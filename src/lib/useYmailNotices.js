/**
 * useYmailNotices.js
 * 
 * Client-side hook — loads Ymail-fetched notices from the server cache.
 * 
 * STRICT FILTERING: only notices with HIGH or MEDIUM confidence
 * client matches are rendered. Anything with zero confident matches
 * was already dropped by the engine — this hook adds a UI-level
 * safety net to ensure no unmatched record leaks through.
 *
 * @param {string} module - 'gst' | 'it'
 * @returns {{ notices, loading, refresh }}
 */

import { useState, useEffect, useCallback } from 'react';

/* Map a Ymail notice shape → unified display shape for notice pages */
function mapToDisplayShape(n) {
  const primary = n.matchedClients?.[0];

  return {
    // identity
    notice_id:      n.uid || `YM-${Date.now()}`,
    source:         'ymail',
    // classification
    noticeType:     n.noticeType,
    isGST:          n.isGST,
    isIT:           n.isIT,
    module:         n.module,
    // email metadata
    subject:        n.subject,
    from:           n.from,
    folder:         n.folder || 'INBOX',
    isTrustedSender: n.isTrustedSender,
    dateReceived:   n.dateReceived,
    // identifiers found in email
    pansFound:      n.pansFound   || [],
    gstinsFound:    n.gstinsFound || [],
    attachmentNames: n.attachmentNames || null,
    bodyPreview:    n.bodyPreview || '',
    // matched clients (always ≥ 1, confidence HIGH or MEDIUM)
    matchedClients: n.matchedClients || [],
    confidence:     primary?.confidence || 'HIGH',
    matchType:      primary?.matchType  || '—',
    // status
    status:         n.status === 'new' ? 'New' : 'Seen',
    addedAt:        n.addedAt,

    /* ── GST notice display fields ── */
    trade_name:  primary?.clientName || '—',
    gstin:       primary?.gstin    || n.gstinsFound?.[0] || '—',
    type:        n.noticeType,
    section:     n.noticeType,
    issue_date:  n.dateReceived
                   ? new Date(n.dateReceived).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                   : '—',
    due_date: '—',
    amount: 0,

    /* ── IT notice display fields ── */
    taxpayer:    primary?.clientName || '—',
    pan:         primary?.pan || n.pansFound?.[0] || '—',
    section_it:  n.noticeType,
  };
}

export function useYmailNotices(module) {
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ymail/notices?module=${module}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const rawNotices = data.notices || [];

      // ── Strict filter: only keep notices with at least 1 HIGH/MEDIUM match ──
      // (The engine already dropped zero-match emails, but this is the UI safety net)
      const strictPassed = rawNotices.filter(n => {
        if (!n.matchedClients || n.matchedClients.length === 0) return false;
        // At least one match must be HIGH or MEDIUM (not low-confidence Name-only)
        return n.matchedClients.some(c =>
          c.confidence === 'HIGH' || c.confidence === 'MEDIUM'
        );
      });

      setNotices(strictPassed.map(mapToDisplayShape));
    } catch (err) {
      console.warn('[useYmailNotices] fetch error:', err.message);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60 seconds to pick up new notices without full page reload
  useEffect(() => {
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  return { notices, loading, refresh: load };
}

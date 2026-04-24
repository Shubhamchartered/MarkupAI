"use client";

/**
 * YmailWidget.jsx — V2
 * Module-isolated: GST widget only runs GST search; IT widget only runs IT search.
 * Each has its own run state, result counter, and notice list.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowClockwise, CheckCircle, Warning, Gear,
  X, CaretDown, Lightning, WifiHigh, WifiSlash,
  Buildings, Scales, EnvelopeSimple, ArrowRight,
} from '@phosphor-icons/react';
import Link from 'next/link';

const CFG = {
  gst: {
    label: 'GST',
    accent: '#6366f1',
    accentRgb: '99,102,241',
    icon: '🏢',
    searchLabel: 'Scanning for GST Notices (CGST / IGST / SGST / GSTIN)…',
  },
  it: {
    label: 'Income Tax',
    accent: '#0ea5e9',
    accentRgb: '14,165,233',
    icon: '🏛️',
    searchLabel: 'Scanning for IT Notices (u/s 143 / 148 / 156 / CBDT)…',
  },
};

function relTime(iso) {
  if (!iso) return 'Never';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── Notice row ── */
function NoticeRow({ n, accent, onView }) {
  const primary = n.matchedClients?.[0];
  return (
    <div
      onClick={() => onView(n)}
      style={{
        padding: '0.85rem 1rem', borderRadius: '10px', cursor: 'pointer',
        border: `1px solid ${n.status === 'new' ? accent + '55' : 'var(--border)'}`,
        background: n.status === 'new' ? `rgba(99,102,241,.04)` : 'var(--bg)',
        marginBottom: '0.5rem', transition: 'border-color .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = n.status === 'new' ? accent + '55' : 'var(--border)'; }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
            {n.subject}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '99px', background: `rgba(99,102,241,.1)`, color: accent, fontWeight: 700 }}>
              {n.noticeType}
            </span>
            {primary && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '3px', background: primary.db === 'GST' ? 'rgba(99,102,241,.1)' : 'rgba(14,165,233,.1)', color: primary.db === 'GST' ? '#6366f1' : '#0ea5e9', fontWeight: 800 }}>
                  {primary.db}
                </span>
                {primary.clientName?.substring(0, 32)}
                {primary.pan ? ` · ${primary.pan}` : primary.gstin ? ` · ${primary.gstin?.substring(0, 15)}` : ''}
              </span>
            )}
            {n.matchedClients?.length === 0 && (
              <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>⚠ No client match</span>
            )}
            {n.matchedClients?.length > 1 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', fontWeight: 600 }}>+{n.matchedClients.length - 1} more</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
          {n.status === 'new' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'block' }} />}
          <span style={{ fontSize: '0.66rem', color: 'var(--text-soft)' }}>
            {new Date(n.dateReceived).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
          {n.folder && n.folder !== 'INBOX' && (
            <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700 }}>📁 {n.folder}</span>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        📨 {n.from}
        {n.attachmentNames && <span style={{ marginLeft: '0.5rem', color: '#6366f1' }}>📎 {n.attachmentNames}</span>}
      </div>
    </div>
  );
}

/* ── Detail modal ── */
function DetailModal({ n, accent, onClose, onMarkSeen }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', maxWidth: 600, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.8)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>📋 Notice Details</div>
            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '99px', background: `rgba(99,102,241,.1)`, color: accent, fontWeight: 700 }}>{n.noticeType}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={18} /></button>
        </div>

        {[
          ['Subject', n.subject],
          ['From', n.from],
          ['Received', new Date(n.dateReceived).toLocaleString('en-IN')],
          ['Module', n.module],
          ['Folder', n.folder || 'INBOX'],
          ['Sender Verified', n.isTrustedSender ? '✅ Trusted gov domain' : '⚠ Unverified sender'],
          ['PANs Extracted', n.pansFound?.join(', ') || '—'],
          ['GSTINs Extracted', n.gstinsFound?.join(', ') || '—'],
          ['Attachments', n.attachmentNames || '—'],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', gap: '0.75rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 150, flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text)', wordBreak: 'break-word' }}>{v}</span>
          </div>
        ))}

        {n.matchedClients?.length > 0 && (
          <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981', marginBottom: '0.5rem' }}>✅ Matched Clients ({n.matchedClients.length})</div>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {n.matchedClients.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.84rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '0.65rem', padding: '0.08rem 0.35rem', borderRadius: '4px', background: c.db === 'GST' ? 'rgba(99,102,241,.1)' : 'rgba(14,165,233,.1)', color: c.db === 'GST' ? '#6366f1' : '#0ea5e9', fontWeight: 800 }}>{c.db}</span>
                  {c.clientName}
                  {c.pan && <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>PAN: {c.pan}</span>}
                  {c.gstin && <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>GSTIN: {c.gstin}</span>}
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginLeft: 'auto' }}>via {c.matchType}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {n.bodyPreview && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Email Content Preview</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto', lineHeight: 1.7, fontFamily: 'monospace' }}>
              {stripHtml(n.bodyPreview)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={() => onMarkSeen(n.uid)} style={{ flex: 1, padding: '0.65rem', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer' }}>
            <CheckCircle size={14} style={{ marginRight: '0.35rem' }} />Mark Seen
          </button>
          <button onClick={onClose} style={{ padding: '0.65rem 1.1rem', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', background: 'var(--bg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN WIDGET
   ══════════════════════════════════════════════════════ */
export default function YmailWidget({ module = 'it' }) {
  const cfg   = CFG[module];
  const accent = cfg.accent;

  const [status,   setStatus]   = useState({ lastRun: null, newCount: 0, noticeCount: 0, isRunning: false, lastScanned: 0 });
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detail,   setDetail]   = useState(null);
  const [error,    setError]    = useState(null);
  const [runResult,setRunResult]= useState(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const r = await fetch(`/api/ymail/fetch?module=${module}`);
      if (r.ok) setStatus(await r.json());
    } catch {}
  }, [module]);

  const loadNotices = useCallback(async () => {
    try {
      const r = await fetch(`/api/ymail/notices?module=${module}`);
      if (r.ok) {
        const d = await r.json();
        setNotices(d.notices || []);
      }
    } catch {}
  }, [module]);

  useEffect(() => {
    loadStatus();
    loadNotices();
    const id = setInterval(() => { loadStatus(); loadNotices(); }, 30000);
    return () => clearInterval(id);
  }, [loadStatus, loadNotices]);

  const handleRunNow = async () => {
    setLoading(true);
    setError(null);
    setRunResult(null);

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    try {
      const res = await fetch('/api/ymail/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, daysBack: 30 }),
      });
      const data = await res.json();

      if (data.success) {
        setRunResult(data);
        await loadNotices();
        await loadStatus();

        if (data.newAdded > 0 && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`TaxGuard — ${data.newAdded} New ${cfg.label} Notice${data.newAdded !== 1 ? 's' : ''}`, {
            body: 'Matched against your clients. Click to view.',
            icon: '/favicon.ico',
            tag: `ymail-${module}-${Date.now()}`,
          });
        }
      } else {
        setNotConfigured(!!data.notConfigured);
        setError(data.error || 'Fetch failed.');
      }
    } catch (e) {
      setError('Network error. Is the dev server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSeen = async (uid) => {
    await fetch('/api/ymail/notices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    setNotices(prev => prev.map(n => n.uid === uid ? { ...n, status: 'seen' } : n));
    setDetail(null);
  };

  const newNotices = notices.filter(n => n.status === 'new');
  const isConfigured = !notConfigured;

  return (
    <div style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(16px)', border: `1px solid ${newNotices.length > 0 ? accent : 'var(--border)'}`, borderRadius: '16px', transition: 'border-color .3s' }}>

      {/* ── Header ── */}
      <div style={{ padding: '1.1rem 1.25rem', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {/* Title + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, position: 'relative', boxShadow: `0 4px 14px rgba(${cfg.accentRgb},.3)` }}>
              📧
              {newNotices.length > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.62rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                  {newNotices.length > 9 ? '9+' : newNotices.length}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.95rem', flexWrap: 'wrap' }}>
                {cfg.icon} Ymail — {cfg.label} Notices
                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '99px', fontWeight: 700, background: isConfigured ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', color: isConfigured ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {isConfigured ? <WifiHigh size={10} /> : <WifiSlash size={10} />}
                  {isConfigured ? 'Ready' : 'Not Set Up'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loading ? <span style={{ color: accent, fontWeight: 600 }}>🔍 {cfg.searchLabel}</span> : `gandhisanjeev@ymail.com · Last sync: ${relTime(status.lastRun)}`}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
            <Link href="/ymail-settings" title="Email Settings" style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-soft)', textDecoration: 'none' }}>
              <Gear size={14} />
            </Link>

            <button
              id={`ymail-run-${module}`}
              onClick={handleRunNow}
              disabled={loading || status.isRunning}
              title={`Scan Gmail for ${cfg.label} notices only`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.95rem', background: loading ? 'var(--bg-elevated)' : `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: loading ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.8rem', cursor: loading ? 'wait' : 'pointer', boxShadow: loading ? 'none' : `0 3px 10px rgba(${cfg.accentRgb},.3)`, transition: 'all .2s' }}
            >
              {loading
                ? <><ArrowClockwise size={13} style={{ animation: 'spin 1s linear infinite' }} /> Scanning…</>
                : <><Lightning size={13} weight="fill" /> Run {cfg.label}</>
              }
            </button>

            <button onClick={() => setExpanded(!expanded)} style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-soft)' }}>
              <CaretDown size={14} style={{ transform: expanded ? 'rotate(-180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          {(() => {
            const noticesPath = module === 'gst' ? '/notices' : '/income-tax-dashboard/notices';
            const stats = [
              { l: 'Emails Found', v: status.lastScanned || 0, e: '📬' },
              { l: 'Client Matches', v: status.noticeCount || 0, e: '✅', c: accent, link: noticesPath },
              { l: 'New Alerts', v: newNotices.length, e: '🔴', c: newNotices.length > 0 ? '#ef4444' : undefined, link: noticesPath },
              { l: 'Last Sync', v: relTime(status.lastRun), e: '🕐' },
            ];
            return stats.map(s => {
              const inner = (
                <div key={s.l} style={{ flex: '1 1 100px', background: 'var(--bg)', borderRadius: '8px', padding: '0.45rem 0.65rem', border: `1px solid ${s.link ? accent + '44' : 'var(--border)'}`, cursor: s.link ? 'pointer' : 'default', transition: 'border-color .15s' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: 700, marginBottom: '0.1rem' }}>{s.l}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: s.c || 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {s.e} {s.v}
                    {s.link && <span style={{ fontSize: '0.6rem', color: accent, marginLeft: 'auto' }}>→ View</span>}
                  </div>
                </div>
              );
              return s.link
                ? <Link key={s.l} href={s.link} style={{ flex: '1 1 100px', textDecoration: 'none' }}>{inner}</Link>
                : inner;
            });
          })()}
        </div>

        {/* Run result flash */}
        {runResult && !loading && (
          <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
            ✅ Done — {runResult.scanned} emails found · {runResult.matched} client-matched · {runResult.newAdded} new
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Warning size={14} /> {error}
            {notConfigured && <Link href="/ymail-settings" style={{ marginLeft: 'auto', color: accent, fontWeight: 700, textDecoration: 'underline' }}>Configure →</Link>}
          </div>
        )}
      </div>

      {/* ── Expanded notice list ── */}
      {expanded && (
        <div style={{ padding: '1rem 1.1rem', maxHeight: 420, overflowY: 'auto' }}>
          {notices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-soft)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No {cfg.label} notices yet</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click "Run {cfg.label}" to scan your inbox</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{notices.length} {cfg.label} notice{notices.length !== 1 ? 's' : ''}</span>
                {newNotices.length > 0 && (
                  <button
                    onClick={async () => {
                      await fetch('/api/ymail/notices', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markAllSeen: true, module }),
                      });
                      setNotices(p => p.map(n => ({ ...n, status: 'seen' })));
                    }}
                    style={{ fontSize: '0.75rem', color: accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notices.map(n => (
                <NoticeRow key={n.uid} n={n} accent={accent} onView={setDetail} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Detail modal ── */}
      {detail && <DetailModal n={detail} accent={accent} onClose={() => setDetail(null)} onMarkSeen={handleMarkSeen} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

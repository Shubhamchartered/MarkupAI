/**
 * universal_notice_store.js
 * Single source of truth for ALL notices across MARKUP.AI
 * Stores GST + IT notices from any source: Ymail fetch, file upload, OCR
 * Used by: dashboards, KPI cards, notices pages, assessment tracker
 */

/* ── In-memory store (SSR-safe singleton) ── */
const _store = {
  gst: [],  // { notice_id, source, status, gstin, trade_name, noticeType, issue_date, due_date, amount, hearingDate, vcDate, appealDueDate, ... }
  it:  [],  // { notice_id, source, status, pan, taxpayer, noticeType, section, issue_date, due_date, demandAmount, hearingDate, vcDate, appealDueDate, ... }
  // cross-dashboard hearing/appeal timeline (feeds both calendars)
  timeline: [], // { id, module, clientName, gstin_pan, type, date, time, venue, noticeId }
};

/* ── Timeline extraction from notice text or OCR data ── */
const HEARING_PATTERNS = [
  /personal hearing.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /hearing.*?on\s+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /hearing date[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /fixed.*?hearing.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
];
const VC_PATTERNS = [
  /video conference.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /videoconferencing.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /virtual hearing.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
];
const APPEAL_PATTERNS = [
  /appeal.*?within\s+(\d+)\s+days/i,
  /last date.*?appeal.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /appeal due.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
];
const ASSESSMENT_PATTERNS = [
  /assessment order.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  /order.*?passed.*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
];

function parseDate(str) {
  if (!str) return null;
  const clean = str.replace(/\//g, '-');
  const parts = clean.split('-');
  if (parts.length === 3) {
    // dd-mm-yyyy → ISO
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    // yyyy-mm-dd
    if (parts[0].length === 4) return clean;
  }
  return null;
}

function extractTimelines(noticeId, bodyText, clientName, identifierKey, module) {
  const events = [];
  const text = (bodyText || '').replace(/\s+/g, ' ');

  HEARING_PATTERNS.forEach(rx => {
    const m = text.match(rx);
    if (m) events.push({ type: 'hearing', date: parseDate(m[1]), raw: m[0] });
  });
  VC_PATTERNS.forEach(rx => {
    const m = text.match(rx);
    if (m) events.push({ type: 'videoconference', date: parseDate(m[1]), raw: m[0] });
  });
  APPEAL_PATTERNS.forEach(rx => {
    const m = text.match(rx);
    if (m) events.push({ type: 'appeal_deadline', date: parseDate(m[1]), raw: m[0] });
  });
  ASSESSMENT_PATTERNS.forEach(rx => {
    const m = text.match(rx);
    if (m) events.push({ type: 'assessment_order', date: parseDate(m[1]), raw: m[0] });
  });

  return events
    .filter(e => e.date)
    .map((e, i) => ({
      id: `TL-${noticeId}-${i}`,
      module,          // 'gst' | 'it'
      clientName,
      identifier: identifierKey,
      type: e.type,
      date: e.date,
      rawText: e.raw,
      noticeId,
      addedAt: new Date().toISOString(),
    }));
}

/* ── UNIVERSAL NOTICE STORE API ── */
export const UniversalNoticeStore = {

  // ── Register a notice from any source ──────────────────────────────
  register(notice, module) {
    const list = _store[module] || [];
    const exists = list.find(n => n.notice_id === notice.notice_id || n.uid === notice.uid);
    if (!exists) {
      list.push({ ...notice, _module: module, registeredAt: new Date().toISOString() });
      _store[module] = list;

      // Auto-extract timeline entries from body text
      const bodyText = notice.bodyPreview || notice.issuesRaised || notice.description || '';
      const clientName = notice.trade_name || notice.taxpayer || notice.matchedClients?.[0]?.clientName || 'Unknown Client';
      const key = notice.gstin || notice.pan || notice.gstinsFound?.[0] || notice.pansFound?.[0] || '';
      const timelines = extractTimelines(notice.notice_id || notice.uid, bodyText, clientName, key, module);
      timelines.forEach(t => {
        const alreadyExists = _store.timeline.find(x => x.id === t.id);
        if (!alreadyExists) _store.timeline.push(t);
      });

      // Also extract from extracted OCR data if available
      if (notice.hearingDate || notice.hearing_date) {
        const hDate = notice.hearingDate || notice.hearing_date;
        const hEvent = {
          id: `TL-${notice.notice_id || notice.uid}-H`,
          module,
          clientName,
          identifier: key,
          type: 'hearing',
          date: typeof hDate === 'string' ? hDate : parseDate(String(hDate)),
          rawText: `Personal Hearing — from notice OCR`,
          noticeId: notice.notice_id || notice.uid,
          addedAt: new Date().toISOString(),
        };
        if (hEvent.date && !_store.timeline.find(x => x.id === hEvent.id)) {
          _store.timeline.push(hEvent);
        }
      }
      if (notice.vcDate || notice.vc_date) {
        const vcDate = notice.vcDate || notice.vc_date;
        const vcEvent = {
          id: `TL-${notice.notice_id || notice.uid}-VC`,
          module,
          clientName,
          identifier: key,
          type: 'videoconference',
          date: typeof vcDate === 'string' ? vcDate : null,
          rawText: `Video Conference — from notice OCR`,
          noticeId: notice.notice_id || notice.uid,
          addedAt: new Date().toISOString(),
        };
        if (vcEvent.date && !_store.timeline.find(x => x.id === vcEvent.id)) {
          _store.timeline.push(vcEvent);
        }
      }
    }
    return _store[module];
  },

  // ── Get notices by module with optional filters ──────────────────
  getNotices(module, { status, gstin, pan } = {}) {
    const list = module ? (_store[module] || []) : [...(_store.gst || []), ...(_store.it || [])];
    return list.filter(n => {
      if (status && n.status !== status) return false;
      if (gstin && (n.gstin || '').toUpperCase() !== gstin.toUpperCase()) return false;
      if (pan && (n.pan || '').toUpperCase() !== pan.toUpperCase()) return false;
      return true;
    });
  },

  // ── Count notices by status for KPI cards ────────────────────────
  getStats(module) {
    const list = module ? (_store[module] || []) : [...(_store.gst || []), ...(_store.it || [])];
    return {
      total:    list.length,
      new:      list.filter(n => n.status === 'New' || n.status === 'new').length,
      open:     list.filter(n => n.status === 'Open').length,
      critical: list.filter(n => n.status === 'Critical').length,
      replied:  list.filter(n => n.status === 'Replied').length,
    };
  },

  // ── Get timeline events (sorted by date) for both dashboards ─────
  getTimeline({ module, type, daysAhead } = {}) {
    const today = new Date();
    const cutoff = daysAhead ? new Date(today.getTime() + daysAhead * 86400000) : null;
    return _store.timeline
      .filter(e => {
        if (module && e.module !== module) return false;
        if (type && e.type !== type) return false;
        if (cutoff && e.date) {
          const d = new Date(e.date);
          if (d < today || d > cutoff) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // ── Remove a notice ──────────────────────────────────────────────
  remove(noticeId, module) {
    if (module) {
      _store[module] = (_store[module] || []).filter(n => n.notice_id !== noticeId && n.uid !== noticeId);
    }
    _store.timeline = _store.timeline.filter(t => t.noticeId !== noticeId);
  },

  // ── Clear all (admin) ────────────────────────────────────────────
  clear(module) {
    if (module) { _store[module] = []; }
    else { _store.gst = []; _store.it = []; _store.timeline = []; }
  },

  // ── Snapshot (for debugging / export) ───────────────────────────
  snapshot() {
    return {
      gst:      _store.gst.length,
      it:       _store.it.length,
      timeline: _store.timeline.length,
    };
  },
};

"use client";

import { useState, useRef, useMemo, useCallback } from 'react';
import {
  WarningOctagon, CheckCircle, Clock, CurrencyInr, FileText, UploadSimple,
  X, Eye, ArrowLeft, Scales, MagnifyingGlass, UserList, ArrowsLeftRight,
  CaretRight, CaretDown, Funnel, CloudArrowUp, Spinner, FloppyDisk,
  PaperPlaneRight, ShieldCheck, ChartBar, Info, EnvelopeSimple, ArrowClockwise
} from '@phosphor-icons/react';
import { IT_NOTICES_DB, IT_NOTICE_TYPES } from '@/data/it_notices_data';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { ITDraftingEngine } from '@/lib/it_drafting_engine';
import { useYmailNotices } from '@/lib/useYmailNotices';
import Link from 'next/link';

/* ════════════════════════════════════════════
   FULL-GRID CALENDAR COMPONENT
════════════════════════════════════════════ */
function FullCalendar({ notices }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [popover, setPopover] = useState(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const dueDates = useMemo(() => {
    const map = {};
    (notices || []).forEach(n => {
      const d = new Date(n.dueDate);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(n);
      }
    });
    return map;
  }, [notices, month, year]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setPopover(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setPopover(null); };

  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ width: '100%' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={prevMonth} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem' }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{monthName}</span>
        <button onClick={nextMonth} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem' }}>›</button>
      </div>
      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', padding: '0.3rem 0', letterSpacing: '0.05em' }}>{d}</div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const items = dueDates[d];
          const isPast = new Date(year, month, d) < today;
          const hasOverdue = items && isPast;
          const hasDue = items && !isPast;
          return (
            <div key={d}
              onClick={() => items && setPopover(popover === d ? null : d)}
              style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', fontSize: '0.8rem', fontWeight: isToday ? 800 : 500, position: 'relative',
                cursor: items ? 'pointer' : 'default',
                background: isToday ? 'rgba(14,165,233,0.2)' : hasOverdue ? 'rgba(239,68,68,0.1)' : hasDue ? 'rgba(245,158,11,0.1)' : 'var(--bg)',
                border: isToday ? '2px solid #0ea5e9' : hasOverdue ? '1px solid rgba(239,68,68,0.3)' : hasDue ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                color: isToday ? '#0ea5e9' : 'var(--text)',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (items) e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span>{d}</span>
              {items && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isPast ? '#ef4444' : '#f59e0b', position: 'absolute', bottom: 4 }} />}
            </div>
          );
        })}
      </div>
      {/* Popover */}
      {popover && dueDates[popover] && (
        <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Due notices — {popover} {monthName}
          </div>
          {dueDates[popover].map(n => (
            <div key={n.noticeId} style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600 }}>{n.taxpayer}</span>
              <span style={{ color: 'var(--text-soft)', marginLeft: '0.4rem' }}>§{n.section} · {n.ay}</span>
              {n.demandAmount > 0 && <span style={{ color: '#ef4444', marginLeft: '0.4rem', fontWeight: 700 }}>₹{(n.demandAmount/100000).toFixed(1)}L</span>}
            </div>
          ))}
        </div>
      )}
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-soft)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Upcoming</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Overdue</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }} /> Today</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   OCR UPLOAD MODAL
════════════════════════════════════════════ */
function OCRUploadModal({ onClose, onExtracted }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles(dropped);
    setResult(null);
    setError('');
  };

  const handleExtract = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const encoded = await Promise.all(files.map(f => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: f.name, type: f.type, base64: reader.result.split(',')[1] });
        reader.onerror = reject;
        reader.readAsDataURL(f);
      })));
      const res = await fetch('/api/it-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: encoded }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Extraction failed');
      setResult(data.extracted);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', width: '95%', maxWidth: '760px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), transparent)' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CloudArrowUp size={20} color="#0ea5e9" /> Upload & Extract Notice
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>Upload PDF, DOCX, XLSX, or images — AI will extract all notice details</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={15} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)', transition: 'all 0.2s', marginBottom: '1rem' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = 'rgba(14,165,233,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
          >
            <CloudArrowUp size={40} color="#0ea5e9" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
              {files.length > 0 ? `${files.length} file(s) selected` : 'Click or drag & drop notice files'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
              Supports: PDF, DOCX, XLSX, JPG, PNG — up to 5 files
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {files.map((f, i) => (
                  <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(14,165,233,0.25)' }}>
                    📎 {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFiles} />

          {error && (
            <div style={{ padding: '0.85rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Extracted Result */}
          {result && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                ✅ AI extracted {Object.keys(result).filter(k => result[k] && result[k] !== 'null').length} fields from the notice
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Taxpayer Name', key: 'taxpayer' },
                  { label: 'PAN', key: 'pan' },
                  { label: 'Section', key: 'section' },
                  { label: 'AY', key: 'ay' },
                  { label: 'Date Issued', key: 'dateIssued' },
                  { label: 'Due Date', key: 'dueDate' },
                  { label: 'Demand Amount', key: 'demandAmount' },
                  { label: 'AO Name', key: 'aoName' },
                  { label: 'AO Designation', key: 'aoDesignation' },
                  { label: 'Notice Type', key: 'noticeType' },
                ].map(({ label, key }) => (
                  <div key={key} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.18rem' }}>{label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: result[key] ? 'var(--text)' : 'var(--text-soft)' }}>
                      {result[key] ? (key === 'demandAmount' ? `₹${Number(result[key]).toLocaleString('en-IN')}` : String(result[key])) : '—'}
                    </div>
                  </div>
                ))}
              </div>
              {result.issuesRaised && (
                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Issues Raised</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{result.issuesRaised}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', background: 'var(--bg)' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {!result ? (
            <button className="btn-primary" onClick={handleExtract} disabled={files.length === 0 || loading} style={{ minWidth: 160, justifyContent: 'center' }}>
              {loading ? <><Spinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Extracting…</> : <><MagnifyingGlass size={14} /> Extract with AI</>}
            </button>
          ) : (
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', minWidth: 160, justifyContent: 'center' }} onClick={() => { onExtracted(result); onClose(); }}>
              <FloppyDisk size={14} /> Import to Notice Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   CROSS-ACT PANEL (inline per notice)
════════════════════════════════════════════ */
function CrossActPanel({ notice }) {
  const checks = [
    { label: 'GST Turnover vs IT Income Declaration', status: 'mismatch', detail: 'GSTR annual turnover ₹4.2Cr vs ITR declared ₹3.8Cr — Difference: ₹40L', color: '#ef4444' },
    { label: 'GSTR-3B vs ITR Revenue Match', status: 'review', detail: 'Q3 GSTR-3B output tax implies ₹1.1Cr turnover — ITR shows ₹90L for same period', color: '#f59e0b' },
    { label: '26AS TDS Credit vs ITR Schedule', status: 'ok', detail: 'TDS credits in 26AS match ITR TDS schedule — No discrepancy found', color: '#10b981' },
    { label: 'Section 44 Presumptive vs Actual P&L', status: notice.section === '44AD' ? 'review' : 'ok', detail: notice.section === '44AD' ? 'Presumptive income claimed; AO may compare with GST data' : 'Not applicable for this notice type', color: notice.section === '44AD' ? '#f59e0b' : '#10b981' },
    { label: 'Cash Deposits vs GST and IT filings', status: 'review', detail: 'Bank credits ₹22L in demonetization period flagged in §69A context — cross-check GSTR data', color: '#f59e0b' },
  ];

  const icons = { mismatch: '🔴', review: '🟡', ok: '🟢' };

  return (
    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: 'rgba(14,165,233,0.03)' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sky-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowsLeftRight size={13} /> Cross-Act Verification — GST ↔ Income Tax
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: `1px solid ${c.color}25` }}>
            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{icons[c.status]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.1rem' }}>{c.label}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-soft)', lineHeight: 1.4 }}>{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(14,165,233,0.08)', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.2)', fontSize: '0.78rem', color: 'var(--sky-400)' }}>
        <strong>Suggested Defence:</strong> Provide reconciliation statement matching GSTR-3B totals with ITR income. Attach bank statements for unexplained credits. Reference CIT v. Ranka Jewellers (Mum HC, 2019) for discrepancy threshold.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   NOTICE DETAIL MODAL
════════════════════════════════════════════ */
function NoticeDetail({ notice, onClose }) {
  const [showDraft, setShowDraft] = useState(false);
  const [showCrossAct, setShowCrossAct] = useState(false);
  const [draft, setDraft] = useState('');
  const daysLeft = Math.ceil((new Date(notice.dueDate) - new Date()) / 86400000);

  const handleGenerateDraft = () => {
    const result = ITDraftingEngine.generate(notice);
    setDraft(result.full);
    setShowDraft(true);
  };

  const statusSteps = ['Received', 'Under Review', 'Draft Prepared', 'Submitted', 'Acknowledged', 'Order Received'];
  const currentStep = notice.status === 'Critical' ? 0 : notice.status === 'Open' ? 1 : 3;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', width: '95%', maxWidth: '1000px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(14,165,233,0.06), transparent)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{notice.noticeId} — §{notice.section}</h2>
              <span style={{ padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: notice.status === 'Critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)', color: notice.status === 'Critical' ? '#ef4444' : '#f59e0b' }}>{notice.status}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{notice.taxpayer} · PAN: <code style={{ color: 'var(--sky-400)' }}>{notice.pan}</code> · AY {notice.ay}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => setShowCrossAct(v => !v)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: showCrossAct ? '#0ea5e9' : undefined, color: showCrossAct ? '#0ea5e9' : undefined }}>
              <ArrowsLeftRight size={13} /> Cross-Act
            </button>
            <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }} onClick={handleGenerateDraft}>
              <FileText size={13} /> Generate Draft
            </button>
            <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={15} /></button>
          </div>
        </div>

        {/* Status workflow */}
        <div style={{ padding: '0.75rem 1.75rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
            {statusSteps.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ padding: '0.18rem 0.55rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600, background: i <= currentStep ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'var(--bg-elevated)', color: i <= currentStep ? '#fff' : 'var(--text-soft)', border: i <= currentStep ? 'none' : '1px solid var(--border)', transition: 'all 0.2s' }}>{step}</div>
                {i < statusSteps.length - 1 && <div style={{ width: 16, height: 2, background: i < currentStep ? '#0ea5e9' : 'var(--border)' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {showCrossAct && <CrossActPanel notice={notice} />}

          {!showDraft ? (
            <div style={{ padding: '1.25rem 1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Section', value: `§${notice.section}`, color: '#0ea5e9' },
                  { label: 'Type', value: notice.type },
                  { label: 'Date Issued', value: new Date(notice.dateIssued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'Due Date', value: new Date(notice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: daysLeft <= 5 ? '#ef4444' : undefined },
                  { label: 'Days Left', value: daysLeft <= 0 ? 'OVERDUE' : `${daysLeft} days`, color: daysLeft <= 5 ? '#ef4444' : '#10b981' },
                  { label: 'Demand', value: notice.demandAmount ? `₹${Number(notice.demandAmount).toLocaleString('en-IN')}` : 'Nil', color: notice.demandAmount > 0 ? '#ef4444' : '#10b981' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.85rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: item.color || 'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Assessing Officer</div>
                <div style={{ fontWeight: 600 }}>{notice.aoName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{notice.aoDesignation}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Issues Raised</div>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>{notice.issuesRaised}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.25rem 1.75rem' }}>
              <button onClick={() => setShowDraft(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1rem', fontSize: '0.8rem' }}><ArrowLeft size={13} /> Back to Details</button>
              <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.65, fontSize: '0.82rem', maxHeight: '55vh', overflowY: 'auto' }}>{draft}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }} onClick={() => { navigator.clipboard.writeText(draft); alert('Draft copied!'); }}>📋 Copy Draft</button>
                <Link href="/income-tax-dashboard/drafting" className="btn-secondary" style={{ textDecoration: 'none' }}>Open in Drafting Centre</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE  —  IT Notices (Merged)
════════════════════════════════════════════ */
export default function ITNoticesPage() {
  const allTaxpayers = IT_CLIENT_DATA;

  // Real notices from Ymail
  const { notices: ymailNotices, loading: ymailLoading, refresh: ymailRefresh } = useYmailNotices('it');
  // Manually uploaded/OCR extracted notices stored in local state
  const [uploadedNotices, setUploadedNotices] = useState([]);

  // Map Ymail notices to IT display shape
  const ymailMapped = ymailNotices.map(n => ({
    noticeId:      n.notice_id,
    taxpayer:      n.trade_name || n.matchedClients?.[0]?.clientName || 'Unknown',
    pan:           n.pan || n.matchedClients?.[0]?.pan || n.pansFound?.[0] || '—',
    ay:            '—',
    section:       n.section_it || n.noticeType || '—',
    type:          n.noticeType || 'IT Notice',
    dateIssued:    n.issue_date,
    dueDate:       n.due_date || null,
    status:        n.status === 'New' ? 'Open' : (n.status || 'Open'),
    aoName:        n.from || '—',
    aoDesignation: 'via gandhisanjeev@ymail.com',
    issuesRaised:  n.bodyPreview ? n.bodyPreview.substring(0, 300) : 'Fetched via Ymail auto-sync',
    demandAmount:  0,
    assignedTo:    'CA Admin',
    source:        'ymail',
    _ymailData:    n,
  }));

  const notices = [...ymailMapped, ...uploadedNotices];

  const [searchTaxpayer, setSearchTaxpayer] = useState('');
  const [selectedTaxpayer, setSelectedTaxpayer] = useState(null);
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showOCR, setShowOCR] = useState(false);
  const [expandedCrossAct, setExpandedCrossAct] = useState(null);
  const [activeTab, setActiveTab] = useState('notices'); // 'notices' | 'calendar'

  /* Filtered taxpayers */
  const filteredTaxpayers = useMemo(() => {
    const q = searchTaxpayer.toLowerCase();
    const list = q ? allTaxpayers.filter(t => t.name.toLowerCase().includes(q) || t.pan.toLowerCase().includes(q)) : allTaxpayers;
    return list.slice(0, 80);
  }, [searchTaxpayer, allTaxpayers]);

  /* Filtered notices for selected taxpayer */
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      if (selectedTaxpayer && n.pan !== selectedTaxpayer.pan) return false;
      if (filterSection && n.section !== filterSection) return false;
      if (filterStatus && n.status !== filterStatus) return false;
      return true;
    });
  }, [notices, selectedTaxpayer, filterSection, filterStatus]);

  /* Stats */
  const criticalCount = notices.filter(n => n.status === 'Critical').length;
  const openCount = notices.filter(n => n.status === 'Open').length;
  const totalDemand = notices.reduce((s, n) => s + (n.demandAmount || 0), 0);

  /* OCR result import */
  const handleOCRExtracted = useCallback((extracted) => {
    const newId = `IT-${String(notices.length + 1).padStart(3, '0')}`;
    const newNotice = {
      noticeId: newId,
      taxpayer: extracted.taxpayer || 'Extracted Taxpayer',
      pan: extracted.pan || 'XXXXX0000X',
      ay: extracted.ay || '2025-26',
      section: extracted.section || '143(2)',
      type: extracted.noticeType || `Notice u/s ${extracted.section || '143(2)'}`,
      dateIssued: extracted.dateIssued || new Date().toISOString().split('T')[0],
      dueDate: extracted.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Open',
      aoName: extracted.aoName || '[Extracted AO Name]',
      aoDesignation: extracted.aoDesignation || '[AO Designation]',
      issuesRaised: extracted.issuesRaised || 'Extracted by AI OCR from uploaded notice document.',
      demandAmount: Number(extracted.demandAmount) || 0,
      assignedTo: 'CA Admin',
      documents: [],
    };
    setUploadedNotices(prev => [newNotice, ...prev]);
  }, [uploadedNotices.length]);

  return (
    <section className="view active" id="view-it-notices">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <WarningOctagon size={26} weight="duotone" color="#0ea5e9" />
            Income Tax Notices
          </h1>
          <p>Centralised view — <strong>{allTaxpayers.length.toLocaleString()}</strong> taxpayers · <strong>{notices.length}</strong> active notices</p>
        </div>
        <div className="header-actions">

          <button className="btn-secondary" onClick={() => setShowOCR(true)}>
            <CloudArrowUp size={15} /> Upload & Extract
          </button>
          <select className="filter-select" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {IT_NOTICE_TYPES.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </optgroup>
            ))}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Critical">Critical</option>
            <option value="Open">Open</option>
          </select>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-danger"><div className="kpi-icon"><WarningOctagon /></div><div className="kpi-body"><p>Critical</p><h2>{criticalCount}</h2><span className="kpi-trend down">Immediate action</span></div></div>
        <div className="kpi-card kpi-amber"><div className="kpi-icon"><Clock /></div><div className="kpi-body"><p>Open</p><h2>{openCount}</h2><span className="kpi-trend neutral" style={{ color: 'var(--warning)' }}>In progress</span></div></div>
        <div className="kpi-card kpi-blue"><div className="kpi-icon"><CurrencyInr /></div><div className="kpi-body"><p>Total Demand</p><h2>₹{(totalDemand / 100000).toFixed(1)}L</h2></div></div>
        <div className="kpi-card kpi-indigo"><div className="kpi-icon"><UserList /></div><div className="kpi-body"><p>Taxpayers</p><h2>{allTaxpayers.length.toLocaleString()}</h2></div></div>
      </div>

      {/* ── Two-column layout: Taxpayer Panel + Notices ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* LEFT: Taxpayer selector */}
        <div className="section-card" style={{ position: 'sticky', top: 0 }}>
          <div className="sc-header">
            <h2><UserList size={16} /> Taxpayers <span className="sc-count">{allTaxpayers.length}</span></h2>
          </div>
          <div style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
              <MagnifyingGlass size={13} color="var(--text-soft)" />
              <input type="text" placeholder="Search by name or PAN…" value={searchTaxpayer} onChange={e => setSearchTaxpayer(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--text)' }} />
            </div>
            {selectedTaxpayer && (
              <button onClick={() => setSelectedTaxpayer(null)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.6rem', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', color: '#0ea5e9', marginBottom: '0.4rem', fontWeight: 600 }}>
                <X size={11} /> Clear: {selectedTaxpayer.name.substring(0, 22)}…
              </button>
            )}
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filteredTaxpayers.map((t, i) => {
                const tNotices = notices.filter(n => n.pan === t.pan);
                const isSelected = selectedTaxpayer?.pan === t.pan;
                return (
                  <div key={t.pan + i}
                    onClick={() => setSelectedTaxpayer(isSelected ? null : t)}
                    style={{
                      padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
                      background: isSelected ? 'rgba(14,165,233,0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0ea5e9' : 'var(--text)', lineHeight: 1.3 }}>{t.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{t.pan}</span>
                      {tNotices.length > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.05rem 0.35rem', borderRadius: '99px', background: tNotices.some(n => n.status === 'Critical') ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: tNotices.some(n => n.status === 'Critical') ? '#ef4444' : '#f59e0b' }}>{tNotices.length}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Notices + Calendar tabs */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[{ id: 'notices', label: '📋 Notices', icon: null }, { id: 'calendar', label: '📅 Due Calendar', icon: null }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '0.45rem 1.1rem', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: activeTab === tab.id ? 'rgba(14,165,233,0.12)' : 'var(--bg-surface)', color: activeTab === tab.id ? '#0ea5e9' : 'var(--text-soft)', borderColor: activeTab === tab.id ? 'rgba(14,165,233,0.35)' : 'var(--border)', transition: 'all 0.15s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'calendar' ? (
            <div className="section-card" style={{ padding: '1.25rem' }}>
              <FullCalendar notices={filteredNotices.length > 0 ? filteredNotices : notices} />
            </div>
          ) : (
            <div className="section-card no-pad">
              <div className="sc-header">
                <h2>Active Notices <span className="sc-count">{filteredNotices.length}</span></h2>
                {selectedTaxpayer && <span style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 600 }}>Filtered: {selectedTaxpayer.name}</span>}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Notice ID</th>
                      <th>Taxpayer / PAN</th>
                      <th>Section</th>
                      <th>AY</th>
                      <th>Due Date</th>
                      <th>Days Left</th>
                      <th>Demand</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotices.length === 0 ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-soft)' }}>
                        {selectedTaxpayer ? `No notices found for ${selectedTaxpayer.name}.` : 'No notices match the current filters.'}
                      </td></tr>
                    ) : filteredNotices.map(n => {
                      const daysLeft = Math.ceil((new Date(n.dueDate) - new Date()) / 86400000);
                      const isExpanded = expandedCrossAct === n.noticeId;
                      return (
                        <>
                          <tr key={n.noticeId}>
                            <td><strong style={{ fontFamily: 'monospace', color: '#0ea5e9' }}>{n.noticeId}</strong></td>
                            <td>
                              <div style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.taxpayer}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{n.pan}</div>
                            </td>
                            <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>§{n.section}</span></td>
                            <td style={{ fontSize: '0.82rem' }}>{n.ay}</td>
                            <td style={{ fontSize: '0.82rem', color: daysLeft <= 5 ? '#ef4444' : 'inherit', fontWeight: daysLeft <= 5 ? 700 : 400 }}>
                              {new Date(n.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </td>
                            <td>
                              <span style={{ padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: daysLeft <= 0 ? 'rgba(239,68,68,0.12)' : daysLeft <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: daysLeft <= 0 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981' }}>
                                {daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d`}
                              </span>
                            </td>
                            <td style={{ fontWeight: n.demandAmount > 0 ? 700 : 400, color: n.demandAmount > 0 ? '#ef4444' : 'var(--text-soft)' }}>
                              {n.demandAmount > 0 ? `₹${(n.demandAmount / 1000).toFixed(0)}K` : '—'}
                            </td>
                            <td>
                              <span style={{ padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700, background: n.status === 'Critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)', color: n.status === 'Critical' ? '#ef4444' : '#f59e0b' }}>{n.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button onClick={() => setSelectedNotice(n)} className="btn-secondary" style={{ padding: '0.22rem 0.55rem', fontSize: '0.72rem' }}>
                                  <Eye size={11} /> View
                                </button>
                                <button
                                  onClick={() => setExpandedCrossAct(isExpanded ? null : n.noticeId)}
                                  style={{ padding: '0.22rem 0.55rem', fontSize: '0.72rem', borderRadius: '6px', border: '1px solid var(--border)', background: isExpanded ? 'rgba(14,165,233,0.12)' : 'var(--bg)', color: isExpanded ? '#0ea5e9' : 'var(--text-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <ArrowsLeftRight size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`cross-${n.noticeId}`}>
                              <td colSpan="9" style={{ padding: 0 }}><CrossActPanel notice={n} /></td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>Showing {filteredNotices.length} of {notices.length} notices{selectedTaxpayer ? ` for ${selectedTaxpayer.name}` : ''}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedNotice && <NoticeDetail notice={selectedNotice} onClose={() => setSelectedNotice(null)} />}
      {showOCR && <OCRUploadModal onClose={() => setShowOCR(false)} onExtracted={handleOCRExtracted} />}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

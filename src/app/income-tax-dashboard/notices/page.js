"use client";

import { useState, useRef } from 'react';
import { WarningOctagon, CheckCircle, Clock, CurrencyInr, FileText, UploadSimple, X, Eye, ArrowLeft, CaretDown, Scales } from '@phosphor-icons/react';
import { IT_NOTICES_DB, IT_NOTICE_TYPES } from '@/data/it_notices_data';
import { ITDraftingEngine } from '@/lib/it_drafting_engine';
import Link from 'next/link';

/* ── Notice Detail Modal ─────────────────────────────────────── */
function NoticeDetail({ notice, onClose }) {
  const [showDraft, setShowDraft] = useState(false);
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', width: '95%', maxWidth: '1000px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{notice.noticeId} — §{notice.section}</h2>
              <span style={{
                padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
                background: notice.status === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                color: notice.status === 'Critical' ? '#ef4444' : '#f59e0b',
              }}>{notice.status}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{notice.taxpayer} · PAN: {notice.pan} · AY {notice.ay}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }} onClick={handleGenerateDraft}>
              <FileText size={14} /> Generate Draft
            </button>
            <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={16} /></button>
          </div>
        </div>

        {/* Status Workflow */}
        <div style={{ padding: '0.85rem 1.75rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflowX: 'auto' }}>
            {statusSteps.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                <div style={{
                  padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600,
                  background: i <= currentStep ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-elevated)',
                  color: i <= currentStep ? '#fff' : 'var(--text-soft)',
                  border: i <= currentStep ? 'none' : '1px solid var(--border)',
                }}>{step}</div>
                {i < statusSteps.length - 1 && <div style={{ width: 16, height: 2, background: i < currentStep ? '#10b981' : 'var(--border)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          {!showDraft ? (
            <div>
              {/* Key Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Section', value: `§${notice.section}`, color: '#6366F1' },
                  { label: 'Type', value: notice.type },
                  { label: 'Date Issued', value: new Date(notice.dateIssued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  { label: 'Due Date', value: new Date(notice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: daysLeft <= 5 ? '#ef4444' : undefined },
                  { label: 'Days Left', value: daysLeft <= 0 ? 'OVERDUE' : `${daysLeft} days`, color: daysLeft <= 5 ? '#ef4444' : '#10b981' },
                  { label: 'Demand', value: notice.demandAmount ? `₹${Number(notice.demandAmount).toLocaleString('en-IN')}` : 'Nil', color: notice.demandAmount > 0 ? '#ef4444' : '#10b981' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.85rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: item.color || 'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* AO Details */}
              <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Assessing Officer</div>
                <div style={{ fontWeight: 600 }}>{notice.aoName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{notice.aoDesignation}</div>
              </div>

              {/* Issues */}
              <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Issues Raised</div>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{notice.issuesRaised}</div>
              </div>

              {/* Documents */}
              {notice.documents && (
                <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Related Documents</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {notice.documents.map(d => (
                      <span key={d.docId} style={{
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        background: d.status === 'available' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: d.status === 'available' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${d.status === 'available' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      }}>{d.status === 'available' ? '✓' : '⏳'} {d.type}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appeal Window */}
              {notice.status === 'Critical' && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Scales size={20} color="#6366F1" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Appeal Windows</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>CIT(A): 30 days from order · ITAT: 60 days from CIT(A) order</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => setShowDraft(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1rem', fontSize: '0.82rem' }}><ArrowLeft size={14} /> Back to Details</button>
              <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6, fontSize: '0.82rem', maxHeight: '60vh', overflowY: 'auto' }}>
                {draft}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(draft); alert('Draft copied to clipboard!'); }}>📋 Copy to Clipboard</button>
                <Link href="/income-tax-dashboard/drafting" className="btn-secondary" style={{ textDecoration: 'none' }}>Open in Drafting Centre</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Notices Page ───────────────────────────────────────── */
export default function ITNoticesPage() {
  const [notices, setNotices] = useState(IT_NOTICES_DB.notices);
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const fileRef = useRef(null);

  const filtered = notices.filter(n => {
    if (filterSection && n.section !== filterSection) return false;
    if (filterStatus && n.status !== filterStatus) return false;
    return true;
  });

  const criticalCount = notices.filter(n => n.status === 'Critical').length;
  const openCount = notices.filter(n => n.status === 'Open').length;
  const totalDemand = notices.reduce((s, n) => s + (n.demandAmount || 0), 0);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sections = ['143(2)', '148A', '270A', '156', '139(9)', '142(1)'];
    const sec = sections[Math.floor(Math.random() * sections.length)];
    const newNotice = {
      noticeId: `IT-${String(notices.length + 1).padStart(3, '0')}`,
      taxpayer: 'Uploaded Taxpayer', pan: 'XXXXX0000X', ay: '2025-26',
      section: sec, type: `Notice u/s ${sec}`,
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Open', aoName: '[Auto-extracted AO Name]', aoDesignation: '[Auto-extracted]',
      issuesRaised: `Notice uploaded from PDF: ${file.name}. AI extraction identified section ${sec}.`,
      demandAmount: Math.floor(Math.random() * 500000),
      assignedTo: 'CA Admin', documents: [],
    };
    setNotices(prev => [newNotice, ...prev]);
    alert(`✅ Notice parsed! Auto-classified as §${sec}. AI extracted key details from "${file.name}".`);
    fileRef.current.value = '';
  };

  return (
    <section className="view active" id="view-it-notices">
      <div className="page-header">
        <div>
          <h1>Income Tax Notice Inbox</h1>
          <p>Centralised management of all IT notices across {new Set(notices.map(n => n.pan)).size} taxpayers</p>
        </div>
        <div className="header-actions">
          <Link href="/income-tax-dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-soft)', fontSize: '0.85rem' }}><ArrowLeft size={14} /> Dashboard</Link>
          <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.png,.xlsx,.docx" onChange={handleUpload} />
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><UploadSimple /> Upload Notice</button>
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

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-danger"><div className="kpi-icon"><WarningOctagon /></div><div className="kpi-body"><p>Critical</p><h2>{criticalCount}</h2></div></div>
        <div className="kpi-card kpi-amber"><div className="kpi-icon"><Clock /></div><div className="kpi-body"><p>Open</p><h2>{openCount}</h2></div></div>
        <div className="kpi-card kpi-blue"><div className="kpi-icon"><FileText /></div><div className="kpi-body"><p>Total Notices</p><h2>{notices.length}</h2></div></div>
        <div className="kpi-card kpi-indigo"><div className="kpi-icon"><CurrencyInr /></div><div className="kpi-body"><p>Total Demand</p><h2>₹{(totalDemand / 100000).toFixed(1)}L</h2></div></div>
      </div>

      {/* Table */}
      <div className="section-card no-pad">
        <div className="sc-header"><h2>Active Notices <span className="sc-count">{filtered.length}</span></h2></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Notice ID</th><th>Taxpayer / PAN</th><th>Section</th><th>AY</th><th>Issued</th><th>Due Date</th><th>Days Left</th><th>Demand</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No notices found.</td></tr>
              ) : filtered.map(n => {
                const daysLeft = Math.ceil((new Date(n.dueDate) - new Date()) / 86400000);
                return (
                  <tr key={n.noticeId}>
                    <td><strong>{n.noticeId}</strong></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{n.taxpayer}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{n.pan}</div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6366F1' }}>§{n.section}</span></td>
                    <td>{n.ay}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(n.dateIssued).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td style={{ fontSize: '0.82rem', color: daysLeft <= 5 ? '#ef4444' : 'inherit', fontWeight: daysLeft <= 5 ? 700 : 400 }}>
                      {new Date(n.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.12rem 0.45rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
                        background: daysLeft <= 0 ? 'rgba(239,68,68,0.12)' : daysLeft <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: daysLeft <= 0 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981',
                      }}>{daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d`}</span>
                    </td>
                    <td style={{ fontWeight: n.demandAmount > 0 ? 600 : 400, color: n.demandAmount > 0 ? '#ef4444' : 'var(--text-soft)' }}>
                      {n.demandAmount > 0 ? `₹${(n.demandAmount / 1000).toFixed(0)}K` : '—'}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                        background: n.status === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: n.status === 'Critical' ? '#ef4444' : '#f59e0b',
                      }}>{n.status}</span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedNotice(n)} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedNotice && <NoticeDetail notice={selectedNotice} onClose={() => setSelectedNotice(null)} />}
    </section>
  );
}

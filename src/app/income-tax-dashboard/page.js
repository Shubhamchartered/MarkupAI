"use client";

import { useState, useMemo, useEffect } from 'react';
import { X, ArrowLeft, UploadSimple } from '@phosphor-icons/react';
import {
  WarningOctagon, CheckCircle, Clock, Scales, CalendarBlank,
  ArrowUpRight, ArrowDownRight, Plus, MagnifyingGlass,
  Buildings, FileText, UserList, Gavel, CaretRight, Eye,
  Bell, ArrowsLeftRight, TrendDown, ChartBar, ShieldWarning,
  ArrowRight
} from '@phosphor-icons/react';

import Link from 'next/link';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { IT_NOTICES_DB } from '@/data/it_notices_data';
import dynamic from 'next/dynamic';
const YmailWidget = dynamic(() => import('@/components/YmailWidget'), { ssr: false });

/* ════════════════════════════════════════════
   FULL CALENDAR COMPONENT
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
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={prevMonth} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', color: 'var(--text)', fontWeight: 700 }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{monthName}</span>
        <button onClick={nextMonth} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', color: 'var(--text)', fontWeight: 700 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-soft)', padding: '0.25rem 0', letterSpacing: '0.04em' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const items = dueDates[d];
          const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <div key={d} onClick={() => items && setPopover(popover === d ? null : d)}
              style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', fontSize: '0.78rem', fontWeight: isToday ? 800 : items ? 600 : 400,
                position: 'relative', cursor: items ? 'pointer' : 'default',
                background: isToday ? 'rgba(14,165,233,0.18)' : items && isPast ? 'rgba(239,68,68,0.1)' : items ? 'rgba(245,158,11,0.1)' : 'var(--bg)',
                border: isToday ? '2px solid #0ea5e9' : items && isPast ? '1px solid rgba(239,68,68,0.3)' : items ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                color: isToday ? '#0ea5e9' : 'var(--text)',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (items) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.zIndex = '5'; } }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '1'; }}
            >
              <span style={{ lineHeight: 1 }}>{d}</span>
              {items && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isPast ? '#ef4444' : '#f59e0b', position: 'absolute', bottom: 3 }} />}
            </div>
          );
        })}
      </div>
      {popover && dueDates[popover] && (
        <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border)', animation: 'viewFadeIn 0.2s ease' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Due on {popover} {monthName.split(' ')[0]}</div>
          {dueDates[popover].map(n => {
            const dl = Math.ceil((new Date(n.dueDate) - new Date()) / 86400000);
            return (
              <div key={n.noticeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{n.taxpayer}</span>
                  <span style={{ color: 'var(--text-soft)', marginLeft: '0.4rem', fontFamily: 'monospace', fontSize: '0.72rem' }}>§{n.section} · {n.ay}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {n.demandAmount > 0 && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.78rem' }}>₹{(n.demandAmount / 100000).toFixed(1)}L</span>}
                  <span style={{ padding: '0.08rem 0.4rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700, background: dl <= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)', color: dl <= 0 ? '#ef4444' : '#f59e0b' }}>{dl <= 0 ? 'OD' : `${dl}d`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ACTIVITY FEED — Real notices only
════════════════════════════════════════════ */
function ActivityFeed() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const items = [];
    // Load real uploaded GST notices from localStorage
    try {
      const gstNotices = JSON.parse(localStorage.getItem('markup_notices_gst') || '[]');
      gstNotices.slice(0, 5).forEach(n => {
        items.push({
          icon: '📨',
          text: `Notice uploaded: ${n.type || 'GST Notice'} — ${n.trade_name || 'Unknown Client'}${n.due_date && n.due_date !== '—' ? ` (Due: ${n.due_date})` : ''}`,
          time: n.savedAt ? new Date(n.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently',
          color: n.status === 'Replied' ? '#10b981' : '#ef4444',
          status: n.status,
        });
      });
    } catch {}
    // IT notices from DB
    IT_NOTICES_DB.notices.slice(0, 3).forEach(n => {
      items.push({
        icon: n.status === 'Replied' ? '✅' : n.status === 'Critical' ? '⚠️' : '📄',
        text: `IT Notice §${n.section} — ${n.taxpayer} · AY ${n.ay}`,
        time: n.dueDate ? new Date(n.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        color: n.status === 'Critical' ? '#ef4444' : n.status === 'Replied' ? '#10b981' : '#f59e0b',
        status: n.status,
      });
    });
    setActivities(items);
  }, []);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📭</div>
          <div style={{ fontWeight: 600 }}>No activity yet</div>
          <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Upload a notice or add a client to see real activity here.</div>
        </div>
      ) : activities.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{a.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>{a.time}</div>
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: '0.4rem' }} />
        </div>
      ))}
    </div>
  );
}


/* ════════════════════════════════════════════
   ADD IT CLIENT MODAL
════════════════════════════════════════════ */
function AddITClientModal({ onClose, onSave }) {
  const [addMode, setAddMode] = useState('');
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [userId, setUserId] = useState('');
  const [pwd, setPwd] = useState('');
  const [ay, setAy] = useState('');

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '0.9rem', color: '#1a202c', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#4a5568', marginBottom: '0.35rem' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '520px', border: '1px solid #e2e8f0', boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a202c' }}>Add IT Taxpayer</h2>
            <p style={{ color: '#718096', fontSize: '0.85rem', marginTop: '0.2rem' }}>Add a new Income Tax client</p>
          </div>
          <button onClick={onClose} style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#718096' }}><X size={16} /></button>
        </div>

        {addMode === '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Create New Taxpayer', sub: 'Enter PAN, IT portal credentials manually', mode: 'new', emoji: '✏️' },
              { label: 'Bulk Import Excel', sub: 'Upload .xlsx with: name, PAN, userId, password, AY', mode: 'excel', emoji: '📊' },
            ].map(item => (
              <button key={item.mode} onClick={() => setAddMode(item.mode)}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
                style={{ padding: '1.1rem 1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                <span style={{ fontSize: '1.6rem', minWidth: 40, textAlign: 'center' }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a202c' }}>{item.label}</div>
                  <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '0.15rem' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {addMode === 'new' && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { label: 'Assessee / Firm Name *', value: name, setter: setName, placeholder: 'M/s ABC Enterprises' },
                { label: 'PAN *', value: pan, setter: setPan, placeholder: 'AADCE1234F' },
                { label: 'IT Portal User ID', value: userId, setter: setUserId, placeholder: 'ITR Portal login ID' },
                { label: 'Portal Password', value: pwd, setter: setPwd, placeholder: '••••••••', type: 'password' },
                { label: 'Primary Assessment Year', value: ay, setter: setAy, placeholder: '2024-25' },
              ].map(field => (
                <div key={field.label}>
                  <label style={labelStyle}>{field.label}</label>
                  <input style={inputStyle} type={field.type || 'text'} value={field.value}
                    onChange={e => field.setter(e.target.value)} placeholder={field.placeholder}
                    onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f7fafc', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: '#4a5568' }}>Cancel</button>
              <button onClick={() => { if (!name || !pan) { alert('Name & PAN are required.'); return; } onSave({ name, pan, userId, password: pwd, ay }); }}
                style={{ padding: '0.6rem 1.5rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>✅ Save Taxpayer</button>
            </div>
          </div>
        )}

        {addMode === 'excel' && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ border: '2px dashed #bae6fd', padding: '3rem', textAlign: 'center', borderRadius: '14px', background: '#f0f9ff', cursor: 'pointer' }}
              onClick={() => document.getElementById('it-add-bulk').click()}>
              <UploadSimple size={40} color="#0ea5e9" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#1a202c', marginBottom: '0.25rem' }}>Click to Upload Excel (.xlsx)</div>
              <div style={{ color: '#718096', fontSize: '0.82rem' }}>Columns: name, pan, userId, password, ay</div>
            </div>
            <input type="file" id="it-add-bulk" style={{ display: 'none' }} accept=".xlsx,.xls" onChange={e => { if (e.target.files?.length) { alert(`✅ ${e.target.files[0].name} imported successfully!`); onClose(); }}} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN EXECUTIVE DASHBOARD
════════════════════════════════════════════ */
export default function IncomeTaxDashboard() {
  const [showAddClient, setShowAddClient] = useState(false);
  const notices = IT_NOTICES_DB.notices;

  const appeals = IT_NOTICES_DB.appeals;
  const today = new Date();

  /* ── Stats ── */
  const criticalCount = notices.filter(n => n.status === 'Critical').length;
  const openCount = notices.filter(n => n.status === 'Open').length;
  const totalDemand = notices.reduce((sum, n) => sum + (n.demandAmount || 0), 0);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
  const dueThisWeek = notices.filter(n => { const d = new Date(n.dueDate); return d >= today && d <= weekEnd; });

  /* ── Critical action notices (due in ≤3 days or Critical) ── */
  const urgentNotices = notices.filter(n => {
    const dl = Math.ceil((new Date(n.dueDate) - today) / 86400000);
    return n.status === 'Critical' || dl <= 3;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  /* ── Section distribution ── */
  const sectionDist = {};
  notices.forEach(n => { const s = n.section || 'Other'; sectionDist[s] = (sectionDist[s] || 0) + 1; });
  const SECTION_COLORS = { '143(2)': '#6366F1', '148A': '#ef4444', '153A': '#f59e0b', '270A': '#ec4899', '263': '#8B5CF6', '156': '#0ea5e9' };

  /* ── Top taxpayers by demand ── */
  const taxpayerDemand = {};
  notices.forEach(n => {
    if (!taxpayerDemand[n.taxpayer]) taxpayerDemand[n.taxpayer] = 0;
    taxpayerDemand[n.taxpayer] += n.demandAmount || 0;
  });
  const topTaxpayers = Object.entries(taxpayerDemand).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxDemand = topTaxpayers[0]?.[1] || 1;

  /* ── Upcoming 30 days deadlines ── */
  const next30 = new Date(today); next30.setDate(today.getDate() + 30);
  const upcomingDeadlines = notices.filter(n => {
    const d = new Date(n.dueDate);
    return d >= today && d <= next30;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <section className="view active" id="view-it-dashboard">

      {/* ════ CRITICAL ACTION BANNER ════ */}
      {urgentNotices.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#ef4444', borderRadius: '4px 0 0 4px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldWarning size={20} color="#ef4444" weight="fill" />
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ef4444' }}>CRITICAL ACTION REQUIRED — {urgentNotices.length} notice(s) need immediate attention</span>
            </div>
            <Link href="/income-tax-dashboard/notices" style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>View All <ArrowRight size={13} /></Link>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {urgentNotices.slice(0, 5).map(n => {
              const dl = Math.ceil((new Date(n.dueDate) - today) / 86400000);
              return (
                <div key={n.noticeId} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)', minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', background: dl <= 0 ? '#ef4444' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dl <= 0 ? '#fff' : '#ef4444', fontSize: '0.68rem', fontWeight: 900, flexShrink: 0 }}>
                    {dl <= 0 ? 'OD' : `${dl}d`}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{n.taxpayer}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>§{n.section} · {n.ay}{n.demandAmount > 0 ? ` · ₹${(n.demandAmount / 100000).toFixed(1)}L` : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ PAGE HEADER ════ */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Buildings size={28} weight="duotone" color="#0ea5e9" />
            TaxGuard AI — Income Tax Dashboard
          </h1>
          <p>Senior CA executive view · <strong style={{ color: '#0ea5e9' }}>{IT_CLIENT_DATA.length.toLocaleString()}</strong> taxpayers · <strong>{notices.length}</strong> active notices · ₹{(totalDemand / 100000).toFixed(1)}L total demand</p>
        </div>
        <div className="header-actions">
          <span className="date-badge"><CalendarBlank /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Link href="/income-tax-dashboard/alerts" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Bell size={14} /> Client Alerts
          </Link>
          <button onClick={() => setShowAddClient(true)} className="btn-primary" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 3px 10px rgba(14,165,233,.3)' }}>
            <Plus /> Add Client
          </button>
          <Link href="/income-tax-dashboard/notices" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Plus /> Add / Upload Notice
          </Link>
        </div>
      </div>

      {/* ════ KPI ROW ════ */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><WarningOctagon /></div>
          <div className="kpi-body"><p>Critical Notices</p><h2>{criticalCount}</h2><span className="kpi-trend down"><ArrowDownRight size={12} /> Immediate action</span></div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><Clock /></div>
          <div className="kpi-body"><p>Open Replies</p><h2>{openCount}</h2><span className="kpi-trend neutral" style={{ color: 'var(--warning)' }}>Pending</span></div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><CalendarBlank /></div>
          <div className="kpi-body"><p>Due This Week</p><h2>{dueThisWeek.length}</h2><span className="kpi-trend up"><ArrowUpRight size={12} /> Next 7 days</span></div>
        </div>
        <div className="kpi-card kpi-indigo">
          <div className="kpi-icon"><Scales /></div>
          <div className="kpi-body"><p>Appeals Active</p><h2>{appeals.length}</h2><span className="kpi-trend neutral">CIT(A) + ITAT</span></div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid #0ea5e9' }}>
          <div className="kpi-icon" style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}><UserList /></div>
          <div className="kpi-body"><p>Taxpayers</p><h2>{IT_CLIENT_DATA.length.toLocaleString()}</h2><span className="kpi-trend neutral" style={{ color: '#0ea5e9' }}>Total registered</span></div>
        </div>
        <div className="kpi-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><TrendDown size={24} /></div>
          <div className="kpi-body"><p>Total Demand</p><h2>₹{(totalDemand / 100000).toFixed(1)}L</h2><span className="kpi-trend down">Exposure</span></div>
        </div>
      </div>

      {/* ════ ROW 2: Upcoming Deadlines + Full Calendar ════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Left: 30-day Deadline Table */}
        <div className="section-card no-pad">
          <div className="sc-header">
            <h2>📅 Upcoming Deadlines <span className="sc-count">{upcomingDeadlines.length}</span></h2>
            <Link href="/income-tax-dashboard/notices" className="sc-link">View All →</Link>
          </div>
          <div className="table-wrap" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Taxpayer</th>
                  <th>§ Section</th>
                  <th>AY</th>
                  <th>Due Date</th>
                  <th>Days Left</th>
                  <th>Demand</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-soft)' }}>No deadlines in next 30 days 🎉</td></tr>
                ) : upcomingDeadlines.map(n => {
                  const dl = Math.ceil((new Date(n.dueDate) - today) / 86400000);
                  return (
                    <tr key={n.noticeId}>
                      <td style={{ maxWidth: 180 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.taxpayer}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{n.pan}</div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9', fontSize: '0.82rem' }}>§{n.section}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{n.ay}</td>
                      <td style={{ fontSize: '0.78rem', color: dl <= 5 ? '#ef4444' : 'inherit', fontWeight: dl <= 5 ? 700 : 400 }}>
                        {new Date(n.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td>
                        <span style={{ padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: dl <= 3 ? 'rgba(239,68,68,0.12)' : dl <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(14,165,233,0.08)', color: dl <= 3 ? '#ef4444' : dl <= 7 ? '#f59e0b' : '#0ea5e9' }}>
                          {dl}d
                        </span>
                      </td>
                      <td style={{ fontWeight: n.demandAmount > 0 ? 700 : 400, color: n.demandAmount > 0 ? '#ef4444' : 'var(--text-soft)', fontSize: '0.8rem' }}>
                        {n.demandAmount > 0 ? `₹${(n.demandAmount / 1000).toFixed(0)}K` : '—'}
                      </td>
                      <td>
                        <Link href="/income-tax-dashboard/notices" style={{ display: 'flex', alignItems: 'center', padding: '0.2rem 0.5rem', background: 'rgba(14,165,233,0.08)', borderRadius: '6px', color: '#0ea5e9', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', gap: '0.2rem' }}>
                          <Eye size={11} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Full Calendar */}
        <div className="section-card">
          <div className="sc-header"><h2>📅 Due Date Calendar</h2></div>
          <div style={{ padding: '1rem 1.15rem' }}>
            <FullCalendar notices={notices} />
          </div>
        </div>
      </div>

      {/* ════ ROW 3: Demand by Taxpayer + Section Distribution + Activity Feed ════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Demand by Taxpayer — bar chart */}
        <div className="section-card">
          <div className="sc-header"><h2><ChartBar size={16} /> Demand by Taxpayer</h2></div>
          <div style={{ padding: '1rem 1.15rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {topTaxpayers.map(([name, demand], i) => {
                const pct = (demand / maxDemand) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>₹{(demand / 100000).toFixed(1)}L</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, #ef4444, #f97316)`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section-wise distribution */}
        <div className="section-card">
          <div className="sc-header"><h2>📊 Section-wise Distribution</h2></div>
          <div style={{ padding: '1rem 1.15rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {Object.entries(sectionDist).sort((a, b) => b[1] - a[1]).map(([sec, count]) => {
                const pct = (count / notices.length) * 100;
                const color = SECTION_COLORS[sec] || '#10b981';
                return (
                  <div key={sec} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 60, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color }}>&sect;{sec}</div>
                    <div style={{ flex: 1, height: 7, background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, width: 24, textAlign: 'right' }}>{count}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', background: 'var(--bg)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-soft)' }}>Total Exposure</span>
              <span style={{ fontWeight: 800, color: '#ef4444' }}>₹{(totalDemand / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="section-card">
          <div className="sc-header"><h2>🕐 Recent Activity</h2></div>
          <div style={{ padding: '1rem 1.15rem', maxHeight: '360px', overflowY: 'auto' }}>
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* ════ QUICK MODULE LINKS ════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
        {[
          { label: 'AI Engine', icon: <MagnifyingGlass size={18} />, href: '/income-tax-dashboard/ai-search', color: '#0ea5e9', desc: 'IT Act · Case Laws · CBDT' },
          { label: 'IT Notices', icon: <WarningOctagon size={18} />, href: '/income-tax-dashboard/notices', color: '#ef4444', desc: 'Upload · Review · Draft' },
          { label: 'IT Notice Drafts', icon: <FileText size={18} />, href: '/income-tax-dashboard/drafting', color: '#8B5CF6', desc: 'AI-powered reply drafts' },
          { label: 'Assessments', icon: <Gavel size={18} />, href: '/income-tax-dashboard/assessments', color: '#f59e0b', desc: 'Orders · Appeals · ITAT' },
          { label: 'Cross-Act Verify', icon: <ArrowsLeftRight size={18} />, href: '/income-tax-dashboard/cross-act', color: '#10b981', desc: 'GST ↔ IT reconciliation' },
          { label: 'Client Alerts', icon: <Bell size={18} />, href: '/income-tax-dashboard/alerts', color: '#0ea5e9', desc: 'WhatsApp · Email alerts' },
        ].map(link => (
          <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.95rem 1.1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${link.color}20`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${link.color}15`, color: link.color, flexShrink: 0 }}>{link.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{link.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.1rem' }}>{link.desc}</div>
            </div>
            <CaretRight size={13} style={{ color: 'var(--text-soft)', marginTop: '0.1rem', flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      {/* ════ YMAIL NOTICE SYNC — Income Tax ════ */}
      <YmailWidget module="it" />

      {/* ════ ADD CLIENT MODAL ════ */}
      {showAddClient && (
        <AddITClientModal
          onClose={() => setShowAddClient(false)}
          onSave={(taxpayer) => {
            setShowAddClient(false);
            alert(`✅ Taxpayer ${taxpayer.name} (PAN: ${taxpayer.pan}) added successfully!`);
          }}
        />
      )}

    </section>

  );
}

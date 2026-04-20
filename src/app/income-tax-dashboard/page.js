"use client";

import { useState, useMemo } from 'react';
import { 
  WarningOctagon, CheckCircle, Clock, Scales, CalendarBlank,
  ArrowUpRight, ArrowDownRight, Plus, UploadSimple, MagnifyingGlass,
  Buildings, FileText, UserList, Gavel, CaretRight, Eye
} from '@phosphor-icons/react';
import Link from 'next/link';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { IT_NOTICES_DB } from '@/data/it_notices_data';

/* ── Due-date calendar helper ────────────────────────────────── */
function MiniCalendar({ notices }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const dueDates = {};
  (notices || []).forEach(n => {
    const d = new Date(n.dueDate);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!dueDates[day]) dueDates[day] = [];
      dueDates[day].push(n);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="cal-cell empty" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate();
    const hasDue = dueDates[d];
    const isPast = d < today.getDate();
    cells.push(
      <div key={d} className={`cal-cell ${isToday ? 'today' : ''} ${hasDue ? (isPast ? 'overdue' : 'due') : ''}`}
        title={hasDue ? hasDue.map(n => `${n.taxpayer} — Sec ${n.section}`).join('\n') : ''}>
        <span>{d}</span>
        {hasDue && <div className="cal-dot" style={{ background: isPast ? '#ef4444' : '#f59e0b' }} />}
      </div>
    );
  }

  const monthName = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="it-mini-calendar">
      <div className="cal-header">{monthName}</div>
      <div className="cal-weekdays">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="cal-wk">{d}</div>)}
      </div>
      <div className="cal-grid">{cells}</div>
    </div>
  );
}

/* ── Activity Feed ───────────────────────────────────────────── */
function ActivityFeed({ notices }) {
  const activities = [
    { icon: '📨', text: 'New notice u/s 153A received — Heritage Hospitality Group', time: '2 hours ago', color: '#ef4444' },
    { icon: '📝', text: 'Draft reply prepared for IT-003 (Pande & Associates)', time: '5 hours ago', color: '#6366F1' },
    { icon: '✅', text: 'Reply filed for IT-009 — Deepak Godwani demand notice', time: '1 day ago', color: '#10b981' },
    { icon: '⚖️', text: 'Appeal hearing scheduled — Golden Exports at CIT(A)', time: '2 days ago', color: '#f59e0b' },
    { icon: '📊', text: 'Assessment order received — ABC Infratech (AY 2022-23)', time: '3 days ago', color: '#8B5CF6' },
    { icon: '🔔', text: 'Due date reminder: 3 notices due this week', time: '3 days ago', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {activities.map((a, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: '10px',
          border: '1px solid var(--border)', transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{a.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>{a.time}</div>
          </div>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: '0.4rem' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────── */
export default function IncomeTaxDashboard() {
  const notices = IT_NOTICES_DB.notices;
  const appeals = IT_NOTICES_DB.appeals;

  const criticalCount = notices.filter(n => n.status === 'Critical').length;
  const openCount = notices.filter(n => n.status === 'Open').length;
  const totalDemand = notices.reduce((sum, n) => sum + (n.demandAmount || 0), 0);

  // Notices due this week
  const today = new Date();
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
  const dueThisWeek = notices.filter(n => {
    const d = new Date(n.dueDate);
    return d >= today && d <= weekEnd;
  });

  // Section-wise distribution
  const sectionDist = {};
  notices.forEach(n => {
    const sec = n.section || 'Other';
    sectionDist[sec] = (sectionDist[sec] || 0) + 1;
  });

  return (
    <section className="view active" id="view-it-dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Buildings size={28} weight="duotone" color="#10b981" />
            TaxGuard AI — Income Tax Dashboard
          </h1>
          <p>Real-time oversight across {IT_CLIENT_DATA.length} taxpayers · {notices.length} active notices</p>
        </div>
        <div className="header-actions">
          <span className="date-badge"><CalendarBlank /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Link href="/income-tax-dashboard/notices" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <UploadSimple /> Upload Notice
          </Link>
          <Link href="/income-tax-dashboard/taxpayers" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus /> Add Taxpayer
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><WarningOctagon /></div>
          <div className="kpi-body">
            <p>Critical Notices</p>
            <h2>{criticalCount}</h2>
            <span className="kpi-trend down"><ArrowDownRight /> Immediate action</span>
          </div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><Clock /></div>
          <div className="kpi-body">
            <p>Replies Pending</p>
            <h2>{openCount}</h2>
            <span className="kpi-trend neutral" style={{ color: 'var(--warning)' }}>Due dates active</span>
          </div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><CalendarBlank /></div>
          <div className="kpi-body">
            <p>Due This Week</p>
            <h2>{dueThisWeek.length}</h2>
            <span className="kpi-trend up"><ArrowUpRight /> This 7 days</span>
          </div>
        </div>
        <div className="kpi-card kpi-indigo">
          <div className="kpi-icon"><Scales /></div>
          <div className="kpi-body">
            <p>Appeals Active</p>
            <h2>{appeals.length}</h2>
            <span className="kpi-trend neutral">CIT(A) + ITAT</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left: Urgent Notices */}
        <div className="section-card">
          <div className="sc-header">
            <h2>⚡ Urgent Notices <span className="sc-count">{criticalCount + dueThisWeek.length}</span></h2>
            <Link href="/income-tax-dashboard/notices" className="sc-link">View All →</Link>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {notices.filter(n => n.status === 'Critical' || dueThisWeek.includes(n)).slice(0, 5).map(n => {
                const daysLeft = Math.ceil((new Date(n.dueDate) - today) / 86400000);
                return (
                  <div key={n.noticeId} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem 1rem', background: 'var(--bg)', borderRadius: '10px',
                    border: `1px solid ${daysLeft <= 3 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      background: daysLeft <= 3 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: daysLeft <= 3 ? '#ef4444' : '#f59e0b', fontWeight: 800, fontSize: '0.75rem',
                    }}>
                      {daysLeft <= 0 ? 'OD' : `${daysLeft}d`}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{n.taxpayer}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                        Sec {n.section} · AY {n.ay} · {n.type}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {n.demandAmount > 0 && (
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>
                          ₹{(n.demandAmount / 100000).toFixed(1)}L
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>Due: {new Date(n.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                    </div>
                    <Link href="/income-tax-dashboard/notices" style={{ color: 'var(--text-soft)' }}>
                      <CaretRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Calendar */}
        <div className="section-card">
          <div className="sc-header">
            <h2>📅 Due Date Calendar</h2>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <MiniCalendar notices={notices} />
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Upcoming
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Overdue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section-wise distribution + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Section Distribution */}
        <div className="section-card">
          <div className="sc-header">
            <h2>📊 Section-wise Distribution</h2>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(sectionDist).sort((a, b) => b[1] - a[1]).map(([sec, count]) => {
                const pct = (count / notices.length) * 100;
                const colors = { '143(2)': '#6366F1', '148A': '#ef4444', '153A': '#f59e0b', '270A': '#ec4899', '263': '#8B5CF6' };
                const color = colors[sec] || '#10b981';
                return (
                  <div key={sec} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 70, fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>§{sec}</div>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, width: 30, textAlign: 'right' }}>{count}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-soft)' }}>Total Demand Exposure</span>
              <span style={{ fontWeight: 800, color: '#ef4444' }}>₹{(totalDemand / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="section-card">
          <div className="sc-header">
            <h2>🕐 Recent Activity</h2>
          </div>
          <div style={{ padding: '1rem 1.25rem', maxHeight: '360px', overflowY: 'auto' }}>
            <ActivityFeed notices={notices} />
          </div>
        </div>
      </div>

      {/* Quick Module Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Taxpayer Directory', icon: <UserList size={20} />, href: '/income-tax-dashboard/taxpayers', color: '#6366F1' },
          { label: 'IT Notice Inbox', icon: <WarningOctagon size={20} />, href: '/income-tax-dashboard/notices', color: '#ef4444' },
          { label: 'AI Drafting Centre', icon: <FileText size={20} />, href: '/income-tax-dashboard/drafting', color: '#8B5CF6' },
          { label: 'Assessments & Appeals', icon: <Gavel size={20} />, href: '/income-tax-dashboard/assessments', color: '#f59e0b' },
          { label: 'AI Legal Search', icon: <MagnifyingGlass size={20} />, href: '/income-tax-dashboard/ai-search', color: '#10b981' },
        ].map(link => (
          <Link key={link.label} href={link.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.25rem',
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px',
            textDecoration: 'none', color: 'var(--text)', transition: 'all 0.2s',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${link.color}15`, color: link.color,
            }}>{link.icon}</div>
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{link.label}</span>
            <CaretRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-soft)' }} />
          </Link>
        ))}
      </div>

      <style jsx>{`
        .it-mini-calendar { width: 100%; }
        .cal-header { text-align: center; font-weight: 700; font-size: 0.92rem; margin-bottom: 0.75rem; }
        .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
        .cal-wk { text-align: center; font-size: 0.65rem; font-weight: 700; color: var(--text-soft); padding: 0.25rem; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .cal-cell {
          aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          border-radius: 6px; font-size: 0.78rem; font-weight: 500; position: relative; cursor: default;
          transition: all 0.15s;
        }
        .cal-cell.empty { background: none; }
        .cal-cell.today { background: rgba(99,102,241,0.15); color: #6366F1; font-weight: 800; }
        .cal-cell.due { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); }
        .cal-cell.overdue { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); }
        .cal-dot { width: 4px; height: 4px; border-radius: 50%; position: absolute; bottom: 3px; }
      `}</style>
    </section>
  );
}

"use client";

import { useState } from 'react';
import { ArrowsLeftRight, WarningOctagon, ShieldWarning, CurrencyInr, Buildings, ArrowRight, Globe, HandCoins } from '@phosphor-icons/react';
import { CROSS_ACT_REFERENCES } from '@/data/it_legal_corpus';
import { IT_NOTICES_DB } from '@/data/it_notices_data';
import Link from 'next/link';

const ACT_ICONS = {
  FEMA: { icon: <Globe size={24} />, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  PMLA: { icon: <ShieldWarning size={24} />, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  Benami: { icon: <Buildings size={24} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  BlackMoney: { icon: <CurrencyInr size={24} />, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7c3aed)' },
  GST: { icon: <HandCoins size={24} />, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
};

function generateCrossActAlerts(notices) {
  const alerts = [];
  let idCounter = 1;
  for (const notice of notices) {
    if (notice.section === '153A') {
      alerts.push({
        id: `XA-00${idCounter++}`, taxpayer: notice.taxpayer, pan: notice.pan,
        sourceNotice: `${notice.noticeId} (§${notice.section} Search)`,
        crossActs: ['PMLA', 'Benami'], severity: 'High',
        summary: 'Search u/s 132 uncovered undisclosed properties or transactions. ED referral likely.',
        flagDate: notice.dateIssued,
      });
    } else if (notice.section === '263') {
      alerts.push({
        id: `XA-00${idCounter++}`, taxpayer: notice.taxpayer, pan: notice.pan,
        sourceNotice: `${notice.noticeId} (§${notice.section} Revision)`,
        crossActs: ['Benami', 'GST'], severity: 'Medium',
        summary: 'Bogus sub-contractor payments may involve benami entities. GST turnover mismatch detected.',
        flagDate: notice.dateIssued,
      });
    } else if (notice.section === '270A') {
      alerts.push({
        id: `XA-00${idCounter++}`, taxpayer: notice.taxpayer, pan: notice.pan,
        sourceNotice: `${notice.noticeId} (§${notice.section} Penalty)`,
        crossActs: ['FEMA', 'GST'], severity: 'Medium',
        summary: 'Under-reporting of income aligns with GST mismatch. Cross-verification needed.',
        flagDate: notice.dateIssued,
      });
    } else if (notice.section === '201') {
      alerts.push({
        id: `XA-00${idCounter++}`, taxpayer: notice.taxpayer, pan: notice.pan,
        sourceNotice: `${notice.noticeId} (§${notice.section} TDS Default)`,
        crossActs: ['FEMA'], severity: 'Low',
        summary: 'Foreign remittances without TDS u/s 195 may trigger FEMA scrutiny.',
        flagDate: notice.dateIssued,
      });
    }
  }
  return alerts;
}

function CrossActDetail({ act, onClose }) {
  const ref = CROSS_ACT_REFERENCES[act];
  const cfg = ACT_ICONS[act];
  if (!ref) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border)', background: `${cfg.color}08` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {cfg.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{ref.title}</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Cross-Act Reference Guide</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ position: 'absolute', top: '1.5rem', right: '1.75rem', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>✕ Close</button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem' }}>
          {/* Triggers */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚡ Trigger Points</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {ref.triggers.map((t, i) => (
                <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <WarningOctagon size={14} color={cfg.color} /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* IT Act Linkage */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🔗 Linked IT Act Sections</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {ref.itSections.map((s, i) => (
                <span key={i} style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(99,102,241,0.1)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.2)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Penalties */}
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.4rem' }}>⚠️ Penalty Exposure</div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{ref.penalties}</div>
          </div>

          {/* Professional Guidance */}
          <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>💡 Professional Guidance</div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text)' }}>{ref.guidance}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrossActPage() {
  const [selectedAct, setSelectedAct] = useState(null);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const CROSS_ACT_ALERTS = generateCrossActAlerts(IT_NOTICES_DB.notices);

  return (
    <section className="view active" id="view-it-crossact">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowsLeftRight size={24} weight="duotone" color="#ec4899" /> Cross-Act Notice Handling
          </h1>
          <p>Detect and manage cross-act implications: FEMA · PMLA · Benami · Black Money · GST</p>
        </div>
        <div className="header-actions">
        </div>
      </div>

      {/* Act Reference Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(CROSS_ACT_REFERENCES).map(([key, ref]) => {
          const cfg = ACT_ICONS[key];
          return (
            <div key={key} className="section-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setSelectedAct(key)}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${cfg.color}20`; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '10px', background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{key === 'BlackMoney' ? 'Black Money Act' : key}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{ref.title.split('—')[0]?.trim()}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                  {ref.triggers.length} trigger points · {ref.itSections.length} linked IT sections
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: cfg.color, fontWeight: 600 }}>
                  View Guide <ArrowRight size={12} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Cross-Act Alerts */}
      <div className="section-card" style={{ marginBottom: '1.5rem' }}>
        <div className="sc-header">
          <h2>🚨 Active Cross-Act Alerts <span className="sc-count">{CROSS_ACT_ALERTS.length}</span></h2>
        </div>
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CROSS_ACT_ALERTS.map(alert => (
              <div key={alert.id} style={{
                padding: '1rem', background: 'var(--bg)', borderRadius: '10px',
                border: `1px solid ${alert.severity === 'High' ? 'rgba(239,68,68,0.3)' : alert.severity === 'Medium' ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{alert.id}</span>
                    <span style={{
                      padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                      background: alert.severity === 'High' ? 'rgba(239,68,68,0.1)' : alert.severity === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      color: alert.severity === 'High' ? '#ef4444' : alert.severity === 'Medium' ? '#f59e0b' : '#10b981',
                    }}>{alert.severity}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alert.taxpayer}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-soft)' }}>{alert.pan}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>
                    Flagged: {new Date(alert.flagDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>Source: </span>{alert.sourceNotice}
                </div>

                <div style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>{alert.summary}</div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {alert.crossActs.map(act => {
                    const cfg = ACT_ICONS[act];
                    return (
                      <button key={act} onClick={() => setSelectedAct(act)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.55rem',
                          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}30`,
                        }}>
                        {act === 'BlackMoney' ? 'Black Money' : act}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Reference Matrix */}
      <div className="section-card">
        <div className="sc-header"><h2>🔗 IT Section ↔ Cross-Act Linkage Matrix</h2></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>IT Section</th>
                <th>Description</th>
                <th>FEMA</th><th>PMLA</th><th>Benami</th><th>Black Money</th><th>GST</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sec: '§68', desc: 'Cash Credits', fema: false, pmla: true, benami: false, bm: false, gst: false },
                { sec: '§69', desc: 'Unexplained Investments', fema: true, pmla: true, benami: true, bm: true, gst: false },
                { sec: '§69A', desc: 'Unexplained Money', fema: true, pmla: true, benami: false, bm: true, gst: false },
                { sec: '§69C', desc: 'Unexplained Expenditure', fema: false, pmla: true, benami: false, bm: false, gst: true },
                { sec: '§5', desc: 'Scope of Total Income', fema: true, pmla: false, benami: false, bm: true, gst: false },
                { sec: '§9', desc: 'Income Deemed to Accrue in India', fema: true, pmla: false, benami: false, bm: true, gst: false },
                { sec: 'Sch FA', desc: 'Foreign Assets Disclosure', fema: true, pmla: false, benami: false, bm: true, gst: false },
                { sec: '§56(2)(x)', desc: 'Gift Taxation', fema: false, pmla: false, benami: true, bm: false, gst: false },
                { sec: '§44AB', desc: 'Tax Audit Threshold', fema: false, pmla: false, benami: false, bm: false, gst: true },
                { sec: '§195', desc: 'TDS on Foreign Payments', fema: true, pmla: false, benami: false, bm: false, gst: false },
              ].map(row => (
                <tr key={row.sec}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366F1' }}>{row.sec}</span></td>
                  <td>{row.desc}</td>
                  {[row.fema, row.pmla, row.benami, row.bm, row.gst].map((linked, i) => (
                    <td key={i} style={{ textAlign: 'center' }}>
                      {linked ? (
                        <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: 900, lineHeight: '18px' }}>✓</span>
                      ) : (
                        <span style={{ color: 'var(--text-soft)', fontSize: '0.72rem' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAct && <CrossActDetail act={selectedAct} onClose={() => setSelectedAct(null)} />}
    </section>
  );
}

"use client";

import { useState } from 'react';
import { Gavel, Scales, WarningOctagon, CurrencyInr, Brain, FileText, ShieldCheck, UploadSimple } from '@phosphor-icons/react';
import { IT_NOTICES_DB } from '@/data/it_notices_data';
import Link from 'next/link';

const APPEAL_STAGES = ['AO Order', 'CIT(A)', 'ITAT', 'High Court', 'Supreme Court'];

function AppealTimeline({ appeal }) {
  const stageIndex = APPEAL_STAGES.indexOf(appeal.stage);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflowX: 'auto', padding: '0.5rem 0' }}>
      {APPEAL_STAGES.map((stage, i) => (
        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700,
            background: i <= stageIndex ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'var(--bg)',
            color: i <= stageIndex ? '#fff' : 'var(--text-soft)',
            border: i <= stageIndex ? 'none' : '1px solid var(--border)',
          }}>{i + 1}</div>
          <span style={{ fontSize: '0.72rem', fontWeight: i === stageIndex ? 700 : 400, color: i === stageIndex ? '#6366F1' : 'var(--text-soft)', whiteSpace: 'nowrap' }}>{stage}</span>
          {i < APPEAL_STAGES.length - 1 && <div style={{ width: 20, height: 2, background: i < stageIndex ? '#8B5CF6' : 'var(--border)' }} />}
        </div>
      ))}
    </div>
  );
}

export default function AssessmentsPage() {
  const { assessments, appeals, notices } = IT_NOTICES_DB;
  const [activeTab, setActiveTab] = useState('assessments');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const totalAdditions = assessments.reduce((s, a) => s + (a.additions || 0), 0);
  const totalDispute = appeals.reduce((s, a) => s + (a.demandInDispute || 0), 0);

  const handleAIAnalysis = async (assessment) => {
    setIsAnalysing(true);
    try {
      const res = await fetch('/api/it-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeData: {
            taxpayer: assessment.taxpayer, pan: assessment.pan, ay: assessment.ay,
            section: assessment.type, type: 'Assessment Order Analysis',
            issuesRaised: assessment.disallowances.map(d => `${d.head}: ₹${Number(d.amount).toLocaleString('en-IN')} u/s ${d.section}`).join('; '),
            demandAmount: assessment.additions,
          },
          draftType: 'Assessment Order Analysis with Grounds of Appeal',
          additionalContext: `Assessment type: ${assessment.type}. Total additions: ₹${Number(assessment.additions).toLocaleString('en-IN')}. Penalty levied: ₹${Number(assessment.penaltyLevied || 0).toLocaleString('en-IN')}. Current status: ${assessment.status}. Appeal stage: ${assessment.appealStage || 'None'}.`,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.draft || data.error);
    } catch {
      setAiAnalysis('Error connecting to AI service.');
    }
    setIsAnalysing(false);
  };

  return (
    <section className="view active" id="view-it-assessments">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gavel size={24} weight="duotone" color="#f59e0b" /> Assessments & Appeals Tracker
          </h1>
          <p>Track assessment orders, additions, penalties, and multi-level appeals</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 3px 10px rgba(14,165,233,.3)' }} onClick={() => alert('Upload Document: attach assessment order, VC links, hearing notices here')}><FileText size={14} /> Upload Order / Doc</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-blue"><div className="kpi-icon"><FileText /></div><div className="kpi-body"><p>Assessments</p><h2>{assessments.length}</h2></div></div>
        <div className="kpi-card kpi-danger"><div className="kpi-icon"><CurrencyInr /></div><div className="kpi-body"><p>Total Additions</p><h2>₹{(totalAdditions / 100000).toFixed(1)}L</h2></div></div>
        <div className="kpi-card kpi-indigo"><div className="kpi-icon"><Scales /></div><div className="kpi-body"><p>Active Appeals</p><h2>{appeals.length}</h2></div></div>
        <div className="kpi-card kpi-amber"><div className="kpi-icon"><CurrencyInr /></div><div className="kpi-body"><p>Demand in Dispute</p><h2>₹{(totalDispute / 100000).toFixed(1)}L</h2></div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['assessments', '📊 Assessment Orders'], ['appeals', '⚖️ Appeals'], ['ai', '🧠 AI Order Analyser']].map(([tab, label]) => (
          <button key={tab} className={`btn-secondary ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setAiAnalysis(null); }}
            style={{ borderColor: activeTab === tab ? '#6366F1' : undefined, color: activeTab === tab ? '#6366F1' : undefined, background: activeTab === tab ? 'rgba(99,102,241,0.06)' : undefined }}>
            {label}
          </button>
        ))}
      </div>

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assessments.map(a => (
            <div key={a.assessmentId} className="section-card">
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800 }}>{a.assessmentId}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#6366F1' }}>{a.type}</span>
                      <span style={{
                        padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                        background: a.status === 'Appeal Filed' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        color: a.status === 'Appeal Filed' ? '#6366F1' : '#f59e0b',
                      }}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{a.taxpayer} · PAN: {a.pan} · AY {a.ay}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>Order Date</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(a.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Disallowances */}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Additions / Disallowances</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {a.disallowances.map((d, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{d.head}</div>
                      <div style={{ color: '#ef4444', fontWeight: 700 }}>₹{Number(d.amount).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>§{d.section}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  <div>Total Additions: <strong style={{ color: '#ef4444' }}>₹{Number(a.additions).toLocaleString('en-IN')}</strong></div>
                  {a.penaltyLevied > 0 && <div>Penalty: <strong style={{ color: '#ef4444' }}>₹{Number(a.penaltyLevied).toLocaleString('en-IN')}</strong></div>}
                  {a.appealStage && <div>Appeal at: <strong style={{ color: '#6366F1' }}>{a.appealStage}</strong></div>}
                  {a.appealDueDate && <div>Appeal Due: <strong style={{ color: '#ef4444' }}>{new Date(a.appealDueDate).toLocaleDateString('en-GB')}</strong></div>}
                  {a.appealSection && <div>Appeal Section: <strong style={{ color: '#6366F1' }}>§{a.appealSection}</strong></div>}
                  {a.personalHearingDate && <div>Personal Hearing: <strong style={{ color: '#f59e0b' }}>{new Date(a.personalHearingDate).toLocaleDateString('en-GB')}</strong></div>}
                  {a.videoConferencingLink && <div>VC Link: <a href={a.videoConferencingLink} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>Join Meeting</a></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appeals Tab */}
      {activeTab === 'appeals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appeals.map(a => (
            <div key={a.appealId} className="section-card">
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{a.appealId} — {a.taxpayer}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>PAN: {a.pan} · AY {a.ay} · Grounds: {a.grounds}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {a.stayGranted && (
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <ShieldCheck size={12} style={{ position: 'relative', top: '1px' }} /> Stay Granted
                      </span>
                    )}
                  </div>
                </div>

                <AppealTimeline appeal={a} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: 700 }}>Filed</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(a.filedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                  </div>
                  <div style={{ padding: '0.6rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: 700 }}>Next Hearing</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>{new Date(a.nextHearing).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                  </div>
                  <div style={{ padding: '0.6rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: 700 }}>Demand in Dispute</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>₹{(a.demandInDispute / 100000).toFixed(1)}L</div>
                  </div>
                  <div style={{ padding: '0.6rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontWeight: 700 }}>Status</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: a.status === 'Pending' ? '#f59e0b' : '#10b981' }}>{a.status}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analyser Tab */}
      {activeTab === 'ai' && (
        <div className="section-card">
          <div className="sc-header"><h2>🧠 AI Order Analyser</h2></div>
          <div style={{ padding: '1.25rem' }}>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginBottom: '1rem' }}>Select an assessment order to generate AI-powered analysis with grounds of appeal and case law references.</p>
            
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {assessments.map(a => (
                <button key={a.assessmentId} onClick={() => handleAIAnalysis(a)} disabled={isAnalysing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
                    cursor: isAnalysing ? 'wait' : 'pointer', textAlign: 'left', color: 'var(--text)', transition: 'all 0.2s',
                  }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.assessmentId} — {a.taxpayer}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{a.type} · AY {a.ay} · Additions ₹{(a.additions / 100000).toFixed(1)}L</div>
                  </div>
                  <Brain size={20} color="#8B5CF6" />
                </button>
              ))}
            </div>

            {isAnalysing && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B5CF6', animation: `typingBounce 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                  ))}
                </div>
                <div style={{ color: 'var(--text-soft)' }}>AI is analysing the assessment order…</div>
              </div>
            )}

            {aiAnalysis && !isAnalysing && (
              <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6, fontSize: '0.82rem', maxHeight: '500px', overflowY: 'auto' }}>
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

"use client";

import { useState } from 'react';
import { FileText, Spinner, Copy, Brain } from '@phosphor-icons/react';
import { IT_NOTICES_DB, IT_NOTICE_TYPES } from '@/data/it_notices_data';
import { IT_SECTIONS, IT_DRAFTING_GUIDES } from '@/data/it_legal_corpus';
import { ITDraftingEngine } from '@/lib/it_drafting_engine';
import Link from 'next/link';

const TEMPLATES = [
  { value: '143(2)', label: 'Reply to §143(2) Scrutiny Notice' },
  { value: '148A', label: 'Reply to §148A Pre-Reassessment Notice' },
  { value: '139(9)', label: 'Response to §139(9) Defective Return' },
  { value: '270A', label: 'Reply to §270A Penalty Notice' },
  { value: '263', label: 'Reply to §263 CIT Revision' },
  { value: '156', label: 'Response to §156 Demand Notice' },
  { value: '153A', label: 'Reply to §153A Search Assessment' },
  { value: 'Form35', label: 'Form 35 — Appeal to CIT(A)' },
  { value: 'Form36', label: 'Form 36 — Appeal to ITAT' },
  { value: 'Stay', label: 'Stay Application' },
  { value: 'Adjournment', label: 'Adjournment Application' },
  { value: 'Condonation', label: 'Condonation of Delay' },
  { value: '154', label: '§154 Rectification Application' },
  { value: '264', label: '§264 Revision Application' },
  { value: '273A', label: '§273A/B Penalty Waiver' },
];

export default function ITDraftingPage() {
  const [selectedNotice, setSelectedNotice] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [draftOutput, setDraftOutput] = useState('');
  const [aiDraft, setAiDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');
  const [activeMode, setActiveMode] = useState('template'); // 'template' or 'ai'

  const notice = IT_NOTICES_DB.notices.find(n => n.noticeId === selectedNotice);
  const guide = notice ? IT_DRAFTING_GUIDES[notice.section] : null;
  const sectionInfo = notice ? IT_SECTIONS[notice.section] : null;

  const handleTemplateDraft = () => {
    if (!notice) { alert('Please select a notice first.'); return; }
    const result = ITDraftingEngine.generate(notice);
    setDraftOutput(result.full);
  };

  const handleAIDraft = async () => {
    if (!notice) { alert('Please select a notice first.'); return; }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/it-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeData: notice,
          draftType: selectedTemplate || 'Formal Reply',
          additionalContext,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAiDraft('⚠️ Error: ' + data.error);
      } else {
        setAiDraft(data.draft);
      }
    } catch (err) {
      setAiDraft('⚠️ Connection error. Make sure the dev server is running.');
    }
    setIsGenerating(false);
  };

  return (
    <section className="view active" id="view-it-drafting">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} weight="duotone" color="#8B5CF6" />
            IT Notice Drafts
          </h1>
          <p>Generate professional Income Tax notice drafts using templates or AI</p>
        </div>
        <div className="header-actions">
          <Link href="/income-tax-dashboard/notices" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-soft)', fontSize: '0.85rem' }}>IT Notices →</Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="mf-group">
          <label className="mf-label">Select Notice</label>
          <select className="mf-input" value={selectedNotice} onChange={e => setSelectedNotice(e.target.value)} style={{ padding: '0.5rem 0.75rem' }}>
            <option value="">— Choose a notice —</option>
            {IT_NOTICES_DB.notices.map(n => (
              <option key={n.noticeId} value={n.noticeId}>{n.noticeId} — {n.taxpayer} — §{n.section} (AY {n.ay})</option>
            ))}
          </select>
        </div>
        <div className="mf-group">
          <label className="mf-label">Template Type</label>
          <select className="mf-input" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={{ padding: '0.5rem 0.75rem' }}>
            <option value="">— Auto-detect from notice —</option>
            {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button className="btn-secondary" onClick={handleTemplateDraft} style={{ height: 'fit-content' }}>
            <FileText size={14} /> Template Draft
          </button>
          <button className="btn-primary" onClick={handleAIDraft} disabled={isGenerating} style={{ height: 'fit-content' }}>
            <Brain size={14} /> {isGenerating ? 'Generating…' : 'AI Draft'}
          </button>
        </div>
      </div>

      {/* Split Screen */}
      <div style={{ display: 'grid', gridTemplateColumns: notice ? '340px 1fr' : '1fr', gap: '1.5rem' }}>
        
        {/* Left: Notice Info + Guide */}
        {notice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Notice Summary Card */}
            <div className="section-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Selected Notice</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{notice.noticeId} — §{notice.section}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>{notice.taxpayer}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div><span style={{ color: 'var(--text-soft)' }}>PAN:</span> <strong>{notice.pan}</strong></div>
                <div><span style={{ color: 'var(--text-soft)' }}>AY:</span> <strong>{notice.ay}</strong></div>
                <div><span style={{ color: 'var(--text-soft)' }}>Due:</span> <strong style={{ color: '#ef4444' }}>{new Date(notice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong></div>
                <div><span style={{ color: 'var(--text-soft)' }}>AO:</span> <strong>{notice.aoName?.split(',')[0]}</strong></div>
              </div>
              {notice.demandAmount > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', fontSize: '0.82rem' }}>
                  Demand: <strong style={{ color: '#ef4444' }}>₹{Number(notice.demandAmount).toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>

            {/* Section Guide */}
            {sectionInfo && (
              <div className="section-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>§{notice.section} — Quick Guide</div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-soft)', marginBottom: '0.75rem' }}>{sectionInfo.summary?.substring(0, 200)}…</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.3rem' }}>TIME LIMIT</div>
                <div style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>{sectionInfo.timeLimit?.substring(0, 120)}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '0.3rem' }}>KEY DEFENCES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {sectionInfo.defences?.slice(0, 4).map((d, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg)', borderRadius: '4px' }}>• {d}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Context for AI */}
            <div className="section-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Additional Context (for AI)</div>
              <textarea
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                placeholder="Add case-specific facts, client instructions, or focus areas for the AI draft…"
                style={{
                  width: '100%', height: '100px', padding: '0.65rem', borderRadius: '8px',
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
                  fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Draft Output */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          <div className="sc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>📝 Draft Output</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(draftOutput || aiDraft) && (
                <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={() => {
                  navigator.clipboard.writeText(draftOutput || aiDraft);
                  alert('Copied to clipboard!');
                }}>
                  <Copy size={12} /> Copy
                </button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B5CF6', animation: `typingBounce 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                  ))}
                </div>
                <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>TaxGuard AI is generating your draft…</div>
              </div>
            ) : draftOutput || aiDraft ? (
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.65, fontSize: '0.82rem' }}>
                {aiDraft || draftOutput}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-soft)' }}>
                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No draft generated yet</div>
                <div style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '400px' }}>
                  Select a notice above and click "Template Draft" for instant generation or "AI Draft" for an AI-powered professional reply.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

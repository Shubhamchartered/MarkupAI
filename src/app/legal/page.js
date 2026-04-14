"use client";

import { useState, useRef } from 'react';
import { Scales, UploadSimple, FilePlus, CalendarBlank, DownloadSimple, PaperPlaneTilt, Copy, X, CaretDown, Warning, CheckCircle, ArrowRight, Printer } from '@phosphor-icons/react';
import { PROMPT_LIBRARY } from '@/data/prompt_library';

const RISK_COLORS = { critical: '#EF4444', high: '#F59E0B', medium: '#10B981', low: '#6366F1' };
const RISK_LABELS = { critical: '🚨 Critical', high: '⚠️ High', medium: '🔵 Medium', low: '✅ Low' };

// ── Category Selector Card ─────────────────────────────────────────────────
function CategoryCard({ cat, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `2px solid ${selected ? cat.color : 'var(--border)'}`,
      borderRadius: '12px', padding: '1rem', cursor: 'pointer',
      background: selected ? `${cat.color}12` : 'var(--bg-elevated)',
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ height: '3px', background: cat.color, borderRadius: '99px', marginBottom: '0.75rem' }} />
      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem', lineHeight: '1.3' }}>{cat.title}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>{cat.sections}</div>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '99px',
        background: `${RISK_COLORS[cat.risk]}20`, color: RISK_COLORS[cat.risk], border: `1px solid ${RISK_COLORS[cat.risk]}40`
      }}>{RISK_LABELS[cat.risk]}</span>
      {selected && (
        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={12} color="#fff" weight="bold" />
        </div>
      )}
    </div>
  );
}

// ── Field Renderer ─────────────────────────────────────────────────────────
function FormField({ field, value, onChange }) {
  const base = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: 'var(--text)', fontSize: '0.88rem', fontFamily: 'inherit', transition: 'all 0.2s', resize: 'vertical' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {field.label}{field.required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea rows={3} style={{ ...base }} placeholder={field.placeholder} value={value} onChange={e => onChange(field.id, e.target.value)} />
      ) : (
        <input type={field.type} style={{ ...base }} placeholder={field.placeholder} value={value} onChange={e => onChange(field.id, e.target.value)} />
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function LegalPage() {
  const [step, setStep] = useState(1); // 1=select, 2=intake, 3=draft
  const [selectedCat, setSelectedCat] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [savedDrafts, setSavedDrafts] = useState([]);
  const fileInputRef = useRef(null);
  const draftRef = useRef(null);

  const updateField = (id, val) => setFormData(prev => ({ ...prev, [id]: val }));

  const handleUpload = (e) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (!selectedCat) { alert('Select a notice category first, then upload.'); e.target.value = ''; return; }
    // Mock auto-fill from upload
    const autoFill = {
      notice_reference_number: `${selectedCat.id.toUpperCase().substring(0,6)}/AUTO/${new Date().getFullYear()}/001`,
      date_of_notice: new Date().toISOString().split('T')[0],
      reply_due_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      department_allegation: `[Auto-extracted from: ${file.name}] — Department has alleged discrepancies as per the uploaded notice document.`,
    };
    setFormData(prev => ({ ...prev, ...autoFill }));
    alert(`✅ "${file.name}" parsed! Key fields auto-filled. Please verify and complete remaining details.`);
    setStep(2);
    e.target.value = '';
  };

  const generateDraft = () => {
    if (!selectedCat) { alert('Please select a notice category.'); return; }
    const text = selectedCat.draft_template(formData);
    setGeneratedDraft(text);
    const newDraft = {
      id: `DRF-${Date.now()}`,
      title: selectedCat.title,
      color: selectedCat.color,
      risk: selectedCat.risk,
      client: formData.legal_name || 'Unnamed Client',
      notice_ref: formData.notice_reference_number || 'N/A',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      text,
    };
    setSavedDrafts(prev => [newDraft, ...prev]);
    setStep(3);
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    alert('Draft copied to clipboard!');
  };

  const printDraft = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>GST Notice Reply — MARKUP.AI</title><style>body{font-family:'Courier New',monospace;font-size:13px;line-height:1.7;padding:40px;white-space:pre-wrap;max-width:800px;margin:0 auto}h1{font-family:sans-serif;font-size:16px;}</style></head><body><h1>GST Notice Reply — Generated by MARKUP.AI</h1><pre>${generatedDraft}</pre></body></html>`);
    w.document.close();
    w.print();
  };

  const resetFlow = () => { setStep(1); setSelectedCat(null); setFormData({}); setGeneratedDraft(''); };

  // Fields to show — always common fields; only show monetary/hearing fields if relevant
  const visibleFields = PROMPT_LIBRARY.common_fields;

  return (
    <section className="view active" id="view-legal">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scales size={26} /> Litigation Draft Centre
          </h1>
          <p style={{ marginTop: '0.25rem' }}>
            Select notice type → fill intake form → generate department-ready reply in formal GST legal language.
          </p>
        </div>
        <div className="header-actions">
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.json,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.webp" onChange={handleUpload} />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <UploadSimple size={16} /> Upload Notice (All Types)
          </button>
          {step > 1 && (
            <button className="btn-secondary" onClick={resetFlow}><X size={14} /> New Draft</button>
          )}
          {step === 2 && (
            <button className="btn-primary" onClick={generateDraft}><FilePlus size={16} /> Generate Draft</button>
          )}
        </div>
      </div>

      {/* ── Step Indicators ── */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', alignItems: 'center' }}>
        {[
          [1, '1', 'Select Category'],
          ['arrow1', null, null],
          [2, '2', 'Fill Intake Form'],
          ['arrow2', null, null],
          [3, '3', 'Review & Save Draft'],
        ].map((item) => {
          if (item[1] === null) return <ArrowRight key={item[0]} size={16} color="var(--text-soft)" style={{ margin: '0 0.5rem' }} />;
          const isActive = step === item[0];
          const isDone = step > item[0];
          return (
            <div key={item[0]} onClick={() => { if (isDone) setStep(item[0]); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
              borderRadius: '8px', cursor: isDone ? 'pointer' : 'default',
              background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: `1px solid ${isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--border)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0
              }}>{isDone ? '✓' : item[0]}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--text-soft)' }}>{item[2]}</span>
            </div>
          );
        })}
      </div>

      {/* ════════════ STEP 1: Category Selection ════════════ */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Select GST Notice Category</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{PROMPT_LIBRARY.categories.length} categories available</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {PROMPT_LIBRARY.categories.map(cat => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                selected={selectedCat?.id === cat.id}
                onClick={() => { setSelectedCat(cat); }}
              />
            ))}
          </div>
          {selectedCat && (
            <div style={{ background: 'var(--bg-surface)', border: `1px solid ${selectedCat.color}`, borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>{selectedCat.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: '0.75rem' }}>{selectedCat.sections}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedCat.dashboard_labels.map(l => (
                      <span key={l} style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, background: `${selectedCat.color}18`, color: selectedCat.color, border: `1px solid ${selectedCat.color}35` }}>{l}</span>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setStep(2)} style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedCat.color}cc)`, boxShadow: `0 4px 14px ${selectedCat.color}50`, flexShrink: 0 }}>
                  Proceed to Intake Form <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>⚡ Clarifying Questions This Draft Will Address</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedCat.clarification_questions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.83rem', color: 'var(--text)' }}>
                      <span style={{ color: selectedCat.color, fontWeight: 700, flexShrink: 0 }}>Q{i+1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ STEP 2: Intake Form ════════════ */}
      {step === 2 && selectedCat && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Form */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 4, height: 24, borderRadius: '99px', background: selectedCat.color }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedCat.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{selectedCat.sections}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-soft)' }}>← Back</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {visibleFields.map(field => (
                <div key={field.id} style={{ gridColumn: (field.type === 'textarea' || ['legal_name', 'department_allegation', 'client_explanation', 'documents_available', 'returns_filed', 'payment_made', 'relief_sought', 'special_instructions'].includes(field.id)) ? '1 / -1' : 'span 1' }}>
                  <FormField field={field} value={formData[field.id] || ''} onChange={updateField} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={resetFlow}>Cancel</button>
              <button className="btn-primary" onClick={generateDraft} style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedCat.color}cc)`, boxShadow: `0 4px 14px ${selectedCat.color}40` }}>
                <FilePlus size={16} /> Generate Draft Reply
              </button>
            </div>
          </div>

          {/* Right: Sidebar Helper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: `1px solid ${selectedCat.color}50`, borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedCat.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>📋 Clarifying Questions</div>
              {selectedCat.clarification_questions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.82rem', alignItems: 'flex-start' }}>
                  <span style={{ color: selectedCat.color, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>Q{i+1}.</span>
                  <span style={{ color: 'var(--text)', lineHeight: '1.45' }}>{q}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>✅ Review Checklist</div>
              {selectedCat.review_checklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.82rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10B981', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <span style={{ color: 'var(--text)', lineHeight: '1.4' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', padding: '1rem', fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 700, color: '#6366F1', marginBottom: '0.4rem' }}>📜 Global Drafting Rules</div>
              {PROMPT_LIBRARY.global_rules.slice(0, 5).map((r, i) => <div key={i}>• {r}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ STEP 3: Generated Draft ════════════ */}
      {step === 3 && generatedDraft && (
        <div>
          <div style={{ background: 'var(--bg-surface)', border: `1px solid ${selectedCat?.color || 'var(--border)'}`, borderRadius: '16px', overflow: 'hidden' }}>
            {/* Draft header */}
            <div style={{ background: `linear-gradient(135deg, ${selectedCat?.color || '#6366F1'}15, transparent)`, padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>📄 {selectedCat?.title || 'Draft'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                  {formData.legal_name || '[Client]'} · {formData.notice_reference_number || '[Notice Ref]'} · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => setStep(2)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>← Edit</button>
                <button className="btn-secondary" onClick={copyDraft} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Copy size={14} /> Copy</button>
                <button className="btn-secondary" onClick={printDraft} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Printer size={14} /> Print / PDF</button>
                <button className="btn-primary" onClick={resetFlow} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><FilePlus size={14} /> New Draft</button>
              </div>
            </div>

            {/* Review checklist banner */}
            {selectedCat?.review_checklist && (
              <div style={{ background: 'rgba(16,185,129,0.06)', borderBottom: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ Review Checklist:</span>
                {selectedCat.review_checklist.map((item, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={11} color="#10B981" /> {item}
                  </span>
                ))}
              </div>
            )}

            {/* Draft body */}
            <div ref={draftRef} style={{
              padding: '2rem 2.5rem', fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.84rem', lineHeight: '1.85', whiteSpace: 'pre-wrap',
              color: 'var(--text)', maxHeight: '72vh', overflowY: 'auto',
              background: 'var(--bg)'
            }}>
              {generatedDraft}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Saved Drafts ════════════ */}
      {savedDrafts.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Saved Drafts <span style={{ background: '#6366F1', color: '#fff', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>{savedDrafts.length}</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {savedDrafts.map(d => (
              <div key={d.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: d.color }} />
                <div style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.45rem', borderRadius: '99px', background: `${RISK_COLORS[d.risk]}18`, color: RISK_COLORS[d.risk], border: `1px solid ${RISK_COLORS[d.risk]}30` }}>{RISK_LABELS[d.risk]}</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.35rem' }}>{d.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="icon-btn-sm" onClick={() => { setGeneratedDraft(d.text); setSelectedCat(PROMPT_LIBRARY.categories.find(c => c.title === d.title)); setStep(3); }}>👁</button>
                      <button className="icon-btn-sm" onClick={() => { navigator.clipboard.writeText(d.text); alert('Copied!'); }}><Copy size={13} /></button>
                      <button className="icon-btn-sm" onClick={() => setSavedDrafts(prev => prev.filter(x => x.id !== d.id))} style={{ color: '#ef4444' }}><X size={13} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'flex', gap: '1rem' }}>
                    <span>👤 {d.client}</span>
                    <span>📄 {d.notice_ref}</span>
                    <span>📅 {d.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

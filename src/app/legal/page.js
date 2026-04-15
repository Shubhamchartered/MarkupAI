"use client";

import { useState, useRef, useEffect } from 'react';
import { Scales, UploadSimple, FilePlus, CalendarBlank, DownloadSimple, Copy, X, CaretDown, Warning, CheckCircle, ArrowRight, Printer, Eye, Spinner, FileText, Files, PencilSimple, ArrowLeft, MagicWand, ShieldCheck, CloudArrowUp } from '@phosphor-icons/react';
import { PROMPT_LIBRARY } from '@/data/prompt_library';

const RISK_COLORS = { critical: '#EF4444', high: '#F59E0B', medium: '#10B981', low: '#6366F1' };
const RISK_LABELS = { critical: '🚨 Critical', high: '⚠️ High', medium: '🔵 Medium', low: '✅ Low' };
const RISK_BADGE = { critical: { bg: '#EF444420', border: '#EF444440' }, high: { bg: '#F59E0B20', border: '#F59E0B40' }, medium: { bg: '#10B98120', border: '#10B98140' }, low: { bg: '#6366F120', border: '#6366F140' } };

// ── Category Card ──────────────────────────────────────────────────────
function CategoryCard({ cat, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `2px solid ${selected ? cat.color : 'var(--border)'}`,
      borderRadius: '14px', padding: '1.1rem', cursor: 'pointer',
      background: selected ? `${cat.color}10` : 'var(--bg-elevated)',
      transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
    }}
      onMouseOver={e => { if (!selected) e.currentTarget.style.borderColor = cat.color + '60'; }}
      onMouseOut={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ height: '3px', background: cat.color, borderRadius: '99px', marginBottom: '0.65rem' }} />
      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem', lineHeight: '1.35' }}>{cat.title}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{cat.sections}</div>
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '99px',
        background: RISK_BADGE[cat.risk]?.bg, color: RISK_COLORS[cat.risk],
        border: `1px solid ${RISK_BADGE[cat.risk]?.border}`
      }}>{RISK_LABELS[cat.risk]}</span>
      {selected && <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={12} color="#fff" weight="bold" /></div>}
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────────
function Stepper({ step, steps, onStepClick }) {
  return (
    <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const isActive = step === stepNum;
        const isDone = step > stepNum;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div onClick={() => isDone && onStepClick(stepNum)} style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem',
              borderRadius: '8px', cursor: isDone ? 'pointer' : 'default',
              background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: `1px solid ${isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--border)',
                color: '#fff', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0
              }}>{isDone ? '✓' : stepNum}</div>
              <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#6366F1' : isDone ? '#10B981' : 'var(--text-soft)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight size={14} color="var(--text-soft)" style={{ margin: '0 0.3rem' }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Markdown-like text formatter ──────────────────────────────────────
function formatText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg);padding:1rem;border-radius:8px;border:1px solid var(--border);overflow-x:auto;margin:0.5rem 0;font-size:0.8rem;white-space:pre-wrap">$1</pre>')
    .replace(/`(.*?)`/g, '<code style="background:var(--bg);padding:0.12rem 0.35rem;border-radius:4px;font-size:0.85em;border:1px solid var(--border)">$1</code>')
    .replace(/^### (.*?)$/gm, '<h3 style="margin:0.8rem 0 0.35rem;font-size:0.95rem;color:var(--text)">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="margin:1rem 0 0.4rem;font-size:1.05rem;color:var(--text)">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 style="margin:1rem 0 0.5rem;font-size:1.15rem;color:var(--text)">$1</h1>')
    .replace(/^- (.*?)$/gm, '<div style="padding-left:1rem;margin:0.12rem 0">• $1</div>')
    .replace(/^\d+\. (.*?)$/gm, '<div style="padding-left:1rem;margin:0.12rem 0">$&</div>')
    .replace(/\n/g, '<br/>');
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────
export default function LegalPage() {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState(null);

  // OCR State
  const [noticeFile, setNoticeFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractError, setExtractError] = useState('');

  // Brief State
  const [aiBrief, setAiBrief] = useState('');
  const [isBriefing, setIsBriefing] = useState(false);

  // Supporting Docs State
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Draft State
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Saved Drafts
  const [savedDrafts, setSavedDrafts] = useState([]);

  const noticeInputRef = useRef(null);
  const docInputRef = useRef(null);

  const STEPS = ['Select Category', 'Upload & Extract', 'Review & Brief', 'Supporting Docs', 'Generate Draft'];

  // Auto scroll to top on every step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('.main-content, main, .view')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── STEP 2: Upload notice & OCR extract ──────────────────────────────
  const handleNoticeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNoticeFile(file);
    setExtractError('');
    setIsExtracting(true);
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'extract');

      const res = await fetch('/api/ocr', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setExtractError(data.error);
      } else {
        setExtractedData(data.extracted);
        setStep(3); // Auto-advance to review
      }
    } catch (err) {
      setExtractError('Failed to connect to AI. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── STEP 3: Generate AI brief ────────────────────────────────────────
  const generateBrief = async () => {
    if (!extractedData) return;
    setIsBriefing(true);
    setAiBrief('');

    try {
      const formData = new FormData();
      formData.append('action', 'brief');
      formData.append('extractedData', JSON.stringify(extractedData));

      const res = await fetch('/api/ocr', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setAiBrief(`⚠️ Error: ${data.error}`);
      } else {
        setAiBrief(data.brief);
      }
    } catch {
      setAiBrief('⚠️ Failed to connect to AI.');
    } finally {
      setIsBriefing(false);
    }
  };

  // ── STEP 4: Add supporting document ──────────────────────────────────
  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      setSupportingDocs(prev => [...prev, { name: f.name, size: f.size, description: '', file: f }]);
    });
    e.target.value = '';
  };

  const updateDocDescription = (idx, desc) => {
    setSupportingDocs(prev => prev.map((d, i) => i === idx ? { ...d, description: desc } : d));
  };

  const removeDoc = (idx) => setSupportingDocs(prev => prev.filter((_, i) => i !== idx));

  // ── STEP 5: Generate AI Draft ────────────────────────────────────────
  const generateDraft = async () => {
    setIsGenerating(true);
    setGeneratedDraft('');

    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData,
          category: selectedCat?.title || 'GST Notice',
          supportingDocs: supportingDocs.map(d => ({ name: d.name, description: d.description })),
          specialInstructions,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setGeneratedDraft(`⚠️ Error: ${data.error}`);
      } else {
        setGeneratedDraft(data.draft);
        // Save draft
        setSavedDrafts(prev => [{
          id: `DRF-${Date.now()}`,
          title: selectedCat?.title || 'GST Notice',
          color: selectedCat?.color || '#6366F1',
          risk: selectedCat?.risk || 'medium',
          client: extractedData?.legal_name || 'Client',
          gstin: extractedData?.gstin || '',
          notice_ref: extractedData?.notice_reference_number || 'N/A',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          text: data.draft,
        }, ...prev]);
      }
    } catch {
      setGeneratedDraft('⚠️ Failed to connect to AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); };

  const printDraft = (text) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>GST Notice Reply — MARKUP.AI</title><style>body{font-family:'Georgia',serif;font-size:13px;line-height:1.8;padding:50px 60px;max-width:800px;margin:0 auto;color:#1a1a1a}h1,h2,h3{font-family:'Arial',sans-serif}pre{white-space:pre-wrap;font-family:'Courier New',monospace;font-size:12px;}</style></head><body>${text.replace(/\n/g,'<br/>')}</body></html>`);
    w.document.close();
    w.print();
  };

  const resetAll = () => {
    setStep(1); setSelectedCat(null); setNoticeFile(null); setExtractedData(null);
    setExtractError(''); setAiBrief(''); setSupportingDocs([]); setSpecialInstructions('');
    setGeneratedDraft('');
  };

  // ── Extracted data field renderer ────────────────────────────────────
  const DataField = ({ label, value, color }) => {
    if (!value || value === 'null') return null;
    return (
      <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: color || 'var(--text-soft)', marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', wordBreak: 'break-word' }}>{typeof value === 'string' ? value : JSON.stringify(value)}</div>
      </div>
    );
  };

  return (
    <section className="view active" id="view-legal">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Scales size={26} /> Litigation Draft Centre</h1>
          <p>Upload notice → AI extracts details → Review → Upload documents → Generate unique department-ready reply</p>
        </div>
        <div className="header-actions">
          {step > 1 && <button className="btn-secondary" onClick={resetAll}><X size={14} /> Start Over</button>}
        </div>
      </div>

      <Stepper step={step} steps={STEPS} onStepClick={setStep} />

      {/* ════════════ STEP 1: SELECT CATEGORY ════════════ */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Select GST Notice Category</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{PROMPT_LIBRARY.categories.length} categories</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {PROMPT_LIBRARY.categories.map(cat => (
              <CategoryCard key={cat.id} cat={cat} selected={selectedCat?.id === cat.id} onClick={() => setSelectedCat(cat)} />
            ))}
          </div>
          {selectedCat && (
            <div style={{ 
              position: 'sticky', bottom: 0, zIndex: 10,
              background: 'var(--bg)', borderTop: '1px solid var(--border)',
              padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: selectedCat.color }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{selectedCat.title} selected</span>
                <span style={{ fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: '99px', background: RISK_BADGE[selectedCat.risk]?.bg, color: RISK_COLORS[selectedCat.risk], border: `1px solid ${RISK_BADGE[selectedCat.risk]?.border}`, fontWeight: 700 }}>{RISK_LABELS[selectedCat.risk]}</span>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => setStep(2)} 
                style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedCat.color}cc)`, boxShadow: `0 4px 14px ${selectedCat.color}40`, padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
              >
                Proceed to Notice Upload <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ STEP 2: UPLOAD NOTICE ════════════ */}
      {step === 2 && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>Upload the GST Notice</div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
              Upload a scan, photo, or PDF of the notice. MARKUP.AI will use OCR + AI to extract all details automatically.
            </p>
          </div>

          {/* Category indicator */}
          {selectedCat && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: `${selectedCat.color}10`, border: `1px solid ${selectedCat.color}30`, borderRadius: '10px' }}>
              <div style={{ width: 4, height: 24, background: selectedCat.color, borderRadius: '99px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{selectedCat.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{selectedCat.sections}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-soft)', cursor: 'pointer' }}>Change</button>
            </div>
          )}

          {/* Upload Area */}
          {!isExtracting && !noticeFile && (
            <div style={{
              border: '2px dashed var(--border)', borderRadius: '18px', padding: '3.5rem 2rem',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s',
              background: 'var(--bg-elevated)'
            }}
              onClick={() => noticeInputRef.current?.click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            >
              <CloudArrowUp size={56} color="#6366F1" style={{ marginBottom: '1rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.3rem' }}>Drop notice file here or click to upload</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Supports: PDF, JPG, PNG, WEBP, BMP, TIFF</div>
              <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['📄 PDF', '🖼️ Images', '📸 Photos', '📋 Scans'].map(t => (
                  <span key={t} style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.72rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <input ref={noticeInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.gif" onChange={handleNoticeUpload} />

          {/* Extracting state */}
          {isExtracting && (
            <div style={{
              border: '2px solid #6366F1', borderRadius: '18px', padding: '3rem',
              textAlign: 'center', background: 'rgba(99,102,241,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: 50, height: 50, border: '3px solid var(--border)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#6366F1', marginBottom: '0.5rem' }}>🔍 AI is reading your notice...</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                Processing: <strong>{noticeFile?.name}</strong><br />
                Extracting GSTIN, dates, amounts, allegations, jurisdiction...
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {['OCR Scan', 'Data Parse', 'Structure'].map((s, i) => (
                  <span key={s} style={{
                    padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                    background: i === 0 ? '#6366F1' : 'var(--bg)', color: i === 0 ? '#fff' : 'var(--text-soft)',
                    border: '1px solid var(--border)', animation: i === 0 ? 'pulse 1.5s infinite' : 'none'
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* File uploaded but error */}
          {noticeFile && !isExtracting && extractError && (
            <div style={{ border: '1px solid #EF444440', borderRadius: '14px', padding: '1.5rem', background: 'rgba(239,68,68,0.06)', textAlign: 'center' }}>
              <Warning size={32} color="#EF4444" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.3rem' }}>Extraction Failed</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginBottom: '1rem' }}>{extractError}</div>
              <button className="btn-primary" onClick={() => { setNoticeFile(null); setExtractError(''); }}>Try Again</button>
            </div>
          )}

          {/* File uploaded successfully — re-upload option */}
          {noticeFile && !isExtracting && extractedData && (
            <div style={{ border: '1px solid #10B98140', borderRadius: '14px', padding: '1.25rem', background: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={28} color="#10B981" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#10B981' }}>Notice Extracted Successfully</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{noticeFile.name} — proceed to review extracted data</div>
              </div>
              <button className="btn-primary" onClick={() => setStep(3)}>Review Data <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ STEP 3: REVIEW EXTRACTED DATA + AI BRIEF ════════════ */}
      {step === 3 && extractedData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Extracted Data */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${selectedCat?.color || '#6366F1'}15, transparent)`, padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>📋 Extracted Notice Details</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>AI-extracted via OCR — verify all fields</div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px', background: RISK_BADGE[extractedData.risk_level]?.bg || '#6366F120', color: RISK_COLORS[extractedData.risk_level] || '#6366F1', border: `1px solid ${RISK_BADGE[extractedData.risk_level]?.border || '#6366F140'}` }}>
                {RISK_LABELS[extractedData.risk_level] || '🔵 Medium'}
              </span>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Key fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <DataField label="Notice Type" value={extractedData.notice_type} color={selectedCat?.color} />
                <DataField label="Form" value={extractedData.form} color={selectedCat?.color} />
                <DataField label="Section" value={extractedData.section} />
                <DataField label="Rule" value={extractedData.rule} />
                <DataField label="GSTIN" value={extractedData.gstin} color="#3B82F6" />
                <DataField label="Legal Name" value={extractedData.legal_name} />
                <DataField label="Notice Ref No." value={extractedData.notice_reference_number} />
                <DataField label="DIN Reference" value={extractedData.din_reference} />
                <DataField label="Date of Notice" value={extractedData.date_of_notice} />
                <DataField label="Reply Due Date" value={extractedData.reply_due_date} color="#EF4444" />
                <DataField label="Tax Period" value={extractedData.tax_period} />
                <DataField label="Financial Year" value={extractedData.financial_year} />
              </div>

              {/* Demand Section */}
              {(extractedData.tax_amount || extractedData.total_demand) && (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.5rem' }}>💰 Demand Breakup</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <DataField label="Tax" value={extractedData.tax_amount} color="#EF4444" />
                    <DataField label="Interest" value={extractedData.interest_amount} color="#F59E0B" />
                    <DataField label="Penalty" value={extractedData.penalty_amount} color="#EF4444" />
                    <DataField label="Total Demand" value={extractedData.total_demand} color="#DC2626" />
                  </div>
                </div>
              )}

              {/* Allegations */}
              {extractedData.allegations && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>⚠️ Department Allegations</div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.6' }}>{extractedData.allegations}</div>
                </div>
              )}

              {/* Key Issues */}
              {extractedData.key_issues?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>🔍 Key Issues</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {extractedData.key_issues.map((issue, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.83rem', padding: '0.4rem 0.6rem', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <span style={{ color: '#EF4444', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hearing */}
              {extractedData.hearing_date && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <DataField label="Hearing Date" value={extractedData.hearing_date} color="#F59E0B" />
                  <DataField label="Hearing Time" value={extractedData.hearing_time} />
                  <DataField label="Venue" value={extractedData.hearing_venue} />
                </div>
              )}

              <DataField label="Jurisdiction / Officer" value={extractedData.jurisdiction || extractedData.proper_officer_name} />
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Re-upload</button>
              <button className="btn-primary" onClick={() => setStep(4)}>Proceed to Documents <ArrowRight size={14} /></button>
            </div>
          </div>

          {/* Right: AI Brief */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
            {/* Generate Brief Button */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <MagicWand size={20} color="#6366F1" />
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>AI Case Brief</div>
              </div>

              {!aiBrief && !isBriefing && (
                <div>
                  <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                    Let MARKUP.AI analyse the extracted notice data and generate a comprehensive brief covering risk assessment, deadlines, action items, and legal strategy.
                  </p>
                  <button className="btn-primary" onClick={generateBrief} style={{ width: '100%' }}>
                    <MagicWand size={16} /> Generate AI Brief
                  </button>
                </div>
              )}

              {isBriefing && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                  <div style={{ fontWeight: 600, color: '#6366F1' }}>Analysing notice & preparing brief...</div>
                </div>
              )}

              {aiBrief && !isBriefing && (
                <div>
                  <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '0.88rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: formatText(aiBrief) }} />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => copyText(aiBrief)} style={{ flex: 1, fontSize: '0.82rem' }}><Copy size={14} /> Copy</button>
                    <button className="btn-secondary" onClick={generateBrief} style={{ flex: 1, fontSize: '0.82rem' }}><ArrowRight size={14} /> Regenerate</button>
                  </div>
                </div>
              )}
            </div>

            {/* Documents Demanded */}
            {extractedData.documents_demanded?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '0.6rem' }}>📄 Documents Demanded by Officer</div>
                {extractedData.documents_demanded.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.35rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span style={{ lineHeight: '1.4' }}>{doc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ STEP 4: SUPPORTING DOCUMENTS ════════════ */}
      {step === 4 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Files size={22} color="#6366F1" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Upload Supporting Documents</h2>
            </div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Upload all documents that will support your reply — invoices, returns, challans, reconciliations, bank statements, etc. Add a brief description for each.
            </p>

            {/* Docs demanded reminder */}
            {extractedData?.documents_demanded?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.5rem' }}>📋 Documents Demanded in Notice (ensure these are uploaded):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {extractedData.documents_demanded.map((d, i) => (
                    <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#B45309' }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Upload button area */}
            <div style={{
              border: '2px dashed var(--border)', borderRadius: '14px', padding: '2rem',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem'
            }}
              onClick={() => docInputRef.current?.click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <UploadSimple size={36} color="#6366F1" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Click to upload supporting documents</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.82rem' }}>PDF, DOCX, XLSX, Images — multiple files allowed</div>
            </div>
            <input ref={docInputRef} type="file" multiple style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls,.csv,.json,.webp,.tiff" onChange={handleDocUpload} />

            {/* Uploaded docs list */}
            {supportingDocs.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Uploaded Documents ({supportingDocs.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {supportingDocs.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                      <FileText size={20} color="#6366F1" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{doc.name}</div>
                        <input
                          type="text"
                          placeholder="Add a description (e.g. GSTR-3B for Apr-Jun 2024)"
                          value={doc.description}
                          onChange={e => updateDocDescription(i, e.target.value)}
                          style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--text)', marginTop: '0.35rem' }}
                        />
                      </div>
                      <button onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: '0.3rem' }}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special instructions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                <PencilSimple size={13} /> Special Instructions to AI Drafter
              </label>
              <textarea
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="E.g. Focus on natural justice argument, emphasize that vendor has filed returns now, mention HC ruling in XYZ case..."
                rows={3}
                style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>← Back to Review</button>
              <button className="btn-primary" onClick={() => { setStep(5); generateDraft(); }} style={{ minWidth: '220px' }}>
                <MagicWand size={16} /> Generate AI Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ STEP 5: GENERATED DRAFT ════════════ */}
      {step === 5 && (
        <div>
          {isGenerating ? (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ width: 60, height: 60, border: '4px solid var(--border)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 2rem' }} />
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6366F1', marginBottom: '0.5rem' }}>✍️ MARKUP.AI is drafting your reply...</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Analysing notice details, supporting documents, and legal precedents to generate a unique, department-ready reply draft.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Reading Notice', 'Analysing Law', 'Checking Precedents', 'Building Arguments', 'Drafting Reply'].map((s, i) => (
                  <span key={s} style={{ padding: '0.35rem 0.9rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>{s}</span>
                ))}
              </div>
            </div>
          ) : generatedDraft ? (
            <div style={{ background: 'var(--bg-surface)', border: `2px solid ${selectedCat?.color || '#6366F1'}40`, borderRadius: '18px', overflow: 'hidden' }}>
              {/* Draft Header */}
              <div style={{ background: `linear-gradient(135deg, ${selectedCat?.color || '#6366F1'}12, transparent)`, padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={22} color={selectedCat?.color || '#6366F1'} />
                    Department-Ready Reply Draft
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                    {extractedData?.legal_name || 'Client'} · {extractedData?.notice_reference_number || 'Notice'} · Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => setStep(4)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>← Edit</button>
                  <button className="btn-secondary" onClick={() => copyText(generatedDraft)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><Copy size={14} /> Copy</button>
                  <button className="btn-secondary" onClick={() => printDraft(generatedDraft)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><Printer size={14} /> Print / PDF</button>
                  <button className="btn-secondary" onClick={() => { setGeneratedDraft(''); generateDraft(); }} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><MagicWand size={14} /> Regenerate</button>
                  <button className="btn-primary" onClick={resetAll} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><FilePlus size={14} /> New Draft</button>
                </div>
              </div>

              {/* Draft Body */}
              <div style={{
                padding: '2rem 2.5rem', maxHeight: '70vh', overflowY: 'auto',
                fontSize: '0.88rem', lineHeight: '1.85', background: 'var(--bg)'
              }} dangerouslySetInnerHTML={{ __html: formatText(generatedDraft) }} />
            </div>
          ) : null}
        </div>
      )}

      {/* ════════════ SAVED DRAFTS ════════════ */}
      {savedDrafts.length > 0 && step !== 5 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Saved Drafts <span style={{ background: '#6366F1', color: '#fff', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>{savedDrafts.length}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {savedDrafts.map(d => (
              <div key={d.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ height: '3px', background: d.color }} />
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '99px', background: RISK_BADGE[d.risk]?.bg, color: RISK_COLORS[d.risk], border: `1px solid ${RISK_BADGE[d.risk]?.border}` }}>{RISK_LABELS[d.risk]}</span>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '0.3rem' }}>{d.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button className="icon-btn-sm" onClick={() => { setGeneratedDraft(d.text); setStep(5); setSelectedCat(PROMPT_LIBRARY.categories.find(c => c.title === d.title)); }}><Eye size={13} /></button>
                      <button className="icon-btn-sm" onClick={() => copyText(d.text)}><Copy size={13} /></button>
                      <button className="icon-btn-sm" onClick={() => setSavedDrafts(prev => prev.filter(x => x.id !== d.id))} style={{ color: '#ef4444' }}><X size={13} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.3rem', display: 'flex', gap: '0.75rem' }}>
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

      {/* Spinner keyframe */}
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </section>
  );
}

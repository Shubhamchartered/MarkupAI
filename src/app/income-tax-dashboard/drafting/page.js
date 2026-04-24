"use client";

import { useState, useRef, useEffect } from 'react';
import { Scales, UploadSimple, FilePlus, DownloadSimple, Copy, X, Warning, CheckCircle, ArrowRight, Printer, Eye, Spinner, FileText, Files, PencilSimple, ArrowLeft, MagicWand, ShieldCheck, CloudArrowUp } from '@phosphor-icons/react';

// ── Markdown-like text formatter ──────────────────────────────────────
function formatText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*?)$/gm, '<h3 style="margin:0.8rem 0 0.35rem;font-size:0.95rem;color:var(--text)">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="margin:1rem 0 0.4rem;font-size:1.05rem;color:var(--text)">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 style="margin:1rem 0 0.5rem;font-size:1.15rem;color:var(--text)">$1</h1>')
    .replace(/^- (.*?)$/gm, '<div style="padding-left:1rem;margin:0.12rem 0">• $1</div>')
    .replace(/\n/g, '<br/>');
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
              background: isActive ? 'rgba(14,165,233,0.1)' : 'transparent',
              border: `1px solid ${isActive ? '#0ea5e9' : isDone ? '#10B981' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? '#0ea5e9' : isDone ? '#10B981' : 'var(--border)',
                color: '#fff', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0
              }}>{isDone ? '✓' : stepNum}</div>
              <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#0ea5e9' : isDone ? '#10B981' : 'var(--text-soft)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight size={14} color="var(--text-soft)" style={{ margin: '0 0.3rem' }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Data Field Display ────────────────────────────────────────────────
function DataField({ label, value, color }) {
  if (!value || value === 'null') return null;
  return (
    <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: color || 'var(--text-soft)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', wordBreak: 'break-word' }}>{typeof value === 'string' ? value : JSON.stringify(value)}</div>
    </div>
  );
}

// ── IT Notice OCR extraction ───────────────────────────────────────────
const IT_EXTRACTION_PROMPT = JSON.stringify({
  notice_type: "Scrutiny/Demand/Penalty/Reassessment/143(1)/143(2)/148/148A/270A/271/263/153A",
  section_it: "Main section of IT Act 1961 invoked",
  assessee_name: "Full name of assessee",
  pan: "10-character PAN",
  assessment_year: "AY e.g. 2023-24",
  date_of_notice: "DD/MM/YYYY",
  reply_due_date: "DD/MM/YYYY",
  ao_name: "Assessing Officer name",
  ao_ward: "Ward/Circle/Range",
  demand_amount: "Total demand amount",
  tax_amount: "Tax component",
  interest_amount: "Interest under 234A/B/C",
  penalty_amount: "Penalty amount",
  issues_raised: "Summary of issues/additions",
  documents_demanded: ["array of documents demanded"],
  hearing_date: "DD/MM/YYYY personal hearing date or null",
  vc_date: "DD/MM/YYYY video conferencing date or null",
  appeal_due_date: "DD/MM/YYYY last date to file appeal or null",
  is_demand_order: "boolean - true if this is 156/143(1) demand",
  is_penalty: "boolean",
  risk_level: "critical/high/medium/low",
  raw_text: "Full extracted text"
});

export default function ITDraftingPage() {
  const [step, setStep] = useState(1);
  const [noticeFile, setNoticeFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractError, setExtractError] = useState('');
  const [detectedType, setDetectedType] = useState(null);

  const [aiBrief, setAiBrief] = useState('');
  const [isBriefing, setIsBriefing] = useState(false);

  const [supportingDocs, setSupportingDocs] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  const noticeInputRef = useRef(null);
  const docInputRef = useRef(null);

  const STEPS = ['Upload Notice', 'Review & Brief', 'Supporting Docs', 'Generate Draft'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Step 1: Upload & OCR extract ──────────────────────────────────
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
      formData.append('mode', 'it'); // IT-specific extraction

      const res = await fetch('/api/it-ocr', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setExtractError(data.error);
      } else {
        const extracted = data.extracted || data;
        setExtractedData(extracted);
        // Auto-detect notice type
        const sectionKey = extracted.section_it || extracted.notice_type || 'IT Notice';
        setDetectedType({ section: sectionKey, pan: extracted.pan, ay: extracted.assessment_year });
        setStep(2);
      }
    } catch {
      setExtractError('Failed to connect to AI. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Step 2: Generate brief ─────────────────────────────────────────
  const generateBrief = async () => {
    if (!extractedData) return;
    setIsBriefing(true);
    setAiBrief('');
    try {
      const res = await fetch('/api/it-ocr', {
        method: 'POST',
        body: (() => { const fd = new FormData(); fd.append('action', 'brief'); fd.append('extractedData', JSON.stringify(extractedData)); return fd; })()
      });
      const data = await res.json();
      setAiBrief(data.brief || data.error || 'Unable to generate brief.');
    } catch {
      setAiBrief('⚠️ Failed to connect to AI.');
    } finally {
      setIsBriefing(false);
    }
  };

  // ── Step 3: Supporting docs ────────────────────────────────────────
  const handleDocUpload = (e) => {
    Array.from(e.target.files || []).forEach(f => {
      setSupportingDocs(prev => [...prev, { name: f.name, size: f.size, description: '', file: f }]);
    });
    e.target.value = '';
  };

  // ── Step 4: Generate draft ─────────────────────────────────────────
  const generateDraft = async () => {
    setIsGenerating(true);
    setGeneratedDraft('');
    try {
      const res = await fetch('/api/it-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData,
          noticeData: extractedData,
          supportingDocs: supportingDocs.map(d => ({ name: d.name, description: d.description })),
          specialInstructions,
          draftType: extractedData?.section_it || 'Income Tax Notice Reply',
        }),
      });
      const data = await res.json();
      if (data.error) { setGeneratedDraft(`⚠️ ${data.error}`); return; }
      setGeneratedDraft(data.draft);
      setSavedDrafts(prev => [{
        id: `IT-DRF-${Date.now()}`,
        section: extractedData?.section_it || 'IT Notice',
        pan: extractedData?.pan || '',
        taxpayer: extractedData?.assessee_name || 'Assessee',
        ay: extractedData?.assessment_year || '',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        text: data.draft,
      }, ...prev]);
    } catch {
      setGeneratedDraft('⚠️ Failed to connect to AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setStep(1); setNoticeFile(null); setExtractedData(null); setExtractError('');
    setAiBrief(''); setSupportingDocs([]); setSpecialInstructions(''); setGeneratedDraft(''); setDetectedType(null);
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); };
  const printDraft = (text) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>IT Notice Reply — TaxGuard AI</title><style>body{font-family:'Georgia',serif;font-size:13px;line-height:1.8;padding:50px 60px;max-width:800px;margin:0 auto;color:#1a1a1a}h1,h2,h3{font-family:'Arial',sans-serif}</style></head><body>${text.replace(/\n/g,'<br/>')}</body></html>`);
    w.document.close(); w.print();
  };

  const IT_COLOR = '#0ea5e9';

  return (
    <section className="view active" id="view-it-drafting">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Scales size={26} /> IT Litigation Draft Centre</h1>
          <p>Upload IT notice → AI reads & extracts → Review → Upload documents → Generate expert department-ready reply</p>
        </div>
        <div className="header-actions">
          {step > 1 && <button className="btn-secondary" onClick={resetAll}><X size={14} /> Start Over</button>}
        </div>
      </div>

      <Stepper step={step} steps={STEPS} onStepClick={setStep} />

      {/* ════════════ STEP 1: UPLOAD NOTICE ════════════ */}
      {step === 1 && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>Upload the Income Tax Notice / Order</div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
              Upload a scan, photo, or PDF. TaxGuard AI automatically reads, classifies, and extracts all notice details — <strong>no manual selection needed.</strong>
            </p>
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: `rgba(14,165,233,0.08)`, border: `1px solid rgba(14,165,233,0.2)`, borderRadius: '10px', fontSize: '0.82rem', color: IT_COLOR, display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
              🤖 AI auto-detects: §143(1) · §143(2) · §148/148A · §270A · §271 · §156 Demand · §263 · §153A
            </div>
          </div>

          {!isExtracting && !noticeFile && (
            <div style={{
              border: '2px dashed var(--border)', borderRadius: '18px', padding: '3.5rem 2rem',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', background: 'var(--bg-elevated)',
            }}
              onClick={() => noticeInputRef.current?.click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = IT_COLOR; e.currentTarget.style.background = 'rgba(14,165,233,0.04)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            >
              <CloudArrowUp size={56} color={IT_COLOR} style={{ marginBottom: '1rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.3rem' }}>Drop IT notice / order / demand here</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Supports: PDF, JPG, PNG, WEBP, TIFF</div>
            </div>
          )}

          <input ref={noticeInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff" onChange={handleNoticeUpload} />

          {isExtracting && (
            <div style={{ border: `2px solid ${IT_COLOR}`, borderRadius: '18px', padding: '3rem', textAlign: 'center', background: 'rgba(14,165,233,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: 50, height: 50, border: '3px solid var(--border)', borderTopColor: IT_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: IT_COLOR, marginBottom: '0.5rem' }}>🔍 AI is reading & classifying your notice...</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>
                Extracting: PAN · AY · Section · Demand · AO Details · Hearing Date...
              </div>
            </div>
          )}

          {noticeFile && !isExtracting && extractError && (
            <div style={{ border: '1px solid #EF444440', borderRadius: '14px', padding: '1.5rem', background: 'rgba(239,68,68,0.06)', textAlign: 'center' }}>
              <Warning size={32} color="#EF4444" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.3rem' }}>Extraction Failed</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginBottom: '1rem' }}>{extractError}</div>
              <button className="btn-primary" onClick={() => { setNoticeFile(null); setExtractError(''); }}>Try Again</button>
            </div>
          )}

          {noticeFile && !isExtracting && extractedData && (
            <div style={{ border: '1px solid #10B98140', borderRadius: '14px', padding: '1.25rem', background: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={28} color="#10B981" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#10B981' }}>Notice Classified: {detectedType?.section || 'IT Notice'} | PAN: {detectedType?.pan} | AY: {detectedType?.ay}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{noticeFile.name} — proceed to review</div>
              </div>
              <button className="btn-primary" style={{ background: `linear-gradient(135deg,${IT_COLOR},#0284c7)` }} onClick={() => setStep(2)}>Review Data <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* ════════════ STEP 2: REVIEW EXTRACTED DATA ════════════ */}
      {step === 2 && extractedData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: `rgba(14,165,233,0.08)`, padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>📋 Extracted IT Notice Details</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.15rem' }}>AI-extracted via OCR — verify all fields before proceeding</div>
              </div>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <DataField label="Notice Type" value={extractedData.notice_type || extractedData.section_it} color={IT_COLOR} />
                <DataField label="Section" value={extractedData.section_it} color={IT_COLOR} />
                <DataField label="Assessee Name" value={extractedData.assessee_name} />
                <DataField label="PAN" value={extractedData.pan} color="#3B82F6" />
                <DataField label="Assessment Year" value={extractedData.assessment_year || extractedData.ay} />
                <DataField label="Date of Notice" value={extractedData.date_of_notice || extractedData.dateIssued} />
                <DataField label="Reply Due Date" value={extractedData.reply_due_date || extractedData.dueDate} color="#EF4444" />
                <DataField label="AO Name" value={extractedData.ao_name || extractedData.aoName} />
                <DataField label="Ward / Circle" value={extractedData.ao_ward || extractedData.aoDesignation} />
              </div>
              {(extractedData.demand_amount || extractedData.demandAmount) && (
                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.5rem' }}>💰 Demand Breakup</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <DataField label="Tax" value={extractedData.tax_amount} color="#EF4444" />
                    <DataField label="Interest" value={extractedData.interest_amount} color="#F59E0B" />
                    <DataField label="Penalty" value={extractedData.penalty_amount} color="#EF4444" />
                    <DataField label="Total Demand" value={extractedData.demand_amount || extractedData.demandAmount} color="#DC2626" />
                  </div>
                </div>
              )}
              {extractedData.issues_raised && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>⚠️ Issues / Additions by AO</div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.6' }}>{extractedData.issues_raised}</div>
                </div>
              )}
              {extractedData.hearing_date && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <DataField label="Hearing Date" value={extractedData.hearing_date} color="#F59E0B" />
                  {extractedData.vc_date && <DataField label="Video Conf. Date" value={extractedData.vc_date} color={IT_COLOR} />}
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Re-upload</button>
              <button className="btn-primary" style={{ background: `linear-gradient(135deg,${IT_COLOR},#0284c7)` }} onClick={() => setStep(3)}>Supporting Docs <ArrowRight size={14} /></button>
            </div>
          </div>

          {/* Right: AI Brief */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <MagicWand size={20} color={IT_COLOR} />
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>AI Case Brief</div>
            </div>
            {!aiBrief && !isBriefing && (
              <div>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                  Let TaxGuard AI analyse the extracted notice data and generate a comprehensive brief — including risk assessment, key deadlines, ITA strategy, and CBDT references.
                </p>
                <button className="btn-primary" onClick={generateBrief} style={{ width: '100%', background: `linear-gradient(135deg,${IT_COLOR},#0284c7)` }}>
                  <MagicWand size={16} /> Generate AI Brief
                </button>
              </div>
            )}
            {isBriefing && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: IT_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 600, color: IT_COLOR }}>Analysing notice & preparing IT Brief...</div>
              </div>
            )}
            {aiBrief && !isBriefing && (
              <div>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '0.88rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: formatText(aiBrief) }} />
                <button className="btn-secondary" onClick={() => copyText(aiBrief)} style={{ marginTop: '1rem', width: '100%', fontSize: '0.82rem' }}><Copy size={14} /> Copy Brief</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ STEP 3: SUPPORTING DOCUMENTS ════════════ */}
      {step === 3 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Files size={22} color={IT_COLOR} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Upload Supporting Documents</h2>
            </div>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Upload ITR, Form 16, Form 26AS, AIS, bank statements, balance sheets, P&L, computation — anything to support your reply.
            </p>

            {extractedData?.documents_demanded?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.5rem' }}>📋 Documents Demanded by AO:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {extractedData.documents_demanded.map((d, i) => (
                    <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#B45309' }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ border: '2px dashed var(--border)', borderRadius: '14px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem', transition: 'all 0.2s' }}
              onClick={() => docInputRef.current?.click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = IT_COLOR; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <UploadSimple size={36} color={IT_COLOR} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Click to upload supporting documents</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.82rem' }}>ITR, Form 16, Form 26AS, AIS, Balance Sheet, P&L, Bank Statements</div>
            </div>
            <input ref={docInputRef} type="file" multiple style={{ display: 'none' }} accept=".pdf,.xlsx,.xls,.docx,.jpg,.jpeg,.png,.csv" onChange={handleDocUpload} />

            {supportingDocs.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Uploaded ({supportingDocs.length})</div>
                {supportingDocs.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                    <FileText size={20} color={IT_COLOR} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{doc.name}</div>
                      <input type="text" placeholder="Description (e.g. ITR-3 for AY 2023-24)" value={doc.description}
                        onChange={e => setSupportingDocs(prev => prev.map((d, idx) => idx === i ? { ...d, description: e.target.value } : d))}
                        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--text)', marginTop: '0.35rem' }}
                      />
                    </div>
                    <button onClick={() => setSupportingDocs(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                <PencilSimple size={13} /> Special Instructions to AI Drafter
              </label>
              <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="E.g. Focus on natural justice argument, highlight that income is exempt u/s 10, mention Form 26AS matches ITR..."
                rows={3} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back to Review</button>
              <button className="btn-primary" onClick={() => { setStep(4); generateDraft(); }} style={{ minWidth: '220px', background: `linear-gradient(135deg,${IT_COLOR},#0284c7)` }}>
                <MagicWand size={16} /> Generate Expert IT Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ STEP 4: GENERATED DRAFT ════════════ */}
      {step === 4 && (
        <div>
          {isGenerating ? (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ width: 60, height: 60, border: '4px solid var(--border)', borderTopColor: IT_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 2rem' }} />
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: IT_COLOR, marginBottom: '0.5rem' }}>✍️ TaxGuard AI is drafting your IT reply...</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Analysing notice, documents, ITA 1961 provisions, CBDT circulars, and judicial precedents to generate a unique, expert reply.
              </div>
            </div>
          ) : generatedDraft ? (
            <div style={{ background: 'var(--bg-surface)', border: `2px solid rgba(14,165,233,0.3)`, borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ background: `rgba(14,165,233,0.08)`, padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={22} color={IT_COLOR} /> Income Tax Department-Ready Reply Draft
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                    {extractedData?.assessee_name || 'Assessee'} · PAN: {extractedData?.pan || '—'} · AY: {extractedData?.assessment_year || '—'} · Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => setStep(3)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>← Edit</button>
                  <button className="btn-secondary" onClick={() => copyText(generatedDraft)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><Copy size={14} /> Copy</button>
                  <button className="btn-secondary" onClick={() => printDraft(generatedDraft)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><FilePlus size={14} /> Print / PDF</button>
                  <button className="btn-secondary" onClick={() => { setGeneratedDraft(''); generateDraft(); }} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><MagicWand size={14} /> Regenerate</button>
                  <button className="btn-primary" onClick={resetAll} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', background: `linear-gradient(135deg,${IT_COLOR},#0284c7)` }}><FilePlus size={14} /> New Draft</button>
                </div>
              </div>
              <div style={{ padding: '2rem 2.5rem', maxHeight: '70vh', overflowY: 'auto', fontSize: '0.88rem', lineHeight: '1.85', background: 'var(--bg)' }}
                dangerouslySetInnerHTML={{ __html: formatText(generatedDraft) }}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Saved Drafts */}
      {savedDrafts.length > 0 && step !== 4 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Saved IT Drafts <span style={{ background: IT_COLOR, color: '#fff', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>{savedDrafts.length}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {savedDrafts.map(d => (
              <div key={d.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: IT_COLOR }} />
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>§{d.section} Reply</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                    <span>👤 {d.taxpayer}</span><span>📄 PAN: {d.pan}</span><span>📅 AY: {d.ay}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
                    <button className="icon-btn-sm" onClick={() => { setGeneratedDraft(d.text); setStep(4); }}><Eye size={13} /></button>
                    <button className="icon-btn-sm" onClick={() => copyText(d.text)}><Copy size={13} /></button>
                    <button className="icon-btn-sm" onClick={() => setSavedDrafts(prev => prev.filter(x => x.id !== d.id))} style={{ color: '#ef4444' }}><X size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}

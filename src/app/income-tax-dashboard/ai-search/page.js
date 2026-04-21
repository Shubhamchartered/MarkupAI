"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MagnifyingGlass, ArrowLeft, PaperPlaneRight, ArrowClockwise,
  Funnel, CloudArrowUp, X, FileText, Brain, Paperclip
} from '@phosphor-icons/react';
import { IT_SECTIONS } from '@/data/it_legal_corpus';
import Link from 'next/link';

const QUICK_QUERIES = [
  { icon: '📋', label: 'Reply to 148A notice', text: 'How should a CA reply to a notice under Section 148A(b) of the Income Tax Act? What are the key defences against reopening of assessment?' },
  { icon: '⚖️', label: '270A vs 271(1)(c)', text: 'Explain the difference between penalty under Section 270A (under-reporting) and Section 271(1)(c) (concealment). When does immunity under 270AA apply?' },
  { icon: '🔍', label: 'Scrutiny 143(2) response', text: 'What documents and records should be prepared when responding to a scrutiny notice under Section 143(2)? What are the time limits for completion of assessment?' },
  { icon: '🏛️', label: 'CIT revision u/s 263', text: 'Under what circumstances can the CIT invoke Section 263 to revise an AO order? What are the twin conditions as per Malabar Industrial Co SC judgment?' },
  { icon: '🔄', label: 'IT Act 1961 vs 2025', text: 'Compare the key changes between the Income Tax Act 1961 and the new Income Tax Act 2025. Which sections have been renumbered or significantly changed?' },
  { icon: '💰', label: 'Section 68 cash credits', text: 'How should an assessee defend unexplained cash credits under Section 68? What is the burden of proof as per Supreme Court judgments? What documents are needed?' },
];

export default function AISearchPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ act: '', section: '', court: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── File handling ── */
  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).slice(0, 5 - attachedFiles.length);
    setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 5));
  }, [attachedFiles.length]);

  const removeFile = (idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));

  const encodeFiles = async (files) => {
    return Promise.all(files.map(f => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, type: f.type, base64: reader.result.split(',')[1] });
      reader.onerror = reject;
      reader.readAsDataURL(f);
    })));
  };

  /* ── Send message ── */
  const sendMessage = async (text) => {
    const query = text || input;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      text: query,
      files: attachedFiles.map(f => f.name),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const body = {
        query,
        filters: Object.keys(active).length > 0 ? active : undefined,
      };

      // If files attached, encode and send via OCR route for context
      if (attachedFiles.length > 0) {
        const encoded = await encodeFiles(attachedFiles);
        body.files = encoded;
      }

      setAttachedFiles([]);

      const res = await fetch('/api/it-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply || data.error || 'No response.',
        isError: !!data.error,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Connection error. Check if the dev server is running.', isError: true }]);
    }
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg);padding:1rem;border-radius:8px;border:1px solid var(--border);overflow-x:auto;margin:0.5rem 0;font-size:0.82rem">$1</pre>')
      .replace(/`(.*?)`/g, '<code style="background:var(--bg);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.85em;border:1px solid var(--border)">$1</code>')
      .replace(/^### (.*?)$/gm, '<h3 style="margin:0.8rem 0 0.4rem;font-size:1rem;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="margin:1rem 0 0.5rem;font-size:1.1rem;">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 style="margin:1rem 0 0.5rem;font-size:1.2rem;">$1</h1>')
      .replace(/^- (.*?)$/gm, '<div style="padding-left:1rem;margin:0.15rem 0">• $1</div>')
      .replace(/^\d+\. (.*?)$/gm, '<div style="padding-left:1rem;margin:0.15rem 0">$&</div>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <section className="view active" id="view-it-search" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
            <MagnifyingGlass size={20} weight="bold" color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>TaxGuard AI — Legal Search Engine</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>IT ACT 1961 · IT ACT 2025 · CBDT Circulars · SC / HC / ITAT Case Laws</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/income-tax-dashboard" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
            <ArrowLeft size={12} /> Dashboard
          </Link>
          <button className={`btn-secondary ${showFilters ? '' : ''}`} onClick={() => setShowFilters(v => !v)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', borderColor: showFilters ? '#0ea5e9' : undefined, color: showFilters ? '#0ea5e9' : undefined }}>
            <Funnel size={13} /> Filters
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()} title="Attach document" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', position: 'relative' }}>
            <Paperclip size={13} /> Attach
            {attachedFiles.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#0ea5e9', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{attachedFiles.length}</span>}
          </button>
          {messages.length > 0 && (
            <button className="btn-secondary" onClick={() => setMessages([])} title="Clear" style={{ padding: '0.4rem 0.5rem' }}>
              <ArrowClockwise size={14} />
            </button>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

      {/* ── Filters ── */}
      {showFilters && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <select className="filter-select" value={filters.act} onChange={e => setFilters(p => ({ ...p, act: e.target.value }))}>
            <option value="">All Acts</option>
            <option value="IT Act 1961">IT Act 1961</option>
            <option value="IT Act 2025">IT Act 2025</option>
            <option value="IT Rules 1962">IT Rules 1962</option>
            <option value="CBDT Circulars">CBDT Circulars</option>
          </select>
          <select className="filter-select" value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))}>
            <option value="">All Sections</option>
            {Object.keys(IT_SECTIONS).map(s => <option key={s} value={s}>§{s}</option>)}
          </select>
          <select className="filter-select" value={filters.court} onChange={e => setFilters(p => ({ ...p, court: e.target.value }))}>
            <option value="">All Courts</option>
            <option value="Supreme Court">Supreme Court</option>
            <option value="High Court">High Court</option>
            <option value="ITAT">ITAT</option>
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', alignSelf: 'center', marginLeft: '0.25rem' }}>Filters narrow AI search context</span>
        </div>
      )}

      {/* ── Attached file chips (above messages) ── */}
      {attachedFiles.length > 0 && (
        <div style={{ padding: '0.6rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0, background: 'rgba(14,165,233,0.04)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600, marginRight: '0.25rem' }}>📎 Attached:</span>
          {attachedFiles.map((f, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.6rem', background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(14,165,233,0.25)' }}>
              <FileText size={11} /> {f.name.length > 25 ? f.name.substring(0, 25) + '…' : f.name}
              <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', padding: 0, lineHeight: 1 }}><X size={10} /></button>
            </span>
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>— will be included in next query for context</span>
        </div>
      )}

      {/* ── Drop zone overlay when dragging ── */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', position: 'relative' }}
      >
        {isDragging && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,165,233,0.08)', border: '2px dashed #0ea5e9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center', color: '#0ea5e9' }}>
              <CloudArrowUp size={48} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Drop files to attach for context</div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3%' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaxGuard AI</span>{' '}Legal Search
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-soft)', fontWeight: 500 }}>Search Income Tax law, case laws, and circulars — upload a notice for instant context</div>
              <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#0ea5e9,#0284c7)', margin: '1rem auto', borderRadius: '99px' }} />
              {/* Upload prompt */}
              <button onClick={() => fileRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'rgba(14,165,233,0.08)', border: '1px dashed rgba(14,165,233,0.35)', borderRadius: '99px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <CloudArrowUp size={16} /> Attach notice / document for AI context
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', maxWidth: '880px', margin: '0 auto', textAlign: 'left' }}>
              {QUICK_QUERIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', color: 'var(--text)', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{q.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{q.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: 1.45 }}>{q.text.substring(0, 80)}…</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', animation: 'viewFadeIn 0.3s ease' }}>
                {m.role !== 'user' && (
                  <div style={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, background: m.isError ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 900, marginTop: '2px', boxShadow: '0 3px 8px rgba(14,165,233,0.3)' }}>
                    {m.isError ? '!' : 'TG'}
                  </div>
                )}
                <div style={{ maxWidth: m.role === 'user' ? '65%' : '82%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {m.role === 'user' && m.files?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {m.files.map((fn, fi) => (
                        <span key={fi} style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', borderRadius: '99px', border: '1px solid rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <FileText size={9} /> {fn.length > 20 ? fn.substring(0, 20) + '…' : fn}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{
                    padding: m.role === 'user' ? '0.85rem 1.15rem' : '1.1rem 1.4rem',
                    lineHeight: '1.65', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : m.isError ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)',
                    color: m.role === 'user' ? 'white' : 'var(--text)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    fontSize: '0.9rem',
                    boxShadow: m.role === 'user' ? '0 4px 14px rgba(14,165,233,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    {m.role === 'user' ? <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div> : <div dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#0369a1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700, marginTop: '2px' }}>CA</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 3px 8px rgba(14,165,233,0.3)' }}>TG</div>
                <div style={{ padding: '1rem 1.4rem', borderRadius: '4px 16px 16px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', animation: `typingBounce 1.4s ease-in-out ${j * 0.2}s infinite` }} />)}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>Searching IT Act database…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', border: `1px solid ${attachedFiles.length > 0 ? 'rgba(14,165,233,0.4)' : 'var(--border)'}`, borderRadius: '24px', padding: '0.6rem 0.6rem 0.6rem 1.1rem', alignItems: 'center', boxShadow: attachedFiles.length > 0 ? '0 0 0 3px rgba(14,165,233,0.1)' : 'none', transition: 'all 0.2s' }}>
          <button onClick={() => fileRef.current?.click()} title="Attach file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: attachedFiles.length > 0 ? '#0ea5e9' : 'var(--text-soft)', padding: '0.2rem', flexShrink: 0, transition: 'color 0.2s' }}>
            <Paperclip size={16} />
          </button>
          <input ref={inputRef} type="text"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
            placeholder={isLoading ? 'Searching…' : attachedFiles.length > 0 ? `Query with ${attachedFiles.length} doc(s) attached…` : 'Ask about any IT section, case law, or legal strategy…'}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isLoading}
          />
          <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            style={{
              background: (isLoading || !input.trim()) ? 'var(--border)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              color: '#fff', border: 'none', borderRadius: '50%', width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              flexShrink: 0, transition: 'all 0.2s',
              boxShadow: (isLoading || !input.trim()) ? 'none' : '0 3px 10px rgba(14,165,233,0.35)',
            }}>
            <PaperPlaneRight weight="fill" size={16} />
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-soft)' }}>
          TaxGuard AI searches IT Act 1961, IT Act 2025, CBDT Circulars, and SC/HC/ITAT case laws. Attach documents for contextual advice. Verify all citations independently.
        </div>
      </div>

      <style jsx>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

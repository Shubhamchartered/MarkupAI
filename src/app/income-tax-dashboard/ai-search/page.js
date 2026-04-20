"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, ArrowLeft, Brain, PaperPlaneRight, ArrowClockwise, Funnel } from '@phosphor-icons/react';
import { IT_SECTIONS } from '@/data/it_legal_corpus';
import Link from 'next/link';

const QUICK_QUERIES = [
  { icon: '📋', label: 'Reply to 148A notice', text: 'How should a CA reply to a notice under Section 148A(b) of the Income Tax Act? What are the key defences against reopening of assessment?' },
  { icon: '⚖️', label: '270A vs 271(1)(c) penalty', text: 'Explain the difference between penalty under Section 270A (under-reporting) and old Section 271(1)(c) (concealment). When does immunity under 270AA apply?' },
  { icon: '🔍', label: 'Scrutiny 143(2) response', text: 'What documents and records should be prepared when responding to a scrutiny notice under Section 143(2)? What are the time limits for completion of assessment?' },
  { icon: '🏛️', label: 'CIT revision u/s 263', text: 'Under what circumstances can the CIT invoke Section 263 to revise an AO order? What are the twin conditions as per Malabar Industrial Co SC judgment?' },
  { icon: '🔄', label: 'IT Act 1961 vs 2025', text: 'Compare the key changes between the Income Tax Act 1961 and the new Income Tax Act 2025. What sections have been renumbered or significantly changed?' },
  { icon: '💰', label: 'Section 68 cash credits', text: 'How should an assessee defend unexplained cash credits under Section 68? What is the burden of proof as per SC judgments? What documents are needed?' },
];

export default function AISearchPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ act: '', section: '', court: '' });
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const query = text || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', text: query };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await fetch('/api/it-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters: Object.keys(active).length > 0 ? active : undefined }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply || data.error || 'No response.',
        isError: !!data.error,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai', text: '⚠️ Connection error. Check if the dev server is running.', isError: true,
      }]);
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
      {/* Header */}
      <div className="ai-view-header">
        <div className="ai-vh-left">
          <div className="ai-vh-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><MagnifyingGlass size={20} weight="bold" /></div>
          <div>
            <div className="ai-vh-title">TaxGuard AI — Legal Search Engine</div>
            <div className="ai-vh-sub">IT ACT 1961 · IT ACT 2025 · CBDT CIRCULARS · SC/HC/ITAT CASE LAWS</div>
          </div>
        </div>
        <div className="ai-vh-right">
          <Link href="/income-tax-dashboard" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}><ArrowLeft size={12} /> Dashboard</Link>
          <button className={`btn-secondary ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)} style={{ borderColor: showFilters ? '#10b981' : undefined }}>
            <Funnel size={14} /> Filters
          </button>
          {messages.length > 0 && (
            <button className="btn-secondary" onClick={() => setMessages([])} title="Clear"><ArrowClockwise size={14} /></button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg-elevated)' }}>
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
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3%' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg,#10b981,#059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TaxGuard AI</span>
                {' '}Legal Search
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text-soft)', fontWeight: 500 }}>Search Income Tax law, sections, case laws, and circulars with AI</div>
              <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#10b981,#059669)', margin: '1rem auto', borderRadius: '99px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', maxWidth: '880px', margin: '0 auto', textAlign: 'left' }}>
              {QUICK_QUERIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', color: 'var(--text)', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{q.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{q.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: '1.45' }}>{q.text.substring(0, 80)}…</div>
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
                  <div style={{ width: 32, height: 32, borderRadius: '10px', flexShrink: 0, background: m.isError ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 900, marginTop: '2px' }}>
                    {m.isError ? '!' : 'TG'}
                  </div>
                )}
                <div style={{
                  maxWidth: m.role === 'user' ? '65%' : '80%', padding: m.role === 'user' ? '0.85rem 1.15rem' : '1.1rem 1.4rem',
                  lineHeight: '1.65', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #10b981, #059669)' : m.isError ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)',
                  color: m.role === 'user' ? 'white' : 'var(--text)', border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  fontSize: '0.9rem', boxShadow: m.role === 'user' ? '0 4px 12px rgba(16,185,129,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {m.role === 'user' ? <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div> : <div dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />}
                </div>
                {m.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>CA</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>TG</div>
                <div style={{ padding: '1.1rem 1.4rem', borderRadius: '4px 16px 16px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(j => (<div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: `typingBounce 1.4s ease-in-out ${j * 0.2}s infinite` }} />))}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>Searching IT Act database…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '24px', padding: '0.55rem 1rem', alignItems: 'center' }}>
          <input ref={inputRef} type="text" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
            placeholder={isLoading ? "Searching…" : "Ask about any IT section, case law, or legal strategy…"}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} disabled={isLoading} />
          <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            style={{
              background: (isLoading || !input.trim()) ? 'var(--border)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading ? 'not-allowed' : 'pointer',
              flexShrink: 0, transition: 'all 0.2s', boxShadow: isLoading ? 'none' : '0 3px 10px rgba(16,185,129,0.3)',
            }}>
            <PaperPlaneRight weight="fill" size={16} />
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-soft)' }}>
          TaxGuard AI searches IT Act 1961, IT Act 2025, CBDT Circulars, and SC/HC/ITAT case laws. Verify all citations independently.
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

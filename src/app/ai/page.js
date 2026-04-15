"use client";

import { useState, useRef, useEffect } from 'react';
import { Gear, Brain, PaperPlaneRight, Paperclip, X, Spinner, ArrowClockwise } from '@phosphor-icons/react';

const QUICK_QUESTIONS = [
  { icon: '📋', label: 'Draft reply for SCN u/s 73', text: 'Draft a professional reply to a Show Cause Notice under Section 73 of CGST Act for ITC mismatch. Use the standard DRC-06 format with placeholders for client-specific data.' },
  { icon: '🔍', label: 'ASMT-10 scrutiny response', text: 'What are the key points to address in a reply to ASMT-10 scrutiny notice for 2B vs 3B mismatch? Provide an ASMT-11 style template.' },
  { icon: '❌', label: 'GSTIN cancellation revocation', text: 'Explain the complete process to file revocation of GSTIN cancellation under Rule 23. What documents are required? What is the time limit?' },
  { icon: '💰', label: 'ITC reversal under Rule 42', text: 'How to calculate ITC reversal under Rule 42 for inputs used for exempt supplies? Show the formula and a worked example.' },
  { icon: '🏦', label: 'Refund rejection reply', text: 'Draft a reply to RFD-08 show cause notice for rejection of GST refund claim. Include computation table and deficiency-wise clarifications.' },
  { icon: '⚠️', label: 'Section 74 fraud notice', text: 'What is the difference between a notice under Section 73 and Section 74? How should a CA defend a Section 74 fraud/suppression notice? What are the key legal safeguards?' },
];

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const sendMessage = async (text) => {
    const msgText = text || input;
    if ((!msgText.trim() && files.length === 0) || isLoading) return;

    let userMsg = msgText;
    let fileContext = '';

    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      userMsg = msgText ? `${msgText}\n\n📎 Attached: ${fileNames}` : `📎 Attached: ${fileNames}`;
      fileContext = `The user has attached the following files: ${fileNames}. Analyse the file names and context to provide relevant advice. The actual file content extraction will be available in a future update.`;
    }

    const newUserMsg = { role: 'user', text: userMsg };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text })),
          fileContext: fileContext || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `⚠️ **Error:** ${data.error}`,
          isError: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: data.reply,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `⚠️ **Connection Error:** Could not reach the AI server. Make sure the dev server is running and try again.`,
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => { setMessages([]); setInput(''); setFiles([]); };

  // Simple markdown-like formatting for AI responses
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
    <section className="view active" id="view-ai" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div className="ai-view-header">
        <div className="ai-vh-left">
          <div className="ai-vh-icon"><Brain size={24} weight="fill" /></div>
          <div>
            <div className="ai-vh-title">MARKUP.AI — GST Intelligence Engine</div>
            <div className="ai-vh-sub">Powered by Google Gemini · RESEARCH · DRAFTING · CASE LAW · ANALYSIS</div>
          </div>
        </div>
        <div className="ai-vh-right">
          <div className="ai-mode-tabs" style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
            {[['chat', '⟡ Chat'], ['search', '⊕ Law Search']].map(([tab, label]) => (
              <button key={tab}
                className={`btn-secondary ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ border: activeTab === tab ? '1px solid var(--primary-color)' : '', background: activeTab === tab ? 'rgba(99, 102, 241, 0.1)' : '' }}
              >{label}</button>
            ))}
          </div>
          {messages.length > 0 && (
            <button className="btn-secondary" onClick={clearChat} title="Clear Chat"><ArrowClockwise size={16} /></button>
          )}
          <button className="btn-secondary"><Gear /></button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="ai-chat-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Messages Area */}
          <div className="ai-messages-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '3%' }}>
                {/* Welcome Banner */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
                    Welcome to&nbsp;
                    <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      M A R K U P . A I
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', color: 'var(--text-soft)', fontWeight: 500 }}>Your AI GST Expert — Draft · Research · Analyse</div>
                  <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', margin: '1rem auto', borderRadius: '99px' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                    Ask any question about GST law, draft notice replies, analyse ITC mismatches, or get legal strategy advice. Powered by Google Gemini AI.
                  </div>
                </div>

                {/* Quick question templates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', maxWidth: '880px', margin: '0 auto', textAlign: 'left' }}>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.text)}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: '14px', padding: '1.1rem 1.2rem', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.2s', color: 'var(--text)',
                        display: 'flex', gap: '0.85rem', alignItems: 'flex-start'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{q.icon}</span>
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
                  <div key={i} style={{
                    marginBottom: '1.25rem',
                    display: 'flex',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '0.75rem',
                    animation: 'viewFadeIn 0.3s ease'
                  }}>
                    {/* AI Avatar */}
                    {m.role !== 'user' && (
                      <div style={{
                        width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                        background: m.isError ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.8rem', fontWeight: 900, marginTop: '2px'
                      }}>
                        {m.isError ? '!' : 'M'}
                      </div>
                    )}

                    <div style={{
                      maxWidth: m.role === 'user' ? '65%' : '80%',
                      padding: m.role === 'user' ? '0.85rem 1.15rem' : '1.1rem 1.4rem',
                      lineHeight: '1.65',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                      background: m.role === 'user'
                        ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                        : m.isError
                          ? 'rgba(239,68,68,0.08)'
                          : 'var(--bg-elevated)',
                      color: m.role === 'user' ? 'white' : 'var(--text)',
                      border: m.role === 'user' ? 'none' : m.isError ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
                      fontSize: '0.9rem',
                      boxShadow: m.role === 'user' ? '0 4px 12px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {m.role === 'user' ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                      )}
                    </div>

                    {/* User Avatar */}
                    {m.role === 'user' && (
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.75rem', fontWeight: 700, marginTop: '2px'
                      }}>CA</div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', animation: 'viewFadeIn 0.3s ease' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                      background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.8rem', fontWeight: 900
                    }}>M</div>
                    <div style={{
                      padding: '1.1rem 1.4rem', borderRadius: '4px 16px 16px 16px',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <div className="typing-dots" style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#6366F1',
                            animation: `typingBounce 1.4s ease-in-out ${j * 0.2}s infinite`
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>MARKUP.AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Bar */}
          <div className="ai-input-bar" style={{
            padding: '1.25rem 1.5rem', background: 'var(--bg)',
            borderTop: '1px solid var(--border)'
          }}>
            {files.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}>
                    <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📎 {f.name}</span>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, display: 'flex' }}>
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="ai-input-inner" style={{
              display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: '24px',
              padding: '0.55rem 1rem', alignItems: 'center',
              transition: 'border 0.2s, box-shadow 0.2s'
            }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'none', border: 'none', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.2rem' }}
                title="Attach Files"
              >
                <Paperclip size={20} />
              </button>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
                placeholder={isLoading ? "Waiting for response..." : "Ask MARKUP.AI about any GST notice, section, or law..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || (!input.trim() && files.length === 0)}
                style={{
                  background: (isLoading || (!input.trim() && files.length === 0)) ? 'var(--border)' : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  color: '#fff', border: 'none', borderRadius: '50%',
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer', flexShrink: 0,
                  transition: 'all 0.2s', boxShadow: isLoading ? 'none' : '0 3px 10px rgba(99,102,241,0.3)'
                }}
              >
                <PaperPlaneRight weight="fill" size={16} />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-soft)' }}>
              MARKUP.AI may produce inaccurate information. Always verify legal advice with a qualified professional.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>
          Law Search Module coming soon...
        </div>
      )}

      {/* Typing animation keyframes */}
      <style jsx>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}

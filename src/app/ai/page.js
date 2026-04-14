"use client";

import { useState, useRef } from 'react';
import { Gear, Brain, PaperPlaneRight, Paperclip, X } from '@phosphor-icons/react';

const QUICK_QUESTIONS = [
  { icon: '📋', label: 'Draft reply for SCN u/s 73', text: 'Draft a professional reply to a Show Cause Notice under Section 73 of CGST Act for ITC mismatch.' },
  { icon: '🔍', label: 'ASMT-10 scrutiny response', text: 'What are the key points to address in a reply to ASMT-10 scrutiny notice for 2B vs 3B mismatch?' },
  { icon: '❌', label: 'GSTIN cancellation revocation', text: 'Explain the process to file revocation of GSTIN cancellation under Rule 23. What documents are required?' },
  { icon: '💰', label: 'ITC reversal under Rule 42', text: 'How to calculate ITC reversal under Rule 42 for inputs used for exempt supplies?' },
  { icon: '🏦', label: 'Refund rejection reply', text: 'Draft a reply to RFD-08 show cause notice for rejection of GST refund claim.' },
  { icon: '⚠️', label: 'Section 74 fraud notice', text: 'What is the difference between a notice under Section 73 and Section 74? How to defend a Section 74 notice?' },
];

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const sendMessage = (text) => {
    const msgText = text || input;
    if (!msgText.trim() && files.length === 0) return;

    let userMsg = msgText;
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      userMsg = msgText ? `${msgText}\n\n[Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setFiles([]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'MARKUP.AI is processing your query... Connect your AI API key in Settings to receive intelligent responses for GST research and notice drafting.' }]);
    }, 500);
  };

  return (
    <section className="view active" id="view-ai" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <div className="ai-view-header">
        <div className="ai-vh-left">
          <div className="ai-vh-icon"><Brain size={24} weight="fill" /></div>
          <div>
            <div className="ai-vh-title">MARKUP.AI — GST Intelligence Engine</div>
            <div className="ai-vh-sub">RESEARCH · DRAFTING · CASE LAW · ANALYSIS</div>
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
          <button className="btn-secondary"><Gear /></button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="ai-chat-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="ai-messages-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '4%' }}>
                {/* Welcome Banner */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.3rem' }}>
                    Welcome to&nbsp;
                    <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      M A R K U P &nbsp;. A I
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-soft)', fontWeight: 500 }}>Your AI GST Expert — Draft · Research · Analyse</div>
                </div>

                {/* Quick question templates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.text)}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '1rem', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.2s', color: 'var(--text)',
                        display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{q.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{q.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: '1.4' }}>{q.text.substring(0, 70)}…</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={{ marginBottom: '1rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '1rem', lineHeight: '1.5', borderRadius: '12px',
                    background: m.role === 'user' ? 'var(--primary-color)' : 'var(--bg-elevated)',
                    color: m.role === 'user' ? 'white' : 'var(--text)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    whiteSpace: 'pre-wrap'
                  }}>{m.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="ai-input-bar" style={{ padding: '1.5rem', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
            {files.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                {files.map((f, i) => (
                  <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, display: 'flex' }}><X size={12} weight="bold" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="ai-input-inner" style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '24px', padding: '0.5rem 1rem', alignItems: 'center' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', cursor: 'pointer' }} title="Upload Files">
                <Paperclip size={20} />
              </button>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              <input
                type="text"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '1rem' }}
                placeholder="Ask about any GST notice, section, or upload a document..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={() => sendMessage()} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <PaperPlaneRight weight="fill" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>
          Law Search Module coming soon...
        </div>
      )}
    </section>
  );
}

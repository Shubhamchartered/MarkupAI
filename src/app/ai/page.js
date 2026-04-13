"use client";

import { useState, useRef } from 'react';
import { Gear, Brain, MagnifyingGlass, PaperPlaneRight, Paperclip, X } from '@phosphor-icons/react';

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const sendMessage = () => {
    if (!input.trim() && files.length === 0) return;
    
    let userMsg = input;
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      userMsg = input ? `${input}\n\n[Attached: ${fileNames}]` : `[Attached: ${fileNames}]`;
    }

    setMessages([...messages, { role: 'user', text: userMsg, isFile: files.length > 0 }]);
    setInput('');
    setFiles([]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'AI processing and parsing documents... Anthropic key required for complete response.' }]);
    }, 500);
  };

  return (
    <section className="view active" id="view-ai" style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'}}>
      
      <div className="ai-view-header">
        <div className="ai-vh-left">
          <div className="ai-vh-icon"><Brain size={24} weight="fill" /></div>
          <div>
            <div className="ai-vh-title">GST Intelligence Engine</div>
            <div className="ai-vh-sub">RESEARCH · DRAFTING · CASE LAW · ANALYSIS</div>
          </div>
        </div>
        <div className="ai-vh-right">
          <div className="ai-mode-tabs" style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
            <button 
              className={`btn-secondary ${activeTab === 'chat' ? 'active' : ''}`} 
              onClick={() => setActiveTab('chat')}
              style={{ border: activeTab === 'chat' ? '1px solid var(--primary-color)' : '', background: activeTab === 'chat' ? 'rgba(99, 102, 241, 0.1)' : ''}}
            >
              ⟡ Chat
            </button>
            <button 
              className={`btn-secondary ${activeTab === 'search' ? 'active' : ''}`} 
              onClick={() => setActiveTab('search')}
              style={{ border: activeTab === 'search' ? '1px solid var(--primary-color)' : '', background: activeTab === 'search' ? 'rgba(99, 102, 241, 0.1)' : ''}}
            >
              ⊕ Law Search
            </button>
          </div>
          <button className="btn-secondary"><Gear /></button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="ai-chat-pane" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          <div className="ai-messages-scroll" style={{flex: 1, overflowY: 'auto', padding: '1.5rem'}}>
            {messages.length === 0 ? (
               <div style={{textAlign: 'center', marginTop: '10%', color: 'var(--text-soft)'}}>
                 <Brain size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
                 <h3>How can I help with GST matters today?</h3>
                 <p style={{marginTop: '0.5rem'}}>Draft replies, research case law, or summarize a notice.</p>
               </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '1rem',
                    lineHeight: '1.5',
                    borderRadius: '12px',
                    background: m.role === 'user' ? 'var(--primary-color)' : 'var(--bg-elevated)',
                    color: m.role === 'user' ? 'white' : 'var(--text)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="ai-input-bar" style={{padding: '1.5rem', background: 'var(--bg)', borderTop: '1px solid var(--border)'}}>
            {files.length > 0 && (
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap'}}>
                {files.map((f, i) => (
                  <div key={i} style={{background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                    <span style={{maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{f.name}</span>
                    <button onClick={() => removeFile(i)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, display: 'flex'}}><X size={12} weight="bold" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="ai-input-inner" style={{display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '24px', padding: '0.5rem 1rem', alignItems: 'center'}}>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{background: 'none', border: 'none', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', cursor: 'pointer'}}
                title="Upload Files"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{display: 'none'}}
              />
              <input 
                type="text" 
                style={{flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '1rem'}}
                placeholder="Ask about any GST section or upload docs..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage}
                style={{background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0}}
              ><PaperPlaneRight weight="fill" /></button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
         <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)'}}>
            Law Search Module coming soon...
         </div>
      )}
    </section>
  );
}

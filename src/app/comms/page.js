"use client";

import { useState } from 'react';
import { Eraser, PaperPlaneTilt, WhatsappLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { CommsEngine } from '@/lib/comms_engine';

export default function CommsPage() {
  const [trigger, setTrigger] = useState('');
  const [clientName, setClientName] = useState('');
  const [noticeRef, setNoticeRef] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [waOutput, setWaOutput] = useState('');
  const [emailOutput, setEmailOutput] = useState('');

  const generateAlert = () => {
    if (!trigger || !clientName) {
      alert("Please select a trigger and provide Client Name.");
      return;
    }
    
    const context = {
      client_name: clientName,
      notice_ref: noticeRef,
      amount: amount,
      due_date: dueDate
    };
    
    const comms = CommsEngine.generate(trigger, context);
    setWaOutput(comms.whatsapp.replace(/\n/g, '<br/>'));
    setEmailOutput(comms.email);
  };

  return (
    <section className="view active" id="view-comms">
      <div className="page-header">
        <div>
          <h1>Client Alerts</h1>
          <p>Generate WhatsApp &amp; Email alerts for notices, deadlines, and document requests.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {
            setTrigger(''); setClientName(''); setNoticeRef(''); setAmount(''); setDueDate(''); setWaOutput(''); setEmailOutput('');
          }}><Eraser /> Clear</button>
          <button className="btn-primary" onClick={generateAlert}><PaperPlaneTilt /> Generate Alert</button>
        </div>
      </div>

      <div className="comms-layout">
        {/* LEFT: Intake Form */}
        <div className="comms-form-col">
          <div className="comms-card">
            <h3>Alert Trigger</h3>
            <div className="mf-group">
              <select className="mf-select" value={trigger} onChange={e => setTrigger(e.target.value)}>
                <option value="">— Select Trigger —</option>
                <option value="NEW_NOTICE_SCN">New Notice / SCN Received</option>
                <option value="CRITICAL_DEADLINE">Critical Deadline Approaching</option>
                <option value="DOCS_REQUIRED">Documents / Info Required</option>
                <option value="DRAFT_APPROVED">Hearing / Draft Approved (Demand Active)</option>
              </select>
            </div>
            
            <h3 style={{ marginTop: '1.5rem' }}>Context Data</h3>
            <div className="mf-grid">
              <div className="mf-group span2">
                <label className="mf-label">Client Name</label>
                <input type="text" className="mf-input" placeholder="e.g. M/s ABC Traders" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div className="mf-group span2">
                <label className="mf-label">Notice Reference</label>
                <input type="text" className="mf-input" placeholder="e.g. SCN/74/2023/12" value={noticeRef} onChange={e => setNoticeRef(e.target.value)} />
              </div>
              <div className="mf-group">
                <label className="mf-label">Demand Amount (₹)</label>
                <input type="text" className="mf-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="mf-group">
                <label className="mf-label">Due Date</label>
                <input type="date" className="mf-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Output Previews */}
        <div className="comms-preview-col">
          <div className="comms-card">
            <h3><WhatsappLogo /> WhatsApp Preview</h3>
            <div className="wa-preview-box">
              <div className="wa-header">Client Chat</div>
              <div className="wa-msg" dangerouslySetInnerHTML={{__html: waOutput || '<em>Select trigger & generate</em>'}}></div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={!waOutput}>Copy for WhatsApp</button>
          </div>

          <div className="comms-card" style={{marginTop: '1.5rem'}}>
            <h3><EnvelopeSimple /> Email Preview</h3>
            <div className="email-preview-box">
              <div className="em-subj" style={{marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>
                <strong>Subject:</strong> {emailOutput ? emailOutput.split('\n')[0].replace('Subject: ', '') : ''}
              </div>
              <div className="em-body" style={{ whiteSpace: 'pre-wrap' }}>{emailOutput ? emailOutput.split('\n').slice(1).join('\n').trim() : 'Select trigger & generate'}</div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={!emailOutput}>Copy Email</button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from 'react';
import { Eraser, PaperPlaneTilt, WhatsappLogo, EnvelopeSimple, CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { CommsEngine } from '@/lib/comms_engine';

const CustomCalendar = ({ value, onChange }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const handleDateSelect = (day) => {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onChange(`${currentYear}-${m}-${d}`);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="custom-calendar-widget" style={{border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg)', padding: '1rem', width: '100%', maxWidth: '300px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <button type="button" onClick={handlePrevMonth} className="icon-btn-sm"><CaretLeft /></button>
        <strong style={{fontSize: '0.95rem'}}>{monthNames[currentMonth]} {currentYear}</strong>
        <button type="button" onClick={handleNextMonth} className="icon-btn-sm"><CaretRight /></button>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', textAlign: 'center'}}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '0.5rem', fontWeight: 600}}>{d}</div>)}
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
          const isSelected = value === dateStr;
          return (
            <button type="button" key={`day-${day}`} onClick={() => handleDateSelect(day)} style={{
              background: isSelected ? 'var(--primary-color)' : 'transparent',
              color: isSelected ? '#fff' : 'var(--text)',
              border: isSelected ? 'none' : '1px solid transparent', 
              borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto',
              fontWeight: isSelected ? 600 : 400, transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >{day}</button>
          )
        })}
      </div>
    </div>
  );
};

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
              <div className="mf-group" style={{gridColumn: '1 / -1'}}>
                <label className="mf-label"><CalendarBlank /> Alert Due Date</label>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                  <CustomCalendar value={dueDate} onChange={setDueDate} />
                  {dueDate && (
                    <div style={{padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid var(--primary-color)', flex: 1}}>
                      <strong style={{display: 'block', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>Selected Deadline:</strong>
                      <span style={{fontSize: '1.2rem'}}>{new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
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

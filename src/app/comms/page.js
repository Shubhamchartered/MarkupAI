"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Eraser, PaperPlaneTilt, WhatsappLogo, EnvelopeSimple, CalendarBlank, CaretLeft, CaretRight, Plus, X, UsersThree, MagnifyingGlass } from '@phosphor-icons/react';
import { CommsEngine } from '@/lib/comms_engine';
import { CLIENT_DATA } from '@/data/client_data';
import { getNoticesForClient } from '@/lib/notice_sync';

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
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg)', padding: '1rem', minWidth: '280px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button type="button" onClick={handlePrevMonth} className="icon-btn-sm"><CaretLeft /></button>
        <strong style={{ fontSize: '0.95rem' }}>{monthNames[currentMonth]} {currentYear}</strong>
        <button type="button" onClick={handleNextMonth} className="icon-btn-sm"><CaretRight /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', textAlign: 'center' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginBottom: '0.5rem', fontWeight: 600 }}>{d}</div>
        ))}
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isSelected = value === dateStr;
          const isToday = dateStr === `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
          return (
            <button type="button" key={`day-${day}`} onClick={() => handleDateSelect(day)} style={{
              background: isSelected ? 'var(--primary-color)' : 'transparent',
              color: isSelected ? '#fff' : isToday ? 'var(--primary-color)' : 'var(--text)',
              border: isSelected ? 'none' : isToday ? '1px solid var(--primary-color)' : '1px solid transparent',
              borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto',
              fontWeight: isSelected || isToday ? 600 : 400, transition: 'all 0.2s',
            }}
              onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >{day}</button>
          );
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

  // Client search dropdown
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const clientDropdownRef = useRef(null);

  const filteredClientList = useMemo(() => {
    if (!clientSearch || clientSearch.length < 1) return CLIENT_DATA.slice(0, 10);
    const q = clientSearch.toLowerCase();
    return CLIENT_DATA.filter(c =>
      (c.userName || '').toLowerCase().includes(q) ||
      (c.userId || '').toLowerCase().includes(q) ||
      (c.gstn || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [clientSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (c) => {
    setSelectedClient(c);
    setClientName(c.userName);
    setClientSearch(c.userName);
    setShowClientDropdown(false);
    // Auto-fill notice reference from synced data
    const notices = getNoticesForClient(c.gstn);
    if (notices.length > 0) {
      setNoticeRef(notices[0].number || notices[0].notice_id || '');
      if (notices[0].amount) setAmount(String(notices[0].amount));
    }
  };

  // Bulk WhatsApp reminder state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [bulkTrigger, setBulkTrigger] = useState('CRITICAL_DEADLINE');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [bulkSent, setBulkSent] = useState(false);

  const toggleClient = (c) => {
    const key = c.userId;
    setSelectedClients(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const sendBulkReminders = () => {
    if (selectedClients.length === 0) { alert('Please select at least one client.'); return; }
    setBulkSent(true);
    setTimeout(() => {
      alert(`✅ WhatsApp reminders sent to ${selectedClients.length} clients!`);
      setShowBulkModal(false);
      setSelectedClients([]);
      setBulkSent(false);
    }, 1500);
  };

  const generateAlert = () => {
    if (!trigger || !clientName) { alert("Please select a trigger and provide Client Name."); return; }
    const context = { client_name: clientName, notice_ref: noticeRef, amount, due_date: dueDate };
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
          <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
            <UsersThree /> Bulk WhatsApp Reminder
          </button>
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
              <div className="mf-group span2" ref={clientDropdownRef} style={{ position: 'relative' }}>
                <label className="mf-label">Client Name</label>
                <div style={{ position: 'relative' }}>
                  <MagnifyingGlass size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                  <input
                    type="text"
                    className="mf-input"
                    placeholder="Search client by name, ID, GSTN…"
                    value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setClientName(e.target.value); setShowClientDropdown(true); }}
                    onFocus={() => setShowClientDropdown(true)}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                {showClientDropdown && filteredClientList.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    maxHeight: '220px', overflowY: 'auto', marginTop: '0.25rem',
                  }}>
                    {filteredClientList.map((c, i) => (
                      <button
                        key={c.userId || i}
                        onClick={() => handleSelectClient(c)}
                        style={{
                          width: '100%', display: 'flex', flexDirection: 'column', gap: '0.1rem',
                          padding: '0.6rem 0.85rem', background: 'none', border: 'none',
                          cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
                          borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{c.userId} · {c.gstn}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mf-group span2">
                <label className="mf-label">Notice Reference</label>
                <input type="text" className="mf-input" placeholder="e.g. SCN/74/2023/12" value={noticeRef} onChange={e => setNoticeRef(e.target.value)} />
              </div>
              <div className="mf-group span2">
                <label className="mf-label">Demand Amount (₹)</label>
                <input type="text" className="mf-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="mf-group" style={{ gridColumn: '1 / -1' }}>
                <label className="mf-label"><CalendarBlank /> Alert Due Date</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <CustomCalendar value={dueDate} onChange={setDueDate} />
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    {dueDate ? (
                      <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Selected Due Date:</strong>
                        <span style={{ fontSize: '1.2rem' }}>{new Date(dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <button style={{ display: 'block', marginTop: '0.75rem', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '0.8rem' }} onClick={() => setDueDate('')}>✕ Clear</button>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                        ← Select a date from the calendar
                      </div>
                    )}
                  </div>
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
              <div className="wa-msg" dangerouslySetInnerHTML={{ __html: waOutput || '<em>Select trigger & generate</em>' }}></div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={!waOutput}
              onClick={() => { navigator.clipboard.writeText(waOutput.replace(/<br\/>/g, '\n')); alert('Copied!'); }}>
              Copy for WhatsApp
            </button>
          </div>

          <div className="comms-card" style={{ marginTop: '1.5rem' }}>
            <h3><EnvelopeSimple /> Email Preview</h3>
            <div className="email-preview-box">
              <div className="em-subj" style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <strong>Subject:</strong> {emailOutput ? emailOutput.split('\n')[0].replace('Subject: ', '') : ''}
              </div>
              <div className="em-body" style={{ whiteSpace: 'pre-wrap' }}>{emailOutput ? emailOutput.split('\n').slice(1).join('\n').trim() : 'Select trigger & generate'}</div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={!emailOutput}>Copy Email</button>
          </div>
        </div>
      </div>

      {/* ===== BULK WHATSAPP MODAL ===== */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Bulk WhatsApp Reminders</h2>
              <button onClick={() => setShowBulkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={20} /></button>
            </div>

            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label">Alert Trigger</label>
              <select className="mf-select" value={bulkTrigger} onChange={e => setBulkTrigger(e.target.value)}>
                <option value="CRITICAL_DEADLINE">Critical Deadline Approaching</option>
                <option value="NEW_NOTICE_SCN">New Notice / SCN Received</option>
                <option value="DOCS_REQUIRED">Documents Required</option>
              </select>
            </div>

            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label"><CalendarBlank size={14} /> Due Date for Reminder</label>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <CustomCalendar value={bulkDueDate} onChange={setBulkDueDate} />
                {bulkDueDate && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: '8px', border: '1px solid var(--primary-color, #6366f1)', alignSelf: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: '0.2rem' }}>Selected:</div>
                    <div style={{ fontWeight: 700 }}>{new Date(bulkDueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="mf-label">Select Clients ({selectedClients.length} selected)</label>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.85rem' }}
                onClick={() => setSelectedClients(selectedClients.length === CLIENT_DATA.slice(0, 15).length ? [] : CLIENT_DATA.slice(0, 15).map(c => c.userId))}>
                {selectedClients.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {CLIENT_DATA.slice(0, 15).map((c, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderBottom: i < 14 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedClients.includes(c.userId)} onChange={() => toggleClient(c)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{c.userName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{c.userId} · {c.gstn}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ minWidth: '180px' }} onClick={sendBulkReminders} disabled={bulkSent}>
                <WhatsappLogo /> {bulkSent ? 'Sending...' : `Send to ${selectedClients.length} clients`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

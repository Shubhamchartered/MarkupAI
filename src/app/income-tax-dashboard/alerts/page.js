"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Bell, WhatsappLogo, EnvelopeSimple, CalendarBlank, X,
  UsersThree, MagnifyingGlass, PaperPlaneTilt, Eraser,
  CaretLeft, CaretRight, CheckCircle, ArrowLeft
} from '@phosphor-icons/react';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { IT_NOTICES_DB } from '@/data/it_notices_data';
import Link from 'next/link';

/* ─── Calendar Component ─── */
function CustomCalendar({ value, onChange }) {
  const today = new Date();
  const [cm, setCm] = useState(today.getMonth());
  const [cy, setCy] = useState(today.getFullYear());
  const daysInMonth = new Date(cy, cm + 1, 0).getDate();
  const firstDay = new Date(cy, cm, 1).getDay();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const prev = () => { if (cm === 0) { setCm(11); setCy(y => y - 1); } else setCm(m => m - 1); };
  const next = () => { if (cm === 11) { setCm(0); setCy(y => y + 1); } else setCm(m => m + 1); };
  const select = (d) => { const m = (cm + 1).toString().padStart(2,'0'); onChange(`${cy}-${m}-${d.toString().padStart(2,'0')}`); };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--bg)', padding: '1rem', minWidth: '272px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <button type="button" onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '1rem', padding: '0.2rem 0.5rem' }}>‹</button>
        <strong style={{ fontSize: '0.92rem' }}>{MONTHS[cm]} {cy}</strong>
        <button type="button" onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '1rem', padding: '0.2rem 0.5rem' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginBottom: '0.4rem', fontWeight: 700 }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const ds = `${cy}-${(cm+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
          const isSel = value === ds;
          const isTd = ds === `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
          return (
            <button type="button" key={d} onClick={() => select(d)} style={{
              background: isSel ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'transparent',
              color: isSel ? '#fff' : isTd ? '#0ea5e9' : 'var(--text)',
              border: isSel ? 'none' : isTd ? '1px solid #0ea5e9' : '1px solid transparent',
              borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto',
              fontWeight: isSel || isTd ? 700 : 400, fontSize: '0.8rem', transition: 'all 0.15s',
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Alert templates ─── */
const IT_TRIGGERS = [
  { value: 'IT_NOTICE_RECEIVED', label: '📨 IT Notice Received' },
  { value: 'SCRUTINY_DEADLINE', label: '⚠️ Scrutiny Reply Deadline' },
  { value: 'DEMAND_NOTICE', label: '💰 Demand Notice Outstanding' },
  { value: 'APPEAL_FILING', label: '⚖️ Appeal Filing Deadline' },
  { value: 'HEARING_DATE', label: '🏛️ Hearing Date Reminder' },
  { value: 'ITR_DUE', label: '📅 ITR Filing Due Date' },
  { value: 'DOCS_REQUIRED', label: '📂 Documents Required from Client' },
];

function generateAlerts(trigger, ctx) {
  const { clientName, pan, noticeRef, section, amount, dueDate, ay } = ctx;
  const name = clientName || '[Client Name]';
  const dueFmt = dueDate ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Due Date]';
  const amtFmt = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '[Amount]';
  const noticeNum = noticeRef || '[Notice Ref]';
  const secStr = section ? `Section ${section}` : '[Section]';
  const ayStr = ay || '[AY]';

  const templates = {
    IT_NOTICE_RECEIVED: {
      whatsapp: `🔔 *IMPORTANT — Income Tax Notice*\n\nDear ${name},\n\nWe wish to bring to your attention that an Income Tax notice has been received under *${secStr}* for Assessment Year *${ayStr}*.\n\n📋 *Notice Reference:* ${noticeNum}\n📅 *Due Date for Reply:* ${dueFmt}\n\n⚠️ Timely response is crucial to avoid penalty u/s 271(b). Please share the required documents at the earliest.\n\nRegards,\n*CA Shubham Choudhary & Associates*\n📞 7741947543`,
      email: `Subject: URGENT — Income Tax Notice Received — ${name} — ${secStr} — AY ${ayStr}\n\nDear ${name},\n\nThis is to inform you that an Income Tax Notice has been received on your behalf under ${secStr} vide Notice Reference: ${noticeNum} for Assessment Year ${ayStr}.\n\nDue Date for Reply: ${dueFmt}\n\nPlease arrange to visit our office or send us the relevant documents (books of accounts, bank statements, ITR acknowledgment, etc.) at the earliest to enable us to prepare a proper reply.\n\nFailure to respond on time may invite penalty under Section 271(b) of the Income Tax Act.\n\nWarm regards,\nCA Shubham Choudhary & Associates\nAmravati | 7741947543`,
    },
    SCRUTINY_DEADLINE: {
      whatsapp: `⚠️ *URGENT — Scrutiny Reply Deadline*\n\nDear ${name},\n\nYour Income Tax scrutiny reply under *${secStr}* for AY *${ayStr}* is due on *${dueFmt}*.\n\n📋 *Notice:* ${noticeNum}\n\nPlease ensure all documents are submitted immediately. Any delay may lead to ex-parte assessment.\n\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: URGENT — Scrutiny Reply Deadline Approaching — ${name} — AY ${ayStr}\n\nDear ${name},\n\nThis is an urgent reminder that your reply to the Income Tax Scrutiny Notice (${secStr}) — Reference: ${noticeNum} — for AY ${ayStr} is due on ${dueFmt}.\n\nPlease bring/courier all documents without delay. Non-submission may result in an ex-parte assessment order.\n\nRegards,\nCA Shubham Choudhary & Associates`,
    },
    DEMAND_NOTICE: {
      whatsapp: `💰 *Income Tax Demand Notice — Action Required*\n\nDear ${name},\n\nAn Income Tax demand of *${amtFmt}* is outstanding against you for AY *${ayStr}* under *${secStr}*.\n\n📋 *Ref:* ${noticeNum}\n📅 *Payment/Response Due:* ${dueFmt}\n\nOptions available:\n✅ Pay the demand\n✅ File rectification u/s 154\n✅ File appeal u/s 246A before CIT(A)\n\nPlease contact us urgently.\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: Income Tax Demand Notice — ${amtFmt} Outstanding — ${name}\n\nDear ${name},\n\nAn Income Tax demand of ${amtFmt} has been confirmed against your PAN (${pan || '[PAN]'}) under ${secStr} for Assessment Year ${ayStr}.\n\nNotice Reference: ${noticeNum}\nDue Date: ${dueFmt}\n\nYou may:\n1. Pay the demand and avoid further interest u/s 220(2)\n2. File a rectification application u/s 154 if demand is incorrect\n3. Prefer an appeal before CIT(A) u/s 246A within 30 days\n\nPlease contact us to discuss the best course of action.\n\nWarm regards,\nCA Shubham Choudhary & Associates`,
    },
    APPEAL_FILING: {
      whatsapp: `⚖️ *Appeal Filing Deadline — URGENT*\n\nDear ${name},\n\nThe deadline to file your Income Tax appeal before CIT(A) for AY *${ayStr}* (${secStr} — ${amtFmt} demand) is *${dueFmt}*.\n\nAppeal window: 30 days from order date. Please share the assessment order urgently.\n\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: URGENT — Appeal Filing Deadline — CIT(A) — ${name} — AY ${ayStr}\n\nDear ${name},\n\nThis is to alert you that the deadline to file your appeal before the Commissioner of Income Tax (Appeals) against the assessment order for AY ${ayStr} — Demand: ${amtFmt} — is ${dueFmt}.\n\nPlease share the original assessment order and Form 35 details to enable us to file the appeal on time.\n\nWarm regards,\nCA Shubham Choudhary & Associates`,
    },
    HEARING_DATE: {
      whatsapp: `🏛️ *Hearing Date Reminder*\n\nDear ${name},\n\nYour Income Tax hearing under *${secStr}* for AY *${ayStr}* is scheduled on *${dueFmt}*.\n\n📋 Notice: ${noticeNum}\n\nPlease be available and ensure all documents are ready. We will be representing you before the AO.\n\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: Income Tax Hearing Date — ${name} — ${secStr} — AY ${ayStr}\n\nDear ${name},\n\nYour Income Tax hearing under ${secStr} — Notice: ${noticeNum} — for AY ${ayStr} has been scheduled on ${dueFmt}.\n\nWe will be present to represent you. Please ensure availability and have all original documents ready.\n\nWarm regards,\nCA Shubham Choudhary & Associates`,
    },
    ITR_DUE: {
      whatsapp: `📅 *ITR Filing Reminder — AY ${ayStr}*\n\nDear ${name},\n\nYour Income Tax Return for AY *${ayStr}* must be filed by *${dueFmt}* to avoid late fee under Section 234F (₹5,000 / ₹10,000).\n\nPlease provide: P&L, Balance Sheet, Bank Statements, Form 16/16A, and all investment proofs at the earliest.\n\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: ITR Filing Due Date Reminder — ${name} — AY ${ayStr}\n\nDear ${name},\n\nThis is a reminder that the deadline to file your Income Tax Return for Assessment Year ${ayStr} is ${dueFmt}.\n\nLate filing attracts fees under Section 234F (₹5,000 if income > ₹5L, else ₹1,000) and interest under Sections 234A, 234B, 234C.\n\nPlease provide your financial statements, Form 16/16A, bank statements, and investment declarations at the earliest.\n\nWarm regards,\nCA Shubham Choudhary & Associates`,
    },
    DOCS_REQUIRED: {
      whatsapp: `📂 *Documents Required — Income Tax*\n\nDear ${name},\n\nFor your Income Tax matter under *${secStr}* (${noticeNum}, AY *${ayStr}*), we require the following documents:\n\n📌 Bank statements (last 3 years)\n📌 Books of accounts / Tally data\n📌 ITR acknowledgments\n📌 Investment & capital gain statements\n📌 Any correspondence received from IT Dept\n\n⏰ Due by: *${dueFmt}*\n\nPlease WhatsApp / courier the same urgently.\n— *CA Shubham Choudhary & Associates*`,
      email: `Subject: Documents Required for IT Notice — ${name} — ${secStr} — AY ${ayStr}\n\nDear ${name},\n\nWith reference to your Income Tax notice under ${secStr} — Ref: ${noticeNum} — for AY ${ayStr}, we require the following documents by ${dueFmt}:\n\n1. Audited financial statements / books of accounts\n2. Bank statements for all accounts\n3. ITR Acknowledgment (all years under scrutiny)\n4. Investment and capital gain statements\n5. Any correspondence previously received from the IT Department\n6. TDS certificates (Form 16/16A/26AS)\n\nKindly arrange and send the same at the earliest.\n\nWarm regards,\nCA Shubham Choudhary & Associates`,
    },
  };

  return templates[trigger] || { whatsapp: '', email: '' };
}

/* ─── Main Page ─── */
export default function ITAlertsPage() {
  const [trigger, setTrigger] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [section, setSection] = useState('');
  const [noticeRef, setNoticeRef] = useState('');
  const [amount, setAmount] = useState('');
  const [ay, setAY] = useState('2025-26');
  const [dueDate, setDueDate] = useState('');
  const [waOutput, setWaOutput] = useState('');
  const [emailOutput, setEmailOutput] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [selectedBulk, setSelectedBulk] = useState([]);
  const [bulkTrigger, setBulkTrigger] = useState('SCRUTINY_DEADLINE');
  const [bulkDue, setBulkDue] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    if (!q) return IT_CLIENT_DATA.slice(0, 12);
    return IT_CLIENT_DATA.filter(c => c.name.toLowerCase().includes(q) || c.pan.toLowerCase().includes(q)).slice(0, 12);
  }, [clientSearch]);

  const selectClient = (c) => {
    setSelectedClient(c);
    setClientSearch(c.name);
    setShowDropdown(false);
    // Auto-fill from notices DB
    const linked = IT_NOTICES_DB.notices.filter(n => n.pan === c.pan);
    if (linked.length > 0) {
      setNoticeRef(linked[0].noticeId);
      setSection(linked[0].section || '');
      setAmount(linked[0].demandAmount ? String(linked[0].demandAmount) : '');
    }
  };

  const generate = () => {
    if (!trigger || !selectedClient) { alert('Please select a trigger and a client.'); return; }
    const ctx = { clientName: selectedClient?.name, pan: selectedClient?.pan, noticeRef, section, amount, dueDate, ay };
    const { whatsapp, email } = generateAlerts(trigger, ctx);
    setWaOutput(whatsapp);
    setEmailOutput(email);
  };

  const clear = () => {
    setTrigger(''); setClientSearch(''); setSelectedClient(null);
    setSection(''); setNoticeRef(''); setAmount(''); setDueDate('');
    setWaOutput(''); setEmailOutput('');
  };

  const sendBulk = () => {
    if (!selectedBulk.length) { alert('Select at least one client.'); return; }
    setBulkSending(true);
    setTimeout(() => { alert(`✅ WhatsApp alerts sent to ${selectedBulk.length} clients!`); setShowBulk(false); setSelectedBulk([]); setBulkSending(false); }, 1500);
  };

  return (
    <section className="view active" id="view-it-alerts">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={26} weight="duotone" color="#0ea5e9" />
            IT Client Alerts
          </h1>
          <p>Generate WhatsApp & Email alerts for Income Tax notices, deadlines, and hearings</p>
        </div>
        <div className="header-actions">
          <Link href="/income-tax-dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <button className="btn-secondary" onClick={() => setShowBulk(true)}><UsersThree /> Bulk Alerts</button>
          <button className="btn-secondary" onClick={clear}><Eraser /> Clear</button>
          <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow: '0 3px 10px rgba(14,165,233,.3)' }} onClick={generate}><PaperPlaneTilt /> Generate Alert</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* LEFT — Form */}
        <div>
          <div className="section-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Alert Trigger</h3>
            <select className="mf-select" value={trigger} onChange={e => setTrigger(e.target.value)} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}>
              <option value="">— Select Trigger —</option>
              {IT_TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="section-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Client & Context</h3>
            <div style={{ display: 'grid', gap: '0.85rem' }}>

              {/* Client search */}
              <div className="mf-group" ref={dropdownRef} style={{ position: 'relative' }}>
                <label className="mf-label">Taxpayer / Client *</label>
                <div style={{ position: 'relative' }}>
                  <MagnifyingGlass size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                  <input className="mf-input" type="text" placeholder="Search by name or PAN…" value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)} style={{ paddingLeft: '2.2rem' }} />
                </div>
                {showDropdown && filteredClients.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 12px 30px rgba(0,0,0,0.35)', maxHeight: '240px', overflowY: 'auto', marginTop: '0.2rem' }}>
                    {filteredClients.map((c, i) => (
                      <button key={c.pan + i} onClick={() => selectClient(c)} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.05rem', padding: '0.6rem 0.9rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{c.pan} · {c.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(14,165,233,0.08)', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.25)', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 700, color: '#0ea5e9', marginBottom: '0.15rem' }}>{selectedClient.name}</div>
                  <div style={{ color: 'var(--text-soft)' }}>PAN: <code>{selectedClient.pan}</code> · {selectedClient.type} · {selectedClient.status}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="mf-group">
                  <label className="mf-label">Section</label>
                  <input className="mf-input" value={section} onChange={e => setSection(e.target.value)} placeholder="e.g. 143(2)" />
                </div>
                <div className="mf-group">
                  <label className="mf-label">Assessment Year</label>
                  <input className="mf-input" value={ay} onChange={e => setAY(e.target.value)} placeholder="2025-26" />
                </div>
                <div className="mf-group">
                  <label className="mf-label">Notice Reference</label>
                  <input className="mf-input" value={noticeRef} onChange={e => setNoticeRef(e.target.value)} placeholder="IT-001" />
                </div>
                <div className="mf-group">
                  <label className="mf-label">Demand Amount (₹)</label>
                  <input className="mf-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="mf-group">
                <label className="mf-label"><CalendarBlank size={13} style={{ marginRight: '0.3rem' }} />Due Date</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  <CustomCalendar value={dueDate} onChange={setDueDate} />
                  {dueDate ? (
                    <div style={{ padding: '0.85rem 1rem', background: 'rgba(14,165,233,0.08)', borderRadius: '10px', border: '1px solid rgba(14,165,233,0.25)', alignSelf: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: '0.2rem' }}>Selected:</div>
                      <div style={{ fontWeight: 700, color: '#0ea5e9', fontSize: '1rem' }}>{new Date(dueDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <button onClick={() => setDueDate('')} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '0.75rem' }}>✕ Clear</button>
                    </div>
                  ) : (
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--bg)', borderRadius: '10px', border: '1px dashed var(--border)', color: 'var(--text-soft)', fontSize: '0.85rem', alignSelf: 'center' }}>← Pick a date</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* WhatsApp */}
          <div className="section-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <WhatsappLogo size={18} color="#25D366" /> WhatsApp Message
            </h3>
            <div style={{ background: '#0b1a0d', border: '1px solid #1a3a1d', borderRadius: '12px', minHeight: '180px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.7, color: '#d0f5d0', whiteSpace: 'pre-wrap', maxHeight: '320px', overflowY: 'auto' }}>
              {waOutput || <span style={{ color: '#3a6b40', fontStyle: 'italic' }}>Select trigger & generate…</span>}
            </div>
            {waOutput && (
              <button className="btn-secondary" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(waOutput); alert('Copied!'); }}>
                📋 Copy for WhatsApp
              </button>
            )}
          </div>

          {/* Email */}
          <div className="section-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <EnvelopeSimple size={18} color="#0ea5e9" /> Email Draft
            </h3>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', minHeight: '180px', padding: '1rem', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '320px', overflowY: 'auto', color: 'var(--text)' }}>
              {emailOutput ? (
                <>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#0ea5e9' }}>
                    {emailOutput.split('\n')[0]}
                  </div>
                  {emailOutput.split('\n').slice(1).join('\n').trim()}
                </>
              ) : <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>Select trigger & generate…</span>}
            </div>
            {emailOutput && (
              <button className="btn-secondary" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(emailOutput); alert('Email copied!'); }}>
                📋 Copy Email
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bulk Modal ─── */}
      {showBulk && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '600px', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Bulk IT Client Alerts</h2>
              <button onClick={() => setShowBulk(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={18} /></button>
            </div>

            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label">Alert Trigger</label>
              <select className="mf-select" value={bulkTrigger} onChange={e => setBulkTrigger(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                {IT_TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label"><CalendarBlank size={13} /> Due Date</label>
              <div style={{ marginTop: '0.35rem' }}>
                <CustomCalendar value={bulkDue} onChange={setBulkDue} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="mf-label">{selectedBulk.length} client(s) selected</label>
              <button onClick={() => setSelectedBulk(selectedBulk.length > 0 ? [] : IT_CLIENT_DATA.slice(0, 20).map(c => c.pan))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', fontSize: '0.82rem', fontWeight: 600 }}>
                {selectedBulk.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {IT_CLIENT_DATA.slice(0, 20).map((c, i) => (
                <label key={c.pan + i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.65rem 1rem', borderBottom: i < 19 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedBulk.includes(c.pan)} onChange={() => setSelectedBulk(p => p.includes(c.pan) ? p.filter(x => x !== c.pan) : [...p, c.pan])} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{c.pan} · {c.type}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', minWidth: 200, justifyContent: 'center' }} onClick={sendBulk} disabled={bulkSending}>
                <WhatsappLogo /> {bulkSending ? 'Sending…' : `Send to ${selectedBulk.length} Clients`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

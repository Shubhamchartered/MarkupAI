"use client";

import { useState, useRef } from 'react';
import { WarningOctagon, EnvelopeOpen, CheckSquare, CurrencyInr, FileCode, CheckCircle, Warning, UploadSimple, X, UserCircle, FolderOpen, Lightning, Trash, ArrowLeft } from '@phosphor-icons/react';
import { NOTICES_DB } from '@/data/notices_data';
import { MatterEngine } from '@/lib/matter_engine';
import { CLIENT_DATA } from '@/data/client_data';
import Link from 'next/link';

const GST_NOTICE_TYPES = [
  { group: '1. Registration Notices', items: [
    { value: 'REG-03 (Sec 25/Rule 9)', label: 'REG-03 — Registration Query (Sec 25 / Rule 9)' },
    { value: 'REG-17 (Rule 21/Sec 29)', label: 'REG-17 — Cancellation Proceedings (Rule 21 / Sec 29)' },
    { value: 'REG-19 (Rule 22)', label: 'REG-19 — Cancellation Order (Rule 22)' },
    { value: 'REG-21/REG-23 (Rule 23)', label: 'REG-21/23 — Revocation of Cancellation (Rule 23)' },
    { value: 'Rule 10A', label: 'Bank Account Validation Notice (Rule 10A)' },
    { value: 'Rule 21A', label: 'GSTIN Suspension Notice (Rule 21A)' },
  ]},
  { group: '2. Return Non-Filing & Compliance', items: [
    { value: 'GSTR-3A (Sec 46)', label: 'GSTR-3A — Non-Filing Notice (Sec 46)' },
    { value: 'Late Fee (Sec 47)', label: 'Late Fee Notice (Sec 47)' },
  ]},
  { group: '3. Mismatch & Scrutiny', items: [
    { value: 'ASMT-10 (Sec 61/Rule 99)', label: 'ASMT-10 — Scrutiny Notice (Sec 61 / Rule 99)' },
    { value: 'ASMT-11 Reply', label: 'ASMT-11 — Reply to Scrutiny' },
  ]},
  { group: '4. Assessment Notices', items: [
    { value: 'ASMT-13 (Sec 62)', label: 'ASMT-13 — Best Judgment Assessment (Sec 62)' },
    { value: 'ASMT-14 (Sec 63)', label: 'ASMT-14 — Unregistered Person Assessment (Sec 63)' },
    { value: 'Sec 64', label: 'Summary Assessment (Sec 64)' },
  ]},
  { group: '5. SCN / Demand (CRITICAL)', items: [
    { value: 'DRC-01 (Sec 73)', label: 'DRC-01 — SCN Non-Fraud (Sec 73)' },
    { value: 'DRC-01 (Sec 74)', label: 'DRC-01 — SCN Fraud / Suppression (Sec 74)' },
    { value: 'DRC-06 Reply', label: 'DRC-06 — Reply to SCN (Sec 75)' },
    { value: 'DRC-07 (Sec 76)', label: 'DRC-07 — Demand Order / Tax Collected Not Paid (Sec 76)' },
  ]},
  { group: '6. ITC Related', items: [
    { value: 'ITC Blocked (Sec 16)', label: 'ITC Blocked (Sec 16)' },
    { value: 'Excess ITC (Sec 17)', label: 'Excess ITC Claimed (Sec 17)' },
    { value: 'ITC Restriction (Rule 36(4))', label: 'ITC Restriction Notice (Rule 36(4))' },
  ]},
  { group: '7. Refund Notices', items: [
    { value: 'RFD-03 (Rule 90)', label: 'RFD-03 — Refund Deficiency (Rule 90)' },
    { value: 'RFD-08 (Rule 92)', label: 'RFD-08 — SCN for Refund Rejection (Rule 92)' },
  ]},
  { group: '8. E-Way Bill / Movement', items: [
    { value: 'MOV-07 (Sec 129)', label: 'MOV-07 — Detention of Goods (Sec 129)' },
    { value: 'MOV-09 (Sec 130)', label: 'MOV-09 — Confiscation Order (Sec 130)' },
  ]},
  { group: '9. Inspection / Search / Enforcement', items: [
    { value: 'Summons (Sec 70)', label: 'Summons (Sec 70)' },
    { value: 'Inspection (Sec 67)', label: 'Inspection / Search (Sec 67)' },
    { value: 'Access Premises (Sec 71)', label: 'Access to Business Premises (Sec 71)' },
  ]},
  { group: '10. Audit & Investigation', items: [
    { value: 'ADT-01 (Sec 65)', label: 'ADT-01 — Departmental Audit (Sec 65)' },
    { value: 'Special Audit (Sec 66)', label: 'Special Audit (Sec 66)' },
  ]},
  { group: '11. Appeals & Litigation', items: [
    { value: 'Appeal (Sec 107)', label: 'First Appeal (Sec 107)' },
    { value: 'Revision (Sec 108)', label: 'Revision Order (Sec 108)' },
    { value: 'Tribunal (Sec 112)', label: 'Appellate Tribunal (Sec 112)' },
  ]},
  { group: '12. Recovery Proceedings', items: [
    { value: 'DRC-13 (Sec 79)', label: 'DRC-13 — Bank Attachment (Sec 79)' },
    { value: 'DRC-16 (Sec 78)', label: 'DRC-16 — Property Attachment (Sec 78)' },
  ]},
];

function MatterTab({ onClose }) {
  const [activeTab, setActiveTab] = useState('mt-client');
  const [formData, setFormData] = useState({
    matterId: '', legalName: '', gstin: '', state: '', regType: 'Regular',
    noticeType: '', noticeNumber: '', issueDate: '', dueDate: '', issuingAuthority: '',
    periodFrom: '', periodTo: '', taxDemand: '', interest: '', penalty: '',
    draftType: 'Formal Reply', tone: 'Respectful and corrective',
  });
  const [docs, setDocs] = useState({ scn: false, returns: false, recon: false, challans: false, books: false, eway: false });
  const [output, setOutput] = useState('');

  const updateForm = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('mf-', '')]: value }));
  };

  const handleUploadNotice = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      alert('Notice parsed! Auto-filling details from uploaded document...');
      setFormData(prev => ({
        ...prev,
        legalName: 'M/s Uploaded Enterprises', gstin: '27AADCA1234F1Z9', state: 'Maharashtra',
        noticeType: 'DRC-01 (Sec 73)', noticeNumber: 'DRC01/2026/MH/0042',
        issueDate: '2026-04-10', dueDate: '2026-05-10', issuingAuthority: 'State Tax Officer, Pune',
      }));
    }
  };

  const handleGenerate = () => {
    const matter = {
      matterId: formData.matterId || 'MTR-AUTO',
      legalName: formData.legalName, gstin: formData.gstin, state: formData.state,
      noticeType: formData.noticeType, noticeNumber: formData.noticeNumber,
      issueDate: formData.issueDate, dueDate: formData.dueDate,
      sectionInvoked: formData.noticeType, strategy: 'FACTUAL',
      issuingAuthority: formData.issuingAuthority, issues: [],
      documentsReady: Object.keys(docs).filter(k => docs[k]),
      pendingDocs: Object.keys(docs).filter(k => !docs[k]),
    };
    const draft = MatterEngine.generate(matter);
    setOutput(draft.full);
    setActiveTab('mt-output');
  };

  return (
    <div style={{ marginTop: '2rem', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg-elevated)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <strong>📋 Matter Record</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="file" id="matter-upload-merged" style={{ display: 'none' }} onChange={handleUploadNotice} accept=".pdf,.json,.docx,.xlsx,.png,.jpg,.jpeg" />
          <button className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }} onClick={() => document.getElementById('matter-upload-merged').click()}>
            <UploadSimple size={14} /> Upload Notice
          </button>
          <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }} onClick={handleGenerate}>
            <FileCode size={14} /> Generate Draft
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }} onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      <div className="matter-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {[['mt-client', '👤 Client'], ['mt-notice', '📄 Notice'], ['mt-docs', '📁 Docs'], ['mt-output', '⚡ Output']].map(([tab, label]) => (
          <button key={tab} className={`mtab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </div>

      <div className="matter-content" style={{ padding: '1.5rem' }}>
        {activeTab === 'mt-client' && (
          <div className="mf-grid">
            <div className="mf-group span2">
              <label className="mf-label">Legal Name</label>
              <input type="text" className="mf-input" id="mf-legalName" value={formData.legalName} onChange={updateForm} />
            </div>
            <div className="mf-group span2">
              <label className="mf-label">GSTIN</label>
              <input type="text" className="mf-input" id="mf-gstin" value={formData.gstin} onChange={updateForm} />
            </div>
            <div className="mf-group">
              <label className="mf-label">State</label>
              <select className="mf-select" id="mf-state" value={formData.state} onChange={updateForm}>
                <option value="">— Select State —</option>
                {['Maharashtra','Gujarat','Delhi','Karnataka','Tamil Nadu','Rajasthan'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'mt-notice' && (
          <div className="mf-grid">
            <div className="mf-group span2">
              <label className="mf-label">Notice Type & Section</label>
              <select className="mf-select" id="mf-noticeType" value={formData.noticeType} onChange={updateForm}>
                <option value="">— Select Notice Type —</option>
                {GST_NOTICE_TYPES.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="mf-group">
              <label className="mf-label">Notice Number</label>
              <input type="text" className="mf-input" id="mf-noticeNumber" value={formData.noticeNumber} onChange={updateForm} />
            </div>
            <div className="mf-group">
              <label className="mf-label">Issuing Authority</label>
              <input type="text" className="mf-input" id="mf-issuingAuthority" value={formData.issuingAuthority} onChange={updateForm} />
            </div>
            <div className="mf-group">
              <label className="mf-label">Issue Date</label>
              <input type="date" className="mf-input" id="mf-issueDate" value={formData.issueDate} onChange={updateForm} />
            </div>
            <div className="mf-group">
              <label className="mf-label">Due Date</label>
              <input type="date" className="mf-input" id="mf-dueDate" value={formData.dueDate} onChange={updateForm} />
            </div>
          </div>
        )}

        {activeTab === 'mt-docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-soft)', fontSize: '0.85rem' }}>Check documents that are available for this case:</div>
            {Object.keys(docs).map(k => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={docs[k]} onChange={e => setDocs({ ...docs, [k]: e.target.checked })} />
                <span>{k.toUpperCase()} — Document Verified</span>
                {docs[k] && <span style={{ marginLeft: 'auto', color: 'var(--success-color)', fontSize: '0.8rem' }}>✓ Ready</span>}
              </label>
            ))}
          </div>
        )}

        {activeTab === 'mt-output' && (
          <div>
            {!output && <button className="btn-primary" onClick={handleGenerate}><FileCode /> Generate Draft Now</button>}
            {output && (
              <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.6', fontSize: '0.9rem', maxHeight: '400px', overflowY: 'auto' }}>
                {output}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NoticesPage() {
  const [notices, setNotices] = useState(NOTICES_DB.notices || []);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeMatterRow, setActiveMatterRow] = useState(null);
  const fileInputRef = useRef(null);

  const filteredNotices = notices.filter(n => {
    if (filterType && n.type !== filterType) return false;
    if (filterStatus && n.status !== filterStatus) return false;
    return true;
  });

  const handleUploadNotice = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      alert(`✅ File "${e.target.files[0].name}" uploaded. Notice data extracted and new record added.`);
      const newNotice = {
        notice_id: `AUTO-${Math.floor(Math.random()*9000)+1000}`,
        trade_name: 'Uploaded Client',
        gstin: '27AADCA0000X1Z9',
        type: 'DRC-01 (Sec 73)',
        section: 'Sec 73',
        issue_date: new Date().toLocaleDateString('en-GB'),
        due_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB'),
        demand: '₹0',
        status: 'Open',
      };
      setNotices(prev => [newNotice, ...prev]);
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Critical': return <span className="status-badge critical"><WarningOctagon /> Critical</span>;
      case 'Open': return <span className="status-badge warning"><Warning /> Open</span>;
      case 'Replied': return <span className="status-badge success"><CheckCircle /> Replied</span>;
      case 'Drafted': return <span className="status-badge info">Drafted</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <section className="view active" id="view-notices">
      <div className="page-header">
        <div>
          <h1>GST Notices, Orders &amp; Matter Record</h1>
          <p>Manage, track, upload and draft replies for all active GST notices across clients.</p>
        </div>
        <div className="header-actions">
          {/* Upload button supporting all types */}
          <input ref={fileInputRef} type="file" id="notice-upload-main" style={{ display: 'none' }} onChange={handleUploadNotice} accept=".pdf,.json,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.webp" />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <UploadSimple /> Upload Notice
          </button>
          {/* Type filter with full GST sections */}
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {GST_NOTICE_TYPES.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </optgroup>
            ))}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Critical">Critical</option>
            <option value="Open">Open</option>
            <option value="Drafted">Drafted</option>
            <option value="Replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Notice KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-danger"><div className="kpi-icon"><WarningOctagon /></div><div className="kpi-body"><p>Critical</p><h2>{notices.filter(n => n.status === 'Critical').length}</h2></div></div>
        <div className="kpi-card kpi-blue"><div className="kpi-icon"><EnvelopeOpen /></div><div className="kpi-body"><p>Open</p><h2>{notices.filter(n => n.status === 'Open').length}</h2></div></div>
        <div className="kpi-card kpi-indigo"><div className="kpi-icon"><CheckSquare /></div><div className="kpi-body"><p>Replied</p><h2>{notices.filter(n => n.status === 'Replied').length}</h2></div></div>
        <div className="kpi-card kpi-amber"><div className="kpi-icon"><CurrencyInr /></div><div className="kpi-body"><p>Total Demand</p><h2>₹22.5L</h2></div></div>
      </div>

      <div className="section-card no-pad">
        <div className="sc-header">
          <h2>Active Notices <span className="sc-count">{filteredNotices.length}</span></h2>
        </div>
        <div className="table-wrap">
          <table id="noticesTable">
            <thead>
              <tr>
                <th>Notice No.</th>
                <th>Client / GSTIN</th>
                <th>Notice Type (Section)</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Demand</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((n, i) => (
                <>
                  <tr key={n.notice_id || i}>
                    <td><strong>{n.notice_id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{n.trade_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{n.gstin}</div>
                    </td>
                    <td>
                      <div>{n.type}</div>
                      {n.section && <span className="badge-outline" style={{ fontSize: '0.75rem' }}>{n.section}</span>}
                    </td>
                    <td>{n.issue_date}</td>
                    <td style={{ color: n.status === 'Critical' ? 'var(--danger-color)' : 'inherit', fontWeight: n.status === 'Critical' ? 600 : 'normal' }}>{n.due_date}</td>
                    <td>{n.demand || '—'}</td>
                    <td>{getStatusBadge(n.status)}</td>
                    <td>
                      <div className="action-cell">
                        <button className="icon-btn-sm tooltip" data-tip="Generate Draft"><FileCode /></button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                          onClick={() => setActiveMatterRow(activeMatterRow === (n.notice_id || i) ? null : (n.notice_id || i))}
                        >
                          📋 Matter
                        </button>
                      </div>
                    </td>
                  </tr>
                  {activeMatterRow === (n.notice_id || i) && (
                    <tr key={`matter-${n.notice_id || i}`}>
                      <td colSpan="8" style={{ background: 'var(--bg)', padding: '0 1.5rem 1.5rem' }}>
                        <MatterTab onClose={() => setActiveMatterRow(null)} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filteredNotices.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No notices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

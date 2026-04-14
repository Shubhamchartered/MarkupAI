"use client";

import { useState } from 'react';
import { FileText, CalendarBlank, DownloadSimple, PaperPlaneTilt, UploadSimple, X, CaretDown, FilePlus, Scales } from '@phosphor-icons/react';
import { NOTICES_DB } from '@/data/notices_data';

// ── Full GST Notice Categories (same as notices page) ──────────────────
const GST_NOTICE_TYPES = [
  { group: '1. Registration Notices', color: '#8B5CF6', items: [
    { value: 'REG-03 (Sec 25/Rule 9)', label: 'REG-03 — Registration Query (Sec 25 / Rule 9)', short: 'RegQuery' },
    { value: 'REG-17 (Rule 21/Sec 29)', label: 'REG-17 — Cancellation Proceedings (Rule 21 / Sec 29)', short: 'CancProceed' },
    { value: 'REG-19 (Rule 22)', label: 'REG-19 — Cancellation Order (Rule 22)', short: 'CancOrder' },
    { value: 'REG-21/REG-23 (Rule 23)', label: 'REG-21/23 — Revocation of Cancellation (Rule 23)', short: 'Revocation' },
    { value: 'Rule 10A', label: 'Bank Account Validation Notice (Rule 10A)', short: 'BankValidation' },
    { value: 'Rule 21A', label: 'GSTIN Suspension Notice (Rule 21A)', short: 'GSTINSuspend' },
  ]},
  { group: '2. Return Non-Filing & Compliance', color: '#F59E0B', items: [
    { value: 'GSTR-3A (Sec 46)', label: 'GSTR-3A — Non-Filing Notice (Sec 46)', short: 'NonFiling' },
    { value: 'Late Fee (Sec 47)', label: 'Late Fee Notice (Sec 47)', short: 'LateFee' },
  ]},
  { group: '3. Mismatch & Scrutiny', color: '#3B82F6', items: [
    { value: 'ASMT-10 (Sec 61/Rule 99)', label: 'ASMT-10 — Scrutiny Notice (Sec 61 / Rule 99)', short: 'Scrutiny' },
    { value: 'ASMT-11 Reply', label: 'ASMT-11 — Reply to Scrutiny', short: 'ScrutinyReply' },
  ]},
  { group: '4. Assessment Notices', color: '#06B6D4', items: [
    { value: 'ASMT-13 (Sec 62)', label: 'ASMT-13 — Best Judgment Assessment (Sec 62)', short: 'BestJudgment' },
    { value: 'ASMT-14 (Sec 63)', label: 'ASMT-14 — Unregistered Person (Sec 63)', short: 'UnregPerson' },
    { value: 'Sec 64', label: 'Summary Assessment (Sec 64)', short: 'SummaryAssmt' },
  ]},
  { group: '5. SCN / Demand (CRITICAL)', color: '#EF4444', items: [
    { value: 'DRC-01 (Sec 73)', label: 'DRC-01 — SCN Non-Fraud (Sec 73)', short: 'SCN_73' },
    { value: 'DRC-01 (Sec 74)', label: 'DRC-01 — SCN Fraud / Suppression (Sec 74)', short: 'SCN_74' },
    { value: 'DRC-06 Reply', label: 'DRC-06 — Reply to SCN (Sec 75)', short: 'DRC06Reply' },
    { value: 'DRC-07 (Sec 76)', label: 'DRC-07 — Demand Order (Sec 76)', short: 'DRC07' },
  ]},
  { group: '6. ITC Related', color: '#10B981', items: [
    { value: 'ITC Blocked (Sec 16)', label: 'ITC Blocked (Sec 16)', short: 'ITCBlocked' },
    { value: 'Excess ITC (Sec 17)', label: 'Excess ITC Claimed (Sec 17)', short: 'ExcessITC' },
    { value: 'ITC Restriction (Rule 36(4))', label: 'ITC Restriction (Rule 36(4))', short: 'ITCRestrict' },
  ]},
  { group: '7. Refund Notices', color: '#F97316', items: [
    { value: 'RFD-03 (Rule 90)', label: 'RFD-03 — Refund Deficiency (Rule 90)', short: 'RefundDefic' },
    { value: 'RFD-08 (Rule 92)', label: 'RFD-08 — Refund Rejection SCN (Rule 92)', short: 'RefundRejSCN' },
  ]},
  { group: '8. E-Way Bill / Movement', color: '#6366F1', items: [
    { value: 'MOV-07 (Sec 129)', label: 'MOV-07 — Detention of Goods (Sec 129)', short: 'Detention' },
    { value: 'MOV-09 (Sec 130)', label: 'MOV-09 — Confiscation Order (Sec 130)', short: 'Confiscation' },
  ]},
  { group: '9. Inspection / Enforcement', color: '#DC2626', items: [
    { value: 'Summons (Sec 70)', label: 'Summons (Sec 70)', short: 'Summons' },
    { value: 'Inspection (Sec 67)', label: 'Inspection / Search (Sec 67)', short: 'Inspection' },
    { value: 'Access Premises (Sec 71)', label: 'Access to Business Premises (Sec 71)', short: 'AccessPremise' },
  ]},
  { group: '10. Audit & Investigation', color: '#7C3AED', items: [
    { value: 'ADT-01 (Sec 65)', label: 'ADT-01 — Departmental Audit (Sec 65)', short: 'DeptAudit' },
    { value: 'Special Audit (Sec 66)', label: 'Special Audit (Sec 66)', short: 'SpecialAudit' },
  ]},
  { group: '11. Appeals & Litigation', color: '#0EA5E9', items: [
    { value: 'Appeal (Sec 107)', label: 'First Appeal (Sec 107)', short: 'FirstAppeal' },
    { value: 'Revision (Sec 108)', label: 'Revision Order (Sec 108)', short: 'Revision' },
    { value: 'Tribunal (Sec 112)', label: 'Appellate Tribunal (Sec 112)', short: 'Tribunal' },
  ]},
  { group: '12. Recovery Proceedings', color: '#B45309', items: [
    { value: 'DRC-13 (Sec 79)', label: 'DRC-13 — Bank Attachment (Sec 79)', short: 'BankAttach' },
    { value: 'DRC-16 (Sec 78)', label: 'DRC-16 — Property Attachment (Sec 78)', short: 'PropAttach' },
  ]},
];

// ── Template generator for 4 draft forms per notice type ──────────────────
function getDraftTemplates(noticeType) {
  const type = noticeType || 'Notice';
  return [
    {
      form: 'Form A — Formal Reply',
      description: 'Official departmental reply with supporting arguments and factual position.',
      content: `TO,
The Adjudicating Authority / Assessing Officer
GST Department

Sub: Reply to ${type} — Without Prejudice

Respected Sir / Ma'am,

We, the undersigned, submit this reply to the ${type} issued to our client. We respectfully state that the notice has been carefully examined and we submit the following factual and legal position:

1. FACTUAL BACKGROUND:
   The taxpayer has been regularly filing returns and discharging GST liability in accordance with applicable provisions.

2. LEGAL GROUNDS:
   The demand/query raised in the notice is disputed on the following grounds:
   (a) The transactions in question are fully supported by valid documents.
   (b) All applicable provisions have been duly complied with.

3. PRAYER:
   In view of the above facts and legal position, it is most respectfully prayed that the notice may be dropped and no demand be confirmed.

Respectfully submitted,
[Taxpayer Name]
[GSTIN]
[Date]`
    },
    {
      form: 'Form B — ITC Reconciliation Statement',
      description: 'Reconciliation of ITC claimed vs books of accounts with supporting schedules.',
      content: `ITC RECONCILIATION STATEMENT
For the Period: [Period From] to [Period To]

Taxpayer: [Client Name]
GSTIN: [GSTIN]
Notice Reference: ${type}

┌─────────────────────────────────────────────────────────────────────┐
│ Particulars              │ As per 2B (₹) │ As per 3B (₹) │ Diff (₹) │
├─────────────────────────────────────────────────────────────────────┤
│ IGST Input               │               │               │          │
│ CGST Input               │               │               │          │
│ SGST Input               │               │               │          │
│ Total ITC                │               │               │          │
└─────────────────────────────────────────────────────────────────────┘

Reasons for Difference:
1. Vendor invoices not reflecting in 2B due to delayed filing by vendor.
2. Pending credits under Section 16(4) being rectified.

Note: All supporting invoices, GSTR-2A/2B data available for verification.`
    },
    {
      form: 'Form C — Ground of Appeal / Objection',
      description: 'Grounds raised for first appeal or objection to the order.',
      content: `GROUNDS OF APPEAL / OBJECTION
In reply to: ${type}

GROUND 1 — ORDER BARRED BY LIMITATION:
The notice / order has been issued beyond the prescribed time limit under CGST Act, rendering it void ab initio.

GROUND 2 — PRINCIPLES OF NATURAL JUSTICE VIOLATED:
No adequate opportunity of hearing was provided to the appellant before passing the order. [Cite: SC ruling on natural justice]

GROUND 3 — DEMAND FACTUALLY INCORRECT:
The impugned demand is based on presumptions without considering documentary evidence. All invoices and payment records are available.

GROUND 4 — WRONG INTERPRETATION OF LAW:
The authority has erred in applying [relevant section], which is not applicable to the facts of the present case.

GROUND 5 — IDENTICAL JUDGMENTS IN FAVOR:
Several High Courts and GST Appellate Tribunals have ruled in favor of the taxpayer on identical facts. [Attach case law summary]

Prayer: Drop the demand and provide relief to the taxpayer.`
    },
    {
      form: 'Form D — Supporting Affidavit',
      description: 'Sworn affidavit supporting the taxpayer\'s reply with factual declarations.',
      content: `AFFIDAVIT

I, [Authorized Signatory Name], son/daughter of [Father's Name], aged [age], residing at [address], being the authorized signatory of [Firm Name] (GSTIN: [GSTIN]), do hereby solemnly affirm and declare as under:

1. That I am fully conversant with the facts and circumstances of the case.

2. That the reply submitted to the ${type} is true and correct to the best of my knowledge and belief.

3. That all documents and records annexed are true copies of the originals.

4. That no amount of GST has been evaded or suppressed willfully.

5. That we are ready to cooperate with the department for any further verification.

DEPONENT

Verified at [Place] on this [Date] day of [Month] [Year] that the contents of this affidavit are true and correct to the best of my knowledge and no part is false.

[Notary Seal & Signature]
[Authorized Signatory Signature & Stamp]`
    }
  ];
}

// ── Draft Card Component ──────────────────────────────────────────────
function DraftCard({ draft, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px',
      overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
    >
      {/* Header bar by category color */}
      <div style={{ height: '3px', background: draft.color || 'linear-gradient(90deg,#6366F1,#3B82F6)' }} />
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px', background: draft.color ? `${draft.color}20` : 'rgba(99,102,241,0.12)', color: draft.color || '#6366F1', border: `1px solid ${draft.color || '#6366F1'}33` }}>
                {draft.draft_type || 'Draft'}
              </span>
              <span className={`status-badge ${draft.status === 'Needs Review' ? 'warning' : 'success'}`}>{draft.status}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{draft.client_name}</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', color: 'var(--text-soft)', fontSize: '0.8rem' }}>
              <span>Ref: {draft.notice_ref}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CalendarBlank size={12} /> {draft.date_generated}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0, marginLeft: '1rem' }}>
            <button className="icon-btn-sm tooltip" data-tip="Download Word"><DownloadSimple /></button>
            <button className="icon-btn-sm tooltip" data-tip="Email to Client"><PaperPlaneTilt /></button>
            {onDelete && <button className="icon-btn-sm tooltip" data-tip="Delete" onClick={onDelete} style={{ color: 'var(--danger-color, #ef4444)' }}><X size={14} /></button>}
          </div>
        </div>

        {/* 4 forms section */}
        {draft.forms && (
          <div>
            <button onClick={() => setExpanded(!expanded)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.5rem 0.9rem', cursor: 'pointer', color: 'var(--text-soft)', fontSize: '0.82rem',
              width: '100%', justifyContent: 'center', transition: 'all 0.2s', marginTop: '0.5rem'
            }}>
              <FilePlus size={14} />
              {expanded ? 'Hide' : 'View'} 4 Draft Forms
              <CaretDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {expanded && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                {draft.forms.map((form, fi) => (
                  <div key={fi} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.7rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{form.form}</div>
                        <div style={{ color: 'var(--text-soft)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{form.description}</div>
                      </div>
                      <button className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', flexShrink: 0, marginLeft: '0.5rem' }}
                        onClick={() => { navigator.clipboard.writeText(form.content); alert(`${form.form} copied!`); }}>
                        Copy
                      </button>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text)', background: 'var(--bg)' }}>
                      {form.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!draft.forms && (
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', marginTop: '0.5rem' }}>
            <FileText size={14} /> Edit Draft
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Litigation Page ──────────────────────────────────────────────────
export default function LegalPage() {
  const [drafts, setDrafts] = useState((NOTICES_DB.drafts || []).map(d => ({ ...d })));
  const [selectedNoticeType, setSelectedNoticeType] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const handleUploadData = (e) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (!selectedNoticeType) { alert('Please select a notice type first, then upload.'); e.target.value = ''; return; }

    const group = GST_NOTICE_TYPES.find(g => g.items.some(i => i.value === selectedNoticeType));
    const item = GST_NOTICE_TYPES.flatMap(g => g.items).find(i => i.value === selectedNoticeType);

    const newDraft = {
      draft_id: `DRF-${Date.now()}`,
      draft_type: item?.label || selectedNoticeType,
      client_name: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Client',
      notice_ref: `${item?.short || 'NOTICE'}/AUTO/${new Date().getFullYear()}`,
      date_generated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Needs Review',
      color: group?.color,
      forms: getDraftTemplates(selectedNoticeType),
    };
    setDrafts(prev => [newDraft, ...prev]);
    e.target.value = '';
    alert(`✅ "${file.name}" processed! Draft generated under "${selectedNoticeType}" with 4 response forms.`);
  };

  const handleGenerateTemplate = () => {
    if (!selectedNoticeType) { alert('Please select a notice type first.'); return; }
    const group = GST_NOTICE_TYPES.find(g => g.items.some(i => i.value === selectedNoticeType));
    const item = GST_NOTICE_TYPES.flatMap(g => g.items).find(i => i.value === selectedNoticeType);

    const newDraft = {
      draft_id: `DRF-${Date.now()}`,
      draft_type: item?.label || selectedNoticeType,
      client_name: 'Template Draft',
      notice_ref: `${item?.short || 'NOTICE'}/TEMPLATE`,
      date_generated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Needs Review',
      color: group?.color,
      forms: getDraftTemplates(selectedNoticeType),
    };
    setDrafts(prev => [newDraft, ...prev]);
  };

  const deleteDraft = (id) => {
    if (confirm('Delete this draft?')) setDrafts(prev => prev.filter(d => d.draft_id !== id));
  };

  const allGroups = [...new Set(GST_NOTICE_TYPES.map(g => g.group))];

  return (
    <section className="view active" id="view-legal">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Scales size={28} /> Litigation Draft Centre</h1>
          <p>Select a notice type → upload document or generate template → get 4 ready-to-use draft forms.</p>
        </div>
        <div className="header-actions">
          <input type="file" id="legal-data-upload" style={{ display: 'none' }} onChange={handleUploadData} accept=".pdf,.json,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg" />
          <button className="btn-secondary" onClick={() => document.getElementById('legal-data-upload').click()}>
            <UploadSimple /> Upload Notice (All Types)
          </button>
          <button className="btn-primary" onClick={handleGenerateTemplate}>
            <FilePlus /> Generate Template
          </button>
        </div>
      </div>

      {/* Notice Type Selector Bar */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem',
        alignItems: 'flex-start', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: '1', minWidth: '260px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Select Notice Type &amp; Section
          </label>
          <select className="mf-select" value={selectedNoticeType} onChange={e => setSelectedNoticeType(e.target.value)} style={{ width: '100%' }}>
            <option value="">— Select Notice Type to Generate Draft —</option>
            {GST_NOTICE_TYPES.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Filter existing drafts by group */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Filter Saved Drafts
          </label>
          <select className="mf-select" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="">All Categories</option>
            {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {selectedNoticeType && (
          <div style={{ alignSelf: 'flex-end', padding: '0.55rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#6366F1', fontWeight: 600 }}>
            Selected: {selectedNoticeType}
          </div>
        )}
      </div>

      {/* Drafts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {drafts
          .filter(d => {
            if (!filterGroup) return true;
            const group = GST_NOTICE_TYPES.find(g => g.color === d.color || g.items.some(i => i.label === d.draft_type));
            return group?.group === filterGroup;
          })
          .map((d, i) => (
            <DraftCard key={d.draft_id || i} draft={d} onDelete={() => deleteDraft(d.draft_id)} />
          ))}

        {drafts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-soft)' }}>
            <Scales size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>No drafts yet</h3>
            <p style={{ marginTop: '0.5rem' }}>Select a notice type above and click "Generate Template" or upload a notice document.</p>
          </div>
        )}
      </div>
    </section>
  );
}

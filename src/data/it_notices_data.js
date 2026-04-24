/* ═══════════════════════════════════════════════════════════════
   it_notices_data.js — Income Tax Notice & Assessment Database
   Real notices come from:
     1. Manual upload via "Upload Notice" button
     2. Ymail auto-fetch (gandhisanjeev@ymail.com)
   No sample/fake data — only real notices will appear.
   ═══════════════════════════════════════════════════════════════ */

export const IT_NOTICE_TYPES = [
  { group: '1. Intimation & Processing', items: [
    { value: '143(1)', label: 'Sec 143(1) — Intimation after Processing' },
    { value: '143(1)(a)', label: 'Sec 143(1)(a) — Prima Facie Adjustment' },
    { value: '245', label: 'Sec 245 — Set-off of Refund against Demand' },
  ]},
  { group: '2. Scrutiny & Assessment', items: [
    { value: '143(2)', label: 'Sec 143(2) — Scrutiny Assessment Notice' },
    { value: '142(1)', label: 'Sec 142(1) — Inquiry / Information Notice' },
    { value: '144', label: 'Sec 144 — Best Judgment Assessment' },
    { value: '139(9)', label: 'Sec 139(9) — Defective Return Notice' },
  ]},
  { group: '3. Reassessment & Reopening', items: [
    { value: '148', label: 'Sec 148 — Income Escaping Assessment' },
    { value: '148A', label: 'Sec 148A — Pre-Issue Notice (New Regime)' },
    { value: '147', label: 'Sec 147 — Reassessment Proceedings' },
  ]},
  { group: '4. Information & Summons', items: [
    { value: '131', label: 'Sec 131 — Summons / Evidence Call' },
    { value: '133(6)', label: 'Sec 133(6) — Information from Third Parties' },
    { value: 'Faceless', label: 'Faceless Assessment Scheme Notice' },
  ]},
  { group: '5. Demand & Collection', items: [
    { value: '156', label: 'Sec 156 — Notice of Demand' },
    { value: '221', label: 'Sec 221 — Penalty for Default in Payment' },
    { value: '234E', label: 'Sec 234E — Fee for Late Filing of TDS Return' },
    { value: '201', label: 'Sec 201 — TDS Default Notice' },
  ]},
  { group: '6. Penalty Proceedings', items: [
    { value: '270A', label: 'Sec 270A — Penalty for Under-Reporting' },
    { value: '271', label: 'Sec 271(1)(c) — Concealment Penalty' },
    { value: '271B', label: 'Sec 271B — Penalty for Non-Audit' },
    { value: '273A', label: 'Sec 273A — Penalty Waiver Application' },
    { value: '273B', label: 'Sec 273B — Penalty Not Leviable (Reasonable Cause)' },
  ]},
  { group: '7. Rectification & Revision', items: [
    { value: '154', label: 'Sec 154 — Rectification of Mistake' },
    { value: '263', label: 'Sec 263 — Revision by CIT (Erroneous Order)' },
    { value: '264', label: 'Sec 264 — Revision by CIT (In Favour of Assessee)' },
  ]},
  { group: '8. Cross-Act Notices', items: [
    { value: 'FEMA', label: 'FEMA 1999 — Foreign Assets / LRS Violation' },
    { value: 'Benami', label: 'Benami Transactions Act — Property Notice' },
    { value: 'BlackMoney', label: 'Black Money Act 2015 — Undisclosed Foreign Assets' },
    { value: 'PMLA', label: 'PMLA 2002 — Suspicious Transaction' },
  ]},
];

/* All real notices come from uploads and Ymail fetch — no fake data */
export const IT_NOTICES_DB = {
  notices:     [],
  assessments: [],
  appeals:     [],
};

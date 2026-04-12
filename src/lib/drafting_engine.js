/* ═══════════════════════════════════════════════════════════════
   drafting_engine.js — GST Litigation Reply Drafting Engine
   Produces department-ready formal submissions only.
   RULES: No invented facts | Separate sections | Flag uncertainty
   ═══════════════════════════════════════════════════════════════ */

export const DraftingEngine = (function () {
  'use strict';

  /* ── Utility Formatters ────────────────────────────────────── */
  function fmtDate(d) {
    if (!d) return '[DATE PENDING]';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function fmtAmt(n) {
    if (!n && n !== 0) return '[AMOUNT PENDING]';
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }

  function fmtPeriod(from, to) {
    if (!from || !to) return '[PERIOD NOT SPECIFIED]';
    const f = new Date(from), t = new Date(to);
    const fy = (d) => `FY ${d.getFullYear()}-${String(d.getFullYear() + 1).slice(-2)}`;
    return `${fmtDate(from)} to ${fmtDate(to)} (${fy(f)})`;
  }

  function docStatus(docs, noticeId) {
    const nd = docs.filter(d => d.notice_id === noticeId);
    const available = nd.filter(d => d.status === 'available').map(d => d.type);
    const pending   = nd.filter(d => d.status === 'pending').map(d => d.type);
    return { available, pending };
  }

  /* ── Section Templates ─────────────────────────────────────── */

  /* SCN u/s 73 — ITC Discrepancy */
  function draftSCN73(n, docs) {
    const { available, pending } = docStatus(docs, n.notice_id);
    const pendingStr = pending.length
      ? pending.map(d => `\n        ${d} [DOCUMENT PENDING]`).join('')
      : '\n        Nil';

    return buildDraft(n, {
      strategy: 'ITC Reconciliation & Bona Fide Dispute Under Section 73',
      facts: `
1.1  The Assessee, M/s ${n.trade_name}, GSTIN ${n.gstin}, registered in the State of ${n.state}, is a duly registered taxpayer under the Central Goods and Services Tax Act, 2017 (hereinafter referred to as "the CGST Act") and the Maharashtra Goods and Services Tax Act, 2017 (hereinafter referred to as "the SGST Act").

1.2  The Assessee is engaged in the regular course of business and has been filing all applicable GST returns within the due dates prescribed under the Act, subject to any procedural delays for which appropriate explanation shall be provided.

1.3  The Department has issued a Show Cause Notice bearing Reference No. ${n.number} dated ${fmtDate(n.issue_date)} under Section 73 of the CGST Act, 2017 alleging discrepancy in Input Tax Credit (ITC) availed by the Assessee for the period ${fmtPeriod(n.period_from, n.period_to)}, involving a demand of ${fmtAmt(n.amount)} (Tax + Interest + Penalty, as applicable).

1.4  The Assessee has received the aforesaid Notice on ${fmtDate(n.issue_date)} and is filing this reply within the time limit stipulated, or as extended by competent authority.`,

      submissions: `
2.1  PRINCIPAL GROUND — LEGITIMATE AVAILMENT OF INPUT TAX CREDIT

     The Assessee states that all ITC availed during the period under consideration was in strict compliance with the conditions prescribed under Section 16 of the CGST Act, 2017. Specifically:

     (a)  The Assessee received tax invoices issued by registered suppliers complying with Section 31 of the CGST Act.
     (b)  The goods/services were received and used in the course or furtherance of business as mandated under Section 16(1).
     (c)  The tax charged on said supplies was duly paid to the Government by the respective suppliers, to the best of the Assessee's knowledge.
     (d)  The Assessee filed valid returns as required under Section 16(2)(d).

2.2  MISMATCH IN GSTR-2A / 2B — SYSTEMIC ISSUE, NOT SUBSTANTIVE DENIAL

     It is respectfully submitted that discrepancies between GSTR-3B and GSTR-2A/2B may arise due to:
     (a)  Delay in filing of GSTR-1 by suppliers;
     (b)  Amendments made by suppliers in subsequent periods;
     (c)  Technical errors in the GSTN portal;
     (d)  Timing differences in invoice reporting.

     [REQUIRES LEGAL VERIFICATION] Reference is drawn to the Hon'ble Supreme Court's directions in Union of India v. Filco Trade Centre Pvt. Ltd. (2022) and various High Court decisions holding that mere mismatch in GSTR-2A cannot be the sole ground to deny ITC where substantive conditions unter Section 16 are satisfied.

2.3  CIRCULAR / NOTIFICATION COMPLIANCE

     [REQUIRES LEGAL VERIFICATION] It is submitted that CBIC Circular No. 183/15/2022-GST dated 27.12.2022 provides guidance on ITC claims and the Assessee's conduct is consistent with said Circular.

2.4  MENS REA ABSENT — SECTION 73 NOT APPLICABLE TO GENUINE DISPUTES

     The Assessee categorically denies any deliberate intent to avail ineligible ITC. The present matter does not involve fraud, wilful misstatement, or suppression of facts, and accordingly penal provisions of Section 74 of the CGST Act are not attracted. Any demand, if at all sustainable, must be confined to Section 73 without penalty.`,

      reconciliation: `
3.1  The Assessee is in the process of compiling a detailed reconciliation statement comparing ITC as per GSTR-3B, GSTR-2A, and GSTR-2B for each month of the disputed period. The same shall be submitted as Annexure-A.

3.2  Documents submitted herewith:
${available.map(d => `     ✓  ${d}`).join('\n') || '     [ALL DOCUMENTS PENDING ATTACHMENT]'}

3.3  Documents to be submitted within [NUMBER] days:
${pendingStr}

3.4  RECONCILIATION SUMMARY (As Compiled):

     ┌─────────────────────────────────────────────────────────────────┐
     │  Period                : ${fmtPeriod(n.period_from, n.period_to).padEnd(42)}│
     │  ITC as per GSTR-3B    : [AMOUNT AS PER BOOKS — TO BE VERIFIED]  │
     │  ITC as per GSTR-2A/2B : [AMOUNT AS PER PORTAL — TO BE VERIFIED] │
     │  Difference Alleged    : ${fmtAmt(n.amount).padEnd(42)}│
     │  ITC Confirmed Eligible: [AMOUNT — DOCUMENT PENDING VERIFICATION]│
     │  ITC in Dispute        : [NET DIFFERENCE AFTER RECONCILIATION]    │
     └─────────────────────────────────────────────────────────────────┘`,

      prayer: `
In view of the above facts, submissions, and reconciliation, the Assessee most respectfully prays that your Honour / the Adjudicating Authority may be pleased to:

(a)  DROP the proceedings initiated vide SCN No. ${n.number} dated ${fmtDate(n.issue_date)} in its entirety, as the ITC availed was legitimate and in full compliance with Section 16 of the CGST Act, 2017;

(b)  In the alternative, if any marginal discrepancy is found upon reconciliation, RESTRICT the demand only to the unreconciled amount, without levy of penalty under Section 74 or interest beyond the period permissible under Section 50;

(c)  GRANT a personal hearing before passing any order, as provided under Section 75(4) of the CGST Act, 2017;

(d)  Pass such other order as deemed fit and proper in the interest of justice and good governance.

The Assessee undertakes to cooperate fully with any further inquiry and shall produce additional documents as and when directed.`,
    });
  }

  /* SCN u/s 74 — Fraud/Suppression */
  function draftSCN74(n, docs) {
    const { available, pending } = docStatus(docs, n.notice_id);
    return buildDraft(n, {
      strategy: 'Denial of Fraud Allegation & Grounds for Reduction to Section 73',
      facts: `
1.1  The Assessee, M/s ${n.trade_name}, GSTIN ${n.gstin}, State of ${n.state}, is a bonafide taxpayer registered under the CGST Act, 2017.

1.2  The Department has issued a Show Cause Notice bearing No. ${n.number} dated ${fmtDate(n.issue_date)} under Section 74(1) of the CGST Act, 2017, alleging suppression of taxable turnover and fraudulent availment of ITC during the period ${fmtPeriod(n.period_from, n.period_to)}, with a demand of ${fmtAmt(n.amount)} including 100% penalty.

1.3  The Assessee denies all allegations of fraud, suppression, or wilful misstatement in the strongest possible terms, reserves the right to challenge the jurisdictional validity of said notice, and files this reply without prejudice to all such rights.`,

      submissions: `
2.1  FRAUD AND SUPPRESSION NOT ESTABLISHED — SECTION 74 INVOCATION UNSUSTAINABLE

     [REQUIRES LEGAL VERIFICATION] It is a settled principle of law, affirmed by numerous High Courts and the Hon'ble Supreme Court, that invocation of Section 74 requires the Department to establish positive evidence of:
     (a)  Fraud, or
     (b)  Wilful misstatement, or
     (c)  Suppression of facts with intent to evade payment of tax.

     Mere arithmetical discrepancy or a difference in turnover figures does not, by itself, constitute "suppression" within the meaning of Section 74. Reference is invited to the Hon'ble Supreme Court's judgment in Pushpam Pharmaceuticals v. CCE (1995) 3 SCC 541 [REQUIRES LEGAL VERIFICATION — GST applicability to be confirmed].

2.2  ALL TRANSACTIONS REFLECTED IN BOOKS OF ACCOUNT

     The Assessee has maintained accurate Books of Account in accordance with the provisions of the Companies Act / Partnership Act as applicable, and all transactions subject to GST have been reflected therein. No income or receipts have been suppressed.

2.3  ALTERNATIVE PLEA — EXTENDED PERIOD NOT APPLICABLE

     [REQUIRES LEGAL VERIFICATION] Even if the Department's allegations are to be considered (which the Assessee categorically denies), the extended period of limitation of five years prescribed under Section 74 is inapplicable in the absence of evidence of fraud. The matter, if at all, falls within the four-year normal period under Section 73.

2.4  PENALTY NOT LEVIABLE IN ABSENCE OF FRAUD

     No penalty under Section 74(9) or (10) is leviable. The Assessee draws attention to the principle of mens rea in penalty proceedings.`,

      reconciliation: `
3.1  Reconciliation of turnover:

     ┌──────────────────────────────────────────────────────────────┐
     │  Turnover as per Books of Account : [DOCUMENT PENDING]       │
     │  Turnover as per GSTR-1           : [AS PER RETURNS FILED]   │
     │  Turnover as per GSTR-3B          : [AS PER RETURNS FILED]   │
     │  Alleged Suppression              : ${fmtAmt(n.amount).padEnd(30)}│
     │  Explanation for difference       : [RECONCILIATION PENDING]  │
     └──────────────────────────────────────────────────────────────┘

3.2  Documents available:
${available.map(d => `     ✓  ${d}`).join('\n') || '     Nil'}

3.3  Documents pending:
${pending.map(d => `     ○  ${d} [DOCUMENT PENDING]`).join('\n') || '     Nil'}`,

      prayer: `
The Assessee most humbly prays that the Adjudicating Authority may be pleased to:

(a)  DROP all proceedings under Section 74 of the CGST Act for want of evidence of fraud or suppression;

(b)  In the alternative, RE-CLASSIFY the proceedings under Section 73 of the CGST Act and re-quantify the demand, if any, accordingly, without penalty;

(c)  WAIVE penalty entirely in view of the bona fide nature of the transactions;

(d)  GRANT personal hearing under Section 75(4) before passing any adjudication order;

(e)  Pass such other appropriate orders as this Authority deems fit.`,
    });
  }

  /* ASMT-10 — Scrutiny of Returns */
  function draftASMT10(n, docs) {
    const { available, pending } = docStatus(docs, n.notice_id);
    return buildDraft(n, {
      strategy: 'Explanation of Return Discrepancy under Section 61 Scrutiny',
      facts: `
1.1  The Assessee, M/s ${n.trade_name}, GSTIN ${n.gstin}, has received Form ASMT-10 bearing Notice No. ${n.number} dated ${fmtDate(n.issue_date)} issued by the Proper Officer under Section 61 of the CGST Act, 2017, seeking explanation of discrepancies observed in the returns filed for the period ${fmtPeriod(n.period_from, n.period_to)}.

1.2  The alleged discrepancy involves a tax impact of ${fmtAmt(n.amount)}.

1.3  This reply is being filed in Form ASMT-11 in response to the aforesaid notice.`,

      submissions: `
2.1  NATURE OF DISCREPANCY IDENTIFIED BY DEPARTMENT

     The Assessee understands that the scrutiny pertains to a difference between:
     (a)  Outward supplies declared in GSTR-1 vis-à-vis GSTR-3B; OR
     (b)  ITC availed in GSTR-3B vis-à-vis GSTR-2B auto-populated data.

2.2  EXPLANATION FOR TURNOVER MISMATCH (if applicable)

     The difference in GSTR-1 vs GSTR-3B may be attributable to:
     (a)  Credit notes issued and reflected in GSTR-1 but not separately in GSTR-3B;
     (b)  Advances received adjusted against supplies in subsequent periods;
     (c)  Amendments to invoices filed in subsequent month's GSTR-1;
     (d)  B2C transactions consolidated differently across the two forms.

2.3  EXPLANATION FOR ITC MISMATCH (if applicable)

     [REQUIRES LEGAL VERIFICATION] Reliance is placed on the proviso to Section 38 and Rule 36(4) as applicable for the relevant period. The Assessee submits that ITC was availed only on invoices appearing in GSTR-2A/2B or on invoices where tax was verifiably paid by the supplier.

2.4  NO TAX LIABILITY ARISES

     Upon reconciliation, the Assessee submits that no additional tax liability arises beyond what has already been paid in the returns. The observed discrepancy is the result of timing differences and presentation differences between the two return forms.`,

      reconciliation: `
3.1  Month-wise reconciliation of GSTR-1 vs GSTR-3B turnover:

     ┌──────────────────────────────────────────────────────────────┐
     │  GSTR-1 Outward Supply  : [MONTH-WISE DATA PENDING]          │
     │  GSTR-3B Table 3.1      : [MONTH-WISE DATA PENDING]          │
     │  Net Difference         : [TO BE COMPUTED POST RECONCILIATION]│
     │  Reason for Difference  : Timing / Credit Notes / Amendments  │
     └──────────────────────────────────────────────────────────────┘

3.2  Documents submitted:
${available.map(d => `     ✓  ${d}`).join('\n') || '     Nil'}

3.3  Documents to follow: ${pendingStr}`,

      prayer: `
The Assessee prays that the Proper Officer may be pleased to:

(a)  ACCEPT this reply as satisfactory explanation of the discrepancy under Section 61(2) of the CGST Act, 2017 and DROP the scrutiny proceedings without issuance of a Show Cause Notice;

(b)  In case further clarifications are required, GRANT adequate time and an opportunity of being heard before any adverse action is taken;

(c)  CONFIRM that no additional tax, interest, or penalty is payable upon acceptance of the above reconciliation.`,
    });
  }

  /* ADT-02 — Audit */
  function draftADT02(n, docs) {
    const { available, pending } = docStatus(docs, n.notice_id);
    return buildDraft(n, {
      strategy: 'Cooperation with GST Audit and Preliminary Submissions',
      facts: `
1.1  The Assessee, M/s ${n.trade_name}, GSTIN ${n.gstin}, has received Form ADT-02 bearing Reference No. ${n.number} dated ${fmtDate(n.issue_date)} intimating commencement of GST Audit under Section 65 of the CGST Act, 2017 for the period ${fmtPeriod(n.period_from, n.period_to)}.

1.2  The tentative tax effect mentioned is ${fmtAmt(n.amount)}.

1.3  The Assessee welcomes this audit as an opportunity to demonstrate full compliance and transparency.`,

      submissions: `
2.1  COOPERATION AND PREPAREDNESS FOR AUDIT

     The Assessee undertakes to make available all books of account, records, invoices, returns, and other documents as required under Section 65(3) of the CGST Act within the time allowed by the Audit team.

2.2  PRELIMINARY SUBMISSION ON E-WAY BILL DISCREPANCY

     The discrepancy noted between output tax in GSTR-3B and e-way bill data may arise due to:
     (a)  E-way bills generated for stock transfers (not taxable supplies);
     (b)  E-way bills generated but transactions subsequently cancelled;
     (c)  E-way bills for job work transactions attracting NIL or exempt rate;
     (d)  E-way bills generated by recipients under Section 15.

     [REQUIRES LEGAL VERIFICATION] E-way bill data is not the determinative criterion for turnover under Section 2(112) of the CGST Act and must be corroborated with invoice data.

2.3  BOOKS OF ACCOUNT MAINTAINED PROPERLY

     The Assessee confirms maintenance of records under Rule 56 of the CGST Rules, 2017 including:
     (a)  Production/Inward Supply records, (b)  Stock records, (c)  ITC availed register, (d)  Output tax liability register.`,

      reconciliation: `
3.1  Preliminary reconciliation — Output Tax:

     ┌──────────────────────────────────────────────────────────────┐
     │  Output Tax per GSTR-3B   : [AS PER ANNUAL RETURNS]          │
     │  Output Tax per GSTR-9    : [AS PER GSTR-9 FILED]            │
     │  E-Way Bill Implied Tax   : [AS PER DEPARTMENT DATA]         │
     │  Difference               : ${fmtAmt(n.amount).padEnd(30)}│
     │  Explanation              : See Para 2.2 above                │
     └──────────────────────────────────────────────────────────────┘

3.2  Documents available for audit:
${available.map(d => `     ✓  ${d}`).join('\n') || '     Nil'}

3.3  Documents to be compiled: ${pendingStr}`,

      prayer: `
The Assessee humbly submits that:

(a)  This reply may be treated as preliminary submissions to maintain record;
(b)  The Audit be completed expeditiously in light of the documents to be produced;
(c)  Any objections raised during Audit be communicated in advance as per Rule 101(4) for issuance of Form GSTR-ADT-03;
(d)  No final audit report be issued without granting the Assessee an adequate opportunity to respond per Section 65(6) of the CGST Act.`,
    });
  }

  /* GSTR-3A — Non-filing Default Notice */
  function draftGSTR3A(n, docs) {
    return buildDraft(n, {
      strategy: 'Confirmation of Filing / Explanation for Late Filing',
      facts: `
1.1  The Registered Person, M/s ${n.trade_name}, GSTIN ${n.gstin}, has received Form GSTR-3A default notice bearing Ref. No. ${n.number} dated ${fmtDate(n.issue_date)} for non-filing of GSTR-3B for the period ${fmtPeriod(n.period_from, n.period_to)}.

1.2  This reply is being filed to address the said notice.`,

      submissions: `
2.1  STATUS OF RETURN FILING

     [Please select applicable option:]

     OPTION A — RETURN SUBSEQUENTLY FILED:
     The Assessee submits that GSTR-3B for the period ${fmtPeriod(n.period_from, n.period_to)} has since been filed with ARN: [ARN NUMBER — TO BE INSERTED] on [DATE OF FILING — TO BE INSERTED]. Late fee of ₹[AMOUNT] has been paid. The default notice may kindly be dropped.

     OPTION B — RETURN PENDING DUE TO HARDSHIP:
     The Assessee was unable to file the return for the following genuine reasons:
     [REASONS TO BE INSERTED — e.g., illness of proprietor, system/technical issues, etc.]
     The return shall be filed by [TARGET DATE] along with applicable late fees.

2.2  LATE FEE ALREADY PAID / WAIVER SOUGHT

     [REQUIRES LEGAL VERIFICATION] In case of genuine hardship, the Assessee may apply for waiver of late fees in terms of any applicable CBIC Notification / Circular.`,

      reconciliation: `
3.1  Return Filing Status:

     ┌──────────────────────────────────────────────────────────────┐
     │  Period          : ${fmtPeriod(n.period_from, n.period_to).padEnd(40)}│
     │  Return Type     : GSTR-3B                                   │
     │  Filing Status   : [FILED / PENDING — TO BE CONFIRMED]       │
     │  ARN             : [INSERT ARN]                              │
     │  Date of Filing  : [INSERT DATE]                             │
     │  Late Fee Paid   : [₹ AMOUNT]                                │
     └──────────────────────────────────────────────────────────────┘`,

      prayer: `
The Assessee prays that:

(a)  The default notice in Form GSTR-3A dated ${fmtDate(n.issue_date)} may be DROPPED upon confirmation of filing of GSTR-3B;
(b)  No assessment order under Section 62 may be passed in view of the return having been filed;
(c)  [REQUIRES LEGAL VERIFICATION] Late fee already paid may be noted and any excess demand be refunded.`,
    });
  }

  /* ── Master Draft Builder ──────────────────────────────────── */
  function buildDraft(n, parts) {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    return {
      notice_id: n.notice_id,
      strategy: parts.strategy,
      generated_on: today,
      content: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  MARKUP GST PRO — DRAFT REPLY
        [STRICTLY CONFIDENTIAL — FOR CA OFFICE USE ONLY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}

To,
The Proper Officer / Adjudicating Authority,
GST Department — ${n.state},
[OFFICE ADDRESS — TO BE FILLED]

Sub: Reply to ${n.type} / ${n.form} Notice No. ${n.number} dated ${fmtDate(n.issue_date)} — reg. GSTIN: ${n.gstin}

Sir / Madam,

With reference to the above-captioned notice issued under Section ${n.section} of the Central Goods and Services Tax Act, 2017 and the corresponding State GST Act, M/s ${n.trade_name} (hereinafter referred to as "the Assessee") respectfully submits this reply as follows:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION I — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.facts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION II — LEGAL SUBMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.submissions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION III — RECONCILIATION & DOCUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.reconciliation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION IV — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.prayer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thanking you and assuring full co-operation.

Yours faithfully,

_________________________________
For M/s ${n.trade_name}
GSTIN: ${n.gstin}

Authorised Signatory / Proprietor
[NAME & DESIGNATION]
[CONTACT: EMAIL / PHONE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER: This draft is generated by MARKUP GST Pro as a
starting template. All [DOCUMENT PENDING] and [REQUIRES LEGAL
VERIFICATION] markers must be resolved by the CA before filing.
Facts and law must be independently verified. This draft does
not constitute legal advice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim(),
    };
  }

  /* ── Public API ────────────────────────────────────────────── */
  return {
    generate(notice, documents) {
      switch (true) {
        case notice.type === 'SCN' && notice.section === '73':  return draftSCN73(notice, documents);
        case notice.type === 'SCN' && notice.section === '74':  return draftSCN74(notice, documents);
        case notice.type === 'ASMT-10':                         return draftASMT10(notice, documents);
        case notice.type === 'ADT-02':                          return draftADT02(notice, documents);
        case notice.type === 'GSTR-3A':                         return draftGSTR3A(notice, documents);
        default:
          return buildDraft(notice, {
            strategy: 'General Reply',
            facts: `\n1.1  Notice No. ${notice.number} dated ${fmtDate(notice.issue_date)} has been received and is under review.`,
            submissions: '\n2.1  [LEGAL SUBMISSIONS TO BE PREPARED — REQUIRES LEGAL VERIFICATION]',
            reconciliation: '\n3.1  [RECONCILIATION TO BE PREPARED — DOCUMENT PENDING]',
            prayer: '\n     [PRAYER TO BE DRAFTED]',
          });
      }
    },

    formatDate: fmtDate,
    formatAmount: fmtAmt,
    formatPeriod: fmtPeriod,
  };
})();

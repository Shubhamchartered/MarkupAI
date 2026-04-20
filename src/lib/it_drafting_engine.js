/* ═══════════════════════════════════════════════════════════════
   it_drafting_engine.js — Income Tax Litigation Reply Drafting
   Produces department-ready formal submissions for IT notices.
   Mirrors GST drafting_engine.js pattern for consistency.
   RULES: No invented facts | Separate sections | Flag uncertainty
   ═══════════════════════════════════════════════════════════════ */

export const ITDraftingEngine = (function () {
  'use strict';

  function fmtDate(d) {
    if (!d) return '[DATE PENDING]';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function fmtAmt(n) {
    if (!n && n !== 0) return '[AMOUNT PENDING]';
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 });
  }

  /* ── Template: 143(2) Scrutiny Reply ──────────────────────── */
  function draft143_2(n) {
    return buildDraft(n, {
      strategy: 'Compliance with Scrutiny and Demonstration of Full Disclosure',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, is a regular taxpayer and has filed income tax return for AY ${n.ay} within the due date prescribed under Section 139 of the Income Tax Act, 1961.

1.2  The Hon'ble Assessing Officer has issued Notice u/s 143(2) bearing Reference No. [NOTICE REF] dated ${fmtDate(n.dateIssued)}, selecting the return for scrutiny assessment.

1.3  The Assessee has noted the issues raised: ${n.issuesRaised || '[ISSUES TO BE SPECIFIED]'}

1.4  This reply is being filed in compliance with the said notice and in accordance with the principles of natural justice.`,

      submissions: `
2.1  FULL AND TRUE DISCLOSURE IN RETURN

     The Assessee submits that all income, deductions, and exemptions claimed in the return for AY ${n.ay} are true, correct, and verifiable from the books of account and supporting documents.

2.2  SPECIFIC RESPONSE TO ISSUES RAISED

     [REQUIRES CASE-SPECIFIC INPUT — Each issue raised in the notice must be addressed individually with supporting documents and legal provisions.]

     The Assessee respectfully submits that:
     (a) All sources of income have been duly disclosed;
     (b) Deductions claimed are in accordance with the provisions of Chapter VI-A;
     (c) Depreciation claimed is as per the rates prescribed in the Income Tax Rules;
     (d) All transactions are genuine, at arm's length, and supported by evidence.

2.3  BOOKS OF ACCOUNT PROPERLY MAINTAINED

     The Assessee maintains regular books of account as required under Section 44AA of the Act and the same are available for verification. Tax audit u/s 44AB has been conducted where applicable.

     [REQUIRES LEGAL VERIFICATION] The Assessee relies upon the principle laid down in CIT v. Orissa Corporation (P) Ltd (1986) 159 ITR 78 (SC) that additions cannot be made on presumptions where books are not rejected.`,

      prayer: `
In view of the above submissions, the Assessee respectfully prays that:

(a) The return filed for AY ${n.ay} may be ACCEPTED as filed, without any addition or disallowance;

(b) In the alternative, any proposed addition/disallowance be communicated to the Assessee with adequate time for response, in accordance with Section 142(3) and principles of natural justice;

(c) A personal hearing be granted before passing any assessment order, as mandated under Section 144B (Faceless Assessment Scheme);

(d) The assessment be completed within the time limit prescribed under Section 153.

The Assessee undertakes to produce all books of account and documents as may be required.`,
    });
  }

  /* ── Template: 148A Pre-Issue Notice Reply ────────────────── */
  function draft148A(n) {
    return buildDraft(n, {
      strategy: 'Challenge to Reopening — No Escapement of Income / Full Disclosure',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, has received notice u/s 148A(b) of the Income Tax Act, 1961 dated ${fmtDate(n.dateIssued)} for AY ${n.ay}.

1.2  The Assessee understands that the "information" relied upon by the AO pertains to: ${n.issuesRaised || '[INFORMATION TO BE SPECIFIED]'}

1.3  The Assessee had duly filed his/her return of income for AY ${n.ay} disclosing all material facts. The assessment was processed / completed u/s 143(1) / 143(3) [AS APPLICABLE].`,

      submissions: `
2.1  NO INCOME HAS ESCAPED ASSESSMENT

     The Assessee categorically submits that no income chargeable to tax has escaped assessment for AY ${n.ay}. All transactions referred to in the "information" were duly reflected in the return of income and the books of account.

2.2  FULL AND TRUE DISCLOSURE — BAR ON REOPENING

     [REQUIRES LEGAL VERIFICATION] It is a settled law following the Hon'ble Supreme Court's decision in CIT v. Kelvinator of India Ltd (2010) 320 ITR 561 that a concluded assessment cannot be reopened on the basis of change of opinion. The present notice amounts to a review of the original assessment, which is impermissible.

2.3  NO NEW TANGIBLE MATERIAL

     The "information" relied upon by the AO does not constitute new tangible material that was not available during the original assessment proceedings. The Assessee had disclosed all material facts fully and truly.

2.4  LIMITATION

     [REQUIRES LEGAL VERIFICATION] The Assessee reserves the right to challenge the validity of this notice on the ground of limitation under the amended provisions of Section 149, as interpreted by the Hon'ble Supreme Court in Rajeev Bansal v. Union of India (2024).`,

      prayer: `
In view of the above, the Assessee prays that:

(a) The inquiry u/s 148A(b) be DROPPED and no notice u/s 148 be issued;

(b) The order u/s 148A(d) record that income has not escaped assessment;

(c) The "information" being relied upon be disclosed in full to the Assessee for effective rebuttal;

(d) Principles of natural justice be followed and adequate time be given for response.`,
    });
  }

  /* ── Template: 139(9) Defective Return Reply ──────────────── */
  function draft139_9(n) {
    return buildDraft(n, {
      strategy: 'Rectification of Defects in Return',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, has received notice u/s 139(9) of the Income Tax Act, 1961 from CPC Bengaluru dated ${fmtDate(n.dateIssued)} for AY ${n.ay}, treating the return as defective.

1.2  The defects identified are: ${n.issuesRaised || '[DEFECTS TO BE SPECIFIED]'}`,

      submissions: `
2.1  RECTIFICATION OF DEFECTS

     The Assessee submits a revised/rectified return addressing all identified defects:
     [LIST EACH DEFECT AND CORRECTION — TO BE FILLED]

2.2  The requisite documents (audit report, balance sheet, P&L, etc.) are being uploaded along with this response through the e-filing portal.

2.3  The Assessee requests that upon rectification, the return be accepted as valid and not treated as invalid.`,

      prayer: `
The Assessee prays that:

(a) The defects noted be treated as rectified upon submission of this response;
(b) The return for AY ${n.ay} be processed u/s 143(1) in the normal course;
(c) No adverse inference be drawn from the procedural delay in rectification.`,
    });
  }

  /* ── Template: 270A Penalty Reply ─────────────────────────── */
  function draft270A(n) {
    return buildDraft(n, {
      strategy: 'Challenge to Penalty — Bona Fide Claim / No Misreporting',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, has received Show Cause Notice for penalty u/s 270A of the Income Tax Act, 1961 dated ${fmtDate(n.dateIssued)} for AY ${n.ay}.

1.2  The penalty proposed is ${fmtAmt(n.demandAmount)} on the ground of: ${n.issuesRaised || '[GROUNDS TO BE SPECIFIED]'}`,

      submissions: `
2.1  NO UNDER-REPORTING OR MISREPORTING

     The Assessee categorically denies any under-reporting or misreporting of income. The claim of deduction/exemption was based on a bona fide interpretation of law and supported by legal precedent.

2.2  IMMUNITY APPLICATION u/s 270AA

     [REQUIRES LEGAL VERIFICATION] Without prejudice to the above, the Assessee may apply for immunity from penalty u/s 270AA within 1 month of the penalty order, subject to payment of tax and interest on under-reported income without filing appeal.

2.3  BONA FIDE BELIEF

     [REQUIRES LEGAL VERIFICATION] Reliance is placed on CIT v. Reliance Petro Products (2010) 322 ITR 158 (SC) — making an incorrect claim in law does not amount to furnishing inaccurate particulars.

2.4  The Assessee had disclosed all primary facts in the return. Penalty cannot be imposed for a debatable legal issue.`,

      prayer: `
The Assessee prays that:

(a) Penalty proceedings u/s 270A be DROPPED as there is no under-reporting or misreporting;
(b) In the alternative, penalty be restricted to under-reporting (50%) and not misreporting (200%);
(c) Immunity u/s 270AA be granted if applicable;
(d) Adequate opportunity of being heard be provided before passing the penalty order.`,
    });
  }

  /* ── Template: 263 Revision Reply ─────────────────────────── */
  function draft263(n) {
    return buildDraft(n, {
      strategy: 'Challenge to Revision — Order Not Erroneous / Not Prejudicial',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, has received Show Cause Notice u/s 263 of the Income Tax Act from the Hon'ble Commissioner of Income Tax dated ${fmtDate(n.dateIssued)} for AY ${n.ay}.

1.2  The CIT proposes to revise the assessment order passed u/s 143(3) / 147 [AS APPLICABLE] on the ground that the order is "erroneous and prejudicial to the interests of revenue."

1.3  The specific issues for revision: ${n.issuesRaised || '[ISSUES TO BE SPECIFIED]'}`,

      submissions: `
2.1  TWIN CONDITIONS NOT SATISFIED

     [REQUIRES LEGAL VERIFICATION] For exercise of power u/s 263, twin conditions must co-exist: (a) the order must be erroneous, AND (b) it must be prejudicial to the interests of revenue. (Malabar Industrial Co Ltd v. CIT (2000) 243 ITR 83 SC).

2.2  AO TOOK A POSSIBLE VIEW

     The Assessing Officer, during the original assessment proceedings, had examined the issue and taken a legally permissible view. The CIT/PCIT cannot substitute his/her view merely because another view is possible. (CIT v. Max India Ltd (2007) 295 ITR 282 SC).

2.3  ADEQUATE INQUIRY WAS CONDUCTED

     The AO had called for and examined all relevant documents during assessment. Show cause notice was issued, books were produced, and detailed order was passed. This constitutes adequate inquiry.

2.4  NO PREJUDICE TO REVENUE

     Even if the CIT considers the order erroneous, there is no loss of revenue as the income in question was taxed in a different AY / the claim was legally allowable. The order is not prejudicial to revenue.`,

      prayer: `
The Assessee prays that:

(a) The revision proceedings u/s 263 be DROPPED as the twin conditions are not satisfied;
(b) The original assessment order be UPHELD as the AO took a possible and legally sustainable view;
(c) A personal hearing be granted before passing the revisionary order;
(d) If revision is considered necessary, fresh assessment be directed with specific directions, not a set-aside in general terms.`,
    });
  }

  /* ── Template: 156 Demand Notice Reply ────────────────────── */
  function draft156(n) {
    return buildDraft(n, {
      strategy: 'Rectification / Stay of Demand / Payment Plan',
      facts: `
1.1  The Assessee, ${n.taxpayer}, PAN: ${n.pan}, has received Notice of Demand u/s 156 for AY ${n.ay} dated ${fmtDate(n.dateIssued)} for an amount of ${fmtAmt(n.demandAmount)}.

1.2  The demand arises from: ${n.issuesRaised || '[BASIS OF DEMAND TO BE SPECIFIED]'}`,

      submissions: `
2.1  RECTIFICATION u/s 154

     [OPTION A] The Assessee submits that the demand is incorrect due to [arithmetical error / non-credit of TDS / prepaid taxes]. A rectification application u/s 154 is being filed separately.

2.2  STAY OF DEMAND

     [OPTION B] The Assessee has filed an appeal against the assessment order. Pending disposal of appeal, the Assessee requests stay of the outstanding demand as per CBDT Instruction No. 1914 dated 21.03.1996 and Office Memorandum F.No.404/72/93-ITCC dated 29.02.2016.

2.3  INSTALLMENT PAYMENT

     [OPTION C] If the demand is upheld, the Assessee requests permission to pay in [NUMBER] monthly installments due to financial hardship. [FINANCIAL DETAILS TO BE PROVIDED]`,

      prayer: `
The Assessee prays that:

(a) The demand be RECTIFIED if arising from an error apparent from the record;
(b) Stay of demand be GRANTED pending appeal;
(c) If demand is valid, installment facility be allowed;
(d) No coercive recovery action be taken during pendency of appeal / rectification.`,
    });
  }

  /* ── Master Draft Builder ──────────────────────────────────── */
  function buildDraft(n, parts) {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    return {
      noticeId: n.noticeId,
      strategy: parts.strategy,
      generatedOn: today,
      full: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAXGUARD AI — INCOME TAX DRAFT REPLY
      [STRICTLY CONFIDENTIAL — FOR CA OFFICE USE ONLY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}

To,
${n.aoName || '[NAME OF ASSESSING OFFICER]'},
${n.aoDesignation || '[DESIGNATION AND ADDRESS]'},
Income Tax Department,
[OFFICE ADDRESS — TO BE FILLED]

Sub: Reply to Notice u/s ${n.section} of the Income Tax Act, 1961
     for Assessment Year ${n.ay}
     PAN: ${n.pan}

Ref: Notice dated ${fmtDate(n.dateIssued)}

Respected Sir/Madam,

With reference to the above-captioned notice, ${n.taxpayer} (hereinafter referred to as "the Assessee") respectfully submits this reply as follows:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION I — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.facts}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION II — LEGAL SUBMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.submissions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION III — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${parts.prayer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thanking you and assuring full co-operation.

Yours faithfully,

_________________________________
For ${n.taxpayer}
PAN: ${n.pan}

Authorised Signatory / Assessee
[NAME & DESIGNATION]
[CONTACT: EMAIL / PHONE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISCLAIMER: This draft is generated by TaxGuard AI as a
starting template. All [DOCUMENT PENDING] and [REQUIRES LEGAL
VERIFICATION] markers must be resolved by the CA/Advocate
before filing. Facts and law must be independently verified.
This draft does not constitute legal advice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim(),
    };
  }

  /* ── Public API ────────────────────────────────────────────── */
  return {
    generate(notice) {
      const sec = (notice.section || '').replace(/\s/g, '');
      switch (true) {
        case sec === '143(2)':   return draft143_2(notice);
        case sec.startsWith('148A'): return draft148A(notice);
        case sec === '148':      return draft148A(notice);
        case sec === '139(9)':   return draft139_9(notice);
        case sec === '270A':     return draft270A(notice);
        case sec === '271':      return draft270A(notice);
        case sec === '263':      return draft263(notice);
        case sec === '156':      return draft156(notice);
        default:
          return buildDraft(notice, {
            strategy: 'General Reply to Notice u/s ' + sec,
            facts: `\n1.1  Notice dated ${fmtDate(notice.dateIssued)} for AY ${notice.ay} has been received and is under review.\n\n1.2  Issues raised: ${notice.issuesRaised || '[TO BE SPECIFIED]'}`,
            submissions: '\n2.1  [LEGAL SUBMISSIONS TO BE PREPARED — REQUIRES LEGAL VERIFICATION]\n\n2.2  The Assessee submits that all income has been duly disclosed and all claims are supported by law and evidence.',
            prayer: '\n     [PRAYER TO BE DRAFTED BASED ON SPECIFIC CASE FACTS]',
          });
      }
    },
    formatDate: fmtDate,
    formatAmount: fmtAmt,
  };
})();

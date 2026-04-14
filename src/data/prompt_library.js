// GST Notice Bot Prompt Library — v1.0
// Source: gst_notice_bot_prompt_library / India - CGST/SGST
// Auto-imported into Litigation Draft Centre

export const PROMPT_LIBRARY = {
  version: "1.0",
  jurisdiction: "India - CGST/SGST",

  global_controller: `You are a senior GST notice drafting expert assisting a Chartered Accountant firm in India. First identify the notice category, governing section, rule, form, and procedural stage. Then draft a formal, factual, evidence-based response suitable for GST portal filing and PDF attachment. Use placeholders where data is missing. Always write in formal Indian tax drafting language.`,

  global_rules: [
    "Use formal and respectful departmental tone",
    "Begin with subject and notice reference",
    "Mention GSTIN, legal name, notice number, DIN/ARN, date, tax period, jurisdiction",
    "Use the phrase: The Noticee respectfully submits as under",
    "Draft para-wise reply",
    "Separate facts, legal submissions, and prayer",
    "Add reconciliation tables wherever mismatch or demand is involved",
    "Do not invent payments, filings, or legal grounds",
    "Mention annexures clearly",
    "End with an appropriate prayer clause",
  ],

  common_fields: [
    { id: "gstin",                    label: "GSTIN",                           type: "text",     placeholder: "27AADCA1234F1Z9",       required: true  },
    { id: "legal_name",               label: "Legal Name",                      type: "text",     placeholder: "M/s ABC Traders Pvt Ltd", required: true  },
    { id: "trade_name",               label: "Trade Name",                      type: "text",     placeholder: "ABC Traders",            required: false },
    { id: "notice_reference_number",  label: "Notice Reference No.",            type: "text",     placeholder: "SCN/73/2025/MH/0042",    required: true  },
    { id: "din_arn_reference",        label: "DIN / ARN Reference",             type: "text",     placeholder: "DIN XXXXXXXX",           required: false },
    { id: "date_of_notice",           label: "Date of Notice",                  type: "date",     placeholder: "",                       required: true  },
    { id: "reply_due_date",           label: "Reply Due Date",                  type: "date",     placeholder: "",                       required: true  },
    { id: "tax_period",               label: "Tax Period",                      type: "text",     placeholder: "Apr 2023 – Mar 2024",    required: true  },
    { id: "financial_year",           label: "Financial Year",                  type: "text",     placeholder: "2023-24",                required: false },
    { id: "jurisdiction",             label: "Jurisdiction / Ward",             type: "text",     placeholder: "State Tax Officer, Ward-1, Pune", required: false },
    { id: "proper_officer_name",      label: "Proper Officer Name",             type: "text",     placeholder: "X, STO",                 required: false },
    { id: "department_allegation",    label: "Department Allegation Summary",   type: "textarea", placeholder: "Summarise what the notice alleges...", required: true  },
    { id: "tax_amount",               label: "Tax Amount Demanded (₹)",         type: "text",     placeholder: "0.00",                   required: false },
    { id: "interest_amount",          label: "Interest Amount (₹)",             type: "text",     placeholder: "0.00",                   required: false },
    { id: "penalty_amount",           label: "Penalty Amount (₹)",              type: "text",     placeholder: "0.00",                   required: false },
    { id: "late_fee_amount",          label: "Late Fee Amount (₹)",             type: "text",     placeholder: "0.00",                   required: false },
    { id: "refund_amount",            label: "Refund Amount Claimed (₹)",       type: "text",     placeholder: "0.00",                   required: false },
    { id: "client_explanation",       label: "Client Factual Explanation",      type: "textarea", placeholder: "What the client says happened...", required: false },
    { id: "returns_filed",            label: "Returns Already Filed",           type: "textarea", placeholder: "e.g. GSTR-3B filed for Apr-Jun 2023 on 15-Jul-2023", required: false },
    { id: "payment_made",             label: "Payment Already Made",            type: "textarea", placeholder: "Challan ref, date, amount...", required: false },
    { id: "documents_available",      label: "Supporting Documents Available",  type: "textarea", placeholder: "e.g. Purchase register, 2B, invoices...", required: false },
    { id: "hearing_date",             label: "Personal Hearing Date (if any)",  type: "date",     placeholder: "",                       required: false },
    { id: "relief_sought",            label: "Relief Sought",                   type: "textarea", placeholder: "e.g. Drop the notice, restore GSTIN, sanction refund...", required: false },
    { id: "special_instructions",     label: "Special Instructions to Drafter", type: "textarea", placeholder: "Any special tone, conditions, or emphasis...", required: false },
  ],

  categories: [
    {
      id: "registration_related",
      title: "Registration Related Notices",
      color: "#8B5CF6",
      risk: "medium",
      sections: "Sec 25/Rule 9/REG-03 · Sec 29/Rule 21/REG-17 · Rule 21A · Rule 10A · Rule 23/REG-21/23/24",
      dashboard_labels: ["Registration Query Pending", "Cancellation Notice", "GSTIN Suspended", "Revocation Required"],
      clarification_questions: [
        "Is the notice for fresh registration clarification, cancellation, suspension, bank validation, or revocation?",
        "What exact objections or reasons are mentioned in the notice?",
        "Is the GSTIN currently active, suspended, or cancelled?",
        "Have pending returns been filed? If yes, mention periods and dates.",
        "Have tax, interest, late fee, or penalty dues been paid? Share challan/reference details.",
        "What business proof documents are available?",
        "Was any personal hearing granted or fixed?",
      ],
      review_checklist: [
        "Correct stage identified: REG-03 / REG-17 / Suspension / REG-24",
        "Pending returns and dues position clearly stated",
        "No unnecessary admission of default",
        "Prayer properly asks for approval / restoration / revocation",
      ],
      draft_template: (d) => `TO,
The Proper Officer / Adjudicating Authority
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: Reply to GST Registration Notice — ${d.notice_reference_number || "[Notice Ref No.]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — Legal Name: ${d.legal_name || "[Legal Name]"}

REF: ${d.din_arn_reference || "[DIN/ARN if available]"}

Respected Sir / Ma'am,

The Noticee respectfully submits as under:

1. IDENTIFICATION & NOTICE DETAILS
   GSTIN              : ${d.gstin || "[GSTIN]"}
   Legal Name         : ${d.legal_name || "[Legal Name]"}
   Trade Name         : ${d.trade_name || "[Trade Name]"}
   Notice No.         : ${d.notice_reference_number || "[Notice Ref No.]"}
   Date of Notice     : ${d.date_of_notice || "[Date]"}
   Reply Due Date     : ${d.reply_due_date || "[Due Date]"}
   Tax Period         : ${d.tax_period || "[Tax Period]"}
   Financial Year     : ${d.financial_year || "[FY]"}

2. BACKGROUND & FACTUAL POSITION
   ${d.client_explanation || "[Provide factual background — how the business is operating, nature of trade, registration history, and reason for any lapse]"}

3. POINT-WISE REPLY TO NOTICE ALLEGATIONS
   Allegation as per Notice:
   "${d.department_allegation || "[Department allegation not provided]"}"

   Reply:
   The Noticee submits that the above allegation is not correct / has been duly rectified for the following reasons:
   (a) [State specific factual rebuttal to each allegation point]
   (b) [Reference compliance documents already submitted or enclosed]

4. COMPLIANCE STATUS
   Returns Filed      : ${d.returns_filed || "[Return filing status — periods, dates, ARNs]"}
   Taxes/Dues Paid    : ${d.payment_made || "[Challan details, reference numbers, dates, amounts]"}
   Pending Actions    : Nil / [List if any pending]

5. DOCUMENTS / ANNEXURES ENCLOSED
   Annexure A — Copy of registration certificate
   Annexure B — Bank account proof (for Rule 10A validation)
   Annexure C — Copy of filed returns (for pending return allegations)
   Annexure D — Proof of business premises / electricity bill
   Annexure E — Challans of tax / penalty / late fee paid
   ${d.documents_available ? "Additional documents: " + d.documents_available : "Annexure F — [Any other supporting documents]"}

6. LEGAL SUBMISSIONS
   (a) All conditions under Section 25 of the CGST Act and relevant rules have been / are being complied with.
   (b) The Noticee is a bonafide taxpayer with no intent to evade taxes.
   (c) Any inadvertent lapse has been duly rectified and taxes/fees paid.
   (d) The principles of natural justice require fair hearing before any adverse action.

7. PRAYER
   In light of the above facts, documents, and legal submissions, it is most respectfully prayed that:
   (i)   The notice / proceedings be treated as satisfied and dropped;
   (ii)  The GSTIN be restored / revocation be granted / registration be confirmed;
   (iii) Suitable relief as prayed be granted in the interest of justice.

   ${d.relief_sought ? "Additional Relief Sought: " + d.relief_sought : ""}
   ${d.special_instructions ? "Special Note: " + d.special_instructions : ""}

Thanking You,
Yours Faithfully,

[Authorized Signatory]
${d.legal_name || "[Legal Name]"}
GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Verify GSTIN current status on portal before filing
• Confirm all annexures are self-attested
• Check if personal hearing is scheduled — attend if yes
• Ensure DIN-stamped copy is saved after filing`,
    },

    {
      id: "return_non_filing",
      title: "Return Non-Filing & Compliance Notices",
      color: "#F59E0B",
      risk: "high",
      sections: "Sec 46 / Rule 68 / GSTR-3A · Section 47 — Late Fee",
      dashboard_labels: ["Return Filing Default", "3B Not Filed", "1 Not Filed"],
      clarification_questions: [
        "Which return is pending: GSTR-3B, GSTR-1, annual return, or final return?",
        "Has the return now been filed? If yes, on what date?",
        "Has tax, interest, and late fee been paid?",
        "What is the reason for delay or non-filing?",
        "Are portal screenshots or challans available?",
      ],
      review_checklist: [
        "Return type and period correctly mentioned",
        "Filing/payment status clearly stated",
        "Reason for delay framed carefully",
        "Closure prayer included",
      ],
      draft_template: (d) => `TO,
The Proper Officer
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: Reply to GSTR-3A Non-Filing Notice under Section 46 read with Rule 68 of CGST Act/Rules — Ref: ${d.notice_reference_number || "[Notice Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"}

Respected Sir / Ma'am,

The Noticee respectfully submits as under:

1. NOTICE DETAILS
   GSTIN              : ${d.gstin || "[GSTIN]"}
   Legal Name         : ${d.legal_name || "[Legal Name]"}
   Notice No.         : ${d.notice_reference_number || "[Notice Ref]"}
   Date of Notice     : ${d.date_of_notice || "[Date]"}
   Tax Period         : ${d.tax_period || "[Period]"}

2. FACTUAL BACKGROUND
   The Noticee acknowledges receipt of the notice issued under Section 46 citing non-filing / late filing of returns for the period ${d.tax_period || "[period]"}.
   ${d.client_explanation || "[Explain the genuine reason for delay — technical issues, illness, hardship, inadvertence, etc.]"}

3. CURRENT COMPLIANCE STATUS
   ┌──────────────────────────────────────────────────────────────┐
   │ Return   │ Period            │ Filed On          │ ARN/Ref  │
   ├──────────────────────────────────────────────────────────────┤
   │ GSTR-3B  │ ${(d.tax_period || "[Period]").padEnd(17)} │ ${d.returns_filed || "Filed / Pending".padEnd(17)} │ [ARN]    │
   │ GSTR-1   │ ${(d.tax_period || "[Period]").padEnd(17)} │ ${d.returns_filed || "Filed / Pending".padEnd(17)} │ [ARN]    │
   └──────────────────────────────────────────────────────────────┘

4. TAX, INTEREST, AND LATE FEE PAYMENT
   ${d.payment_made || "[Provide challan details — CPIN, date, amount paid for tax, interest, and late fee]"}
   ┌──────────────────────────────────────────────┐
   │ Component    │ Amount (₹)  │ Challan Ref      │
   ├──────────────────────────────────────────────┤
   │ Tax          │ ${(d.tax_amount || "[Amount]").padEnd(12)} │ [CPIN / Ref]     │
   │ Interest     │ ${(d.interest_amount || "[Amount]").padEnd(12)} │ [CPIN / Ref]     │
   │ Late Fee     │ ${(d.late_fee_amount || "[Amount]").padEnd(12)} │ [CPIN / Ref]     │
   └──────────────────────────────────────────────┘

5. REASONS FOR DELAY
   ${d.client_explanation || "[State specific genuine reason — portal issues, staff absence, technical error, banking delays, etc.]"}

6. ANNEXURES ENCLOSED
   Annexure A — Copy of filed return(s) with acknowledgement
   Annexure B — Tax/interest/late fee payment challans
   Annexure C — Portal screenshot of filing status
   ${d.documents_available ? "Other: " + d.documents_available : ""}

7. PRAYER
   In light of the above, it is respectfully prayed that:
   (i)   The present notice be treated as complied with and marked Closed on the GST portal;
   (ii)  No further adverse action be taken as the default has been rectified;
   (iii) Any late fee already paid be accepted in full settlement.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Confirm return ARNs before filing reply
• Attach all challans as self-attested copies
• File reply before due date to avoid ex-parte proceedings`,
    },

    {
      id: "scrutiny_mismatch",
      title: "Mismatch & Scrutiny Notices",
      color: "#3B82F6",
      risk: "high",
      sections: "Sec 61 / Rule 99 / ASMT-10 / ASMT-11 / ASMT-12",
      dashboard_labels: ["Scrutiny Notice", "ITC Mismatch Notice", "Turnover Mismatch"],
      clarification_questions: [
        "Is the issue turnover mismatch, ITC mismatch, short payment, or other discrepancy?",
        "What figures are shown by the department vs books/returns?",
        "Has any amount already been paid through DRC-03?",
        "Are reconciliation workings available?",
        "Are purchase register, sales register, 2B, and return extracts available?",
      ],
      review_checklist: [
        "ASMT-11 style preserved",
        "Each discrepancy answered point-by-point",
        "Reconciliation table included",
        "Prayer asks for closure in ASMT-12",
      ],
      draft_template: (d) => `TO,
The Proper Officer
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: ASMT-11 Reply to Scrutiny Notice (ASMT-10) under Section 61 read with Rule 99 of CGST Act/Rules — Ref: ${d.notice_reference_number || "[Notice Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — Period: ${d.tax_period || "[Period]"}

Respected Sir / Ma'am,

The Noticee respectfully submits this reply in Form ASMT-11 to the scrutiny notice issued in Form ASMT-10 under Section 61 of the CGST Act, 2017:

1. NOTICE DETAILS
   GSTIN              : ${d.gstin || "[GSTIN]"}
   Legal Name         : ${d.legal_name || "[Legal Name]"}
   Notice No. (ASMT-10) : ${d.notice_reference_number || "[Ref]"}
   Date of Notice     : ${d.date_of_notice || "[Date]"}
   Tax Period         : ${d.tax_period || "[Period]"}
   Discrepancies Alleged: ${d.department_allegation || "[As per notice]"}

2. RECONCILIATION STATEMENT — TURNOVER / TAX / ITC COMPARISON
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ Particulars          │ Dept Figures (₹) │ Assessee Figures (₹) │ Diff  │
   ├─────────────────────────────────────────────────────────────────────────┤
   │ Turnover (GSTR-1)    │ [Dept Amount]    │ [Books/Return]       │ [Diff]│
   │ Turnover (GSTR-3B)   │ [Dept Amount]    │ [Books/Return]       │ [Diff]│
   │ ITC as per 2B        │ [Dept Amount]    │ [Books/Return]       │ [Diff]│
   │ ITC Claimed in 3B    │ [Dept Amount]    │ [Books/Return]       │ [Diff]│
   │ Tax Paid             │ ${(d.tax_amount || "[Amount]").padEnd(16)}│ [As per Challan]     │ [Diff]│
   └─────────────────────────────────────────────────────────────────────────┘

3. POINT-WISE REPLY TO DISCREPANCIES
   3.1 Re: Turnover Mismatch (if applicable):
       The difference in turnover figures arises due to: [Explain — debit notes, credit notes, advances, amendments not reflected correctly, timing differences, etc.]

   3.2 Re: ITC Mismatch (if applicable):
       The ITC claimed in GSTR-3B differs from GSTR-2B due to: [Explain — vendor filing delay, IGST/CGST+SGST head mismatch, transitional credits, ineligible credits already reversed, etc.]

   3.3 Re: Other Discrepancies:
       ${d.client_explanation || "[Explain each allegation from the notice point by point. Do not admit to any unverified discrepancy.]"}

4. PAYMENTS ALREADY MADE (DRC-03 if any)
   ${d.payment_made || "[If any amount has been paid voluntarily through DRC-03, mention challan number, date, and amount here]"}

5. DOCUMENTS / ANNEXURES ENCLOSED
   Annexure A — GSTR-1 and GSTR-3B extracts for disputed period
   Annexure B — GSTR-2A / 2B reconciliation workings
   Annexure C — Sales register and purchase register extracts
   Annexure D — DRC-03 challan (if payment already made)
   ${d.documents_available ? "Other: " + d.documents_available : "Annexure E — [Enter relevant documents]"}

6. PRAYER
   In light of the above explanation, reconciliation, and supporting documents, it is most respectfully prayed that:
   (i)   The explanation submitted herein be accepted;
   (ii)  Proceedings be closed by issuance of Form ASMT-12;
   (iii) No demand be raised for differences explained herein.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Upload ASMT-11 reply form on GST portal before due date
• Ensure reconciliation table figures match portal data
• Retain signed physical copy with stamp for records`,
    },

    {
      id: "demand_show_cause",
      title: "Demand & Show Cause Notices — SCN (CRITICAL)",
      color: "#EF4444",
      risk: "critical",
      sections: "Sec 73 / Sec 74 / Sec 75 / Sec 76 / Rule 142 / DRC-01 / DRC-06 / DRC-07",
      dashboard_labels: ["SCN – Non Fraud", "SCN – Fraud", "Demand Order", "Reply Pending"],
      clarification_questions: [
        "Is the notice under Section 73 (non-fraud), 74 (fraud/suppression), 75, or 76?",
        "Has summary been uploaded in DRC-01A/DRC-02?",
        "Has any amount already been paid through DRC-03?",
        "Is personal hearing fixed? If yes, date?",
        "Which allegations are admitted, disputed, or already complied with?",
      ],
      review_checklist: [
        "DRC-06 style reply preserved",
        "Demand breakup addressed fully",
        "Section 74 fraud/suppression wording handled with extreme caution",
        "Prayer and optional hearing request properly included",
      ],
      draft_template: (d) => `TO,
The Adjudicating Authority / Proper Officer
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: DRC-06 Reply to Show Cause Notice — ${d.notice_reference_number || "[SCN Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — Period: ${d.tax_period || "[Period]"}

DIN / ARN Reference: ${d.din_arn_reference || "[DIN/ARN if available]"}

Respected Sir / Ma'am,

The Noticee respectfully submits this reply without prejudice to any other rights, remedies, and objections available at law:

1. NOTICE & PARTY DETAILS
   GSTIN              : ${d.gstin || "[GSTIN]"}
   Legal Name         : ${d.legal_name || "[Legal Name]"}
   Trade Name         : ${d.trade_name || "[Trade Name]"}
   Notice No.         : ${d.notice_reference_number || "[SCN Ref]"}
   DIN Reference      : ${d.din_arn_reference || "[DIN]"}
   Date of Notice     : ${d.date_of_notice || "[Date]"}
   Reply Due Date     : ${d.reply_due_date || "[Due Date]"}
   Tax Period         : ${d.tax_period || "[Period]"}
   Financial Year     : ${d.financial_year || "[FY]"}

2. DEMAND BREAKUP (AS PER NOTICE)
   ┌───────────────────────────────────────────────────┐
   │ Component         │ Amount as per Notice (₹)       │
   ├───────────────────────────────────────────────────┤
   │ Tax — IGST        │ [Amount]                       │
   │ Tax — CGST        │ [Amount]                       │
   │ Tax — SGST        │ [Amount]                       │
   │ Total Tax         │ ${(d.tax_amount || "[Amount]").padEnd(30)}│
   │ Interest          │ ${(d.interest_amount || "[Amount]").padEnd(30)}│
   │ Penalty           │ ${(d.penalty_amount || "[Amount]").padEnd(30)}│
   │ Grand Total       │ [Total Amount]                 │
   └───────────────────────────────────────────────────┘

3. GROUNDS OF THE NOTICE / ALLEGATIONS
   "${d.department_allegation || "[State the specific allegations from the notice]"}"

4. PARA-WISE REBUTTAL & FACTUAL SUBMISSIONS

   4.1 Re: Alleged [First Allegation]:
       The allegation is disputed / is factually incorrect for the following reasons:
       ${d.client_explanation || "[Provide specific factual explanation with reference to documents]"}

   4.2 Re: Tax Demand:
       The Noticee disputes the tax demand of ₹${d.tax_amount || "[Amount]"} on the following grounds:
       (a) The transactions in question are covered by [applicable exemption / lower rate / reverse charge];
       (b) Applicable tax has already been discharged as per return data available on GSTN portal;
       (c) [Any other specific rebuttal to the demand.]

   4.3 Re: Interest and Penalty:
       Without prejudice to the above dispute, it is submitted that —
       (a) Interest under Section 50 is not applicable as [no delay / delay was in bona fide circumstances / no tax was evaded];
       (b) Penalty under [applicable section] is not attracted as [no fraud / suppression / misstatement is alleged/established].

5. PAYMENT ALREADY MADE (DRC-03)
   ${d.payment_made || "[If any amount paid voluntarily — DRC-03 ARN, date, IGST/CGST/SGST breakup]"}
   ┌──────────────────────────────────────────────┐
   │ DRC-03 ARN   │         │ Amount (₹) │        │
   │ Date Paid    │         │ Tax Period │        │
   └──────────────────────────────────────────────┘

6. DOCUMENTS / ANNEXURES ENCLOSED
   Annexure A — GSTR-1, GSTR-3B extracts for disputed period(s)
   Annexure B — Purchase/sales register
   Annexure C — Invoices supporting the correct tax position
   Annexure D — DRC-03 payment challans (if any)
   Annexure E — Bank statements / e-way bills where relevant
   ${d.documents_available ? "Additional: " + d.documents_available : "Annexure F — [Any other document supporting the Noticee's position]"}

7. PRAYER
   In light of the above factual and legal submissions, it is most respectfully prayed that:
   (i)   The Show Cause Notice be dropped in its entirety;
   (ii)  No demand for tax, interest, or penalty be confirmed against the Noticee;
   (iii) A personal hearing be granted before any adverse order is passed, if deemed necessary;
   (iv)  The proceedings be disposed of on the basis of submissions made herein.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}
   ${d.special_instructions ? "\nSpecial Note to Authority: " + d.special_instructions : ""}

Yours Faithfully,
[Authorized Signatory]
${d.legal_name || "[Legal Name]"}
GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
⚠ CRITICAL NOTICE — Handle with highest caution
• If Section 74 (fraud), avoid any admission; consult senior counsel
• File reply in DRC-06 on the portal on or before due date
• Attach DRC-03 challan if voluntary payment is being made
• Attend personal hearing personally or through AR
• Preserve all original documents in case of further proceedings`,
    },

    {
      id: "itc_related",
      title: "Input Tax Credit Notices",
      color: "#10B981",
      risk: "high",
      sections: "Sec 16 / Sec 17 / Rule 36(4) / Linked DRC proceedings",
      dashboard_labels: ["ITC Blocked", "Excess ITC Claimed", "ITC Reversal Required"],
      clarification_questions: [
        "Is the issue eligibility, blocked credit, mismatch, excess claim, or non-reversal?",
        "Do invoice-wise or supplier-wise workings exist?",
        "What is the exact 2B vs books vs 3B difference?",
        "Has any reversal/DRC-03 payment already been made?",
        "Are vendor GST compliance confirmations available?",
      ],
      review_checklist: [
        "ITC eligibility conditions under Section 16(2) addressed",
        "Invoice / supplier-wise reconciliation table included",
        "Reversal / reclaim treatment clearly explained",
        "Annexures support each major ITC claim",
      ],
      draft_template: (d) => `TO,
The Proper Officer
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: Reply to ITC-Related Notice — ${d.notice_reference_number || "[Notice Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — Period: ${d.tax_period || "[Period]"}

Respected Sir / Ma'am,

The Noticee respectfully submits as under in reply to the notice concerning Input Tax Credit:

1. NOTICE DETAILS
   GSTIN       : ${d.gstin || "[GSTIN]"} | Period: ${d.tax_period || "[Period]"}
   Notice No.  : ${d.notice_reference_number || "[Ref]"} | Date: ${d.date_of_notice || "[Date]"}
   Allegation  : ${d.department_allegation || "[ITC issue as stated in notice]"}

2. ITC RECONCILIATION TABLE
   ┌───────────────────────────────────────────────────────────────────────────┐
   │ Particulars              │ As per 2B (₹)  │ As per 3B (₹)  │ Diff (₹)  │
   ├───────────────────────────────────────────────────────────────────────────┤
   │ IGST Input               │ [Amount]        │ [Amount]        │ [Amount]  │
   │ CGST Input               │ [Amount]        │ [Amount]        │ [Amount]  │
   │ SGST Input               │ [Amount]        │ [Amount]        │ [Amount]  │
   │ Total ITC                │ [Total]         │ [Total]         │ [Total]   │
   │ Already Reversed         │ [Amount]        │ [Amount]        │ —         │
   │ Net ITC Claimed          │ —               │ [Net Amount]    │ —         │
   └───────────────────────────────────────────────────────────────────────────┘

3. LEGAL SUBMISSIONS
   3.1 Eligibility under Section 16:
       All conditions under Section 16(2)(a) to (d) of the CGST Act are duly satisfied — i.e., (a) tax invoice received; (b) goods/services received; (c) tax has been paid to the Government by the supplier; (d) return has been furnished.

   3.2 Reason for Mismatch (if any):
       ${d.client_explanation || "[Explain vendor filing delay, IGST vs CGST misalignment, timing differences, or other reconciling items]"}

   3.3 Reversals already made:
       ${d.payment_made || "[If ITC has been reversed through GSTR-3B or DRC-03, mention specific details]"}

4. ANNEXURES ENCLOSED
   Annexure A — GSTR-2A / 2B for disputed period
   Annexure B — Purchase register with supplier-wise ITC details
   Annexure C — Copy of relevant invoices
   Annexure D — DRC-03 reversal details (if applicable)
   ${d.documents_available ? "Other: " + d.documents_available : ""}

5. PRAYER
   (i)   The eligible ITC as per books and reconciliation be allowed in full;
   (ii)  The excess demand, if any, for denied/blocked ITC be dropped;
   (iii) The notice be disposed of accepting the submissions made herein.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Cross-check 2B vs books vs 3B figures before finalising reply
• If vendor GSTIN is cancelled, this needs careful handling`,
    },

    {
      id: "refund_related",
      title: "Refund Related Notices",
      color: "#F97316",
      risk: "medium",
      sections: "Sec 54 / Rule 90 / RFD-03 / Rule 92 / RFD-08 / RFD-06",
      dashboard_labels: ["Refund Deficiency", "Refund Rejection SCN", "Refund Pending Clarification"],
      clarification_questions: [
        "What is the refund category? (Export / Inverted duty / Excess cash / UN body etc.)",
        "What exact deficiency or rejection ground is mentioned in the notice?",
        "What is the ARN and total amount claimed?",
        "Are computation sheets and supporting export/invoice documents available?",
      ],
      review_checklist: [
        "Refund category clearly identified",
        "Each deficiency ground answered one by one",
        "Refund computation table included",
        "Sanction prayer clearly framed",
      ],
      draft_template: (d) => `TO,
The Proper Officer (Refunds)
${d.jurisdiction || "[GST Ward / Jurisdiction]"}

SUB: Reply to GST Refund Deficiency/Rejection Notice — ${d.notice_reference_number || "[RFD-03/RFD-08 Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — ARN: ${d.din_arn_reference || "[ARN]"}

Respected Sir / Ma'am,

The Noticee respectfully submits as under:

1. REFUND APPLICATION DETAILS
   GSTIN           : ${d.gstin || "[GSTIN]"}
   Legal Name      : ${d.legal_name || "[Legal Name]"}
   ARN             : ${d.din_arn_reference || "[ARN]"}
   Amount Claimed  : ₹${d.refund_amount || "[Amount]"}
   Refund Category : [Export with payment of tax / Inverted duty / Excess cash balance / Other]
   Tax Period      : ${d.tax_period || "[Period]"}
   Notice Ref      : ${d.notice_reference_number || "[Ref]"}
   Date of Notice  : ${d.date_of_notice || "[Date]"}

2. DEFICIENCY / REJECTION GROUNDS AS PER NOTICE
   "${d.department_allegation || "[Paste the deficiency/rejection grounds from the notice]"}"

3. POINT-WISE CLARIFICATIONS
   3.1 Re: Ground 1 — [First deficiency ground]:
       ${d.client_explanation || "[Specific factual and documentary response to this ground]"}

   3.2 Re: Ground 2 — [Second deficiency ground]:
       [Response to second ground]

   3.3 Re: Ground 3 — [If any]:
       [Response]

4. REFUND COMPUTATION
   ┌──────────────────────────────────────────────────────────────┐
   │ Particulars              │ Amount (₹)    │ Reference          │
   ├──────────────────────────────────────────────────────────────┤
   │ Total Refund Claimed     │ ${(d.refund_amount || "[Amount]").padEnd(13)} │ ARN: [ARN]         │
   │ Already Sanctioned       │ Nil           │ —                  │
   │ Balance Refund Due       │ ${(d.refund_amount || "[Amount]").padEnd(13)} │ —                  │
   └──────────────────────────────────────────────────────────────┘

5. ANNEXURES ENCLOSED
   Annexure A — Copy of refund application with ARN
   Annexure B — GSTR-1, GSTR-3B data for refund period
   Annexure C — Export invoices / shipping bills (for export refunds)
   Annexure D — GSTR-2B showing input tax details (for inverted duty)
   ${d.documents_available ? "Other: " + d.documents_available : "Annexure E — [Other supporting documents]"}

6. PRAYER
   (i)   The deficiencies / grounds of rejection be treated as satisfactorily clarified;
   (ii)  The refund of ₹${d.refund_amount || "[Amount]"} be sanctioned in Form RFD-06 at the earliest;
   (iii) No further deficiencies be raised on grounds already addressed.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Time limit for refund sanction is 60 days from filing — track portal
• Ensure all ICEGATE/FIRC documents are attached for export refunds`,
    },

    {
      id: "ewaybill_movement",
      title: "E-Way Bill / Goods Movement Notices",
      color: "#6366F1",
      risk: "critical",
      sections: "Sec 129 (Detention) / Sec 130 (Confiscation) / MOV-07 / MOV-09",
      dashboard_labels: ["E-way Bill Detention", "Goods Seized"],
      clarification_questions: [
        "Vehicle no., invoice no., e-way bill no., and goods description?",
        "Was there a clerical or technical lapse (expired e-way bill, wrong address, etc.)?",
        "Was any tax/penalty paid under protest? Provide challan details.",
        "Are transport documents, invoice copies, and e-way bill records available?",
      ],
      review_checklist: [
        "Movement facts and documents narrated clearly",
        "Absence of intent to evade tax strongly emphasised",
        "Urgent release prayer prominently placed",
      ],
      draft_template: (d) => `TO,
The Proper Officer (Enforcement / Mobile Squad)
${d.jurisdiction || "[GST Enforcement Ward / Jurisdiction]"}

SUB: Objection / Reply to Detention / Seizure Notice — ${d.notice_reference_number || "[MOV-07/MOV-09 Ref]"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"} — Vehicle: [Vehicle No.]

Respected Sir / Ma'am,

The Noticee submits this urgent objection and reply to the detention/seizure proceedings:

1. NOTICE & MOVEMENT DETAILS
   GSTIN          : ${d.gstin || "[GSTIN]"}
   Legal Name     : ${d.legal_name || "[Legal Name]"}
   Notice No.     : ${d.notice_reference_number || "[MOV-07/09 Ref]"}
   Date           : ${d.date_of_notice || "[Date]"}
   Vehicle No.    : [Vehicle Registration Number]
   Driver Details : [Driver Name, License No.]
   Invoice No.    : [Invoice Number and Date]
   E-Way Bill No. : [EWB Number]
   Goods Desc.    : [Nature and Quantity of Goods]
   Taxable Value  : ₹[Amount]

2. FACTS OF MOVEMENT
   The goods were being transported from [Origin] to [Destination] for bona fide commercial purposes. All applicable documents were in order at the time of dispatch. ${d.client_explanation || "[Describe the movement and what happened — whether e-way bill was expired, address mismatch, transporter error, etc.]"}

3. NATURE OF LAPSE (if any)
   The only lapse, if any, was as follows: [Describe technical/clerical error — expired EWB by a few hours, wrong vehicle number updated, minor discrepancy, etc.]
   This lapse was purely technical in nature and there was NO INTENT WHATSOEVER to evade payment of GST. The goods and invoices are genuinely backed by legitimate trade.

4. DEMAND DETAILS
   ┌─────────────────────────────────────────┐
   │ Tax (IGST/CGST/SGST) │ ₹${(d.tax_amount||"[Amount]").padEnd(18)}│
   │ Penalty             │ ₹${(d.penalty_amount||"[Amount]").padEnd(18)}│
   └─────────────────────────────────────────┘
   ${d.payment_made || "Amount paid under protest (if any): [Challan details]"}

5. ANNEXURES
   Annexure A — Copy of tax invoice
   Annexure B — E-Way Bill printout
   Annexure C — Transporter details and lorry receipt
   Annexure D — Payment challan under protest (if paid)
   ${d.documents_available ? "Other: " + d.documents_available : ""}

6. URGENT PRAYER
   (i)   Release the detained goods and/or vehicle immediately;
   (ii)  Drop / reduce excessive penalty considering the minor/technical nature of the lapse;
   (iii) Accept payment under protest, if any, as full settlement;
   (iv)  No confiscation proceedings be initiated as there is zero intent to evade tax.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
⚠ URGENT — Physical presence at detention point may be required
• File reply immediately — goods may be perishable
• Pay under protest if needed to secure release, then contest`,
    },

    {
      id: "inspection_enforcement",
      title: "Inspection / Summons / Enforcement",
      color: "#DC2626",
      risk: "critical",
      sections: "Sec 67 (Inspection) / Sec 70 (Summons) / Sec 71 (Access to Records)",
      dashboard_labels: ["Summons Received", "Inspection Notice", "Enforcement Action"],
      clarification_questions: [
        "Is it a summons, inspection notice, search/seizure communication, or records requisition?",
        "Who is required to appear and on what date?",
        "What records or books specifically have been called for?",
        "Is adjournment or time extension needed?",
        "Should authorised representative details be submitted?",
      ],
      review_checklist: [
        "No unnecessary admission made anywhere in the reply",
        "Cooperation with authority confirmed unambiguously",
        "Adjournment justification clearly stated if sought",
        "Legal rights preserved throughout",
      ],
      draft_template: (d) => `TO,
The Proper Officer / Investigating Authority
${d.jurisdiction || "[GST Enforcement / Investigation Wing]"}

SUB: Response to ${d.notice_reference_number ? "Summons / Notice Ref: " + d.notice_reference_number : "Enforcement Communication"} dated ${d.date_of_notice || "[Date]"} — GSTIN: ${d.gstin || "[GSTIN]"}

Respected Sir / Ma'am,

The Noticee respectfully acknowledges receipt of the above-referenced communication and submits as follows:

1. ACKNOWLEDGEMENT
   We confirm receipt of the ${d.department_allegation ? "communication regarding: " + d.department_allegation : "summons / inspection notice"} issued under Section [67 / 70 / 71] of the CGST Act, 2017.
   GSTIN: ${d.gstin || "[GSTIN]"} | Entity: ${d.legal_name || "[Legal Name]"} | Tax Period: ${d.tax_period || "[Period]"}

2. COOPERATION & COMPLIANCE
   The Noticee fully cooperates with the GST department and undertakes to comply with the requirements of the notice. The following is submitted:
   (a) The Authorised Representative/Director/Proprietor [Name] shall appear before the authority on the scheduled date;
   (b) Records and documents as called for are being compiled and shall be produced on the date of appearance or as directed.

3. DOCUMENTS TO BE PRODUCED
   ${d.documents_available || "[List documents being produced — books of accounts, invoices, ledgers, returns data, bank statements, agreements, etc.]"}

4. REQUEST FOR ADJOURNMENT (IF APPLICABLE)
   [If time is needed:] Due to [specific reason — outstation travel, health, accountant unavailability, time to compile voluminous records], it is prayed that an adjournment of [X] more days be granted to appear with complete records.

5. LEGAL RIGHTS RESERVED
   This response is without prejudice to any and all legal rights and remedies available to the Noticee under CGST Act, 2017.
   ${d.client_explanation ? "Additional Submission: " + d.client_explanation : ""}

6. PRAYER
   (i)   Grant the required time to produce documents in comprehensive and organised form;
   (ii)  Proceed with the inquiry fairly and in accordance with law;
   (iii) No adverse inference be drawn until the Noticee is provided full opportunity to explain.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
⚠ CRITICAL — Engage senior legal counsel before appearance
• Never make any oral or written admission without proper guidance
• Bring authorised representative letter and ID proof`,
    },

    {
      id: "audit_investigation",
      title: "Audit & Investigation",
      color: "#7C3AED",
      risk: "high",
      sections: "Sec 65 / ADT-01 (Departmental Audit) / Sec 66 (Special Audit)",
      dashboard_labels: ["GST Audit Notice", "Special Audit"],
      clarification_questions: [
        "Is it a departmental audit (Sec 65) or special audit (Sec 66)?",
        "What tax period and years are covered?",
        "What specific documents or data are being sought?",
        "Are there known issues that need preliminary explanation?",
      ],
      review_checklist: [
        "Audit scope and period correctly identified",
        "Records submission plan clear and complete",
        "Preliminary clarifications carefully worded",
        "No avoidable admission made",
      ],
      draft_template: (d) => `TO,
The Audit Officer / Special Audit Team
${d.jurisdiction || "[GST Audit Wing / Jurisdiction]"}

SUB: Reply to GST Audit Notice — ${d.notice_reference_number || "[ADT-01 Ref]"} dated ${d.date_of_notice || "[Date]"} under Section ${d.department_allegation?.includes('66') ? '66' : '65'} — GSTIN: ${d.gstin || "[GSTIN]"} — Period: ${d.tax_period || "[Period]"}

Respected Sir / Ma'am,

The Noticee respectfully acknowledges the audit notice and submits as under:

1. NOTICE DETAILS & READINESS
   GSTIN       : ${d.gstin || "[GSTIN]"} | Legal Name: ${d.legal_name || "[Legal Name]"}
   Notice Ref  : ${d.notice_reference_number || "[ADT-01 Ref]"} | Date: ${d.date_of_notice || "[Date]"}
   Audit Period: ${d.tax_period || "[Period / FY]"}
   Type        : [Departmental Audit u/s 65 / Special Audit u/s 66]

2. READINESS TO PRODUCE RECORDS
   The Noticee is ready and willing to furnish all required documents and books of accounts for the audit period. The following records are available and will be produced:
   ${d.documents_available || `
   (a) Books of accounts — purchase register, sales register, cash book
   (b) GSTR-1, GSTR-3B, GSTR-9/9C for all audit years
   (c) Input tax credit workings (2A/2B reconciliation)
   (d) Tax payment challans
   (e) Relevant invoices, contracts, and agreements
   (f) Bank statements
   (g) E-way bill data
   (h) Any other records as specifically required by the audit team`}

3. PRELIMINARY CLARIFICATIONS (if applicable)
   ${d.client_explanation || "[Provide any preliminary factual points that may help the audit — differences already explained, voluntary disclosures, DRC-03 payments, amendments filed, etc.]"}

4. REQUEST FOR ADVANCE INFORMATION
   The Noticee requests that a specific list of documents / transactions is provided in advance so that the records may be compiled in an organised manner for efficient audit proceedings.

5. PRAYER
   (i)   Conduct the audit in a fair and transparent manner;
   (ii)  Allow adequate time to compile and present records;
   (iii) Issue a draft audit report / ADT-02 with opportunity of reply before finalisation.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory] | ${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• Prepare a master document index before audit begins
• Assign a dedicated person to liaise with the audit team
• Do not volunteer information beyond what is asked`,
    },

    {
      id: "appeals_litigation",
      title: "Appeals & Litigation",
      color: "#0EA5E9",
      risk: "high",
      sections: "Sec 107 (First Appeal) / Sec 108 (Revision) / Sec 112 (Appellate Tribunal) / APL-01",
      dashboard_labels: ["Appeal Filed", "Appeal Order Received", "Appeal Deadline Pending"],
      clarification_questions: [
        "What is the impugned order number and its date?",
        "When was the order served on the taxpayer?",
        "Has the appeal limitation period expired? Is delay condonation needed?",
        "Has the mandatory pre-deposit been paid?",
        "What are the main grounds of challenge?",
      ],
      review_checklist: [
        "Limitation period and pre-deposit clearly addressed",
        "Grounds of appeal are numbered and specific",
        "Relief sought matches the appellate stage",
        "Facts align precisely with the impugned order",
      ],
      draft_template: (d) => `BEFORE THE APPELLATE AUTHORITY / FIRST APPELLATE FORUM
[GST First Appellate Authority / GSTAT / High Court — as applicable]
${d.jurisdiction || "[Jurisdiction]"}

APL-01 APPEAL / APPELLATE SUBMISSION

IN THE MATTER OF APPEAL AGAINST ORDER — ${d.notice_reference_number || "[Impugned Order Ref]"} dated ${d.date_of_notice || "[Order Date]"}

APPELLANT:
${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"} | ${d.trade_name ? "Trade Name: " + d.trade_name : ""}

RESPONDENT:
[Designation of Proper Officer who passed the impugned order]

---

1. PARTICULARS OF THE IMPUGNED ORDER
   Order No.      : ${d.notice_reference_number || "[Order No.]"}
   Date of Order  : ${d.date_of_notice || "[Order Date]"}
   Date of Service: [Date Served]
   Tax Period     : ${d.tax_period || "[Period]"}
   Financial Year : ${d.financial_year || "[FY]"}
   Amount Confirmed:
   ┌──────────────────────────────────────────────┐
   │ Tax      : ₹${(d.tax_amount || "[Amount]").padEnd(30)} │
   │ Interest : ₹${(d.interest_amount || "[Amount]").padEnd(30)} │
   │ Penalty  : ₹${(d.penalty_amount || "[Amount]").padEnd(30)} │
   └──────────────────────────────────────────────┘

2. PRE-DEPOSIT
   Pre-deposit of 10% of disputed tax [₹ Amount] paid vide Challan No. [CPIN] dated [Date] as per Section 107(6).

3. LIMITATION
   The order was served on [service date]. This appeal is filed on [filing date]. The appeal is within the limitation period of [3 months / as applicable]. [If delayed — "Delay of [X] days is condoned on the ground that [genuine reason]. A separate application for condonation of delay is enclosed."]

4. GROUNDS OF APPEAL

   GROUND 1 - The impugned order is contrary to facts and law:
   The Adjudicating Authority has passed the order without taking into consideration the documentary evidence and reply filed by the Appellant. The order is therefore non-speaking, cryptic, and against principles of natural justice.

   GROUND 2 - Demand of tax is erroneous:
   The demand of ₹${d.tax_amount || "[Amount]"} is based on [erroneous computation / incorrect interpretation of law / incorrect denial of ITC / etc.].
   ${d.client_explanation || "[State specific factual grounds for disputing the tax demand]"}

   GROUND 3 - Department Allegation Incorrect:
   "${d.department_allegation || "[Specific allegation from the order]"}" — This is factually incorrect because [detailed factual rebuttal with reference to documents].

   GROUND 4 - Penalty Not Sustainable:
   Penalty under Section [applicable section] cannot be imposed as there is no evidence of fraud, willful misstatement, or suppression of facts.

   GROUND 5 - Interest Not Applicable:
   Interest under Section 50 cannot be charged on [the disputed amount / amounts not established as Tax Short Paid / etc.].

5. ANNEXURES
   Annexure A — Copy of impugned order
   Annexure B — Copy of original reply to SCN / notice
   Annexure C — Pre-deposit challan
   Annexure D — Evidence and reconciliation submitted at original stage
   ${d.documents_available ? "Other: " + d.documents_available : "Annexure E — [Other relevant documents]"}

6. PRAYER
   In light of the above facts and legal submissions, it is most respectfully prayed that:
   (i)   The impugned order dated ${d.date_of_notice || "[Date]"} be quashed and set aside;
   (ii)  Tax demand of ₹${d.tax_amount || "[Amount]"} be dropped in its entirety;
   (iii) Interest and penalty confirmed in the impugned order be waived;
   (iv)  Pre-deposit of ₹[Amount] be refunded with interest.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Appellant / Authorized Representative]
${d.legal_name || "[Legal Name]"} | GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
• File APL-01 on GSTN portal with all annexures
• Ensure pre-deposit paid and challan annexed
• Keep track of appeal order date — further appeal window is 3 months`,
    },

    {
      id: "recovery_proceedings",
      title: "Recovery Proceedings",
      color: "#B45309",
      risk: "critical",
      sections: "Sec 78 / Sec 79 / DRC-13 (Bank Attachment) / DRC-16 (Property Attachment)",
      dashboard_labels: ["Recovery Notice", "Bank Attachment", "Property Attachment"],
      clarification_questions: [
        "What is the original demand / order against which recovery is initiated?",
        "Has appeal been filed? Is stay granted or pending?",
        "Has any amount already been paid towards the demand?",
        "Is there a bank or property attachment already made?",
        "What urgent relief is sought — stay, release, or payment arrangement?",
      ],
      review_checklist: [
        "Original demand and order background clearly stated",
        "Appeal / stay / payment position unambiguously mentioned",
        "Urgency reflected prominently in the prayer",
        "Release from attachment specifically sought with legal grounds",
      ],
      draft_template: (d) => `TO,
The Recovery Officer / Proper Officer
${d.jurisdiction || "[GST Recovery Wing / Jurisdiction]"}

SUB: URGENT Reply / Objection to Recovery Proceedings — ${d.notice_reference_number || "[DRC-13/16 Ref]"} — GSTIN: ${d.gstin || "[GSTIN]"} — GSTIN of Noticee: ${d.gstin || "[GSTIN]"}

Respected Sir / Ma'am,

The Noticee respectfully and urgently submits as under:

*** URGENT — BANK / PROPERTY ATTACHMENT — IMMEDIATE RELIEF SOUGHT ***

1. BACKGROUND OF ORIGINAL DEMAND
   GSTIN         : ${d.gstin || "[GSTIN]"}
   Legal Name    : ${d.legal_name || "[Legal Name]"}
   Original Order: ${d.notice_reference_number || "[Original Order No. / Ref]"} dated ${d.date_of_notice || "[Date]"}
   Tax Period    : ${d.tax_period || "[Period]"}
   Demand Amount : ₹${d.tax_amount || "[Tax]"} + Interest ₹${d.interest_amount || "[Int]"} + Penalty ₹${d.penalty_amount || "[Penalty]"}

2. STATUS OF APPEAL / STAY
   ${d.client_explanation || `
   (a) Appeal has been filed before [First Appellate Authority / GSTAT / High Court] on [Date] — APL-01 Ref: [Ref];
   (b) Stay / interim relief has been [applied for / granted] vide [Order if any];
   (c) As per established law, recovery proceedings are premature during pendency of appeal / stay.`}

3. PAYMENT ALREADY MADE
   ${d.payment_made || "[Any amounts already paid — pre-deposit, voluntary payment through DRC-03, must be stated here with challan details]"}

4. LEGAL GROUNDS FOR OBJECTION TO ATTACHMENT
   (a) Recovery proceedings u/s 78/79 are maintainable only after the order becomes final — which it has not, as appeal is pending.
   (b) Attachment of bank account / property is disproportionate and will cause irreparable hardship to a running business.
   (c) The Noticee has not been given adequate opportunity to comply before coercive measures were taken.
   (d) [Cite any favorable High Court ruling on premature recovery / attachment]

5. DEMAND SUMMARY
   ┌───────────────────────────────────────────────┐
   │ Original Demand (₹) : ${(d.tax_amount || "[Amount]").padEnd(22)} │
   │ Amount Paid (₹)     : ${(d.payment_made || "As above").padEnd(22)} │
   │ Balance Outstanding : [Balance Amount]         │
   └───────────────────────────────────────────────┘

6. ANNEXURES
   Annexure A — Copy of original demand order
   Annexure B — Copy of appeal filing acknowledgement
   Annexure C — Stay application / stay order (if granted)
   Annexure D — Payment challans for amounts already paid
   ${d.documents_available ? "Other: " + d.documents_available : ""}

7. URGENT PRAYER
   (i)   Immediately release the bank attachment / lift property attachment;
   (ii)  Keep recovery proceedings in abeyance pending disposal of appeal;
   (iii) Grant a payment instalment arrangement, if any balance is to be recovered;
   (iv)  Issue written communication to [Bank Name/Branch] for immediate release.
   ${d.relief_sought ? "\nAdditional Relief: " + d.relief_sought : ""}

Yours Faithfully,
[Authorized Signatory]
${d.legal_name || "[Legal Name]"}
GSTIN: ${d.gstin || "[GSTIN]"}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

---
[CONSULTANT REVIEW NOTES]
⚠ EXTREME URGENCY — Bank attachment disrupts business payments
• Contact the Recovery Officer by phone immediately after filing
• File stay application in High Court if appeal stay not yet granted
• Simultaneously write to the bank with a copy of this reply`,
    },
  ],
};

// Helper: find category by value from notice type dropdowns
export function findCategory(noticeTypeValue) {
  return PROMPT_LIBRARY.categories.find(cat =>
    cat.sections.toLowerCase().includes(noticeTypeValue?.toLowerCase()?.split(' ')[0]) ||
    cat.dashboard_labels.some(l => l.toLowerCase().includes(noticeTypeValue?.toLowerCase()?.substring(0, 6)))
  );
}

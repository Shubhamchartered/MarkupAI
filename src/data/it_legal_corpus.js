/* ═══════════════════════════════════════════════════════════════
   it_legal_corpus.js — Income Tax Legal Reference Database
   Sections, drafting guides, case laws, cross-act references
   ═══════════════════════════════════════════════════════════════ */

export const IT_SECTIONS = {
  '143(1)': {
    title: 'Intimation after Processing of Return',
    act: 'Income Tax Act, 1961',
    summary: 'CPC Bengaluru processes the return and sends intimation. May include prima facie adjustments u/s 143(1)(a) for arithmetical errors, incorrect claims, or disallowances apparent from the return.',
    timeLimit: 'Within 9 months from the end of the FY in which the return is filed.',
    defences: ['Rectification u/s 154', 'Online response to CPC', 'Appeal u/s 246A if demand exceeds adjustment allowed'],
    caseLaws: ['CIT v. Rajesh Jhaveri Stock Brokers (2007) 291 ITR 500 (SC)', 'DCIT v. Manas Saha (2019) ITAT Kolkata'],
    checklist: ['Verify computation in intimation', 'Check all adjustments u/s 143(1)(a)', 'Compare with original ITR filed', 'Verify Form 26AS credits', 'Check interest calculations u/s 234A/B/C'],
  },
  '143(2)': {
    title: 'Scrutiny Assessment Notice',
    act: 'Income Tax Act, 1961',
    summary: 'Notice for detailed scrutiny of income tax return. AO may call for books of account, documents, and evidence. The most common assessment notice for substantial cases.',
    timeLimit: 'Must be served within 6 months from the end of the FY in which the return was filed (for CASS/manual selection). Assessment to be completed within 12 months from end of AY.',
    defences: ['Time-barred if served beyond limitation', 'Jurisdictional challenges', 'Natural justice principles', 'All income already disclosed'],
    caseLaws: ['ACIT v. Hotel Blue Moon (2010) 321 ITR 362 (SC)', 'CIT v. Smt. Amiya Bala Paul (2003) 262 ITR 407 (Cal)'],
    checklist: ['Verify limitation date', 'Check if notice is under CASS or manual', 'Prepare books of account', 'Reconcile turnover with GST returns', 'Keep ITR acknowledgment ready', 'Verify AO jurisdiction'],
  },
  '148A': {
    title: 'Pre-Issue Notice — New Reassessment Regime',
    act: 'Income Tax Act, 1961 (w.e.f. 01.04.2021)',
    summary: 'Before issuing notice u/s 148, AO must conduct inquiry and provide opportunity to the assessee u/s 148A(b). This is the new regime replacing the old 148 process. AO must pass order u/s 148A(d) before reassessment.',
    timeLimit: '3 years from end of relevant AY (normal); 10 years if escaped income ≥ ₹50 lakhs.',
    defences: ['Challenge adequacy of inquiry', 'Argue no new tangible material', 'All transactions already disclosed in return', 'Limitation expired'],
    caseLaws: ['Ashish Agarwal v. PCIT (2022) 444 ITR 1 (SC) — All old 148 notices deemed as 148A', 'Rajeev Bansal v. UOI (2024) SC — Extended timeline for conversion'],
    checklist: ['Respond within 7-30 days (as specified)', 'Challenge "information" relied upon', 'Show all facts were disclosed in original return', 'Argue change of opinion is not permissible'],
  },
  '148': {
    title: 'Income Escaping Assessment',
    act: 'Income Tax Act, 1961',
    summary: 'Notice for reassessment when AO has reason to believe income has escaped assessment. New regime (post April 2021) requires 148A inquiry first.',
    timeLimit: '3 years (normal); up to 10 years for income escaping ≥ ₹50 lakh.',
    defences: ['No tangible material for reopening', 'Mere change of opinion', 'Original assessment after due inquiry', 'Beyond limitation'],
    caseLaws: ['CIT v. Kelvinator of India Ltd (2010) 320 ITR 561 (SC)', 'CIT v. Chhabil Dass Agarwal (2014) 357 ITR 357 (SC)'],
    checklist: ['Verify 148A procedure was followed', 'Check if reasons recorded before issue', 'Examine "information" relied upon by AO', 'File reply within stipulated time'],
  },
  '270A': {
    title: 'Penalty for Under-Reporting and Misreporting',
    act: 'Income Tax Act, 1961 (w.e.f. AY 2017-18)',
    summary: 'Replaced old s.271(1)(c). Under-reporting: 50% of tax on under-reported income. Misreporting: 200% of tax. Both require separate SCN.',
    timeLimit: 'Penalty proceedings must be initiated in assessment order itself. No separate time limit for penalty order.',
    defences: ['All facts disclosed — no misreporting', 'Bona fide claim of deduction/exemption — immunity u/s 270AA', 'Difference of opinion is not under-reporting', 'Errors in record not substantive under-reporting'],
    caseLaws: ['PCIT v. Sahara India Life Insurance Co. (2019) 417 ITR 469 (Del)', 'CIT v. Reliance Petro Products (2010) 322 ITR 158 (SC)'],
    checklist: ['Check if SCN specifies under-reporting or misreporting', 'Prepare immunity application u/s 270AA', 'Demonstrate bona fide belief', 'Show full disclosure in return'],
  },
  '263': {
    title: 'Revision by Commissioner — Erroneous Order',
    act: 'Income Tax Act, 1961',
    summary: 'CIT can revise AO\'s order if considered erroneous AND prejudicial to the interests of revenue. Both conditions must coexist. CIT must provide reasonable opportunity before revision.',
    timeLimit: '2 years from the date of the order sought to be revised (extended to the period up to which appeal can be filed by assessee in certain cases).',
    defences: ['Order is not erroneous — AO took a possible view', 'Order is not prejudicial to revenue', 'CIT cannot substitute his view for AO\'s possible view', 'Adequate inquiry was conducted by AO'],
    caseLaws: ['CIT v. Max India Ltd (2007) 295 ITR 282 (SC)', 'Malabar Industrial Co Ltd v. CIT (2000) 243 ITR 83 (SC)', 'CIT v. Amitabh Bachchan (2016) 384 ITR 200 (Bom)'],
    checklist: ['Verify limitation period', 'Show AO conducted adequate inquiry', 'Demonstrate AO\'s view was a plausible legal position', 'Challenge if CIT is merely changing opinion'],
  },
  '153A': {
    title: 'Assessment in case of Search or Seizure',
    act: 'Income Tax Act, 1961',
    summary: 'After search u/s 132 or requisition u/s 132A, AO shall assess or reassess total income for 6 AYs preceding the search year. For incriminating material found, additions can be made even in completed assessments.',
    timeLimit: '18 months from end of FY in which last authorization was executed (21 months if transfer pricing is involved).',
    defences: ['No incriminating material found for the specific AY', 'Completed assessments cannot be disturbed without incriminating material', 'Statements u/s 132(4) retracted', 'Seized material does not belong to the assessee'],
    caseLaws: ['CIT v. Kabul Chawla (2016) 380 ITR 573 (Del)', 'PCIT v. Abhisar Buildwell (2023) SC — Landmark on incriminating material', 'CIT v. Sinhgad Technical Education Society (2017) 397 ITR 344 (SC)'],
    checklist: ['Obtain copies of all seized documents', 'Identify incriminating material AY-wise', 'Analyze statement u/s 132(4) — consider retraction', 'Prepare valuation reports for seized assets', 'Check completed vs pending assessments'],
  },
};

export const CROSS_ACT_REFERENCES = {
  'FEMA': {
    title: 'Foreign Exchange Management Act, 1999',
    triggers: ['Foreign bank accounts not reported in ITR Schedule FA', 'LRS remittances exceeding limits', 'Foreign assets/income not disclosed', 'FCGPR/FCTRS violations'],
    itSections: ['Section 5 (Scope of total income for non-residents)', 'Section 9 (Income deemed to accrue in India)', 'Schedule FA (Foreign Assets)'],
    penalties: 'Up to 3 times the amount involved under FEMA. Additional penalties under Black Money Act if undisclosed.',
    guidance: 'Cross-reference ITR Schedule FA disclosure with FEMA compliance. Ensure all foreign assets are reported. LRS remittances above ₹7 lakh require Form 15CA/15CB.',
  },
  'PMLA': {
    title: 'Prevention of Money Laundering Act, 2002',
    triggers: ['Large cash deposits not matching declared income', 'Suspicious transaction reports (STR) from banks', 'Shell company transactions', 'Round-tripping of funds'],
    itSections: ['Section 68 (Cash credits)', 'Section 69 (Unexplained investments)', 'Section 69A (Unexplained money)', 'Section 69C (Unexplained expenditure)'],
    penalties: 'Rigorous imprisonment 3-7 years and fine under PMLA. Under IT Act: 60% tax + 25% surcharge on unexplained income u/s 115BBE.',
    guidance: 'IT proceedings may trigger ED investigation. Maintain complete audit trail of all transactions. Coordinate response with PMLA counsel.',
  },
  'Benami': {
    title: 'Benami Transactions (Prohibition) Act, 1988 (as amended 2016)',
    triggers: ['Properties in name of family members but funded by assessee', 'Undisclosed properties found during search', 'Nominee shareholders with no real investment'],
    itSections: ['Section 69 (Unexplained investments)', 'Section 69B (Investment not fully disclosed)', 'Section 56(2)(x) (Gift taxation)'],
    penalties: 'Confiscation of benami property. Imprisonment up to 7 years. Fine up to 25% of fair market value under Benami Act.',
    guidance: 'IT search may uncover benami properties. Establish genuine source of funds for all properties. Gift deeds must be properly stamped and documented.',
  },
  'BlackMoney': {
    title: 'Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015',
    triggers: ['Undisclosed foreign bank accounts', 'Foreign assets not reported in Schedule FA', 'Income from undisclosed foreign sources'],
    itSections: ['Section 5 (Total income scope)', 'Schedule FA (Foreign Assets)', 'Section 139(1) (Due date compliance)'],
    penalties: '30% tax + 90% penalty on undisclosed foreign income. Criminal prosecution with imprisonment up to 10 years.',
    guidance: 'File revised return immediately if any foreign assets were not declared. Consult specific Black Money Act advisor for penalty mitigation.',
  },
  'GST': {
    title: 'Goods and Services Tax Act, 2017',
    triggers: ['Income-GST turnover mismatch', 'Professional receipts in ITR vs GST returns', 'Missing GST registration despite turnover threshold'],
    itSections: ['Section 44AB (Tax audit threshold)', 'Section 44AD (Presumptive income)', 'Section 194C/194J (TDS obligations)'],
    penalties: 'Under GST: Sec 73/74 SCN. Under IT: Additions for undisclosed turnover. Both departments increasingly share data.',
    guidance: 'Reconcile ITR turnover with GSTR-9 annual return. Address any mismatches proactively in both returns.',
  },
};

export const IT_DRAFTING_GUIDES = {
  '143(2)': {
    explanation: 'A scrutiny notice u/s 143(2) means the AO wants to examine your return in detail. This is NOT a demand — it is a notice for inquiry. The assessee must produce books of account and evidence.',
    mustAddress: ['Identify specific queries raised by AO', 'Prepare reconciliation of income sources', 'Keep all supporting documents organized', 'Track hearing dates carefully', 'Request adjournment only with valid reasons'],
    availableDefences: ['All income disclosed in return', 'Deductions claimed as per law', 'AO cannot travel beyond the scope of return', 'Assessment must be completed within time limit', 'Notice must be validly served'],
    commonMistakes: ['Ignoring the notice', 'Providing incomplete information', 'Not requesting adjournment when needed', 'Admitting facts without legal advice', 'Missing the assessment completion deadline'],
    landmarkCases: ['ACIT v. Hotel Blue Moon (2010) 321 ITR 362 (SC) — Mandatory requirement of 143(2) notice', 'CIT v. Laxman Das Khandelwal (2019) SC — Time limit for issuance'],
    timeLimits: { reply: '15-30 days as specified in notice', assessment: '12 months from end of AY', appeal: '30 days from order date' },
  },
  '148A': {
    explanation: 'Before reopening assessment, the AO must now follow the 148A procedure: (b) give notice to assessee with "information" relied upon, (d) pass a speaking order after considering reply. Only then can 148 notice be issued.',
    mustAddress: ['Challenge the "information" relied upon by AO', 'Show all facts were disclosed in the original return', 'Argue that reopening amounts to change of opinion', 'Point out limitation issues'],
    availableDefences: ['Full and true disclosure in original return', 'No new tangible material', 'Change of opinion is not permissible (Kelvinator)', 'Limitation period expired', '148A inquiry was inadequate'],
    commonMistakes: ['Not responding to 148A(b) notice within time', 'Ignoring the opportunity — leads to 148A(d) order without hearing', 'Not challenging the "information" specifically'],
    landmarkCases: ['Ashish Agarwal v. PCIT (2022) SC — Converted all old 148 to new regime', 'CIT v. Kelvinator of India Ltd (2010) SC — Change of opinion'],
    timeLimits: { reply: '7-30 days as specified', order148Ad: 'Within 1 month of reply', total: '3 years normal, 10 years for ≥ ₹50L' },
  },
  '270A': {
    explanation: 'Penalty for under-reporting income (50% of tax) or misreporting income (200% of tax). New regime replaced old s.271(1)(c). Key: immunity u/s 270AA available if tax and interest are paid and no appeal is filed against the quantum.',
    mustAddress: ['Distinguish between under-reporting and misreporting', 'Apply for immunity u/s 270AA within 1 month', 'Show bona fide claim if deduction/exemption was disallowed', 'Challenge if AO has not specified the limb in SCN'],
    availableDefences: ['Immunity u/s 270AA', 'Bona fide claim — no misreporting', 'Returned income exceeds assessed income after adjustments', 'Difference of opinion is not under-reporting'],
    commonMistakes: ['Missing the 1-month window for 270AA immunity', 'Not distinguishing under-reporting from misreporting', 'Filing appeal and losing immunity'],
    landmarkCases: ['CIT v. Reliance Petro Products (2010) SC — Making an incorrect claim is not furnishing inaccurate particulars', 'PCIT v. Sahara India Life Insurance (2019) Del HC'],
    timeLimits: { immunityApplication: '1 month from receipt of penalty order', appeal: '30 days CIT(A), 60 days ITAT' },
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   matter_engine.js — MARKUP GST Pro
   Multi-Strategy Matter Record Drafting Engine
   Generates department-ready GST reply from structured intake form data.
   RULES: No invented facts · Separate structured sections · Mark uncertainty
   ═══════════════════════════════════════════════════════════════════════ */

export const MatterEngine = (function () {
  'use strict';

  /* ── Formatters ─────────────────────────────────────────────── */
  const fmtDate = (d) => {
    if (!d) return '[DATE PENDING]';
    const [y, m, day] = d.split('-');
    if (y && m && day) {
      const months = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
      return `${parseInt(day, 10)} ${months[parseInt(m, 10)-1]} ${y}`;
    }
    return d;
  };

  const fmtAmt = (n) => {
    if (!n || n === '0' || n === 0) return 'NIL';
    return '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const fmtPeriod = (from, to) => {
    if (!from && !to) return '[TAX PERIOD NOT SPECIFIED]';
    return `${from || '[FROM]'} to ${to || '[TO]'}`;
  };

  const today = () => new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  /* ── Strategy Descriptions ───────────────────────────────────── */
  const STRATEGY_MAP = {
    FACTUAL: {
      label: 'Factual',
      desc: 'The material facts and documents on record demonstrate compliance. The reply prioritises documentary evidence and return reconciliation to factually negate the allegation.',
    },
    LEGAL: {
      label: 'Legal',
      desc: 'The Department\'s interpretation of the relevant provisions is legally untenable. The reply leads with statutory provisions, CBIC Circulars, and judicial precedents to challenge the basis of the notice.',
    },
    RECONCILIATION: {
      label: 'Reconciliation',
      desc: 'The apparent discrepancy is purely an accounting/timing difference, fully explained by a detailed reconciliation. The reply centres on the reconciliation table with supporting documents.',
    },
    'LITIGATION-DEFENSIVE': {
      label: 'Litigation-Defensive',
      desc: 'The matter involves significant risk and contested facts. The reply preserves all legal rights, challenges jurisdictional/procedural validity, and prepares the grounds for appellate proceedings.',
    },
  };

  /* ── Helper for Documents ────────────────────────────────────── */
  const getDocList = (docs) => {
    const docMeta = [
      { key: 'gstr1',       label: 'GSTR-1 Data' },
      { key: 'gstr3b',      label: 'GSTR-3B Data' },
      { key: 'gstr2b',      label: 'GSTR-2B / GSTR-2A Data' },
      { key: 'purchaseReg', label: 'Purchase Invoice Register' },
      { key: 'salesReg',    label: 'Sales Invoice Register' },
      { key: 'ewayBills',   label: 'E-Way Bill Records' },
      { key: 'challans',    label: 'GST Payment Challans' },
      { key: 'bankStmts',   label: 'Bank Statements' },
      { key: 'books',       label: 'Books of Accounts / Ledger Extract' },
      { key: 'supplierGstn',label: 'Supplier GSTIN Verification Certificates' },
      { key: 'priorReply',  label: 'Prior Notice Replies / Orders' },
    ];
    return docMeta.map(d => ({ ...d, status: docs[d.key] || 'NA' })).filter(d => d.status !== 'NA');
  };

  /* ── 1. FACTUAL DRAFT ────────────────────────────────────────── */
  function buildFactualDraft(m) {
    const docs = getDocList(m.documents || {});
    const availableDocs = docs.filter(d => d.status === 'Available');
    const pendingDocs = docs.filter(d => d.status === 'Pending');

    const factsStr = `1.1 The Assessee, ${m.legalName || '[CLIENT]'}, GSTIN ${m.gstin || '[GSTIN]'}, has received the Notice No. ${m.noticeNumber} dated ${fmtDate(m.issueDate)}.\n` +
                     `1.2 The Assessee has been regularly filing returns and paying requisite taxes. The present matter involves a factual discrepancy which is explained below using books of accounts, challans and returns.\n` +
                     `1.3 The following documents are placed on record to establish the facts:\n` +
                     (availableDocs.length ? availableDocs.map((d, i) => `     Annexure-${String.fromCharCode(65+i)}: ${d.label}`).join('\n') : `     [DOCUMENT PENDING — to be annexed before filing]`);

    const issuesStr = (!m.issues || m.issues.length === 0) ? `\n2.1 [NO ISSUES ENTERED]\n` : m.issues.map((issue, i) => {
        return `2.${i+1} ISSUE ${i+1}: ${issue.title || `[ISSUE ${i+1}]`}
     ALLEGATION: ${issue.description || '[NOTICE ALLEGATION]'}
     FACTUAL REBUTTAL:
     ${issue.submission || '[BRIEF FACTUAL REBUTTAL — REFERENCING RETURNS/CHALLANS/BOOKS]'}
     EXPLANATION FOR MISMATCH:
     ${issue.reconciliation || '[CONCISE EXPLANATION: e.g., timing difference, amendment, rounding]'} — Refer to Section 3 (Reconciliation Statement).`;
    }).join('\n\n');

    const reconStr = `3.1 RECONCILIATION STATEMENT
     The Assessee submits the following factual reconciliation which resolves the alleged discrepancy:
     [RECONCILIATION TABLE TO BE INSERTED]
     ${m.reconciliationStatus === 'Done' ? 'Detailed reconciliation is annexed.' : '[DOCUMENT PENDING — to be annexed before filing]'}`;

    const annexuresStr = `4.1 ANNEXURES & ENCLOSURES\n` +
      (availableDocs.length ? availableDocs.map((d, i) => `     Annexure-${String.fromCharCode(65+i)}: ${d.label}`).join('\n') : `     No available annexures set.`) +
      (pendingDocs.length ? '\n\n4.2 PENDING DOCUMENTS\n' + pendingDocs.map((d, i) => `     ${i+1}. ${d.label} [DOCUMENT PENDING — to be annexed before filing]`).join('\n') : '');

    const prayerStr = `In view of the factual submissions and documentary evidence placed on record, the Assessee politely prays that the proceedings initiated vide Notice No. ${m.noticeNumber} be dropped.`;

    const internalNote = `[INTERNAL NOTE: Verify if all factual claims are fully supported by the available documents. Ensure no pending documents remain unattached before filing.]`;

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${factsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — FACTUAL REBUTTAL & EXPLANATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issuesStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — RECONCILIATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reconStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — DOCUMENTS & ANNEXURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${annexuresStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prayerStr}

${internalNote}`;
  }

  /* ── 2. LEGAL DRAFT ──────────────────────────────────────────── */
  function buildLegalDraft(m) {
    const docs = getDocList(m.documents || {});
    const pendingDocs = docs.filter(d => d.status === 'Pending');

    const factsStr = `1.1 The Assessee, ${m.legalName || '[CLIENT]'}, GSTIN ${m.gstin || '[GSTIN]'}, acknowledges receipt of Notice No. ${m.noticeNumber} dated ${fmtDate(m.issueDate)}.\n` +
                     `1.2 The Assessee has complied with all statutory requirements. The allegations raised in the notice are based on an erroneous interpretation of the law.`;

    const legalStr = `2.1 PRELIMINARY OBJECTIONS & JURISDICTION
     [REQUIRES LEGAL VERIFICATION] The Assessee submits that the notice is not tenable in law, having been issued without fulfilling the jurisdictional pre-conditions stipulated under Section ${m.sectionInvoked || '[SECTIONS]'}.

2.2 STATUTORY PROVISIONS & INTERPRETATION
     [REQUIRES LEGAL VERIFICATION] The demand contradicts the clear mandate of the CGST Act. [Insert statutory analysis].

2.3 RELIANCE ON JUDICIAL PRECEDENTS
     The Assessee relies on the following binding precedents:
     1. [REQUIRES LEGAL VERIFICATION] [Case Law Citation 1] — [Brief proposition]
     2. [REQUIRES LEGAL VERIFICATION] [Circular Verification] — [Clarification provided]`;

    const issuesStr = (!m.issues || m.issues.length === 0) ? `\n3.1 [NO ISSUES ENTERED]\n` : m.issues.map((issue, i) => {
        return `3.${i+1} ISSUE ${i+1}: ${issue.title || `[ISSUE ${i+1}]`}
     LEGAL SUBMISSION:
     ${issue.submission || '[LEGAL REBUTTAL]'}
     [REQUIRES LEGAL VERIFICATION] The allegation of ₹${issue.amount || '0.00'} is unsustainable in law.`;
    }).join('\n\n');

    const prayerStr = `In light of the statutory provisions and judicial precedents cited above, it is respectfully prayed that the proceedings be dropped entirely.`;

    const internalNote = `[INTERNAL NOTE: Verify if all case laws cited are good law and check wording of CBIC circulars.]`;

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${factsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — LEGAL SUBMISSIONS & CASE LAWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${legalStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — ISSUE-WISE LEGAL REBUTTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issuesStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prayerStr}
${pendingDocs.length > 0 ? `\n[DOCUMENT PENDING: Ensure pending documents are attached]` : ''}

${internalNote}`;
  }

  /* ── 3. RECONCILIATION DRAFT ─────────────────────────────────── */
  function buildReconDraft(m) {
    const docs = getDocList(m.documents || {});
    const availableDocs = docs.filter(d => d.status === 'Available');
    const pendingDocs = docs.filter(d => d.status === 'Pending');

    const factsStr = `1.1 The Assessee, M/s ${m.legalName || '[CLIENT]'}, GSTIN ${m.gstin || '[GSTIN]'}, has received the Notice No. ${m.noticeNumber} dated ${fmtDate(m.issueDate)}.\n` +
                     `1.2 The perceived discrepancy and consequent demand of ${fmtAmt(m.taxDemand)} is purely an accounting and timing difference and does not represent any evasion of tax.`;

    const reconTableStr = `2.1 MAGNITUDE OF DIFFERENCE & RECONCILIATION
     The Assessee submits the following reconciliation statement:
     ┌────────────────────────────────────────────────────────┐
     │  Period: ${fmtPeriod(m.periodFrom, m.periodTo).padEnd(46)}│
     │  Total Demand Alleged: ${fmtAmt(m.taxDemand).padEnd(40)}│
     │  Difference Explained via Reconciliation: [COMPUTED]   │
     │  Unreconciled Balance: [BALANCE]                       │
     └────────────────────────────────────────────────────────┘

2.2 NATURE OF DISCREPANCIES
     The differences are primarily attributable to:
     [ ] Timing differences in reporting
     [ ] Credit notes or amendments in subsequent periods
     [ ] Clerical/rounding errors
     [ ] Other: ${m.strategyReason || '[Specify reason]'}`;

    const issuesStr = (!m.issues || m.issues.length === 0) ? `\n3.1 [NO ISSUES ENTERED]\n` : m.issues.map((issue, i) => {
        return `3.${i+1} ISSUE ${i+1}: ${issue.title || `[ISSUE ${i+1}]`}
     RECONCILIATION EXPLANATION:
     ${issue.reconciliation || '[EXPLAIN THE ACCOUNTING MISMATCH SPECIFICALLY]'}
     ${issue.submission || ''} — Refer to attached working sheets.`;
    }).join('\n\n');

    const docStr = `4.1 SUPPORTING RECONCILIATION DOCUMENTS\n` +
      (availableDocs.length ? availableDocs.map((d, i) => `     ${i+1}. ${d.label}`).join('\n') : `     [DOCUMENT PENDING — attach working sheets]`) +
      (pendingDocs.length ? '\n\n4.2 PENDING DOCUMENTS TO BE FILED\n' + pendingDocs.map((d, i) => `     ${i+1}. ${d.label} [DOCUMENT PENDING]`).join('\n') : '');

    const prayerStr = `Upon verification of the enclosed reconciliation statements, the Assessee prays that the alleged differences be dropped.`;

    const internalNote = `[INTERNAL NOTE: Ensure mathematical calculations in the reconciliation table cross-tally completely.]`;

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${factsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — RECONCILIATION STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reconTableStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — ISSUE-WISE EXPLANATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issuesStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — DOCUMENTS & WORKING SHEETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${docStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prayerStr}

${internalNote}`;
  }

  /* ── 4. LITIGATION DEFENSIVE DRAFT ───────────────────────────── */
  function buildLitigationDraft(m) {
    const docs = getDocList(m.documents || {});
    const pendingDocs = docs.filter(d => d.status === 'Pending');

    const factsStr = `1.1 The Assessee, ${m.legalName || '[CLIENT]'}, GSTIN ${m.gstin || '[GSTIN]'}, has received the Notice No. ${m.noticeNumber} dated ${fmtDate(m.issueDate)}, proposing a total exposure of ${fmtAmt(m.totalExposure)}.\n` +
                     `1.2 The Assessee strongly refutes all allegations contained in the notice as being factually incorrect, legally unsustainable, and procedurally defective.`;

    const prelimStr = `2.1 PROCEDURAL & JURISDICTIONAL FLAWS
     [REQUIRES LEGAL VERIFICATION] The present proceedings are void ab-initio due to limitation / lack of jurisdiction / violation of principles of natural justice.

2.2 DENIAL OF ALLEGATIONS
     The allegations of suppression / misstatement / fraud under Section ${m.sectionInvoked || '[SECTIONS]'} are vehemently denied. The Department has failed to discharge its burden of proof.`;

    const issuesStr = (!m.issues || m.issues.length === 0) ? `\n3.1 [NO ISSUES ENTERED]\n` : m.issues.map((issue, i) => {
        return `3.${i+1} ISSUE ${i+1}: ${issue.title || `[ISSUE ${i+1}]`}
     DEFENSE & REBUTTAL:
     ${issue.submission || '[LITIGATION REBUTTAL]'}
     [REQUIRES LEGAL VERIFICATION] The Assessee reserves the right to adduce further evidence and challenge this during appellate proceedings.`;
    }).join('\n\n');

    const wpStr = `4.1 WITHOUT PREJUDICE
     All submissions made herein are without prejudice to the Assessee's right to pursue alternative remedies, including writ jurisdiction, and without admitting any liability whatsoever.
     ${m.additionalInstructions ? `\n     SPECIFIC INSTRUCTIONS: ${m.additionalInstructions}` : ''}`;

    const prayerStr = `The Assessee demands a personal hearing and prays that the notice be quashed and proceedings be dropped in their entirety.`;

    const internalNote = `[INTERNAL NOTE: Preserve all grounds of appeal. Ensure no admissions are inadvertently made. This draft prepares the matter for a potential legal challenge.]`;

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${factsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — PRELIMINARY OBJECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prelimStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — ISSUE-WISE REBUTTAL & DEFENSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issuesStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — WITHOUT PREJUDICE SUBMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${wpStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prayerStr}
${pendingDocs.length > 0 ? `\n[DOCUMENT PENDING: Ensure evidence is finalized prior to filing]` : ''}

${internalNote}`;
  }

  /* ── Master Builder ──────────────────────────────────────────── */
  function generateMatterDraft(matter) {
    const m = matter;
    const strategy = STRATEGY_MAP[m.strategy] || STRATEGY_MAP['FACTUAL'];

    const header = `
${'═'.repeat(70)}
          MARKUP GST PRO — MATTER RECORD DRAFT REPLY
              [STRICTLY CONFIDENTIAL — FOR CA OFFICE USE ONLY]
${'═'.repeat(70)}

MATTER REFERENCE : ${m.matterId || '[MATTER-ID — TO BE ASSIGNED]'}
DATE GENERATED   : ${today()}
DRAFTED BY       : MARKUP GST Pro · Litigation Drafting Engine v2.0

CLIENT           : ${m.legalName || '[CLIENT NAME]'}
GSTIN            : ${m.gstin || '[GSTIN]'}
STATE            : ${m.state || '[STATE]'}
NOTICE           : ${m.noticeType || '[NOTICE TYPE]'} No. ${m.noticeNumber || '[NOTICE NO.]'}
ISSUE DATE       : ${fmtDate(m.issueDate)}
DUE DATE         : ${fmtDate(m.dueDate)}
SECTION(S)       : ${m.sectionInvoked || '[SECTIONS]'}
STRATEGY ADOPTED : ${strategy.label.toUpperCase()}

${'─'.repeat(70)}
STRATEGY RATIONALE: ${strategy.desc}
${'─'.repeat(70)}

                         F O R M A L   R E P L Y
${'═'.repeat(70)}
${today()}

To,
${m.issuingAuthority || 'The Proper Officer / Adjudicating Authority'},
GST Department${m.state ? ' — ' + m.state : ''},
[WARD / CIRCLE / COMMISSIONERATE — TO BE FILLED]

Sub: Reply to ${m.noticeType || 'Notice'} No. ${m.noticeNumber || '[NOTICE NO.]'} dated ${fmtDate(m.issueDate)} — GSTIN: ${m.gstin || '[GSTIN]'}
     [Tax period: ${fmtPeriod(m.periodFrom, m.periodTo)}]

Respected Sir / Madam,

With reference to the above-mentioned notice, M/s ${m.legalName || '[CLIENT NAME]'} (hereinafter referred to as "the Assessee") respectfully submits this reply.`;

    let body = '';
    if (m.strategy === 'FACTUAL') body = buildFactualDraft(m);
    else if (m.strategy === 'LEGAL') body = buildLegalDraft(m);
    else if (m.strategy === 'RECONCILIATION') body = buildReconDraft(m);
    else if (m.strategy === 'LITIGATION-DEFENSIVE') body = buildLitigationDraft(m);
    else body = buildFactualDraft(m);

    const footer = `
${'═'.repeat(70)}
Thanking your Honour and awaiting a favourable order.

Yours faithfully,

_________________________________
For M/s ${m.legalName || '[CLIENT NAME]'}
GSTIN: ${m.gstin || '[GSTIN]'}

Authorised Signatory
[NAME, DESIGNATION]
[CONTACT: EMAIL / PHONE]

[CA SIGNATURE / STAMP — IF FILED THROUGH REPRESENTATIVE]
Advocate / CA: _______________________
Enrollment No.: ______________________
${'═'.repeat(70)}
DISCLAIMER: Draft generated by MARKUP GST Pro. All [REQUIRES LEGAL
VERIFICATION] and [DOCUMENT PENDING] markers MUST be resolved by the
CA / Advocate before filing. Facts must be independently verified.
This output does not constitute legal advice.
${'═'.repeat(70)}`.trim();

    return { header, body, footer, full: (header + '\n\n' + body + '\n\n' + footer).trim() };
  }

  /* ── Public API ──────────────────────────────────────────────── */
  return {
    generate:    generateMatterDraft,
    formatDate:  fmtDate,
    formatAmount: fmtAmt,
    STRATEGY_MAP,
  };

})();

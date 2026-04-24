/**
 * /api/it-draft/route.js — IT Litigation Reply Drafting Engine V2
 *
 * Model: gemini-2.0-flash
 * Profile: 25-year Senior CA + IT Litigator / Advocate
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const IT_EXPERT_SYSTEM = `You are a Senior Chartered Accountant and Income Tax Litigation Expert with 25 years of active practice before:
- Assessing Officers (AO) and Additional CITs
- Commissioner of Income Tax (Appeals) — CIT(A) / NFAC
- Income Tax Appellate Tribunal (ITAT)
- High Courts and Supreme Court of India

Your drafts are recognised for:
1. Surgical precision — facts ONLY from uploaded documents, never invented
2. Deep mastery of Income Tax Act 1961, Income Tax Rules 1962, CBDT Circulars and Instructions
3. Strategic citation of ITAT orders, High Court judgments, Supreme Court decisions
4. Firm but respectful tone — you exhaust all legal remedies before conceding anything

ABSOLUTE RULES:
- NEVER invent facts, amounts, dates, or case laws
- NEVER cite a case without [REQUIRES INDEPENDENT VERIFICATION — CONFIRM BEFORE FILING]
- NEVER suggest paying tax without exhausting all legal remedies
- Mark missing information as [INSERT ___] or [TO BE VERIFIED BY CA]

STRUCTURE (mandatory):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION I — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION II — LEGAL SUBMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION III — RECONCILIATION & DOCUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION IV — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION V — CA REVIEW CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

function buildITPrompt({ noticeData, extractedData, supportingDocs, specialInstructions, draftType }) {
  const n = extractedData || noticeData || {};
  const docs = supportingDocs || [];

  const taxpayer = n.taxpayer || n.assessee_name || n.legal_name || '[ASSESSEE NAME]';
  const pan = n.pan || '[PAN]';
  const ay = n.ay || n.assessment_year || '[AY]';
  const section = n.section || n.section_it || '[SECTION]';
  const noticeType = n.noticeType || n.notice_type || n.type || draftType || 'Income Tax Notice';
  const aoName = n.aoName || n.ao_name || n.proper_officer_name || '[AO NAME]';
  const aoWard = n.aoDesignation || n.ao_ward || n.jurisdiction || '[WARD/CIRCLE]';
  const issueDate = n.dateIssued || n.date_of_notice || n.issue_date || '[DATE]';
  const dueDate = n.dueDate || n.reply_due_date || n.due_date || '[DUE DATE]';
  const demand = n.demandAmount || n.total_demand || n.amount || 0;
  const issues = n.issuesRaised || n.allegations || n.key_issues || '[ISSUES NOT EXTRACTED]';
  const hearingDate = n.hearingDate || n.hearing_date || null;
  const vcDate = n.vcDate || n.vc_date || null;
  const docsDemanded = n.documents_demanded || [];

  const docsBlock = docs.length > 0
    ? docs.map((d, i) => `   Annexure ${String.fromCharCode(65 + i)}: ${d.name} — ${d.description || 'uploaded'}`).join('\n')
    : '   (No supporting documents — use [INSERT ANNEXURE X] placeholders)';

  const issuesBlock = Array.isArray(issues)
    ? issues.map((k, i) => `   ${i + 1}. ${k}`).join('\n')
    : `   ${issues}`;

  const docsDemandedBlock = docsDemanded.length > 0
    ? docsDemanded.map(d => `   • ${d}`).join('\n')
    : '   [None specified or not extracted]';

  return `${IT_EXPERT_SYSTEM}

═══════════════════════════════════════════════════════════════
NOTICE/ORDER DETAILS
═══════════════════════════════════════════════════════════════
Assessee         : ${taxpayer}
PAN              : ${pan}
Assessment Year  : ${ay}
Section          : ${section}
Notice/Order Type: ${noticeType}
Date of Notice   : ${issueDate}
Reply Due Date   : ${dueDate}
Demand Amount    : ₹${Number(demand).toLocaleString('en-IN') || 0}
Assessing Officer: ${aoName}
Ward/Circle      : ${aoWard}
${hearingDate ? `Hearing Date     : ${hearingDate}` : ''}
${vcDate ? `Video Conf. Date : ${vcDate}` : ''}

ISSUES/GROUNDS BY DEPARTMENT:
${issuesBlock}

DOCUMENTS DEMANDED BY OFFICER:
${docsDemandedBlock}

SUPPORTING DOCUMENTS AVAILABLE:
${docsBlock}

${specialInstructions ? `SPECIAL INSTRUCTIONS FROM CA:\n${specialInstructions}\n` : ''}

═══════════════════════════════════════════════════════════════
TASK: Draft a complete formal reply / submission
═══════════════════════════════════════════════════════════════

Draft a COMPLETE, UNIQUE, department-ready reply for this ${section} notice.

Requirements:
1. Salutation: "To, The Assessing Officer, [Ward/Circle], [City]" 
2. Subject line: "Reply to ${noticeType} under Section ${section} — PAN: ${pan} — AY: ${ay}"
3. In SECTION II (Legal Submissions):
   a. Cite exact sections of Income Tax Act 1961 most relevant to this case
   b. Reference CBDT Circulars and Instructions (real; if uncertain, add [VERIFY CIRCULAR NO.])
   c. Reference 2-3 ITAT/High Court/SC judgments most favourable to assessee. ALWAYS add [REQUIRES INDEPENDENT VERIFICATION — CONFIRM AUTHORITY AND CITATION BEFORE FILING]
   d. If penalty notice u/s 270A/271 — raise mens rea defense and bona fide belief arguments
   e. If reassessment u/s 148 — challenge jurisdiction and escapement of income
   f. If scrutiny u/s 143(2) — address each specific query point-by-point
4. In SECTION III:
   a. Reconciliation table matching income per ITR vs. AO's computation
   b. List all Annexures (A, B, C...)
   c. Flag documents still to be obtained
5. In SECTION IV (Prayer): specific relief (drop / reduce / no penalty / allow appeal / grant stay)
6. In SECTION V (CA Checklist): 5-8 action items before filing

Generate the complete expert reply now:`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    });

    const prompt = buildITPrompt(body);
    const result = await model.generateContent([{ text: prompt }]);
    const draft = result.response.text();

    return Response.json({ draft, source: 'TaxGuard AI IT Drafting Engine V2' });
  } catch (err) {
    console.error('[IT-Draft V2] Error:', err);
    const msg = err.message || '';
    let errorMessage = 'Failed to generate IT draft.';
    if (msg.includes('429') || msg.includes('quota')) {
      errorMessage = 'AI rate limit reached. Please wait 30 seconds and try again.';
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

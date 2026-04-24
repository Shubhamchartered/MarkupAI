/**
 * /api/draft/route.js — GST Litigation Reply Drafting Engine V2
 * 
 * Model: gemini-2.0-flash
 * Profile: 25-year Senior CA + GST Litigator
 * 
 * Behavior:
 * - Reads ALL uploaded notice + document context
 * - Auto-classifies notice type from OCR data (no manual category needed)
 * - Generates 4-section formal reply (Facts → Law → Reconciliation → Prayer)
 * - Cites real sections of CGST Act 2017, CGST Rules 2017
 * - References real CBIC Circulars by number where applicable
 * - References relevant judicial decisions with [REQUIRES INDEPENDENT VERIFICATION]
 * - Never invents amounts, dates, or case laws
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const EXPERT_SYSTEM_PROMPT = `You are a Senior Chartered Accountant and GST Litigation Expert with 25 years of active practice before:
- GST Adjudicating Authorities (AO level)
- Appellate Authorities (Commissioner Appeals)
- GST Appellate Tribunal (GSTAT)
- High Courts and Supreme Court of India

Your drafts are known for:
1. Surgical precision in facts — you NEVER state anything not supported by the documents
2. Deep mastery of CGST Act 2017, IGST Act, CGST Rules 2017, GST Council decisions
3. Strategic use of CBIC Circulars, Notifications, and clarifications
4. Strong citation of relevant judicial precedents (you ALWAYS flag these as [REQUIRES INDEPENDENT VERIFICATION - CONFIRM BEFORE FILING])
5. Respectful but firm tone — you never concede anything without exhausting legal remedies

ABSOLUTE RULES — NEVER VIOLATE:
- NEVER invent facts, amounts, dates, or names not found in the uploaded documents
- NEVER cite a case law without flagging [REQUIRES INDEPENDENT VERIFICATION]
- NEVER suggest paying tax without exhausting all legal remedies first
- NEVER use vague language — every sentence must have a purpose
- MARK anything uncertain as [TO BE VERIFIED BY CA]
- If information is missing, use [INSERT ___] placeholders

STRUCTURE (mandatory, 4 sections):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION I — STATEMENT OF FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION II — LEGAL SUBMISSIONS  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION III — RECONCILIATION & DOCUMENT LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION IV — PRAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION V — CA REVIEW CHECKLIST (action items before filing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

function buildPrompt({ extractedData, supportingDocs, specialInstructions }) {
  const notice = extractedData || {};
  const docs = supportingDocs || [];

  const noticeType = notice.notice_type || notice.noticeType || 'GST Notice';
  const section = notice.section || '—';
  const gstin = notice.gstin || '[GSTIN]';
  const tradeName = notice.legal_name || notice.trade_name || '[CLIENT NAME]';
  const noticeNo = notice.notice_reference_number || notice.number || '[NOTICE NO.]';
  const noticeDate = notice.date_of_notice || notice.issue_date || '[NOTICE DATE]';
  const dueDate = notice.reply_due_date || notice.due_date || '[DUE DATE]';
  const period = notice.tax_period || `${notice.period_from || '—'} to ${notice.period_to || '—'}`;
  const allegations = notice.allegations || '[ALLEGATIONS NOT EXTRACTED — REVIEW NOTICE]';
  const demandTotal = notice.total_demand || notice.amount || '0';
  const taxAmt = notice.tax_amount || '—';
  const interestAmt = notice.interest_amount || '—';
  const penaltyAmt = notice.penalty_amount || '—';
  const officer = notice.proper_officer_name || notice.jurisdiction || '[PROPER OFFICER NAME]';
  const state = notice.state || 'Maharashtra';
  const hearingDate = notice.hearing_date || notice.hearingDate || null;
  const keyIssues = notice.key_issues || [];
  const docsDemanded = notice.documents_demanded || [];

  const docsBlock = docs.length > 0
    ? docs.map((d, i) => `   ${i + 1}. ${d.name} — ${d.description || 'uploaded'}`).join('\n')
    : '   (No supporting documents uploaded — use [INSERT ANNEXURE] placeholders)';

  const keyIssuesBlock = keyIssues.length > 0
    ? keyIssues.map((k, i) => `   Issue ${i + 1}: ${k}`).join('\n')
    : '   [AUTO-DETECTED FROM NOTICE — VERIFY]';

  const docsDemandedBlock = docsDemanded.length > 0
    ? docsDemanded.map(d => `   • ${d}`).join('\n')
    : '   [NONE SPECIFIED IN NOTICE]';

  return `${EXPERT_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════
NOTICE DETAILS (extracted by AI-OCR — verified before drafting)
═══════════════════════════════════════════════════════════════
Notice Type       : ${noticeType}
Section / Form    : ${section}
GSTIN             : ${gstin}
Trade Name        : ${tradeName}
Notice Number     : ${noticeNo}
Date of Notice    : ${noticeDate}
Reply Due Date    : ${dueDate}
Tax Period        : ${period}
Demand (Total)    : ₹${demandTotal}
   └ Tax Amount   : ₹${taxAmt}
   └ Interest     : ₹${interestAmt}
   └ Penalty      : ₹${penaltyAmt}
Proper Officer    : ${officer}
State             : ${state}
${hearingDate ? `Hearing Date      : ${hearingDate}` : ''}

KEY ALLEGATIONS BY DEPARTMENT:
${allegations}

KEY ISSUES IDENTIFIED:
${keyIssuesBlock}

DOCUMENTS DEMANDED BY OFFICER:
${docsDemandedBlock}

DOCUMENTS AVAILABLE (uploaded by CA):
${docsBlock}

${specialInstructions ? `SPECIAL INSTRUCTIONS FROM CA:\n${specialInstructions}\n` : ''}

═══════════════════════════════════════════════════════════════
YOUR TASK: Draft the complete formal reply
═══════════════════════════════════════════════════════════════

Draft a COMPLETE, UNIQUE, department-ready reply to this ${section} notice.

Requirements:
1. Use full formal salutation (To, The Proper Officer, GST Department — ${state})
2. Subject line: "Reply to ${noticeType} No. ${noticeNo} dated ${noticeDate} — GSTIN: ${gstin}"
3. In SECTION II (Legal Submissions):
   a. Cite specific sections of CGST Act 2017 / IGST Act 2017 most relevant to this case
   b. Reference 2-3 relevant CBIC Circulars (real ones; if you're uncertain, note [VERIFY CIRCULAR NO.])
   c. Reference 2-3 judicial precedents from GSTAT / High Court / Supreme Court that are most helpful. ALWAYS add [REQUIRES INDEPENDENT VERIFICATION — CONFIRM AUTHORITY AND CITATION BEFORE FILING]
4. In SECTION III:
   a. Create a specific reconciliation table for the demand amounts
   b. List each uploaded document as Annexure A, B, C...
   c. List documents still to be obtained
5. In SECTION IV (Prayer):
   a. Be specific — pray for exact relief (drop proceedings / reduce demand / no penalty / personal hearing)
6. In SECTION V (CA Review Checklist):
   a. List 5-8 specific actions the CA must take before filing this reply
   b. Flag any amount or date needing verification
   c. Point out the strongest and weakest arguments

Generate the complete draft now. Make it unique and tailored to THIS specific case:`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    });

    const prompt = buildPrompt(body);
    const result = await model.generateContent([{ text: prompt }]);
    const draft = result.response.text();

    return Response.json({ draft });

  } catch (error) {
    console.error("[Draft V2] Error:", error);
    const msg = error.message || "";
    let errorMessage = "Failed to generate draft.";
    if (msg.includes("429") || msg.includes("quota")) {
      errorMessage = "AI rate limit reached. Please wait 30 seconds and try again.";
    } else if (msg.includes("API key")) {
      errorMessage = "Gemini API key is invalid. Check .env.local.";
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

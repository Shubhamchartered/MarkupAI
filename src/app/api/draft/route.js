import { GoogleGenerativeAI } from "@google/generative-ai";

const DRAFT_SYSTEM = `You are MARKUP.AI — India's most experienced GST litigation drafting expert with 25+ years of practice before GST Appellate Authorities, High Courts, and the Supreme Court.

CRITICAL RULES:
1. Every draft you produce MUST be UNIQUE — never use the same language twice. Vary sentence structure, arguments, and phrasing each time.
2. Use formal, respectful departmental drafting language used in Indian tax practice.
3. NEVER invent facts, challans, dates, amounts, or legal submissions. Use ONLY what is provided.
4. Use [PLACEHOLDER] for any missing data.
5. Structure: Subject → Reference → Background → Point-wise Reply → Legal Submissions → Annexures → Prayer
6. Always begin the reply body with: "The Noticee respectfully submits as under:"
7. Include reconciliation tables where mismatch or demand is involved.
8. The prayer clause must be specific to the notice type and relief sought.
9. Mention all annexures clearly with proper numbering.
10. The draft must be ready for filing on the GST portal or as a PDF attachment.`;

export async function POST(request) {
  try {
    const { extractedData, category, supportingDocs, specialInstructions } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${DRAFT_SYSTEM}

NOTICE CATEGORY: ${category || "GST Notice"}

EXTRACTED NOTICE DATA:
${JSON.stringify(extractedData, null, 2)}

SUPPORTING DOCUMENTS UPLOADED BY CLIENT:
${supportingDocs && supportingDocs.length > 0 
  ? supportingDocs.map((d, i) => `${i+1}. ${d.name} — ${d.description || 'No description'}`).join('\n') 
  : 'No supporting documents uploaded yet. Use placeholders for annexure references.'}

${specialInstructions ? `SPECIAL INSTRUCTIONS FROM CA:\n${specialInstructions}\n` : ''}

TASK: Generate a COMPLETE, UNIQUE, department-ready reply draft for this notice. The draft should:

1. Be addressed to the proper officer/authority mentioned in the notice
2. Have a proper subject line with notice reference, GSTIN, period
3. Include complete identification details
4. Provide point-wise rebuttal to EVERY allegation in the notice
5. Include reconciliation tables if there is any mismatch or demand
6. Reference all supporting documents as numbered annexures
7. Include strong but respectful legal submissions citing relevant sections, rules, and judicial precedents
8. End with a specific prayer clause seeking appropriate relief
9. Include a CONSULTANT REVIEW NOTES section at the end with actionable items for the CA

IMPORTANT: Make this draft UNIQUE. Use different sentence structures and arguments than you would typically use. The draft should feel like it was written by a senior advocate specifically for THIS case.

Generate the complete draft now:`;

    const result = await model.generateContent([{ text: prompt }]);
    const draft = result.response.text();

    return Response.json({ draft });

  } catch (error) {
    console.error("[Draft] Error:", error);
    
    let errorMessage = "Failed to generate draft.";
    const msg = error.message || "";
    if (msg.includes("429") || msg.includes("quota")) {
      errorMessage = "AI rate limit reached. Please wait 30 seconds and try again.";
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

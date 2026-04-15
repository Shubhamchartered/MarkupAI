import { GoogleGenerativeAI } from "@google/generative-ai";

const EXTRACTION_PROMPT = `You are a senior GST notice data extraction specialist. Analyse the uploaded notice document and extract ALL available information in the following JSON format. Be extremely precise — extract exact values from the document. If a field is not found, use null.

Return ONLY valid JSON, no markdown, no backticks, no explanation before or after:

{
  "notice_type": "string — e.g. SCN, ASMT-10, DRC-01, REG-17, GSTR-3A, MOV-07, RFD-08 etc.",
  "notice_category": "string — e.g. Demand & Show Cause, Scrutiny, Registration, Return Non-Filing, ITC Related, Refund, E-Way Bill, Recovery, Appeal etc.",
  "section": "string — e.g. Section 73, Section 74, Section 61 etc.",
  "rule": "string — e.g. Rule 142, Rule 99 etc. or null",
  "form": "string — e.g. DRC-01, ASMT-10, REG-17 etc.",
  "gstin": "string — 15-digit GSTIN",
  "legal_name": "string — registered legal name",
  "trade_name": "string or null",
  "notice_reference_number": "string — notice/order reference number",
  "din_reference": "string — DIN number if available, else null",
  "date_of_notice": "string — DD/MM/YYYY format",
  "reply_due_date": "string — DD/MM/YYYY format or null",
  "tax_period": "string — e.g. April 2023 to March 2024",
  "financial_year": "string — e.g. 2023-24",
  "jurisdiction": "string — officer name, ward, division, state",
  "proper_officer_name": "string or null",
  "tax_amount": "string — amount in INR or null",
  "interest_amount": "string or null",
  "penalty_amount": "string or null",
  "late_fee_amount": "string or null",
  "total_demand": "string — total demand amount or null",
  "allegations": "string — detailed summary of what the department is alleging",
  "key_issues": ["array of strings — each key issue/discrepancy mentioned"],
  "documents_demanded": ["array of strings — documents/information demanded by the officer"],
  "hearing_date": "string — DD/MM/YYYY or null",
  "hearing_time": "string or null",
  "hearing_venue": "string or null",
  "risk_level": "string — critical/high/medium/low based on notice severity",
  "urgency": "string — immediate/urgent/normal based on due dates",
  "raw_text": "string — full text of the notice as extracted"
}`;

const BRIEF_PROMPT = `You are MARKUP.AI, a senior GST advisory expert. Based on the extracted notice data below, provide a comprehensive brief for the Chartered Accountant. Include:

1. **NOTICE SUMMARY** — What this notice is about in 2-3 sentences
2. **RISK ASSESSMENT** — How serious this notice is and why
3. **KEY DEADLINES** — Reply due date, hearing date, limitation period
4. **DEPARTMENT'S POSITION** — What the department is alleging
5. **IMMEDIATE ACTION ITEMS** — What the CA must do right now (numbered list)
6. **DOCUMENTS NEEDED FOR REPLY** — Specific documents that should be gathered to prepare the reply
7. **LEGAL STRATEGY NOTES** — Key legal points to consider in the reply
8. **RELEVANT SECTIONS & CASE LAW** — Applicable sections, rules, and any landmark judgments

Write in professional but accessible language. Use **bold** for important items. This brief should help the CA understand the notice completely and prepare for the reply.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const action = formData.get("action") || "extract"; // extract | brief
    const extractedData = formData.get("extractedData"); // for brief action

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Action: Generate brief from already-extracted data
    if (action === "brief" && extractedData) {
      const result = await model.generateContent([
        { text: BRIEF_PROMPT + "\n\nEXTRACTED NOTICE DATA:\n" + extractedData }
      ]);
      return Response.json({ brief: result.response.text() });
    }

    // Action: Extract data from uploaded file using vision
    if (!file) {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Determine MIME type
    const fileName = file.name.toLowerCase();
    let mimeType = "image/jpeg";
    if (fileName.endsWith(".png")) mimeType = "image/png";
    else if (fileName.endsWith(".webp")) mimeType = "image/webp";
    else if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
    else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (fileName.endsWith(".gif")) mimeType = "image/gif";
    else if (fileName.endsWith(".bmp")) mimeType = "image/bmp";
    else if (fileName.endsWith(".tiff") || fileName.endsWith(".tif")) mimeType = "image/tiff";

    console.log(`[OCR] Processing: ${file.name} (${mimeType}, ${bytes.byteLength} bytes)`);

    const result = await model.generateContent([
      { text: EXTRACTION_PROMPT },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);

    const responseText = result.response.text();
    console.log(`[OCR] Raw response length: ${responseText.length}`);

    // Parse JSON from response — handle potential markdown wrapping
    let extracted;
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseErr) {
      console.error("[OCR] JSON parse error:", parseErr.message);
      // Return raw text if JSON parsing fails
      return Response.json({
        extracted: {
          raw_text: responseText,
          notice_type: "Unable to parse — review raw text",
          allegations: responseText.substring(0, 500),
        },
        parseError: true,
      });
    }

    return Response.json({ extracted });
  } catch (error) {
    console.error("[OCR] Error:", error);

    let errorMessage = "Failed to process document.";
    const msg = error.message || "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      errorMessage = "AI rate limit reached. Please wait 30 seconds and try again.";
    } else if (msg.includes("SAFETY")) {
      errorMessage = "Document was blocked by safety filters. Try a clearer scan.";
    } else if (msg.includes("too large") || msg.includes("size")) {
      errorMessage = "File too large. Please upload a file under 10MB.";
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}

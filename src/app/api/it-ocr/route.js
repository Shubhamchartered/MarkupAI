import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EXTRACT_PROMPT = `You are an expert Indian Income Tax notice parser.
Extract the following structured fields from the uploaded document(s).
Return ONLY valid JSON with the exact keys listed below.

{
  "taxpayer": "Full name of the taxpayer",
  "pan": "PAN number (10 chars, uppercase)",
  "section": "Section number e.g. 143(2), 148A, 270A, 153A",
  "ay": "Assessment Year e.g. 2024-25",
  "demandAmount": 0,
  "dueDate": "YYYY-MM-DD format",
  "aoName": "Assessing Officer name",
  "aoDesignation": "AO designation e.g. ITO Ward 5(2)",
  "issuesRaised": "Brief description of issues raised in the notice",
  "noticeType": "Type of notice e.g. Scrutiny Notice, Reassessment Notice",
  "dateIssued": "YYYY-MM-DD format",
  "crossActFlags": []
}

If a field is not found, use null for strings/numbers. Be precise with PAN and section numbers.`;

export async function POST(req) {
  try {
    const { files } = await req.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build parts — text prompt + all images/docs
    const parts = [{ text: EXTRACT_PROMPT }];

    for (const file of files) {
      // PDFs and images supported via inline_data
      const mimeType = file.type || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: file.base64,
        },
      });
    }

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let extracted;
    try {
      extracted = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to find JSON in the response
      const match = jsonStr.match(/\{[\s\S]*\}/);
      extracted = match ? JSON.parse(match[0]) : null;
    }

    if (!extracted) {
      return NextResponse.json({ error: 'Could not parse extraction result', raw: text }, { status: 422 });
    }

    return NextResponse.json({ success: true, extracted });
  } catch (err) {
    console.error('[it-ocr] Error:', err);
    return NextResponse.json({ error: err.message || 'OCR extraction failed' }, { status: 500 });
  }
}

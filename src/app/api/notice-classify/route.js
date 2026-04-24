import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLIENT_DATA } from "@/data/client_data";

const CLASSIFY_PROMPT = `You are a GST notice classification expert. Analyse the attached document and extract the following information in valid JSON format ONLY. Do not include any text outside the JSON.

Return this exact JSON structure:
{
  "clientName": "Legal name of the taxpayer/noticee as mentioned in the notice",
  "gstin": "15-character GSTIN if present, else empty string",
  "noticeId": "Notice number or reference number (DRC-01/ASMT-10/REG-17 etc)",
  "noticeType": "Type of notice (e.g. DRC-01, ASMT-10, REG-17, Summons etc)",
  "section": "GST section invoked (e.g. 73, 74, 61, 29 etc)",
  "issueDate": "Date the notice was issued in DD/MM/YYYY format",
  "dueDate": "Reply due date in DD/MM/YYYY format (look for 'reply by', 'due date', 'within X days' etc)",
  "demandAmount": "Demand amount as a number (no commas or currency symbols), or 0 if not mentioned",
  "issuingAuthority": "Name/designation of the issuing officer",
  "period": "Tax period mentioned (e.g. April 2022 to March 2023)",
  "facts": "Key facts/grounds mentioned in the notice in 2-3 sentences",
  "status": "Open"
}

If any field cannot be determined, use an empty string for text fields and 0 for numbers.
IMPORTANT: Return ONLY the JSON object, nothing else.`;

function findMatchingClient(extractedName, extractedGstin) {
  if (!extractedGstin && !extractedName) return null;

  // Try GSTIN match first (most reliable)
  if (extractedGstin && extractedGstin.length === 15) {
    const byGstin = CLIENT_DATA.find(
      (c) => c.gstn && c.gstn.toLowerCase() === extractedGstin.toLowerCase()
    );
    if (byGstin) return byGstin;
  }

  // Try name match (case-insensitive, partial)
  if (extractedName) {
    const cleanName = extractedName.toLowerCase().replace(/m\/s\s*/i, "").trim();
    const byName = CLIENT_DATA.find((c) => {
      const clientName = (c.userName || "").toLowerCase().replace(/m\/s\s*/i, "").trim();
      return clientName.includes(cleanName) || cleanName.includes(clientName);
    });
    if (byName) return byName;
  }

  return null;
}

export async function POST(request) {
  try {
    const { file } = await request.json();

    if (!file || !file.base64) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

    let extracted = null;
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`[NoticeClassify] Trying ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          CLASSIFY_PROMPT,
          {
            inlineData: {
              mimeType: file.type || "application/pdf",
              data: file.base64,
            },
          },
        ]);

        const raw = result.response.text().trim();

        // Parse JSON — strip markdown fences if present
        const jsonStr = raw
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        extracted = JSON.parse(jsonStr);
        console.log(`[NoticeClassify] ✅ Success with ${modelName}`);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`[NoticeClassify] ❌ ${modelName}: ${err.message?.substring(0, 80)}`);
        continue;
      }
    }

    if (!extracted) {
      // Fallback: return a basic structure with filename-derived info
      console.warn("[NoticeClassify] All models failed, using fallback:", lastError?.message);
      extracted = {
        clientName: file.name.replace(/\.(pdf|docx?|xlsx?|png|jpe?g|webp)$/i, ""),
        gstin: "",
        noticeId: `UPL-${Math.floor(Math.random() * 9000) + 1000}`,
        noticeType: "GST Notice",
        section: "",
        issueDate: new Date().toLocaleDateString("en-GB"),
        dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB"),
        demandAmount: 0,
        issuingAuthority: "",
        period: "",
        facts: "Notice details could not be automatically extracted. Please review and fill in manually.",
        status: "Open",
      };
    }

    // Match to existing client
    const matchedClient = findMatchingClient(extracted.clientName, extracted.gstin);

    return Response.json({
      extracted,
      matchedClient: matchedClient
        ? { userName: matchedClient.userName, userId: matchedClient.userId, gstn: matchedClient.gstn }
        : null,
    });
  } catch (error) {
    console.error("[NoticeClassify] Fatal error:", error);
    return Response.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}

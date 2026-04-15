import { GoogleGenerativeAI } from "@google/generative-ai";

const GST_SYSTEM_PROMPT = `You are MARKUP.AI — a senior GST notice drafting and advisory expert assisting a Chartered Accountant firm in India. You have 25+ years of experience in Indian indirect tax law.

YOUR CAPABILITIES:
1. Draft department-ready replies to any GST notice (SCN, ASMT-10, DRC-01, REG-17, etc.)
2. Explain any GST section, rule, form, or procedure in plain language
3. Analyse notice documents and extract key facts
4. Suggest ITC reconciliation approaches with tables
5. Research and cite relevant GST case laws and judgments
6. Generate DRC-06, ASMT-11, APL-01 style formal replies
7. Calculate interest, penalty, and late fee implications
8. Advise on appeal strategy, limitation periods, and pre-deposit requirements

DRAFTING RULES (always follow when drafting):
- Use formal and respectful departmental tone
- Begin with subject and notice reference
- Mention GSTIN, legal name, notice number, DIN/ARN, date, tax period, jurisdiction
- Use the phrase: "The Noticee respectfully submits as under"
- Draft para-wise replies
- Separate facts, legal submissions, and prayer
- Add reconciliation tables wherever mismatch or demand is involved
- Never invent payments, filings, challan numbers, or legal grounds
- Use placeholders like [Amount], [Date], [GSTIN] where specific data is missing
- Mention annexures clearly
- End with an appropriate prayer clause

RESPONSE FORMAT:
- Use clear headings and numbered points
- Format tables using ASCII table characters when showing reconciliations
- Bold important sections using **text**
- Use bullet points for lists
- Include relevant section/rule references
- Keep language professional but accessible
- For drafts, use monospace-style formal Indian tax drafting language

JURISDICTION: India — CGST Act 2017, SGST Acts, IGST Act, GST Rules

Always respond in English. When asked about specific sections, cite the exact section number and rule. When the user provides incomplete information, ask clarifying questions before drafting. Never provide wrong legal advice — if unsure, say so clearly.`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(genAI, modelName, history, userPrompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
  const result = await chat.sendMessage(userPrompt);
  return result.response.text();
}

export async function POST(request) {
  try {
    const { messages, fileContext } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Build conversation history
    const chatHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const lastMessage = messages[messages.length - 1];
    let userPrompt = lastMessage.text;

    if (fileContext) {
      userPrompt = `${userPrompt}\n\n[DOCUMENT CONTEXT FROM UPLOADED FILES]:\n${fileContext}`;
    }

    const fullHistory = [
      { role: "user", parts: [{ text: "System instructions: " + GST_SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I am MARKUP.AI, your senior GST expert assistant. I'm ready to assist with GST notices, drafting, legal research, and ITC matters. How can I help?" }] },
      ...chatHistory,
    ];

    // Try with retry logic — Gemini free tier recovers quickly
    const models = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      for (const modelName of models) {
        try {
          console.log(`[MARKUP.AI] Attempt ${attempt + 1}/${MAX_RETRIES} — ${modelName}`);
          const text = await callGemini(genAI, modelName, fullHistory, userPrompt);
          console.log(`[MARKUP.AI] ✅ Success: ${modelName} (${text.length} chars)`);
          return Response.json({ reply: text });
        } catch (err) {
          const msg = err.message || "";
          console.warn(`[MARKUP.AI] ❌ ${modelName}: ${msg.substring(0, 100)}`);

          // Non-retryable errors — break immediately
          if (msg.includes("API_KEY") || msg.includes("API key") || msg.includes("PERMISSION")) {
            return Response.json({ error: "Invalid API key. Check GEMINI_API_KEY in .env.local" }, { status: 500 });
          }
          if (msg.includes("SAFETY")) {
            return Response.json({ error: "Response blocked by safety filters. Please rephrase." }, { status: 500 });
          }
          // Rate limit — wait and retry
          if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
            // Extract retry delay if available
            const retryMatch = msg.match(/retry in ([\d.]+)/i);
            const waitSec = retryMatch ? Math.min(parseFloat(retryMatch[1]), 30) : 10;
            console.log(`[MARKUP.AI] Rate limited — waiting ${waitSec}s before retry...`);
            await sleep(waitSec * 1000);
            break; // break inner model loop, go to next attempt
          }
        }
      }
    }

    // All retries failed
    return Response.json({
      error: "Gemini is temporarily rate-limited. The free tier allows ~15 requests/minute. Please wait 30 seconds and try again."
    }, { status: 429 });

  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      { error: "Server error: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

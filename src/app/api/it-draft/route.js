import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are TaxGuard AI — a professional Income Tax litigation drafting assistant for Indian CAs and Tax Advocates.

You generate formal, department-ready replies to Income Tax notices under the Income Tax Act, 1961 and IT Act 2025.

FORMAT REQUIREMENTS:
1. Use formal legal reply format: Subject → Facts → Legal Submissions → Prayer
2. Address to the specific AO/Authority
3. Cite sections, rules, circulars, and case laws with full citations
4. Include [DOCUMENT PENDING] markers where client documents are needed
5. Include [REQUIRES LEGAL VERIFICATION] for uncertain legal positions
6. Use proper legal terminology (Assessee, Respondent, Hon'ble, etc.)
7. Include annexure list at the end
8. Keep submissions numbered and organized

NOTICE TYPES YOU HANDLE:
- 143(1) Intimation replies / rectification
- 143(2) Scrutiny assessment replies
- 148A / 148 Reassessment challenge
- 139(9) Defective return response
- 270A / 271 Penalty replies
- 263 / 264 Revision replies
- 156 Demand notice responses
- 153A Search assessment replies
- Form 35 (CIT(A) appeal grounds)
- Form 36 (ITAT appeal grounds)
- Stay applications
- Condonation applications
- Adjournment petitions

RULES:
- Never invent facts — use placeholders
- Always flag legal positions that need verification
- Maintain professional CA/Advocate tone
- Cross-reference FEMA, PMLA, Benami Act where relevant`;

export async function POST(request) {
  try {
    const { noticeData, draftType, additionalContext } = await request.json();

    if (!noticeData) {
      return Response.json({ error: 'Notice data is required.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'API key not configured.' }, { status: 500 });
    }

    const prompt = `${SYSTEM_PROMPT}

NOTICE DETAILS:
- Taxpayer: ${noticeData.taxpayer || '[NAME]'}
- PAN: ${noticeData.pan || '[PAN]'}
- Assessment Year: ${noticeData.ay || '[AY]'}
- Section: ${noticeData.section || '[SECTION]'}
- Notice Type: ${noticeData.type || '[TYPE]'}
- Date Issued: ${noticeData.dateIssued || '[DATE]'}
- Due Date: ${noticeData.dueDate || '[DUE DATE]'}
- AO: ${noticeData.aoName || '[AO NAME]'}, ${noticeData.aoDesignation || '[DESIGNATION]'}
- Issues Raised: ${noticeData.issuesRaised || '[ISSUES]'}
- Demand Amount: ${noticeData.demandAmount ? '₹' + Number(noticeData.demandAmount).toLocaleString('en-IN') : '[AMOUNT]'}

DRAFT TYPE: ${draftType || 'Formal Reply'}
${additionalContext ? 'ADDITIONAL CONTEXT: ' + additionalContext : ''}

Generate a complete, professional ${draftType || 'reply'} for this notice. Use the formal legal format with numbered paragraphs.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
      ],
    });

    const response = result.response;
    const draft = response.text();

    return Response.json({ draft, source: 'TaxGuard AI Drafting Engine' });
  } catch (err) {
    console.error('IT Draft API error:', err);
    return Response.json(
      { error: 'Failed to generate draft: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

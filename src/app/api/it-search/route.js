import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are TaxGuard AI — an expert Income Tax legal search engine for Indian tax professionals (CAs, Tax Advocates).

SCOPE: Income Tax Act 1961, Income Tax Act 2025, IT Rules 1962, CBDT Circulars (1961-present), Finance Acts, Supreme Court / High Court / ITAT judgments, Faceless Assessment Scheme.

RULES:
1. Always cite specific section numbers, rule numbers, and circular references
2. For case laws, provide: Case Name, Year, Citation (ITR/Taxman/SCC), Court
3. When IT Act 2025 overrides IT Act 1961, highlight the conflict clearly
4. Mark any uncertain or unverified references with [VERIFY]
5. Provide practical advice a CA can use directly
6. Structure responses with clear headings and numbered points
7. For drafting assistance, follow the formal reply format: Facts → Legal Submissions → Prayer
8. Cross-reference FEMA, PMLA, Benami Act, Black Money Act when relevant

TONE: Professional, authoritative, precise. You are assisting a CA/Advocate in their professional capacity.`;

export async function POST(request) {
  try {
    const { query, filters } = await request.json();

    if (!query || !query.trim()) {
      return Response.json({ error: 'Search query is required.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'API key not configured.' }, { status: 500 });
    }

    const filterContext = filters
      ? `\nFilters applied: ${filters.act ? 'Act: ' + filters.act : ''} ${filters.section ? 'Section: ' + filters.section : ''} ${filters.ay ? 'AY: ' + filters.ay : ''} ${filters.court ? 'Court: ' + filters.court : ''}`
      : '';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT + filterContext + '\n\nUser Query: ' + query }] },
      ],
    });

    const response = result.response;
    const reply = response.text();

    return Response.json({ reply, source: 'TaxGuard AI Legal Search' });
  } catch (err) {
    console.error('IT Search API error:', err);
    return Response.json(
      { error: 'Failed to process search query: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

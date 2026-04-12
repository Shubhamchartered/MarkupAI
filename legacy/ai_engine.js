/* ═══════════════════════════════════════════════════════════════════
   ai_engine.js — MARKUP GST Pro
   GST Intelligence Engine — Vanilla JS Port
   Chat + Law Search | Powered by Anthropic Claude API

   SETUP: Enter your Anthropic API key in the AI Engine settings
          (⚙ icon in the AI Engine view header).
   ═══════════════════════════════════════════════════════════════════ */

const GSTAIEngine = (function () {
  'use strict';

  /* ── System Prompt ───────────────────────────────────── */
  const SYSTEM_PROMPT = `You are an expert GST litigation research and drafting assistant for chartered accountants in India.

You have deep knowledge of:
- CGST Act, 2017 and CGST Rules, 2017
- State GST Acts and IGST Act
- CBIC Circulars, Notifications, and Press Releases
- GST notice types: ASMT-10, DRC-01, DRC-01A, GSTR-3A, SCN, Audit notices, Summons
- ITC provisions under Section 16, 17, 18
- GST return filing: GSTR-1, GSTR-3B, GSTR-2B, GSTR-9, GSTR-9C
- Common notice issues: GSTR-1 vs 3B mismatch, inadmissible ITC, supplier authenticity, e-way bill violations

RESPONSE MODES — detect intent from the query:

1. RESEARCH MODE (if user asks about law, sections, circulars, case law, interpretations):
   - Explain the legal provision clearly
   - State departmental position vs taxpayer defenses
   - List relevant CBIC Circulars and Notifications
   - Give risk assessment: LOW / MEDIUM / HIGH
   - Recommend draft strategy

2. DRAFT MODE (if user asks to draft/write/prepare a reply or notice):
   - Generate a formal Indian tax-reply in this structure:
     Subject | Reference | Preliminary Submission | Brief Facts | Issue-wise Reply | Legal Submissions | Reconciliation Table (if mismatch) | Annexure List | Prayer | [INTERNAL NOTE]
   - Use formal language: "It is humbly submitted that..."
   - Cite sections precisely: "Section 16(2)(b) of the CGST Act, 2017"
   - Mark missing info as: [INSERT DETAILS]
   - Mark uncertain law as: [REQUIRES LEGAL VERIFICATION]

3. EXPLAIN MODE (if user asks what something means or how something works):
   - Plain language first, then formal legal explanation
   - Give practical examples relevant to Indian GST

4. CHECKLIST MODE (if user asks what documents are needed):
   - Give a structured checklist
   - Separate: Documents Available vs Documents to Collect

RULES:
- Never invent facts, GSTINs, amounts, or citations
- Use Indian number format: ₹ X,XX,XXX
- Use DD.MM.YYYY for dates
- Always end research responses with a recommended next action
- Keep drafts department-ready, not conversational
- If query is vague, ask one clarifying question before proceeding`;

  const SEARCH_SYSTEM = `You are a GST law search engine. For the given query, return a JSON array of 4-5 relevant results. Each result has: title (string), section (string — e.g. "Section 16(4), CGST Act"), summary (string, 2 sentences max), type (one of: "Section" | "Circular" | "Notification" | "Case Law" | "Rule"), relevance ("High" | "Medium"). Return ONLY valid JSON array, no markdown fences, no explanation.`;

  /* ── Quick Prompts ───────────────────────────────────── */
  const QUICK_PROMPTS = [
    { label: 'Draft ASMT-10 Reply',   icon: '✍️',  query: 'Draft a reply to ASMT-10 notice for GSTR-1 vs GSTR-3B mismatch of ₹2,50,000 for the period April 2023 to March 2024. Client has reconciliation explaining timing differences.' },
    { label: 'ITC Reversal Defense',  icon: '⚖️',  query: 'Research the legal defenses available for inadmissible ITC claim under Section 16(4) where the supplier filed returns late. What circulars support the taxpayer?' },
    { label: 'DRC-01 Response',       icon: '📋',  query: 'Draft a DRC-01 reply for a show cause notice alleging fake invoices from a suspended supplier. Client has e-way bills, bank payments, and physical delivery proof.' },
    { label: 'GSTR-2B Mismatch',      icon: '🔍',  query: 'Explain how to handle a GSTR-2B mismatch notice where ITC was claimed in GSTR-3B but not appearing in GSTR-2B due to supplier non-filing.' },
    { label: 'Reconciliation Table',  icon: '📊',  query: 'Prepare a reconciliation table format for GSTR-1 vs GSTR-3B output tax mismatch with columns for tax period, GSTR-1 amount, 3B amount, difference, and reason.' },
    { label: 'Summons Response',      icon: '🏛️', query: 'Draft a professional response to a summons under Section 70 of CGST Act for production of books of accounts and invoices.' },
  ];

  /* ── Mode config ─────────────────────────────────────── */
  const MODE_COLORS = {
    RESEARCH:  { bg:'#EEF2FF', text:'#3730A3', border:'#C7D2FE' },
    DRAFT:     { bg:'#F0FDF4', text:'#166534', border:'#BBF7D0' },
    EXPLAIN:   { bg:'#FFF7ED', text:'#9A3412', border:'#FED7AA' },
    CHECKLIST: { bg:'#F0F9FF', text:'#075985', border:'#BAE6FD' },
  };

  const TYPE_COLORS = {
    'Section':      { bg:'#EEF2FF', text:'#4338CA' },
    'Circular':     { bg:'#F0FDF4', text:'#15803D' },
    'Notification': { bg:'#FFF7ED', text:'#C2410C' },
    'Case Law':     { bg:'#FDF4FF', text:'#7E22CE' },
    'Rule':         { bg:'#F0F9FF', text:'#0369A1' },
  };

  /* ── State ───────────────────────────────────────────── */
  let messages      = [];
  let history       = [];
  let loading       = false;
  let currentMode   = 'chat';
  let searchResults = [];
  let searching     = false;

  /* ── Helpers ─────────────────────────────────────────── */
  function detectMode(text) {
    const t = text.toLowerCase();
    if (t.includes('draft') || t.includes('write') || t.includes('prepare') || t.includes('reply to')) return 'DRAFT';
    if (t.includes('checklist') || t.includes('documents needed') || t.includes('what documents')) return 'CHECKLIST';
    if (t.includes('explain') || t.includes('what is') || t.includes('what are') || t.includes('how does') || t.includes('meaning of')) return 'EXPLAIN';
    return 'RESEARCH';
  }

  function esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getApiKey()  { return localStorage.getItem('gst_ai_key') || ''; }
  function saveApiKey(k){ localStorage.setItem('gst_ai_key', k.trim()); }

  function toast(msg, dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  /* ── API Call (direct-browser Anthropic) ─────────────── */
  async function callClaude(msgs, system, maxTokens = 1800) {
    const key = getApiKey();
    if (!key) throw new Error('NO_API_KEY');

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: maxTokens,
        system,
        messages: msgs,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${resp.status}`);
    }
    const data = await resp.json();
    return data.content?.map(b => b.text || '').join('') || '';
  }

  /* ── Render messages ─────────────────────────────────── */
  function render() {
    const container = document.getElementById('aiMessages');
    if (!container) return;

    container.innerHTML = messages.map((msg, idx) => {
      const isUser  = msg.role === 'user';
      const isTyping = msg.content === '__typing__';
      const mode    = !isUser && msg.mode ? msg.mode : null;
      const mc      = mode ? MODE_COLORS[mode] : null;

      const modeTag = mc ? `<span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;padding:2px 8px;border-radius:4px;background:${mc.bg};color:${mc.text};border:1px solid ${mc.border};font-family:'Courier New',monospace;margin-bottom:4px;text-transform:uppercase">${mode} MODE</span><br>` : '';

      const bubbleContent = isTyping
        ? `<span class="ai-dots"><span></span><span></span><span></span></span>`
        : esc(msg.content).replace(/\n/g,'<br>');

      const copyBtn = (!isUser && !isTyping)
        ? `<button class="ai-copy-btn" onclick="GSTAIEngine.copyMsg(${idx})">⎘ Copy response</button>`
        : '';

      return `<div style="display:flex;flex-direction:${isUser?'row-reverse':'row'};align-items:flex-start;gap:10px;margin-bottom:20px;animation:aiIn .3s ease-out">
        <div style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:${isUser?'#6366F1':'#0F172A'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;font-family:'Courier New',monospace;letter-spacing:-.5px">${isUser?'CA':'AI'}</div>
        <div style="max-width:78%;display:flex;flex-direction:column;gap:2px">
          ${modeTag}
          <div style="background:${isUser?'#6366F1':'#fff'};color:${isUser?'#fff':'#1E293B'};border:${isUser?'none':'1px solid #E2E8F0'};border-radius:${isUser?'18px 18px 4px 18px':'18px 18px 18px 4px'};padding:12px 16px;font-size:14px;line-height:1.75;font-family:Georgia,serif;word-break:break-word;box-shadow:${isUser?'0 2px 8px rgba(99,102,241,.2)':'0 1px 4px rgba(0,0,0,.06)'}">${bubbleContent}</div>
          ${copyBtn}
        </div>
      </div>`;
    }).join('');

    // Scroll bottom
    document.getElementById('aiBottom')?.scrollIntoView({ behavior:'smooth' });

    // Quick prompts only on welcome screen
    const qp = document.getElementById('aiQuickPrompts');
    if (qp) qp.style.display = messages.length <= 1 ? 'block' : 'none';
  }

  /* ── Send Message ────────────────────────────────────── */
  async function send(text) {
    if (!text.trim() || loading) return;
    if (!getApiKey()) { showKeyModal(); return; }

    const mode  = detectMode(text);
    messages.push({ role:'user', content:text });
    messages.push({ role:'assistant', content:'__typing__', mode });
    loading = true;
    render();
    updateBtn();

    const inp = document.getElementById('aiChatInput');
    if (inp) { inp.value = ''; inp.style.height = 'auto'; }

    const newHist = [...history, { role:'user', content:text }];
    try {
      const reply = await callClaude(newHist, SYSTEM_PROMPT);
      messages[messages.length-1] = { role:'assistant', content:reply, mode };
      history = [...newHist, { role:'assistant', content:reply }];
    } catch(e) {
      const errText = e.message === 'NO_API_KEY'
        ? '⚙ Please configure your Anthropic API key using the ⚙ button above to activate the AI engine.'
        : `Connection error: ${e.message}. Please verify your API key and network connection.`;
      messages[messages.length-1] = { role:'assistant', content:errText, mode:'RESEARCH' };
    }
    loading = false;
    render();
    updateBtn();
  }

  /* ── Search Mode ─────────────────────────────────────── */
  async function doSearch(query) {
    if (!query.trim() || searching) return;
    if (!getApiKey()) { showKeyModal(); return; }

    searching = true;
    searchResults = [];
    renderSearch(query);

    try {
      const raw    = await callClaude([{ role:'user', content:`Search query: ${query}` }], SEARCH_SYSTEM, 900);
      const clean  = raw.replace(/```json|```/g,'').trim();
      searchResults = JSON.parse(clean);
    } catch(e) {
      searchResults = [{ title:'Search failed', section:'', summary:'Could not complete search. Check your API key and try again.', type:'Section', relevance:'Low' }];
    }
    searching = false;
    renderSearch(query);
  }

  function renderSearch(query) {
    const spinner = document.getElementById('aiSrchSpinner');
    const results = document.getElementById('aiSrchResults');
    if (!spinner || !results) return;
    spinner.style.display = searching ? 'flex' : 'none';

    if (!searching && searchResults.length > 0) {
      results.innerHTML = `
        <div style="font-size:11px;color:#94A3B8;font-family:'Courier New',monospace;margin-bottom:12px;letter-spacing:.05em">${searchResults.length} RESULTS FOR "${esc(query).toUpperCase()}"</div>
        ${searchResults.map((r, i) => {
          const tc = TYPE_COLORS[r.type] || TYPE_COLORS['Section'];
          return `<div class="ai-sr-card" onclick="GSTAIEngine.drillDown('${esc(r.title)}','${esc(r.section||'')}')">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px">
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:${tc.bg};color:${tc.text};font-family:'Courier New',monospace;letter-spacing:.04em">${esc(r.type)}</span>
                ${r.relevance==='High'?'<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:#F0FDF4;color:#15803D;font-family:\'Courier New\',monospace">HIGH RELEVANCE</span>':''}
              </div>
              <span style="font-size:11px;color:#CBD5E1;font-family:'Courier New',monospace;white-space:nowrap;flex-shrink:0">→ Ask AI</span>
            </div>
            <div style="font-size:15px;font-weight:600;color:#1E293B;font-family:Georgia,serif;margin-bottom:4px">${esc(r.title)}</div>
            ${r.section?`<div style="font-size:11px;color:#6366F1;font-family:'Courier New',monospace;margin-bottom:8px">${esc(r.section)}</div>`:''}
            <div style="font-size:13px;color:#64748B;font-family:Georgia,serif;line-height:1.65">${esc(r.summary)}</div>
          </div>`;
        }).join('')}
        <button class="ai-deepdive-btn" onclick="GSTAIEngine.deepDive('${esc(query)}')">⟡ Deep-dive analysis in Chat →</button>`;
    } else if (!searching) {
      results.innerHTML = '';
    }
  }

  /* ── Switch modes ────────────────────────────────────── */
  function switchMode(m) {
    currentMode = m;
    const chatPane  = document.getElementById('aiChatPane');
    const srchPane  = document.getElementById('aiSrchPane');
    const tabChat   = document.getElementById('aiTabChat');
    const tabSearch = document.getElementById('aiTabSearch');
    if (chatPane)  chatPane.style.display  = m === 'chat'   ? 'flex' : 'none';
    if (srchPane)  srchPane.style.display  = m === 'search' ? 'block' : 'none';
    if (tabChat)   { tabChat.style.background  = m==='chat'  ?'#6366F1':'transparent'; tabChat.style.color  = m==='chat'  ?'#fff':'#64748B'; }
    if (tabSearch) { tabSearch.style.background = m==='search'?'#6366F1':'transparent'; tabSearch.style.color = m==='search'?'#fff':'#64748B'; }
  }

  /* ── API Key Modal ───────────────────────────────────── */
  function showKeyModal() {
    const m = document.getElementById('aiKeyModal');
    if (m) {
      m.style.display = 'flex';
      const inp = document.getElementById('aiKeyInput');
      if (inp) inp.value = getApiKey();
    }
  }
  function hideKeyModal() {
    const m = document.getElementById('aiKeyModal');
    if (m) m.style.display = 'none';
  }
  function saveKey() {
    const val = document.getElementById('aiKeyInput')?.value.trim();
    if (!val) { toast('⚠ Please enter a valid API key'); return; }
    saveApiKey(val);
    hideKeyModal();
    updateBanner();
    toast('✅ API key saved — AI Engine is active!');
  }

  function updateBanner() {
    const b = document.getElementById('aiNoBanner');
    if (b) b.style.display = getApiKey() ? 'none' : 'flex';

    // Also update home widget banner
    const hb = document.getElementById('homeAiBanner');
    if (hb) hb.style.display = getApiKey() ? 'none' : 'flex';
  }

  /* ── UI helpers ──────────────────────────────────────── */
  function updateBtn() {
    const btn = document.getElementById('aiSendBtn');
    const inp = document.getElementById('aiChatInput');
    if (!btn) return;
    const dis = loading || !inp?.value.trim();
    btn.disabled = dis;
    btn.style.background = dis ? '#CBD5E1' : '#6366F1';
    btn.style.cursor     = dis ? 'not-allowed' : 'pointer';
  }

  /* ── Render quick prompts ────────────────────────────── */
  function renderQuickBtns(wrapperId) {
    const container = document.getElementById(wrapperId);
    if (!container) return;
    container.innerHTML = QUICK_PROMPTS.map(p =>
      `<button class="ai-qp-btn" onclick="GSTAIEngine.send(${JSON.stringify(p.query)})">
        <span style="font-size:15px">${p.icon}</span>${p.label}
      </button>`
    ).join('');
  }

  /* ── Public methods ──────────────────────────────────── */
  function copyMsg(idx) {
    const m = messages[idx];
    if (m) navigator.clipboard.writeText(m.content).then(() => toast('📋 Response copied'));
  }

  function drillDown(title, section) {
    switchMode('chat');
    const inp = document.getElementById('aiChatInput');
    if (inp) { inp.value = `Tell me more about: ${title}${section?' — '+section:''}`; updateBtn(); inp.focus(); }
  }

  function deepDive(query) {
    switchMode('chat');
    setTimeout(() => send(`Give me a comprehensive analysis of: ${query}`), 50);
  }

  function doSearchChip(chip) {
    const inp = document.getElementById('aiSrchInput');
    if (inp) inp.value = chip;
    doSearch(chip);
  }

  /* ── Init full AI view ───────────────────────────────── */
  function initView() {
    // Welcome message
    messages = [{
      role: 'assistant',
      content: 'Namaste. I\'m your GST Research & Drafting Assistant.\n\nAsk me to:\n• Research any GST legal issue, section, or circular\n• Draft replies to ASMT-10, DRC-01, SCN, Summons\n• Explain provisions in plain language\n• Build reconciliation tables and checklists\n\nOr pick a quick action below ↓',
      mode: null,
    }];
    history = [];
    render();
    renderQuickBtns('aiQPInner');
    updateBanner();

    // Chat input events
    const inp = document.getElementById('aiChatInput');
    if (inp) {
      inp.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        updateBtn();
      });
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(this.value); }
      });
    }

    document.getElementById('aiSendBtn')?.addEventListener('click', () => send(document.getElementById('aiChatInput')?.value || ''));
    document.getElementById('aiTabChat')?.addEventListener('click',   () => switchMode('chat'));
    document.getElementById('aiTabSearch')?.addEventListener('click', () => switchMode('search'));
    document.getElementById('aiSettingsBtn')?.addEventListener('click', showKeyModal);
    document.getElementById('aiKeySaveBtn')?.addEventListener('click', saveKey);
    document.getElementById('aiKeySkipBtn')?.addEventListener('click', hideKeyModal);
    document.getElementById('aiKeyModalClose')?.addEventListener('click', hideKeyModal);

    document.getElementById('aiSrchInput')?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSearch(this.value);
    });
    document.getElementById('aiSrchBtn')?.addEventListener('click', () => doSearch(document.getElementById('aiSrchInput')?.value || ''));

    // Show key modal on first load if no key set
    if (!getApiKey()) setTimeout(showKeyModal, 600);
  }

  /* ── Init dashboard home widget ──────────────────────── */
  function initHomeWidget() {
    renderQuickBtns('homeAiQP');
    updateBanner();

    const homeInp  = document.getElementById('homeAiInput');
    const homeSend = document.getElementById('homeAiSend');

    function sendFromHome() {
      const val = homeInp?.value.trim();
      if (!val) return;
      // Navigate to AI view then send
      const navAI = document.getElementById('nav-ai');
      if (navAI) navAI.click();
      setTimeout(() => send(val), 150);
    }

    homeInp?.addEventListener('keydown', e => { if (e.key === 'Enter') sendFromHome(); });
    homeSend?.addEventListener('click', sendFromHome);
    document.getElementById('homeAiOpenBtn')?.addEventListener('click', () => document.getElementById('nav-ai')?.click());
    document.getElementById('homeAiBannerSetup')?.addEventListener('click', showKeyModal);
  }

  /* ── Boot ────────────────────────────────────────────── */
  function init() {
    const ready = () => { initView(); initHomeWidget(); };
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', ready)
      : ready();
  }

  init();

  return { send, copyMsg, drillDown, deepDive, doSearchChip, showKeyModal };

})();

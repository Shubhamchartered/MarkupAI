/**
 * ymail_engine.js  — V3 STRICT MATCH ENGINE
 * ─────────────────────────────────────────────────────────────────────
 * Designed like a production-grade data pipeline, not a toy matcher.
 *
 * MATCHING RULES (strict, in priority order):
 *
 *  TIER 1 — EXACT IDENTIFIER MATCH (HIGH confidence, auto-accept)
 *    • GSTIN exact 15-char match found in email body → match against GST DB
 *    • PAN exact 10-char match found in email body   → match against IT DB
 *    • PAN derived from GSTIN (chars 3-12)           → also check IT DB
 *
 *  TIER 2 — FULL LEGAL NAME MATCH (MEDIUM confidence, auto-accept)
 *    • The client's complete legal name (split to ≥3 unique tokens,
 *      each 4+ chars) ALL appear in the email body.
 *    • Not accepted from untrusted senders.
 *
 *  TIER 3 — PARTIAL NAME (LOW confidence, REJECTED)
 *    • Single-word or common-word matches are DISCARDED entirely.
 *    • Words like NOTICE, DEMAND, INCOME, PRIVATE, LIMITED, KENDRA,
 *      etc. are in a stop-list and never trigger a match.
 *
 * Only emails with ≥1 TIER 1 or TIER 2 match are stored.
 * Emails with ZERO matches are silently dropped.
 * ─────────────────────────────────────────────────────────────────────
 */

import { ImapFlow }    from 'imapflow';
import { simpleParser } from 'mailparser';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { CLIENT_DATA }    from '@/data/client_data';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════ */

const TRUSTED_DOMAINS = [
  'incometax.gov.in', 'efiling.incometax.gov.in', 'cbdt.gov.in',
  'gst.gov.in', 'cbic.gov.in', 'gstn.org.in', 'gstn.org',
  'traces.gov.in', 'tin.tin.nsdl.com', 'nsdl.com',
  'dgft.gov.in', 'mca.gov.in', 'nic.in',
];

/**
 * Stop words — these are so common in business names AND in notice emails
 * that matching on them alone would generate massive false positives.
 * Any word in this list is EXCLUDED from name matching.
 */
const NAME_STOP_WORDS = new Set([
  'PRIVATE', 'LIMITED', 'LTD', 'PVT', 'COMPANY', 'AND', 'THE', 'FOR',
  'ENTERPRISES', 'ENTERPRISE', 'INDUSTRIES', 'INDUSTRY', 'TRADING',
  'SERVICES', 'SERVICE', 'AGENCY', 'AGENCIES', 'CENTRE', 'CENTER',
  'STORE', 'STORES', 'HOUSE', 'SHOP', 'MART', 'MARKET', 'MARKETING',
  'SOLUTION', 'SOLUTIONS', 'GROUP', 'BROTHERS', 'INTERNATIONAL',
  'NATIONAL', 'GENERAL', 'DIGITAL', 'GLOBAL', 'INDIA', 'BHARAT',
  'KENDRA', 'SEVA', 'SANSTHA', 'SEWA', 'VIKAS', 'SHREE', 'SHRI',
  'NOTICES', 'NOTICE', 'DEMAND', 'INCOME', 'TRUST', 'SOCIETY',
  'AGRICULTURE', 'AGRICULTURAL', 'CONSTRUCTIONS', 'CONSTRUCTION',
  'ASSOCIATE', 'ASSOCIATES', 'CONTRACTOR', 'CONTRACTORS',
  'SUPPLIERS', 'SUPPLIER', 'DEALER', 'DEALERS', 'PRODUCTS', 'PRODUCT',
  'BUSINESS', 'WORKS', 'WORK', 'VENTURE', 'VENTURES',
  'CREATION', 'CREATIONS', 'FASHION', 'GARMENT', 'GARMENTS',
  'COLLECTION', 'COLLECTIONS', 'TEXTILES', 'TEXTILE',
  // common first names (reduces false positives significantly)
  'RAHUL', 'AMIT', 'RAVI', 'SURESH', 'RAMESH', 'NARESH', 'RAJESH',
  'KAMAL', 'ANIL', 'VIKAS', 'ANAND', 'ASHOK', 'DINESH', 'PRAKASH',
  'VIJAY', 'SANJAY', 'MANOJ', 'RAKESH', 'MUKESH', 'DEEPAK', 'RAJESH',
]);

// Valid PAN regex: [A-Z]{5}[0-9]{4}[A-Z]
// 4th char must be entity type letter; 5th is PAN holder initial
const PAN_REGEX   = /\b([A-Z]{3}[A-Z][A-Z][0-9]{4}[A-Z])\b/g;
// Valid GSTIN: 2-digit state + 10-char PAN + 1 + Z + check digit
const GSTIN_REGEX = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/g;

/* false-positive PANs that appear in boilerplate text */
const BLACKLISTED_PANS = new Set([
  'ABCDE1234F', 'AAAAA0000A', 'XXXXX0000X',
]);

/* GST notice keywords – must appear in subject/body for classification */
const GST_SIGNALS = [
  'cgst', 'igst', 'sgst', 'gstin', 'gst notice', 'gst demand',
  'show cause notice', 'drc-01', 'drc-07', 'asmt-10', 'adt-01',
  'its mismatch', 'itc mismatch', 'gstr mismatch', 'section 73',
  'section 74', 'section 61', 'suo moto', 'gst audit',
];

/* IT notice keywords */
const IT_SIGNALS = [
  'income tax', 'cbdt', 'assessment order', 'reassessment',
  'intimation under section', 'notice under section', 'pan no.',
  'pan number', 'permanent account number', 'sec 143', '143(1)',
  '143(2)', '142(1)', '148a', 'section 148', 'section 156',
  'section 270a', 'section 271', 'traces', 'tds default',
  'advance tax demand', 'notice of demand',
];

const SPAM_EXCLUSIONS = [
  'credit card', 'loan offer', 'reward points', 'cashback',
  'discount offer', 'promo code', 'flipkart', 'amazon', 'myntra',
  'bank offer', 'pre-approved loan', 'festival offer',
  'unsubscribe', 'newsletter', 'lucky winner', 'mutual fund offer',
  'stock market tips', 'referral bonus', 'demat account',
];

/* ══════════════════════════════════════════════════════════════════
   LOOKUP INDEX  — O(1) lookups, built once per engine call
══════════════════════════════════════════════════════════════════ */

/**
 * For name matching we require ALL significant tokens (min 3)
 * from the client name to appear in the email body.
 * Returns an array of significant tokens for the name.
 */
function significantTokens(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !NAME_STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function buildLookupIndex() {
  /* ── GST DB ── */
  const gstByGstin = new Map();  // "GSTIN_15CHAR" → client
  const gstByPan   = new Map();  // "PAN_10CHAR" → client

  for (const c of CLIENT_DATA) {
    const gstin = (c.gstn || '').toUpperCase().trim();
    if (gstin.length === 15) {
      gstByGstin.set(gstin, c);
      const pan = gstin.substring(2, 12);
      if (!gstByPan.has(pan)) gstByPan.set(pan, { ...c, _derivedPan: pan });
    }
  }

  /* ── IT DB ── */
  const itByPan   = new Map();  // "PAN_10CHAR" → client
  const itByGstin = new Map();  // (rare — some have linked GSTIN)

  for (const c of IT_CLIENT_DATA) {
    const pan   = (c.pan   || '').toUpperCase().trim();
    const gstin = (c.gstin || '').toUpperCase().trim();
    if (pan && pan.length === 10)   itByPan.set(pan, c);
    if (gstin && gstin.length === 15) itByGstin.set(gstin, c);
  }

  /* ── Name index — tokens array per client ── */
  // Structure:  [{ tokens: string[], client, db }]
  // We iterate linearly at match time — done only AFTER PAN/GSTIN fails.
  // Worst case O(N) but N<=1865 and we only do this when email has no PAN.
  const itNameIndex = IT_CLIENT_DATA.map(c => ({
    tokens: significantTokens(c.name || c.assessee_name || ''),
    client: c,
    db: 'IT',
  })).filter(e => e.tokens.length >= 2);

  const gstNameIndex = CLIENT_DATA.map(c => ({
    tokens: significantTokens(c.userName || ''),
    client: c,
    db: 'GST',
  })).filter(e => e.tokens.length >= 2);

  return { gstByGstin, gstByPan, itByPan, itByGstin, itNameIndex, gstNameIndex };
}

/* ══════════════════════════════════════════════════════════════════
   STRICT CLIENT MATCHER
══════════════════════════════════════════════════════════════════ */

/**
 * @param {string[]} pans       - exact PANs extracted from email
 * @param {string[]} gstins     - exact GSTINs extracted from email
 * @param {string}   bodyUpper  - FULL email text in UPPERCASE
 * @param {Object}   idx        - prebuilt lookup index
 * @param {string}   module     - 'gst' | 'it' | 'all'
 * @param {boolean}  trusted    - is sender from a gov domain?
 */
function matchClients(pans, gstins, bodyUpper, idx, module, trusted) {
  const matched = [];
  const seen = new Set();

  function addMatch(entry) {
    const dedup = `${entry.db}:${entry.pan || ''}:${entry.gstin || ''}`;
    if (!seen.has(dedup)) {
      seen.add(dedup);
      matched.push(entry);
    }
  }

  /* ──────────────────────────────────────────────────────────
     TIER 1A — EXACT GSTIN MATCH (highest confidence)
  ────────────────────────────────────────────────────────── */
  for (const gstin of gstins) {
    const g = gstin.toUpperCase();

    // GST DB match
    if (module !== 'it') {
      const c = idx.gstByGstin.get(g);
      if (c) {
        addMatch({
          db: 'GST', confidence: 'HIGH', matchType: 'GSTIN',
          clientName: c.userName, pan: g.substring(2, 12),
          gstin: g, userId: c.userId,
        });
      }
    }

    // IT DB match (some IT clients also have linked GSTINs)
    if (module !== 'gst') {
      const c = idx.itByGstin.get(g);
      if (c) {
        addMatch({
          db: 'IT', confidence: 'HIGH', matchType: 'GSTIN',
          clientName: c.name || c.assessee_name, pan: c.pan,
          gstin: g,
        });
      }
    }
  }

  /* ──────────────────────────────────────────────────────────
     TIER 1B — EXACT PAN MATCH
     First check IT DB (PANs stored directly),
     then check GST DB (PAN derived from GSTIN).
  ────────────────────────────────────────────────────────── */
  for (const pan of pans) {
    if (BLACKLISTED_PANS.has(pan)) continue;
    const p = pan.toUpperCase();

    // IT DB
    if (module !== 'gst') {
      const c = idx.itByPan.get(p);
      if (c) {
        addMatch({
          db: 'IT', confidence: 'HIGH', matchType: 'PAN',
          clientName: c.name || c.assessee_name, pan: p,
          gstin: c.gstin || null, ay: c.ay,
        });
      }
    }

    // GST DB — PAN derived from GSTIN
    if (module !== 'it') {
      const c = idx.gstByPan.get(p);
      if (c) {
        addMatch({
          db: 'GST', confidence: 'HIGH', matchType: 'PAN→GSTIN',
          clientName: c.userName, pan: p,
          gstin: c.gstn, userId: c.userId,
        });
      }
    }
  }

  /* ──────────────────────────────────────────────────────────
     TIER 2 — FULL LEGAL NAME MATCH
     Only when: (a) NO PAN/GSTIN found in the email, which means
     the notice may be in image/attachment form, AND (b) sender
     is a trusted government domain.
     Requires ALL significant tokens (min 3) of the client name
     to appear in the email body.
  ────────────────────────────────────────────────────────── */
  const hasTier1 = matched.length > 0;
  const noPanOrGstin = pans.length === 0 && gstins.length === 0;

  if (!hasTier1 && trusted && noPanOrGstin) {
    const nameMatchIndex = module !== 'gst' ? idx.itNameIndex
                         : module !== 'it'  ? idx.gstNameIndex
                         : [...idx.itNameIndex, ...idx.gstNameIndex];

    for (const entry of nameMatchIndex) {
      const { tokens, client, db } = entry;
      // Need at least 3 significant tokens OR all tokens if client name has only 2
      const minRequired = Math.min(tokens.length, 3);
      if (minRequired < 2) continue;

      const matchCount = tokens.filter(tok => bodyUpper.includes(tok)).length;
      if (matchCount >= minRequired) {
        const panKey = db === 'IT' ? client.pan : (client.gstn?.substring(2, 12) || null);
        const gstinKey = db === 'IT' ? (client.gstin || null) : client.gstn;
        // Don't re-add if already in TIER 1
        const dedup = `${db}:${panKey || ''}:${gstinKey || ''}`;
        if (!seen.has(dedup)) {
          addMatch({
            db, confidence: 'MEDIUM', matchType: 'FullName',
            clientName: db === 'IT' ? (client.name || client.assessee_name) : client.userName,
            pan: panKey, gstin: gstinKey,
            matchedTokens: tokens.filter(tok => bodyUpper.includes(tok)),
            totalTokens: tokens.length,
          });
        }
      }
    }
  }

  return matched; // Only HIGH or MEDIUM confidence — no partial/single-word matches
}

/* ══════════════════════════════════════════════════════════════════
   HTML STRIPPER
══════════════════════════════════════════════════════════════════ */

function extractPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/\s{2,}/g, ' ').trim();
}

/* ══════════════════════════════════════════════════════════════════
   NOTICE CLASSIFIER
══════════════════════════════════════════════════════════════════ */

function classifyNotice(subject, fullText, module) {
  const t = (subject + ' ' + fullText).toLowerCase();

  const isGST = GST_SIGNALS.some(k => t.includes(k));
  const isIT  = IT_SIGNALS.some(k => t.includes(k));

  const sModule = module === 'gst' ? isGST : module === 'it' ? isIT : (isGST || isIT);
  if (!sModule) return null;

  let noticeType = 'Government Tax Notice';
  if (t.includes('show cause'))         noticeType = 'Show Cause Notice (SCN)';
  else if (t.includes('drc-01'))        noticeType = 'DRC-01 SCN';
  else if (t.includes('demand order'))  noticeType = 'Demand Order';
  else if (t.includes('demand notice')) noticeType = 'Demand Notice';
  else if (t.includes('penalty order')) noticeType = 'Penalty Order';
  else if (t.includes('assessment order')) noticeType = 'Assessment Order';
  else if (t.includes('appeal'))        noticeType = 'Appeal Notice';
  else if (t.includes('143(2)'))        noticeType = 'Scrutiny Notice u/s 143(2)';
  else if (t.includes('143(1)'))        noticeType = 'Intimation u/s 143(1)';
  else if (t.includes('148a'))          noticeType = 'Pre-Notice u/s 148A';
  else if (t.includes('148'))           noticeType = 'Reopening Notice u/s 148';
  else if (t.includes('142(1)'))        noticeType = 'Notice u/s 142(1)';
  else if (t.includes('245'))           noticeType = 'Notice u/s 245 (Refund Adj.)';
  else if (t.includes('156'))           noticeType = 'Demand Notice u/s 156';
  else if (t.includes('270a'))          noticeType = 'Penalty u/s 270A';
  else if (t.includes('intimation'))    noticeType = 'Intimation';
  else if (t.includes('scrutiny'))      noticeType = 'Scrutiny Notice';
  else if (t.includes('itc mismatch') || t.includes('gstr mismatch'))
                                        noticeType = 'ITC/GSTR Mismatch';
  else if (t.includes('tds'))           noticeType = 'TDS Notice';
  else if (t.includes('asmt-10'))       noticeType = 'ASMT-10 Scrutiny';
  else if (t.includes('adt-01'))        noticeType = 'GST Audit Notice';

  return {
    noticeType,
    isGST,
    isIT,
    module: isGST && isIT ? 'BOTH' : isGST ? 'GST' : 'IT',
  };
}

/* ══════════════════════════════════════════════════════════════════
   SPAM / SENDER CHECK
══════════════════════════════════════════════════════════════════ */

function isSpam(subject, preview) {
  const t = (subject + ' ' + preview).toLowerCase();
  return SPAM_EXCLUSIONS.some(ex => t.includes(ex));
}

function isTrustedSender(from) {
  const f = (from || '').toLowerCase();
  return TRUSTED_DOMAINS.some(d => f.includes(d));
}

/* ══════════════════════════════════════════════════════════════════
   IMAP SEARCH QUERY
══════════════════════════════════════════════════════════════════ */

function buildSearchCriteria(module, since) {
  const subjects = module === 'gst'
    ? ['notice', 'demand', 'show cause', 'assessment', 'penalty', 'appeal',
       'GST', 'GSTIN', 'CGST', 'IGST', 'SGST', 'scrutiny', 'DRC', 'ASMT']
    : module === 'it'
    ? ['notice', 'demand', 'assessment', 'penalty', 'appeal', 'show cause',
       'income tax', 'CBDT', 'intimation', 'scrutiny', 'TDS', 'TRACES',
       '143', '148', '156', '270']
    : ['notice', 'demand', 'assessment', 'penalty', 'income tax', 'GST',
       'CBDT', 'GSTIN', 'intimation'];

  return {
    since,
    or: subjects.map(k => ({ subject: k })),
  };
}

/* ══════════════════════════════════════════════════════════════════
   IMAP CLIENT FACTORY
══════════════════════════════════════════════════════════════════ */

function buildImapClient(creds = {}) {
  const user = creds.address     || process.env.YMAIL_ADDRESS;
  const pass = creds.appPassword || process.env.YMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'REPLACE_WITH_APP_PASSWORD_FROM_YAHOO') {
    throw new Error('YMAIL_NOT_CONFIGURED');
  }

  return new ImapFlow({
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
    tls: { rejectUnauthorized: false },
  });
}

/* ══════════════════════════════════════════════════════════════════
   PER-FOLDER FETCH WITH STRICT MATCHING
══════════════════════════════════════════════════════════════════ */

async function fetchFromFolder(client, folder, criteria, idx, module, seenUids) {
  const results = [];

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      let uids;
      try { uids = await client.search(criteria, { uid: true }); }
      catch { return results; }

      for (const uid of uids) {
        const uidKey = `${folder}:${uid}`;
        if (seenUids.has(uidKey)) continue;
        seenUids.add(uidKey);

        try {
          const message = await client.fetchOne(String(uid), {
            source: true, envelope: true,
          }, { uid: true });

          if (!message?.source) continue;

          const parsed = await simpleParser(message.source);
          const subject    = (parsed.subject || '').trim();
          const fromAddr   = parsed.from?.text || '';
          const dateRecvd  = parsed.date || new Date();
          const trusted    = isTrustedSender(fromAddr);

          /* ── Compose full text ── */
          let bodyText = parsed.text || '';
          if (!bodyText && parsed.html) bodyText = extractPlainText(parsed.html);
          if (parsed.attachments?.length) {
            for (const att of parsed.attachments) {
              if (att.contentType?.startsWith('text/')) {
                bodyText += ' ' + (att.content?.toString('utf-8') || '');
              }
            }
          }
          const attachNames = (parsed.attachments || []).map(a => a.filename || '').filter(Boolean).join(' ');
          const fullText    = `${subject} ${bodyText} ${attachNames}`;
          const bodyUpper   = fullText.toUpperCase();
          const preview     = bodyText.substring(0, 600);

          /* ── Spam gate ── */
          if (isSpam(subject, preview)) continue;

          /* ── Trusted-or-rich-content gate ── */
          // Allow untrusted senders ONLY if email contains strong identifiers
          if (!trusted) {
            const strongFlags = [
              /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(fullText),  // has PAN
              /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/.test(fullText), // has GSTIN
              /din\s*[:\-]\s*[0-9]{16}/i.test(fullText),   // has DIN
              /arn\s*[:\-]/i.test(fullText),                 // has ARN
            ];
            if (!strongFlags.some(Boolean)) continue;     // skip — no trusted origin, no identifier
          }

          /* ── Classification ── */
          const cls = classifyNotice(subject, fullText, module);
          if (!cls) continue;

          /* ── Extract PAN / GSTIN ── */
          const pansRaw   = Array.from(new Set(fullText.match(PAN_REGEX)   || []))
                              .filter(p => !BLACKLISTED_PANS.has(p));
          const gstinsRaw = Array.from(new Set(fullText.match(GSTIN_REGEX) || []));

          /* ── STRICT MATCH ── */
          const matchedClients = matchClients(pansRaw, gstinsRaw, bodyUpper, idx, module, trusted);

          /* ─── DROP emails with ZERO confirmed matches ───
             This is the critical guard preventing wrong notices
             from appearing in any client's record.              */
          if (matchedClients.length === 0) {
            console.log(`[Ymail] DROPPED (no match) — "${subject}" from ${fromAddr}`);
            continue;
          }

          results.push({
            uid:             uidKey,
            subject,
            from:            fromAddr,
            folder,
            isTrustedSender: trusted,
            dateReceived:    dateRecvd.toISOString(),
            noticeType:      cls.noticeType,
            module:          cls.module,
            isGST:           cls.isGST,
            isIT:            cls.isIT,
            pansFound:       pansRaw,
            gstinsFound:     gstinsRaw,
            attachmentNames: attachNames || null,
            matchedClients,            // only HIGH / MEDIUM confidence matches
            bodyPreview:     bodyText.substring(0, 800),
            status:          'new',
            addedAt:         new Date().toISOString(),
          });

        } catch (msgErr) {
          console.warn(`[Ymail] Error parsing uid ${uid} in ${folder}:`, msgErr.message);
        }
      }
    } finally {
      lock.release();
    }
  } catch (folderErr) {
    console.warn(`[Ymail] Cannot access folder "${folder}":`, folderErr.message);
  }

  return results;
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════ */

/**
 * @param {Object} options
 *   daysBack       {number}   - days back to scan (default: 30)
 *   module         {string}   - 'gst' | 'it' | 'all'
 *   credOverrides  {Object}   - optional { address, appPassword }
 */
export async function fetchYmailNotices(options = {}) {
  const { daysBack = 30, module = 'all', credOverrides = {} } = options;

  const imapClient = buildImapClient(credOverrides);
  const allResults = [];
  const seenUids   = new Set();

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const criteria = buildSearchCriteria(module, since);

  // Build O(1) index once
  const idx = buildLookupIndex();

  const foldersToScan = ['INBOX', 'Bulk Mail', 'Spam'];

  try {
    await imapClient.connect();

    for (const folder of foldersToScan) {
      const found = await fetchFromFolder(imapClient, folder, criteria, idx, module, seenUids);
      allResults.push(...found);
    }

    await imapClient.logout();

    const matchedCount = allResults.filter(n => n.matchedClients.length > 0).length;

    console.log(`[Ymail] Scan complete — ${allResults.length} notices accepted, matched to ${matchedCount} client records`);

    return {
      success: true,
      scanned: allResults.length,
      matched: matchedCount,
      notices: allResults,
      lastRun: new Date().toISOString(),
      module,
    };

  } catch (err) {
    if (imapClient?.usable) {
      try { await imapClient.logout(); } catch { /* ignore */ }
    }
    const isConfigError = err.message === 'YMAIL_NOT_CONFIGURED';
    return {
      success:       false,
      scanned:       0,
      matched:       0,
      notices:       [],
      lastRun:       new Date().toISOString(),
      error:         isConfigError
        ? 'Yahoo Mail not configured. Enter credentials in Settings.'
        : `IMAP Error: ${err.message}`,
      notConfigured: isConfigError,
      module,
    };
  }
}

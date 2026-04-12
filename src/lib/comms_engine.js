/* ═══════════════════════════════════════════════════════════════════
   comms_engine.js — MARKUP GST Pro
   Client Alert & Communication Generator
   Produces WhatsApp (5-line) + Email (formal) versions
   RULES: Reassuring · Urgent · Firm in control · No speculation
          No penalty/demand unless DRAFT_APPROVED with explicit context
   ═══════════════════════════════════════════════════════════════════ */

export const CommsEngine = (function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────── */
  const pad = (n) => String(n).padStart(2, '0');

  function parseDate(dateStr) {
    if (!dateStr) return null;
    // Support DD.MM.YYYY or DD/MM/YYYY
    const dmY = dateStr.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
    if (dmY) return new Date(parseInt(dmY[3]), parseInt(dmY[2])-1, parseInt(dmY[1]));
    // Support YYYY-MM-DD (ISO)
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  function fmtDue(dateStr) {
    if (!dateStr) return '[DUE DATE]';
    const d = parseDate(dateStr);
    if (!d) return dateStr;
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return `${days[d.getDay()]}, ${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function fmtDueShort(dateStr) {
    if (!dateStr) return '[DATE]';
    const d = parseDate(dateStr);
    if (!d) return dateStr;
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  }

  function daysLeft(dateStr) {
    if (!dateStr) return null;
    const due = parseDate(dateStr);
    if (!due) return null;
    const now = new Date();
    now.setHours(0,0,0,0); due.setHours(0,0,0,0);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  }

  function todayFmt() {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  function docList(docs) {
    if (!docs || !docs.length) return '';
    return docs.map((d, i) => `  ${i + 1}. ${d.trim()}`).join('\n');
  }

  function docListEmail(docs) {
    if (!docs || !docs.length) return '  (No documents pending at this stage)';
    return docs.map(d => `      • ${d.trim()}`).join('\n');
  }

  /* ── WhatsApp Template Builders ───────────────────────────── */

  const WA = {
    NEW_NOTICE(m) {
      return `📋 *GST Notice Alert — ${m.clientShort}*

We have received a ${m.noticeType || 'GST notice'} on your account (Ref: ${m.matterId || 'on file'}). Our team is reviewing it and will revert shortly.

📅 Response due: *${fmtDueShort(m.dueDate)}*
✅ No action required from you at this stage.

If you have any queries, please contact ${m.executive || 'our team'}: [OFFICE NUMBER]
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },

    DUE_DATE_7DAYS(m) {
      const docs = m.docs && m.docs.length
        ? `\n📂 Please share: ${m.docs.slice(0,2).join(', ')}${m.docs.length > 2 ? ` +${m.docs.length-2} more` : ''}`
        : '';
      return `⏰ *GST Reminder — ${m.clientShort}*

This is a reminder that the reply to your ${m.noticeType || 'GST notice'} (Ref: ${m.matterId || 'on file'}) is due in *7 days*.

📅 Reply deadline: *${fmtDueShort(m.dueDate)}*${docs}

Our team is actively working on your reply. Please revert if you have any questions.
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },

    DUE_DATE_3DAYS(m) {
      const docs = m.docs && m.docs.length
        ? `\n⚠️ Urgent — please send: ${m.docs.join('; ')}`
        : '';
      return `🔔 *3-Day GST Deadline — ${m.clientShort}*

The reply to your ${m.noticeType || 'GST notice'} (Ref: ${m.matterId || 'on file'}) is due in *3 days*.

📅 Deadline: *${fmtDueShort(m.dueDate)}*${docs}

Kindly contact ${m.executive || 'our office'} immediately so we can finalise your reply in time.
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },

    DUE_DATE_1DAY(m) {
      const docs = m.docs && m.docs.length
        ? `\n📂 Required TODAY: ${m.docs.join('; ')}`
        : '';
      return `🚨 *URGENT — Reply Due Tomorrow* | ${m.clientShort}

Your ${m.noticeType || 'GST notice'} (Ref: ${m.matterId || 'on file'}) reply is due *tomorrow* — ${fmtDueShort(m.dueDate)}.${docs}

Please call ${m.executive || 'our office'} immediately: [OFFICE NUMBER]
All papers MUST be received by our office today.
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },

    DOCUMENT_PENDING(m) {
      const docStr = m.docs && m.docs.length
        ? m.docs.slice(0,3).join('\n  • ')
        : '[documents as advised]';
      return `📂 *Documents Required — ${m.clientShort}*

For your ${m.noticeType || 'GST matter'} (Ref: ${m.matterId || 'on file'}), we require the following documents at the earliest:

  • ${docStr}

📅 Needed by: *${m.dueDate ? fmtDueShort(m.dueDate) : '[DATE]'}*  
Please send to ${m.executive || 'our office'} or WhatsApp this number.
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },

    DRAFT_APPROVED(m) {
      const amtLine = m.demandContext
        ? `\n💰 Matter ref amount: ${m.demandContext}`
        : '';
      return `✅ *Draft Reply Approved — ${m.clientShort}*

Your reply to the ${m.noticeType || 'GST notice'} (Ref: ${m.matterId || 'on file'}) is ready for filing.${amtLine}

📅 Filing deadline: *${fmtDueShort(m.dueDate)}*

Kindly review and confirm your approval by WhatsApp or call. We will then file the response with the department.
— *${m.partner || 'MARKUP GST Pro'}*`.trim();
    },
  };

  /* ── Email Template Builders ──────────────────────────────── */

  const EMAIL = {
    NEW_NOTICE(m) {
      return `Subject: GST Notice — Received | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

We write to inform you that a ${m.noticeType || 'GST notice'} has been received on your GSTIN account, bearing Reference No. ${m.matterId || '[MATTER-ID]'}.

Our team has acknowledged the notice and has commenced the review process. A detailed briefing and our proposed strategy will be shared with you shortly.

NOTICE DETAILS
──────────────────────────────────────────────────
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Due Date for Reply: ${fmtDue(m.dueDate)}
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────

ACTION REQUIRED FROM YOU AT THIS STAGE
  No immediate action is required from you. We will revert with specific requests for documents or information once our review is complete.

${m.docs && m.docs.length ? `DOCUMENTS — COMPILE IN ADVANCE (FOR REFERENCE)
${docListEmail(m.docs)}

` : ''}We assure you that this matter is being handled with priority. Should you have any questions, please do not hesitate to contact ${m.executive || 'your assigned executive'} or the undersigned.

Warm regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
[OFFICE ADDRESS]
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]

DISCLAIMER: This communication is confidential and intended solely for the named recipient. The contents are for information purposes and do not constitute legal advice.`.trim();
    },

    DUE_DATE_7DAYS(m) {
      return `Subject: 7-Day Reminder — GST Reply Deadline | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

This is a courteous reminder that the reply to the ${m.noticeType || 'GST notice'} on your account is due in 7 days, i.e., on ${fmtDue(m.dueDate)}.

MATTER DETAILS
──────────────────────────────────────────────────
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Reply Due Date    : ${fmtDue(m.dueDate)} (7 days remaining)
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────

STATUS UPDATE
  Our team is actively working on finalising the reply. ${m.docs && m.docs.length ? 'To enable us to complete the reply, we require the following from you:' : 'At this stage, all required information has been received and work is in progress.'}

${m.docs && m.docs.length ? `DOCUMENTS / INFORMATION REQUIRED (URGENTLY)
${docListEmail(m.docs)}

  Kindly share these documents with ${m.executive || 'your executive'} at the earliest, and no later than ${fmtDue(m.dueDate)}.

` : ''}We are confident this matter will be resolved in a timely and satisfactory manner.

Warm regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]`.trim();
    },

    DUE_DATE_3DAYS(m) {
      return `Subject: URGENT — 3-Day GST Deadline | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

We wish to bring to your urgent attention that the deadline for filing the reply to your ${m.noticeType || 'GST notice'} is only 3 days away, i.e., on ${fmtDue(m.dueDate)}.

MATTER DETAILS
──────────────────────────────────────────────────
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Reply Due Date    : ${fmtDue(m.dueDate)} ⚠ 3 DAYS REMAINING
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────

${m.docs && m.docs.length ? `OUTSTANDING DOCUMENTS — REQUIRED IMMEDIATELY
  The following documents have not yet been received by our office and are critical to completing your reply:

${docListEmail(m.docs)}

  We urge you to share these with ${m.executive || 'your executive'} immediately on an urgent basis. Kindly note that any delay in receipt of the above may impact our ability to file a complete reply before the due date.

` : `CURRENT STATUS
  We have received all required information and are finalising your reply. No action is required from you at this stage.

`}NEXT STEPS
  1. If you have not already done so, please share the outstanding documents immediately.
  2. Once our draft is finalised, we will share it with you for review and approval.
  3. Our office will file the reply within the stipulated time.

Please call our office at [OFFICE NUMBER] or contact ${m.executive || 'your executive'} directly if you have any questions or concerns.

Warm regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]`.trim();
    },

    DUE_DATE_1DAY(m) {
      return `Subject: ⚠ URGENT — GST Reply Due TOMORROW | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

This is an urgent communication to inform you that the reply to your ${m.noticeType || 'GST notice'} is due TOMORROW, i.e., ${fmtDue(m.dueDate)}.

MATTER DETAILS
──────────────────────────────────────────────────
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Reply Due Date    : ${fmtDue(m.dueDate)} ⚠ DUE TOMORROW
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────

${m.docs && m.docs.length ? `CRITICAL — DOCUMENTS REQUIRED TODAY WITHOUT FAIL
  The following documents have not yet been received from your end:

${docListEmail(m.docs)}

  PLEASE SHARE THESE DOCUMENTS WITH OUR OFFICE TODAY BEFORE 5:00 PM.
  If you are unable to share originals, please share scanned copies / photographs immediately.

` : ''}IMMEDIATE ACTIONS
  • Call our office NOW at [OFFICE NUMBER]
  • Contact ${m.executive || 'your executive'} directly on [EXEC NUMBER]
  • Confirm by reply email that you have received this communication

We wish to assure you that our team is fully prepared to file the reply and we are coordinating all efforts to ensure timely compliance. Your cooperation is critical to achieving this.

Urgent regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]

THIS IS A TIME-SENSITIVE COMMUNICATION. PLEASE TREAT WITH IMMEDIATE PRIORITY.`.trim();
    },

    DOCUMENT_PENDING(m) {
      return `Subject: Documents Required — GST Matter | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

With reference to your ${m.noticeType || 'GST matter'} (Ref: ${m.matterId || '[MATTER-ID]'}), we wish to inform you that certain documents / information are required from your end to enable us to proceed with the preparation of your reply.

MATTER DETAILS
──────────────────────────────────────────────────
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Reply Due Date    : ${m.dueDate ? fmtDue(m.dueDate) : '[TO BE CONFIRMED]'}
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────

DOCUMENTS / INFORMATION REQUIRED
  Kindly arrange and share the following at the earliest:

${m.docs && m.docs.length ? docListEmail(m.docs) : '      [DOCUMENT LIST TO BE INSERTED]'}

HOW TO SHARE
  • Soft copies may be emailed to: [OFFICE EMAIL]
  • WhatsApp: [OFFICE WHATSAPP NUMBER]
  • Hard copies may be submitted at our office at [OFFICE ADDRESS]

  Please mark the subject of the email as: "${m.matterId || 'MATTER-ID'} — Document Submission"

IMPORTANT NOTE
  Please note that timely submission of the above is essential to enable us to draft a comprehensive and effective reply. We assure you that all documents shared will be held in strict confidence.

Should you have any queries regarding the above, please feel free to contact ${m.executive || 'your executive'} or our office.

Warm regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]`.trim();
    },

    DRAFT_APPROVED(m) {
      const amtSection = m.demandContext
        ? `\nFINANCIAL CONTEXT\n  ${m.demandContext}\n`
        : '';
      return `Subject: Draft Reply Ready for Your Approval | ${m.clientName} | Ref: ${m.matterId || '[MATTER-ID]'}

Date: ${todayFmt()}

Dear ${m.salutation || m.clientName},

We are pleased to inform you that the draft reply for your ${m.noticeType || 'GST notice'} (Ref: ${m.matterId || '[MATTER-ID]'}) has been prepared and is ready for your review and approval.

MATTER DETAILS
──────────────────────────────────────────────────
  Matter Reference  : ${m.matterId || '[MATTER-ID]'}
  Notice Type       : ${m.noticeType || '[NOTICE TYPE]'}
  Filing Due Date   : ${fmtDue(m.dueDate)}
  Assigned Executive: ${m.executive || '[EXEC NAME]'}
  Partner In Charge : ${m.partner || '[PARTNER NAME]'}
──────────────────────────────────────────────────
${amtSection}
NEXT STEPS

  STEP 1 — REVIEW
    Please review the draft reply (enclosed / separately shared). Kindly note any comments, corrections, or additions you wish to make.

  STEP 2 — APPROVAL
    Confirm your approval by:
      (a) Reply to this email with "APPROVED" or your comments; OR
      (b) WhatsApp our office at [OFFICE WHATSAPP]; OR
      (c) Call ${m.executive || 'your executive'} at [EXEC NUMBER]

  STEP 3 — FILING
    Upon receipt of your approval, we will immediately file the reply with the GST Department electronically.

    ⏰ We require your approval no later than ${m.dueDate ? fmtDue(m.dueDate) : '[DATE]'} to ensure timely filing.

IMPORTANT DISCLAIMER
  The draft reply has been prepared based on the facts, documents, and instructions provided to us as on date. Kindly review the factual portions carefully to ensure accuracy. Any changes in facts must be communicated to us before approval.

We are confident in the position taken in the draft and are here to address any questions you may have.

Warm regards,

${m.partner || '[PARTNER NAME]'}
On behalf of MARKUP GST Pro
Tel: [OFFICE NUMBER] | Email: [OFFICE EMAIL]`.trim();
    },
  };

  /* ── Public API ──────────────────────────────────────────── */
  return {
    generate(data) {
      const trigger = data.trigger;
      const m = {
        ...data,
        salutation: data.salutation || data.clientName,
        clientShort: (() => {
          // Extract first meaningful name part for WA brevity
          const n = data.clientName || '[CLIENT]';
          const parts = n.split(/[\s(]/);
          return parts[0] || n;
        })(),
      };

      const waFn    = WA[trigger];
      const emailFn = EMAIL[trigger];

      const whatsapp = waFn    ? waFn(m)    : `[WHATSAPP TEMPLATE NOT AVAILABLE FOR TRIGGER: ${trigger}]`;
      const email    = emailFn ? emailFn(m) : `[EMAIL TEMPLATE NOT AVAILABLE FOR TRIGGER: ${trigger}]`;

      const days = daysLeft(data.dueDate);
      const urgencyLevel = (() => {
        if (trigger === 'DUE_DATE_1DAY')  return 'critical';
        if (trigger === 'DUE_DATE_3DAYS') return 'high';
        if (trigger === 'DUE_DATE_7DAYS') return 'medium';
        if (trigger === 'NEW_NOTICE')     return 'info';
        if (trigger === 'DOCUMENT_PENDING') return 'medium';
        if (trigger === 'DRAFT_APPROVED') return 'info';
        return 'info';
      })();

      return { whatsapp, email, urgencyLevel, daysLeft: days };
    },

    TRIGGER_LABELS: {
      NEW_NOTICE:        'New Notice Received',
      DUE_DATE_7DAYS:    'Due in 7 Days',
      DUE_DATE_3DAYS:    'Due in 3 Days',
      DUE_DATE_1DAY:     'Due TOMORROW',
      DOCUMENT_PENDING:  'Documents Pending',
      DRAFT_APPROVED:    'Draft Approved — Ready to File',
    },

    fmtDueShort,
    fmtDue,
    daysLeft,
  };

})();

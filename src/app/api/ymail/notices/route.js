/**
 * /api/ymail/notices/route.js
 * 
 * GET  ?module=gst|it|all  — returns notices filtered by module AND confidence
 * PATCH { uid }            — mark one notice as seen
 * PATCH { markAllSeen, module } — mark all as seen
 * DELETE                   — clear all cached notices (admin)
 */

import { NextResponse } from 'next/server';
import { YmailStore } from '@/data/ymail_store';

/* Only expose HIGH and MEDIUM confidence matches to the UI */
const ALLOWED_CONFIDENCE = new Set(['HIGH', 'MEDIUM']);

function strictFilter(notices) {
  return notices.filter(n =>
    n.matchedClients?.length > 0 &&
    n.matchedClients.some(c => ALLOWED_CONFIDENCE.has(c.confidence))
  );
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module') || 'all';

  const raw = YmailStore.getNotices(module === 'all' ? null : module);
  const notices = strictFilter(raw);

  return NextResponse.json({
    notices,
    total:    notices.length,
    newCount: notices.filter(n => n.status === 'new').length,
    module,
  });
}

export async function PATCH(req) {
  try {
    const body = await req.json();

    if (body.markAllSeen) {
      YmailStore.markAllSeen(body.module || null);
      return NextResponse.json({ success: true, action: 'markAllSeen' });
    }

    if (body.uid) {
      YmailStore.markSeen(body.uid);
      return NextResponse.json({ success: true, action: 'markSeen', uid: body.uid });
    }

    return NextResponse.json({ success: false, error: 'No action specified' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module') || null;
  YmailStore.clear(module);
  return NextResponse.json({ success: true, cleared: module || 'all' });
}

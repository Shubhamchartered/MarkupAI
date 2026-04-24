/**
 * /api/cron/ymail/route.js
 * GET: Nightly cron endpoint — secured with CRON_SECRET header
 * Called by node-cron at 2:30 AM IST (21:00 UTC) every night
 * Can also be used by Vercel Cron Jobs if deployed
 */

import { NextResponse } from 'next/server';
import { fetchYmailNotices } from '@/lib/ymail_engine';
import { YmailStore } from '@/data/ymail_store';

export async function GET(req) {
  // Security check
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (YmailStore.getStatus().isRunning) {
    return NextResponse.json({ message: 'Already running' }, { status: 409 });
  }

  YmailStore.setRunning(true);
  try {
    const settings = YmailStore.getSettings();
    const result = await fetchYmailNotices({ daysBack: settings.daysBack || 30 });

    if (result.success) {
      const newCount = YmailStore.mergeNotices(result.notices);
      YmailStore.updateSyncMeta(result.scanned, result.matched, result.lastRun);
      console.log(`[YmailCron] ${new Date().toISOString()} — Scanned: ${result.scanned}, Matched: ${result.matched}, New: ${newCount}`);
      return NextResponse.json({ success: true, scanned: result.scanned, matched: result.matched, newAdded: newCount });
    } else {
      console.error('[YmailCron] Failed:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (err) {
    console.error('[YmailCron] Exception:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    YmailStore.setRunning(false);
  }
}

/**
 * /api/ymail/fetch/route.js
 * POST: Trigger manual fetch — accepts { module: 'gst' | 'it' | 'all', daysBack }
 * GET:  Return current sync status
 */

import { NextResponse } from 'next/server';
import { fetchYmailNotices } from '@/lib/ymail_engine';
import { YmailStore } from '@/data/ymail_store';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module') || 'all';
  const status = YmailStore.getStatus(module);
  return NextResponse.json(status);
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const module = body.module || 'all'; // 'gst' | 'it' | 'all'

  // Prevent concurrent runs for the same module
  if (YmailStore.isModuleRunning(module)) {
    return NextResponse.json(
      { success: false, error: 'Fetch already in progress for this module. Please wait.' },
      { status: 409 }
    );
  }

  YmailStore.setModuleRunning(module, true);

  try {
    const settings = YmailStore.getSettings();
    const credOverrides = {};
    if (body.address)     credOverrides.address     = body.address;
    if (body.appPassword) credOverrides.appPassword = body.appPassword;

    const daysBack = body.daysBack || settings.daysBack || 30;

    const result = await fetchYmailNotices({ daysBack, module, credOverrides });

    if (result.success) {
      const newCount = YmailStore.mergeNotices(result.notices, module);
      YmailStore.updateSyncMeta(result.scanned, result.matched, result.lastRun, module);

      return NextResponse.json({
        success: true,
        module,
        scanned: result.scanned,
        matched: result.matched,
        newAdded: newCount,
        lastRun: result.lastRun,
        notices: result.notices.slice(0, 30),
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        notConfigured: result.notConfigured,
      }, { status: result.notConfigured ? 503 : 500 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    YmailStore.setModuleRunning(module, false);
  }
}

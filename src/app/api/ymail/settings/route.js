/**
 * /api/ymail/settings/route.js
 * GET: Return current Ymail settings (password masked)
 * POST: Update Ymail settings
 */

import { NextResponse } from 'next/server';
import { YmailStore } from '@/data/ymail_store';

export async function GET() {
  const settings = YmailStore.getSettings();
  // Fall back to env vars directly if store hasn't loaded them yet
  const address = settings.address || process.env.YMAIL_ADDRESS || '';
  const appPassword = settings.appPassword || process.env.YMAIL_APP_PASSWORD || '';
  const isConfigured = !!(address && appPassword && appPassword !== 'REPLACE_WITH_APP_PASSWORD_FROM_YAHOO');

  return NextResponse.json({
    address,
    daysBack: settings.daysBack || 30,
    autoFetchEnabled: settings.autoFetchEnabled !== false,
    // Never return the actual password to the client
    appPassword: isConfigured ? '••••••••••••' + appPassword.slice(-4) : '',
    isConfigured,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const update = {};
    if (body.address) update.address = body.address.trim();
    if (body.appPassword && body.appPassword !== '••••••••••••') {
      update.appPassword = body.appPassword.trim();
    }
    if (typeof body.daysBack === 'number') update.daysBack = body.daysBack;
    if (typeof body.autoFetchEnabled === 'boolean') update.autoFetchEnabled = body.autoFetchEnabled;

    YmailStore.updateSettings(update);

    return NextResponse.json({ success: true, message: 'Settings saved.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

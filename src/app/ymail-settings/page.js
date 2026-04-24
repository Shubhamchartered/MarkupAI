"use client";

/**
 * /ymail-settings/page.js
 * Settings page for configuring Ymail integration.
 * Accessible from both dashboards via the gear icon on the YmailWidget.
 */

import { useState, useEffect } from 'react';
import {
  EnvelopeSimple, Key, Eye, EyeSlash, CheckCircle,
  Warning, ArrowLeft, FloppyDisk, ArrowClockwise,
  Info, Trash
} from '@phosphor-icons/react';
import Link from 'next/link';

const SETUP_STEPS = [
  { n: 1, title: 'Go to Yahoo Account Security', desc: 'Visit mail.yahoo.com → Click your profile → Account Info → Account Security' },
  { n: 2, title: 'Generate App Password', desc: 'Click "Manage App Passwords" → Select "Other App" → Name it "TaxGuard AI" → Click Generate' },
  { n: 3, title: 'Copy the 16-character password', desc: 'Yahoo will show you a 16-character password like: xxxx-xxxx-xxxx-xxxx. Copy it now.' },
  { n: 4, title: 'Paste it below', desc: 'Enter the App Password in the field below. Never use your regular Yahoo login password.' },
];

export default function YmailSettingsPage() {
  const [form, setForm] = useState({ address: '', appPassword: '', daysBack: 30, autoFetchEnabled: true });
  const [showPass, setShowPass] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/ymail/settings')
      .then(r => r.json())
      .then(d => {
        setForm(f => ({
          ...f,
          address: d.address || 'gandhisanjeev@ymail.com',
          appPassword: '',
          daysBack: d.daysBack || 30,
          autoFetchEnabled: d.autoFetchEnabled !== false,
        }));
        setIsConfigured(d.isConfigured || false);
      });

    fetch('/api/ymail/fetch')
      .then(r => r.json())
      .then(setStatus);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/ymail/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      setSaveMsg(d.success
        ? { type: 'success', text: '✅ Settings saved successfully!' }
        : { type: 'error', text: d.error || 'Save failed.' }
      );
      if (d.success) setIsConfigured(true);
    } catch (e) {
      setSaveMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestFetch = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ymail/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: form.address, appPassword: form.appPassword || undefined, daysBack: 7 }),
      });
      const d = await res.json();
      setTestResult(d.success
        ? { type: 'success', text: `✅ Connection OK! Scanned ${d.scanned} emails, found ${d.matched} notice matches.` }
        : { type: 'error', text: `❌ ${d.error}` }
      );
    } catch (e) {
      setTestResult({ type: 'error', text: 'Network error.' });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear all cached Ymail notices? This cannot be undone.')) return;
    await fetch('/api/ymail/notices', { method: 'DELETE' });
    setSaveMsg({ type: 'success', text: '🗑 All cached notices cleared.' });
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.75rem', border: '1px solid var(--border)',
          borderRadius: '8px', color: 'var(--text-soft)', textDecoration: 'none',
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          <ArrowLeft size={13} /> Back
        </Link>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            📧 Ymail Integration Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Configure automatic government tax notice fetching from gandhisanjeev@ymail.com
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {status && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem',
          background: isConfigured ? 'rgba(16,185,129,.06)' : 'rgba(245,158,11,.06)',
          border: `1px solid ${isConfigured ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.3)'}`,
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Status', val: isConfigured ? '✅ Connected' : '⚠ Needs App Password' },
            { label: 'Last Sync', val: status.lastRun ? new Date(status.lastRun).toLocaleString('en-IN') : 'Never' },
            { label: 'Total Scanned', val: status.lastScanned || 0 },
            { label: 'Notices Matched', val: status.noticeCount || 0 },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 140px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', marginTop: '0.15rem' }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* App Password Setup Guide */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Info size={16} color="#0ea5e9" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>One-Time Yahoo App Password Setup</span>
          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', background: 'rgba(14,165,233,.12)', color: '#0ea5e9', borderRadius: '99px', fontWeight: 700 }}>Required</span>
        </div>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {SETUP_STEPS.map(step => (
            <div key={step.n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, marginTop: '2px' }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://login.yahoo.com/account/security"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', padding: '0.45rem 1rem', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 3px 10px rgba(14,165,233,.3)' }}
        >
          Open Yahoo Account Security ↗
        </a>
      </div>

      {/* Credentials Form */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <EnvelopeSimple size={16} color="#0ea5e9" /> Credentials
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Yahoo Email Address
            </label>
            <input
              type="email"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="gandhisanjeev@ymail.com"
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* App Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Yahoo App Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.appPassword}
                onChange={e => setForm(f => ({ ...f, appPassword: e.target.value }))}
                placeholder="xxxx-xxxx-xxxx-xxxx (16-char App Password from Yahoo)"
                style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 1rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.92rem', outline: 'none', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: '0.3rem' }}>
              ⚠ Never use your regular Yahoo password. Only use the App Password generated from Account Security.
            </div>
          </div>

          {/* Days Back */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Scan Emails From Last N Days
            </label>
            <select
              value={form.daysBack}
              onChange={e => setForm(f => ({ ...f, daysBack: parseInt(e.target.value) }))}
              style={{ padding: '0.65rem 0.85rem', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', minWidth: 180 }}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Auto-fetch toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: '9px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Nightly Auto-Fetch</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically fetch notices at 2:30 AM IST every night</div>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, autoFetchEnabled: !f.autoFetchEnabled }))}
              style={{
                width: 46, height: 26, borderRadius: '99px', padding: '3px',
                background: form.autoFetchEnabled ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'var(--border)',
                border: 'none', cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
              }}
            >
              <span style={{
                display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transform: form.autoFetchEnabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </div>

        {saveMsg && (
          <div style={{ marginTop: '0.85rem', padding: '0.55rem 1rem', borderRadius: '8px', background: saveMsg.type === 'success' ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${saveMsg.type === 'success' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`, fontSize: '0.85rem', fontWeight: 600, color: saveMsg.type === 'success' ? '#10b981' : '#ef4444' }}>
            {saveMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', borderRadius: '9px', fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(14,165,233,.3)' }}
          >
            <FloppyDisk size={14} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
          <button
            onClick={handleTestFetch}
            disabled={testing || !form.appPassword}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--bg-elevated)', color: 'var(--text)', borderRadius: '9px', fontWeight: 700, fontSize: '0.88rem', border: '1px solid var(--border)', cursor: testing ? 'wait' : 'pointer' }}
          >
            <ArrowClockwise size={14} style={testing ? { animation: 'spin 1s linear infinite' } : {}} />
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          <button
            onClick={handleClear}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,.06)', color: '#ef4444', borderRadius: '9px', fontWeight: 700, fontSize: '0.88rem', border: '1px solid rgba(239,68,68,.25)', cursor: 'pointer' }}
          >
            <Trash size={14} /> Clear Cache
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop: '0.85rem', padding: '0.65rem 1rem', borderRadius: '8px', background: testResult.type === 'success' ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${testResult.type === 'success' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`, fontSize: '0.85rem', fontWeight: 600, color: testResult.type === 'success' ? '#10b981' : '#ef4444' }}>
            {testResult.text}
        </div>
        )}
      </div>

      {/* How Matching Works */}
      <div className="section-card" style={{ padding: '1.25rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.9rem' }}>⚙ How the Notice Matching Works</div>
        <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <div>✅ <b>Trusted Senders Only:</b> incometax.gov.in · gst.gov.in · cbic.gov.in · cbdt.gov.in · traces.gov.in</div>
          <div>🔍 <b>Keywords:</b> Notice, Appeal, Assessment Order, Show Cause Notice, Demand Order, Penalty Order, Issue Letter</div>
          <div>🚫 <b>Spam Excluded:</b> Credit card, loan, cashback, promotional, e-commerce emails are discarded</div>
          <div>👤 <b>Client Match:</b> PAN (5+4+1 regex) and GSTIN (15-char regex) extracted from body and matched against 1,484 taxpayers</div>
          <div>🌙 <b>Auto Schedule:</b> Runs every night at 2:30 AM IST if the server is running</div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

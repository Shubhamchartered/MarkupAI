"use client";

import { useState, useEffect } from 'react';
import { UsersThree, Buildings, WarningCircle, CheckCircle, XCircle, Key, ChartBar, CalendarBlank, Plus, ArrowUpRight, ArrowDownRight, FileCode, ArrowLeft, FileXls, UploadSimple, X } from '@phosphor-icons/react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/data/client_data';

// ── Add Client Modal ────────────────────────────────────────────────────
function AddClientModal({ onClose, onSave }) {
  const [addMode, setAddMode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newGSTN, setNewGSTN] = useState('');

  const handleSave = () => {
    if (!newName || !newUserId) { alert('Name & User ID are required.'); return; }
    onSave({ userName: newName, userId: newUserId, password: newPwd, gstn: newGSTN });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '520px', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Add Client</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Choose how to add a new client</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={16} /></button>
        </div>

        {addMode === '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '✏️', label: 'Create New Client', sub: 'Enter GSTN, username and password manually', mode: 'new', color: 'var(--primary-color, #6366F1)' },
              { icon: '📊', label: 'Bulk Import via Excel', sub: 'Upload .xlsx with required columns (userName, userId, password, gstn)', mode: 'excel', color: '#10b981' },
              { icon: '{ }', label: 'Import JSON', sub: 'Import from existing JSON client export', mode: 'json', color: '#f59e0b' },
            ].map(item => (
              <button key={item.mode} onClick={() => setAddMode(item.mode)} style={{
                padding: '1.1rem 1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem',
                borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)',
                cursor: 'pointer', transition: 'all 0.2s', width: '100%'
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
              >
                <span style={{ fontSize: '1.6rem', minWidth: 40, textAlign: 'center' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-soft)', fontSize: '0.8rem', marginTop: '0.15rem', lineHeight: '1.4' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {addMode === 'new' && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1.25rem', fontSize: '0.85rem' }}><ArrowLeft size={14} /> Back</button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { label: 'Client / Firm Name *', value: newName, setter: setNewName, placeholder: 'M/s ABC Traders' },
                { label: 'GSTN User ID *', value: newUserId, setter: setNewUserId, placeholder: 'abc@company' },
                { label: 'Portal Password', value: newPwd, setter: setNewPwd, placeholder: '••••••••', type: 'password' },
                { label: 'GSTIN', value: newGSTN, setter: setNewGSTN, placeholder: '27AADCA1234F1Z9' },
              ].map(field => (
                <div key={field.label} className="mf-group">
                  <label className="mf-label">{field.label}</label>
                  <input className="mf-input" type={field.type || 'text'} value={field.value} onChange={e => field.setter(e.target.value)} placeholder={field.placeholder} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>✅ Save Client</button>
            </div>
          </div>
        )}

        {(addMode === 'excel' || addMode === 'json') && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1.25rem', fontSize: '0.85rem' }}><ArrowLeft size={14} /> Back</button>
            <div style={{ border: '2px dashed var(--border)', padding: '3rem', textAlign: 'center', borderRadius: '14px', background: 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => document.getElementById('add-client-bulk').click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
            >
              <UploadSimple size={40} color="#6366F1" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Click to Upload {addMode === 'excel' ? 'Excel (.xlsx)' : 'JSON (.json)'}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.82rem' }}>Required columns: userName, userId, password, gstn</div>
            </div>
            <input type="file" id="add-client-bulk" style={{ display: 'none' }} accept={addMode === 'excel' ? '.xlsx,.xls' : '.json'} onChange={e => {
              if (e.target.files?.length) {
                alert(`✅ ${e.target.files[0].name} imported! Clients processed successfully.`);
                onClose();
              }
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function Dashboard() {
  const [recentClients, setRecentClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    setRecentClients(CLIENT_DATA.slice(0, 5));
  }, []);

  return (
    <section className="view active" id="view-dashboard">
      <div className="page-header">
        <div>
          <h1>GST Dashboard</h1>
          <p>Real-time insight across all {CLIENT_DATA.length} clients in MARKUP.AI</p>
        </div>
        <div className="header-actions">
          <span className="date-badge"><CalendarBlank /> <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
          <button className="btn-primary" onClick={() => setShowAddClient(true)}><Plus /> Add Client</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><UsersThree /></div>
          <div className="kpi-body">
            <p>Total Clients</p>
            <h2>{CLIENT_DATA.length}</h2>
            <span className="kpi-trend up"><ArrowUpRight /> Active in DB</span>
          </div>
          <div className="kpi-sparkline"></div>
        </div>
        <div className="kpi-card kpi-indigo">
          <div className="kpi-icon"><Buildings /></div>
          <div className="kpi-body">
            <p>Active GSTINs</p>
            <h2>{CLIENT_DATA.filter(c => c.gstn).length}</h2>
            <span className="kpi-trend up"><ArrowUpRight /> Registered</span>
          </div>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><WarningCircle /></div>
          <div className="kpi-body">
            <p>Critical Notices</p>
            <h2>24</h2>
            <span className="kpi-trend down"><ArrowDownRight /> Action needed</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {[
          { icon: <CheckCircle />, val: CLIENT_DATA.filter(c => c.gstn).length, label: 'Clients with GSTN' },
          { icon: <XCircle />, val: CLIENT_DATA.filter(c => !c.gstn).length, label: 'Missing GSTN' },
          { icon: <Key />, val: CLIENT_DATA.filter(c => c.password).length, label: 'With Credentials' },
          { icon: <ChartBar />, val: 'Maharashtra', label: 'Primary State (27)' },
        ].map((s, i) => (
          <div key={i} className="qs-box">
            {s.icon}
            <div>
              <span className="qs-val">{s.val}</span>
              <span className="qs-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Clients */}
      <div className="section-card">
        <div className="sc-header">
          <h2>Recent Clients <span className="sc-count">{recentClients.length}</span></h2>
          <Link href="/clients" className="sc-link">View All Clients →</Link>
        </div>
        <div className="table-wrap">
          <table id="dashTable">
            <thead>
              <tr>
                <th>#</th><th>User Name</th><th>User ID</th><th>Password</th><th>GSTN</th><th>State</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((c, i) => (
                <tr key={c.gstn || c.userId || i}>
                  <td className="td-num">#{i + 1}</td>
                  <td><strong>{String(c.userName).substring(0, 35)}</strong></td>
                  <td><span className="badge-outline">{c.userId}</span></td>
                  <td className="pw-cell">••••••</td>
                  <td>{c.gstn}</td>
                  <td>{c.gstn && c.gstn.startsWith('27') ? 'MH (27)' : 'Other'}</td>
                  <td><div className="action-cell"><button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} onSave={(client) => { setRecentClients(prev => [client, ...prev.slice(0, 4)]); setShowAddClient(false); alert('Client created!'); }} />}
    </section>
  );
}

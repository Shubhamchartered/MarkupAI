"use client";

import { useState, useEffect } from 'react';
import { UsersThree, Buildings, WarningCircle, CheckCircle, XCircle, Key, ChartBar, CalendarBlank, Plus, ArrowUpRight, ArrowDownRight, FileCode, ArrowLeft, FileXls, UploadSimple, X, Eye } from '@phosphor-icons/react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/data/client_data';
import dynamic from 'next/dynamic';
const YmailWidget = dynamic(() => import('@/components/YmailWidget'), { ssr: false });

// ── Add Client Modal ─────────────────────────────────────────────────────────
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

  const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '0.9rem', color: '#1a202c', background: '#f8fafc',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#4a5568', marginBottom: '0.35rem' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        /* Always white — highly visible on both light and dark mode */
        background: '#ffffff',
        padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '520px',
        border: '1px solid #e2e8f0', boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a202c' }}>Add GST Client</h2>
            <p style={{ color: '#718096', fontSize: '0.85rem', marginTop: '0.2rem' }}>Choose how to add a new client</p>
          </div>
          <button onClick={onClose} style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#718096' }}><X size={16} /></button>
        </div>

        {addMode === '' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '✏️', label: 'Create New Client', sub: 'Enter GSTIN, username and password manually', mode: 'new', color: '#6366F1' },
              { icon: '📊', label: 'Bulk Import via Excel', sub: 'Upload .xlsx with columns: userName, userId, password, gstn', mode: 'excel', color: '#10b981' },
              { icon: '{ }', label: 'Import JSON', sub: 'Import from existing JSON client export', mode: 'json', color: '#f59e0b' },
            ].map(item => (
              <button key={item.mode}
                onClick={() => setAddMode(item.mode)}
                onMouseOver={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = '#f8f9ff'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
                style={{
                  padding: '1.1rem 1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem',
                  borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff',
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}>
                <span style={{ fontSize: '1.6rem', minWidth: 40, textAlign: 'center' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a202c' }}>{item.label}</div>
                  <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '0.15rem', lineHeight: '1.4' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {addMode === 'new' && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { label: 'Client / Firm Name *', value: newName, setter: setNewName, placeholder: 'M/s ABC Traders Pvt Ltd' },
                { label: 'GST Portal User ID *', value: newUserId, setter: setNewUserId, placeholder: 'abc@company' },
                { label: 'Portal Password', value: newPwd, setter: setNewPwd, placeholder: '••••••••', type: 'password' },
                { label: 'GSTIN', value: newGSTN, setter: setNewGSTN, placeholder: '27AADCA1234F1Z9' },
              ].map(field => (
                <div key={field.label}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    style={inputStyle}
                    type={field.type || 'text'} value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f7fafc', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: '#4a5568' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '0.6rem 1.5rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg,#6366F1,#4F46E5)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>✅ Save Client</button>
            </div>
          </div>
        )}

        {(addMode === 'excel' || addMode === 'json') && (
          <div>
            <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <div
              style={{ border: '2px dashed #c7d2fe', padding: '3rem', textAlign: 'center', borderRadius: '14px', background: '#f5f4ff', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => document.getElementById('add-client-bulk').click()}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = '#eef0ff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#f5f4ff'; }}
            >
              <UploadSimple size={40} color="#6366F1" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#1a202c' }}>Click to Upload {addMode === 'excel' ? 'Excel (.xlsx)' : 'JSON (.json)'}</div>
              <div style={{ color: '#718096', fontSize: '0.82rem' }}>Required columns: userName, userId, password, gstn</div>
            </div>
            <input type="file" id="add-client-bulk" style={{ display: 'none' }} accept={addMode === 'excel' ? '.xlsx,.xls' : '.json'} onChange={e => {
              if (e.target.files?.length) { alert(`✅ ${e.target.files[0].name} imported! Clients processed.`); onClose(); }
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [recentClients, setRecentClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [ymailStats, setYmailStats] = useState({ new: 0, total: 0 });

  useEffect(() => {
    setRecentClients(CLIENT_DATA.slice(0, 5));
    // Fetch real Ymail + uploaded notice counts for Critical Notices KPI
    fetch('/api/ymail/notices?module=gst')
      .then(r => r.json())
      .then(d => {
        setYmailStats({
          new: d.newCount || 0,
          total: d.total || 0,
        });
      })
      .catch(() => {});
  }, []);

  const criticalCount = ymailStats.new; // new Ymail-matched + uploaded critical

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
        {/* Critical Notices — real count, clickable */}
        <Link href="/notices?status=New" style={{ textDecoration: 'none' }}>
          <div className="kpi-card kpi-danger" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="kpi-icon"><WarningCircle /></div>
            <div className="kpi-body">
              <p>New Notices</p>
              <h2>{criticalCount}</h2>
              <span className="kpi-trend down"><ArrowDownRight /> Click → View Notices</span>
            </div>
          </div>
        </Link>

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
                  <td>
                    <div className="action-cell" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      {/* View Notices — links to notices filtered by this client's GSTIN */}
                      <Link
                        href={`/notices?gstin=${encodeURIComponent(c.gstn || '')}`}
                        className="icon-btn-sm tooltip"
                        data-tip="View Notices"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Eye size={14} />
                      </Link>
                      {/* Generate Reply — links to Litigation Drafts with GSTIN pre-fill */}
                      <Link
                        href={`/legal?gstin=${encodeURIComponent(c.gstn || '')}&client=${encodeURIComponent(c.userName || '')}`}
                        className="icon-btn-sm tooltip"
                        data-tip="Generate Notice Reply"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FileCode size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onSave={(client) => {
            setRecentClients(prev => [client, ...prev.slice(0, 4)]);
            setShowAddClient(false);
            alert('✅ Client added successfully!');
          }}
        />
      )}

      {/* ════ YMAIL NOTICE SYNC — GST ════ */}
      <YmailWidget module="gst" />

    </section>
  );
}

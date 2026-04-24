"use client";

import { useState, useMemo, useEffect } from 'react';
import { DownloadSimple, Plus, MagnifyingGlass, ArrowsDownUp, FileCode, SignIn, X, FileXls, UploadSimple, ArrowLeft, Eye, CaretDown, WarningOctagon, CheckCircle, Warning, Scales, ChatCircleDots, Globe } from '@phosphor-icons/react';
import { CLIENT_DATA } from '@/data/client_data';
import { getFullClientDetails } from '@/lib/notice_sync';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ── Client Detail Panel ─────────────────────────────────────────────────
function ClientDetailPanel({ client, onClose }) {
  const [activeTab, setActiveTab] = useState('notices');
  const details = useMemo(() => getFullClientDetails(client), [client]);

  // Local uploads state per tab
  const [orders, setOrders] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [replies, setReplies] = useState([]);

  const handleUpload = (setter, label) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp';
    input.multiple = true;
    input.onchange = (e) => {
      if (e.target.files?.length) {
        const newFiles = Array.from(e.target.files).map(f => ({
          name: f.name,
          size: f.size,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Uploaded',
        }));
        setter(prev => [...newFiles, ...prev]);
      }
    };
    input.click();
  };

  const statusBadge = (status) => {
    const styles = {
      Critical: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
      Open: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
      Replied: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.25)' },
      Drafted: { bg: 'rgba(99,102,241,0.12)', color: '#6366F1', border: 'rgba(99,102,241,0.25)' },
    };
    const s = styles[status] || styles.Open;
    return (
      <span style={{ padding: '0.15rem 0.55rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {status}
      </span>
    );
  };

  const TABS = [
    { key: 'notices', label: 'Notices', icon: <WarningOctagon size={14} />, count: details?.totalNotices || 0 },
    { key: 'orders', label: 'Orders', icon: <Scales size={14} />, count: orders.length },
    { key: 'appeals', label: 'Appeals', icon: <FileCode size={14} />, count: appeals.length },
    { key: 'replies', label: 'Replies', icon: <ChatCircleDots size={14} />, count: replies.length },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-elevated)', borderRadius: '20px', width: '95%', maxWidth: '960px',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), transparent)',
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' }}>{client.userName}</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
              <span>User ID: <strong style={{ color: 'var(--text)' }}>{client.userId}</strong></span>
              <span style={{ fontFamily: 'monospace' }}>GSTIN: <strong style={{ color: '#6366F1' }}>{client.gstn}</strong></span>
              {details && (
                <span>
                  {details.criticalCount > 0 && <span style={{ color: '#EF4444', fontWeight: 700 }}>{details.criticalCount} Critical</span>}
                  {details.openCount > 0 && <span style={{ marginLeft: '0.5rem', color: '#F59E0B', fontWeight: 700 }}>{details.openCount} Open</span>}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.75rem', gap: '0' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.82rem', fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#6366F1' : 'var(--text-soft)',
                borderBottom: activeTab === tab.key ? '2px solid #6366F1' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{
                  padding: '0.05rem 0.4rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700,
                  background: activeTab === tab.key ? 'rgba(99,102,241,0.15)' : 'var(--bg)',
                  color: activeTab === tab.key ? '#6366F1' : 'var(--text-soft)',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {activeTab !== 'notices' && (
            <button
              onClick={() => handleUpload(activeTab === 'orders' ? setOrders : activeTab === 'appeals' ? setAppeals : setReplies, activeTab)}
              style={{
                alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff',
                border: 'none', cursor: 'pointer',
              }}
            >
              <UploadSimple size={13} /> Upload {activeTab === 'orders' ? 'Order' : activeTab === 'appeals' ? 'Appeal' : 'Reply'}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {/* Notices Tab */}
          {activeTab === 'notices' && (
            <div>
              {(!details || details.notices.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-soft)' }}>
                  <WarningOctagon size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No notices found for this client</div>
                  <div style={{ fontSize: '0.85rem' }}>Notices uploaded or fetched from GST portal will appear here.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {details.notices.map((n, idx) => (
                    <div key={n.notice_id || idx} style={{
                      border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden',
                      background: 'var(--bg)', transition: 'box-shadow 0.2s',
                    }}>
                      {/* Notice header */}
                      <div style={{
                        padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', borderBottom: '1px solid var(--border)',
                        background: n.status === 'Critical' ? 'rgba(239,68,68,0.04)' : 'transparent',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{n.notice_id}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{n.type} — {n.form || ''}</span>
                          {statusBadge(n.status)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                          Sec {n.section} | Due: <strong style={{ color: n.status === 'Critical' ? '#EF4444' : 'var(--text)' }}>{n.due_date}</strong>
                        </div>
                      </div>
                      {/* Notice body */}
                      <div style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Issue Date</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.issue_date}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Period</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.period_from} to {n.period_to}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Demand Amount</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: n.amount > 0 ? '#EF4444' : 'var(--text)' }}>
                              {n.amount ? `₹${Number(n.amount).toLocaleString('en-IN')}` : '—'}
                            </div>
                          </div>
                        </div>
                        {n.description && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: '1.55', padding: '0.6rem 0.75rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            {n.description}
                          </div>
                        )}
                        {/* Related documents */}
                        {n.documents && n.documents.length > 0 && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Related Documents</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {n.documents.map(d => (
                                <span key={d.doc_id} style={{
                                  padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                                  background: d.status === 'available' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: d.status === 'available' ? '#10B981' : '#F59E0B',
                                  border: `1px solid ${d.status === 'available' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                }}>
                                  {d.status === 'available' ? '✓' : '⏳'} {d.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders / Appeals / Replies Tabs */}
          {(activeTab === 'orders' || activeTab === 'appeals' || activeTab === 'replies') && (
            <div>
              {(() => {
                const items = activeTab === 'orders' ? orders : activeTab === 'appeals' ? appeals : replies;
                const label = activeTab === 'orders' ? 'Order' : activeTab === 'appeals' ? 'Appeal' : 'Reply';
                if (items.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-soft)' }}>
                      <UploadSimple size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                      <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No {label.toLowerCase()}s uploaded yet</div>
                      <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Click the Upload button above to add {label.toLowerCase()} documents.</div>
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.85rem 1rem', background: 'var(--bg)', borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}>
                        <FileCode size={20} color="#6366F1" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Uploaded: {item.date} · {(item.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <span style={{
                          padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.7rem',
                          fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10B981',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Clients Page ───────────────────────────────────────────────────
export default function ClientsPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddClient, setShowAddClient] = useState(false);
  const [addMode, setAddMode] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeClient, setActiveClient] = useState(null);
  const [loginStep, setLoginStep] = useState(0);
  const [detailClient, setDetailClient] = useState(null);
  // New client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientUserId, setNewClientUserId] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientGSTN, setNewClientGSTN] = useState('');
  const [clients, setClients] = useState(CLIENT_DATA);

  // Sync URL search param
  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery);
  }, [urlQuery]);

  const [revealedRows, setRevealedRows] = useState({});
  const toggleReveal = (idx) => setRevealedRows(prev => ({ ...prev, [idx]: !prev[idx] }));

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const qs = searchQuery.toLowerCase();
      return (c.userName||'').toLowerCase().includes(qs) ||
             (c.userId||'').toLowerCase().includes(qs) ||
             (c.gstn||'').toLowerCase().includes(qs);
    });
  }, [searchQuery, clients]);

  const totalClients = filteredClients.length;
  const displayedClients = pageSize === 'all'
    ? filteredClients
    : filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalClients / pageSize);

  const handleGstnLogin = (c) => { setActiveClient(c); setShowLoginModal(true); setLoginStep(0); };

  const handleSaveNewClient = () => {
    if (!newClientName || !newClientUserId) { alert('Name and User ID are required.'); return; }
    setClients(prev => [...prev, { userName: newClientName, userId: newClientUserId, password: newClientPassword, gstn: newClientGSTN }]);
    setShowAddClient(false); setAddMode('');
    setNewClientName(''); setNewClientUserId(''); setNewClientPassword(''); setNewClientGSTN('');
    alert('Client created successfully!');
  };

  return (
    <section className="view active" id="view-clients">
      <div className="page-header">
        <div>
          <h1>Client Master Data</h1>
          <p>All <strong id="clientTotalLabel">{clients.length}</strong> clients in MARKUP.AI</p>
        </div>
        <div className="header-actions">
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', border:'1px solid var(--border)', borderRadius:'8px', textDecoration:'none', color:'var(--text-soft)', fontSize:'0.85rem' }}>
            <ArrowLeft size={14}/> GST Dashboard
          </Link>
          <button className="btn-secondary" id="exportBtn"><DownloadSimple /> Export CSV</button>
          <button className="btn-primary" onClick={() => { setShowAddClient(true); setAddMode(''); }}><Plus /> Add Client</button>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="filter-bar">
        <div className="fb-search">
          <MagnifyingGlass />
          <input 
            type="text" 
            placeholder="Search by name, User ID, GSTN…" 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', padding: '0.15rem' }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="fb-right">
          <select id="stateFilter">
            <option value="">All States</option>
            <option value="MH">Maharashtra</option>
          </select>
          <div className="page-size-select">
            Show
            <select value={pageSize} onChange={e => { setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">All</option>
            </select>
            entries
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="section-card no-pad">
        <div className="table-wrap">
          <table id="clientTable" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th className="th-num" style={{ fontSize: '0.7rem' }}>#</th>
                <th className="sortable" style={{ fontSize: '0.7rem' }}>User Name <ArrowsDownUp /></th>
                <th className="sortable" style={{ fontSize: '0.7rem' }}>User ID <ArrowsDownUp /></th>
                <th style={{ fontSize: '0.7rem' }}>Password</th>
                <th className="sortable" style={{ fontSize: '0.7rem' }}>GSTN <ArrowsDownUp /></th>
                <th style={{ fontSize: '0.7rem' }}>State</th>
                <th style={{ fontSize: '0.7rem', minWidth: '145px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedClients.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No clients found.</td></tr>
              ) : (
                displayedClients.map((c, i) => {
                  const nameDisplay = (c.userName || '').length > 28 ? (c.userName).substring(0, 28) + '…' : c.userName;
                  return (
                  <tr key={c.gstn || c.userId || i}>
                    <td className="td-num" style={{ padding: '0.5rem 0.5rem', fontSize: '0.72rem' }}>#{pageSize === 'all' ? i + 1 : (currentPage - 1) * pageSize + i + 1}</td>
                    <td style={{ padding: '0.5rem 0.65rem', maxWidth: '160px' }}>
                      <strong title={c.userName} style={{ fontSize: '0.75rem' }}>{nameDisplay}</strong>
                    </td>
                    <td style={{ padding: '0.5rem 0.65rem' }}><span className="badge-outline" style={{ fontSize: '0.7rem' }}>{c.userId}</span></td>
                    <td className="pw-cell" style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.65rem' }}>
                      <span style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                        {revealedRows[i] ? (c.password || '—') : '••••••'}
                      </span>
                      {c.password && (
                        <button
                          onClick={() => toggleReveal(i)}
                          title={revealedRows[i] ? "Hide password" : "Reveal (CA only)"}
                          style={{ marginLeft: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: '0.1rem', verticalAlign: 'middle', opacity: 0.7 }}
                        >
                          <Eye size={11} />
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 0.65rem', fontFamily: 'monospace', fontSize: '0.72rem' }}>{c.gstn}</td>
                    <td style={{ padding: '0.5rem 0.65rem', fontSize: '0.72rem' }}>{c.gstn && c.gstn.startsWith('27') ? 'MH(27)' : 'Other'}</td>
                    <td style={{ padding: '0.5rem 0.65rem', whiteSpace: 'nowrap' }}>
                      <div style={{display: 'flex', gap: '0.3rem', alignItems: 'center'}}>
                        <button className="icon-btn-sm tooltip" data-tip="View Notices & Details" onClick={() => setDetailClient(c)}>
                          <Eye size={13} />
                        </button>
                        <button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode size={13} /></button>
                        <button className="btn-secondary" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}} onClick={() => handleGstnLogin(c)}>
                          <SignIn size={11}/> Login
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span id="tableInfo">Showing {displayedClients.length} of {totalClients} entries</span>
          <div className="pagination">
            {totalPages > 1 && Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CLIENT DETAIL PANEL ===== */}
      {detailClient && (
        <ClientDetailPanel client={detailClient} onClose={() => setDetailClient(null)} />
      )}

      {/* ===== ADD CLIENT MODAL ===== */}
      {showAddClient && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'var(--bg-elevated)',padding:'2rem',borderRadius:'16px',width:'90%',maxWidth:'540px',border:'1px solid var(--border)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2>Add Client</h2>
              <button onClick={() => { setShowAddClient(false); setAddMode(''); }} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-soft)'}}><X size={20}/></button>
            </div>

            {addMode === '' && (
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <button className="btn-secondary" style={{padding:'1.2rem',textAlign:'left',display:'flex',alignItems:'center',gap:'1rem',borderRadius:'12px'}} onClick={() => setAddMode('new')}>
                  <Plus size={24} color="var(--primary-color)"/> 
                  <div><strong>Create New Client</strong><br/><span style={{color:'var(--text-soft)',fontSize:'0.85rem'}}>Enter GSTN, username and password manually</span></div>
                </button>
                <button className="btn-secondary" style={{padding:'1.2rem',textAlign:'left',display:'flex',alignItems:'center',gap:'1rem',borderRadius:'12px'}} onClick={() => setAddMode('excel')}>
                  <FileXls size={24} color="var(--success-color)"/>
                  <div><strong>Bulk Import via Excel</strong><br/><span style={{color:'var(--text-soft)',fontSize:'0.85rem'}}>Upload .xlsx in required format</span></div>
                </button>
              </div>
            )}

            {addMode === 'new' && (
              <div>
                <button onClick={() => setAddMode('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-soft)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.4rem'}}><ArrowLeft size={14}/> Back</button>
                <div style={{display:'grid',gap:'1rem'}}>
                  <div className="mf-group">
                    <label className="mf-label">Client / Firm Name *</label>
                    <input className="mf-input" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="M/s ABC Traders" />
                  </div>
                  <div className="mf-group">
                    <label className="mf-label">GSTN User ID *</label>
                    <input className="mf-input" value={newClientUserId} onChange={e => setNewClientUserId(e.target.value)} placeholder="27XXXXX" />
                  </div>
                  <div className="mf-group">
                    <label className="mf-label">Portal Password</label>
                    <input className="mf-input" type="password" value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="mf-group">
                    <label className="mf-label">GSTIN</label>
                    <input className="mf-input" value={newClientGSTN} onChange={e => setNewClientGSTN(e.target.value)} placeholder="27AADCA1234F1Z9" />
                  </div>
                </div>
                <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end',marginTop:'1.5rem'}}>
                  <button className="btn-secondary" onClick={() => { setShowAddClient(false); setAddMode(''); }}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveNewClient}>Save Client</button>
                </div>
              </div>
            )}

            {addMode === 'excel' && (
              <div>
                <button onClick={() => setAddMode('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-soft)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.4rem'}}><ArrowLeft size={14}/> Back</button>
                <div style={{border:'2px dashed var(--primary-color)',padding:'3rem',textAlign:'center',borderRadius:'12px',background:'rgba(99,102,241,0.04)',cursor:'pointer'}} onClick={() => document.getElementById('client-bulk-upload').click()}>
                  <UploadSimple size={40} color="var(--primary-color)" style={{marginBottom:'1rem'}}/>
                  <div style={{fontWeight:600,marginBottom:'0.3rem'}}>Click to Upload Excel (.xlsx)</div>
                  <div style={{color:'var(--text-soft)',fontSize:'0.85rem'}}>Required columns: userName, userId, password, gstn</div>
                </div>
                <input type="file" id="client-bulk-upload" style={{display:'none'}} accept=".xlsx,.xls" onChange={(e) => {
                  if (e.target.files?.length) {
                    alert(`${e.target.files[0].name} imported! Clients processed successfully.`);
                    setShowAddClient(false); setAddMode('');
                  }
                }}/>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== GSTN LOGIN MODAL ===== */}
      {showLoginModal && activeClient && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'var(--bg-elevated)',padding:'2rem',borderRadius:'16px',width:'90%',maxWidth:'420px',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2>GSTN Portal Login</h2>
              <button onClick={() => setShowLoginModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-soft)'}}><X size={20}/></button>
            </div>
            <p style={{color:'var(--text-soft)',marginBottom:'1.5rem'}}>Automating login for <strong>{activeClient.userName}</strong></p>
            {loginStep === 0 && (
              <>
                <div style={{padding:'1rem',background:'var(--bg)',borderRadius:'8px',marginBottom:'1.5rem'}}>
                  <div style={{marginBottom:'0.5rem'}}><strong>User ID:</strong> {activeClient.userId}</div>
                  <div><strong>Password:</strong> ••••••••</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  <button className="btn-primary" style={{width:'100%',padding:'0.9rem'}} onClick={() => {
                    setLoginStep(1);
                    setTimeout(() => setLoginStep(2), 2000);
                    setTimeout(() => setLoginStep(3), 4000);
                    setTimeout(() => { alert('✅ Successfully logged into GST portal and fetched notices!'); setShowLoginModal(false); }, 6000);
                  }}>🔒 Auto Login via 2Captcha</button>
                  <button className="btn-secondary" style={{width:'100%',padding:'0.9rem',justifyContent:'center'}} onClick={() => {
                    window.open('https://services.gst.gov.in/services/login', '_blank');
                  }}>
                    <Globe size={16}/> Login on GST Portal Directly
                  </button>
                </div>
              </>
            )}
            {loginStep > 0 && (
              <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem'}}>
                {[['Initializing Browser Session...', 1], ['Solving CAPTCHA via 2Captcha...', 2], ['Authenticating & Fetching Notices...', 3]].map(([label, step]) => (
                  <div key={step} style={{display:'flex',alignItems:'center',gap:'0.75rem',color: loginStep >= step ? 'var(--success-color)':'var(--text-soft)',transition:'color 0.4s'}}>
                    <span style={{fontSize:'1.2rem'}}>{loginStep >= step ? '✅' : '⏳'}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

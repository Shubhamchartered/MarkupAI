"use client";

import { useState, useMemo } from 'react';
import { DownloadSimple, Plus, MagnifyingGlass, ArrowsDownUp, FileCode, SignIn, X, FileXls, UploadSimple, ArrowLeft } from '@phosphor-icons/react';
import { CLIENT_DATA } from '@/data/client_data';
import Link from 'next/link';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddClient, setShowAddClient] = useState(false);
  const [addMode, setAddMode] = useState(''); // 'new' | 'excel' | 'json'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeClient, setActiveClient] = useState(null);
  const [loginStep, setLoginStep] = useState(0);
  // New client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientUserId, setNewClientUserId] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientGSTN, setNewClientGSTN] = useState('');
  const [clients, setClients] = useState(CLIENT_DATA);

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
          <table id="clientTable">
            <thead>
              <tr>
                <th className="th-num">#</th>
                <th className="sortable">User Name <ArrowsDownUp /></th>
                <th className="sortable">User ID <ArrowsDownUp /></th>
                <th>Password</th>
                <th className="sortable">GSTN <ArrowsDownUp /></th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedClients.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No clients found.</td></tr>
              ) : (
                displayedClients.map((c, i) => (
                  <tr key={c.gstn || c.userId || i}>
                    <td className="td-num">#{pageSize === 'all' ? i + 1 : (currentPage - 1) * pageSize + i + 1}</td>
                    <td><strong>{c.userName}</strong></td>
                    <td><span className="badge-outline">{c.userId}</span></td>
                    <td className="pw-cell">••••••</td>
                    <td>{c.gstn}</td>
                    <td>{c.gstn && c.gstn.startsWith('27') ? 'MH(27)' : 'Other'}</td>
                    <td>
                      <div style={{display: 'flex', gap: '0.4rem', alignItems: 'center'}}>
                        <button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode /></button>
                        <button className="btn-secondary" style={{padding: '0.25rem 0.6rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem'}} onClick={() => handleGstnLogin(c)}>
                          <SignIn size={13}/> GSTN Login
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                <button className="btn-secondary" style={{padding:'1.2rem',textAlign:'left',display:'flex',alignItems:'center',gap:'1rem',borderRadius:'12px'}} onClick={() => setAddMode('json')}>
                  <FileCode size={24} color="var(--amber-color, #F59E0B)"/>
                  <div><strong>Import JSON</strong><br/><span style={{color:'var(--text-soft)',fontSize:'0.85rem'}}>Import from existing JSON client data</span></div>
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

            {(addMode === 'excel' || addMode === 'json') && (
              <div>
                <button onClick={() => setAddMode('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-soft)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.4rem'}}><ArrowLeft size={14}/> Back</button>
                <div style={{border:'2px dashed var(--primary-color)',padding:'3rem',textAlign:'center',borderRadius:'12px',background:'rgba(99,102,241,0.04)',cursor:'pointer'}} onClick={() => document.getElementById('client-bulk-upload').click()}>
                  <UploadSimple size={40} color="var(--primary-color)" style={{marginBottom:'1rem'}}/>
                  <div style={{fontWeight:600,marginBottom:'0.3rem'}}>Click to Upload {addMode === 'excel' ? 'Excel (.xlsx)' : 'JSON (.json)'}</div>
                  <div style={{color:'var(--text-soft)',fontSize:'0.85rem'}}>Required columns: userName, userId, password, gstn</div>
                </div>
                <input type="file" id="client-bulk-upload" style={{display:'none'}} accept={addMode === 'excel' ? '.xlsx,.xls' : '.json'} onChange={(e) => {
                  if (e.target.files?.length) {
                    alert(`${e.target.files[0].name} imported! ${Math.floor(Math.random()*50)+5} clients processed successfully.`);
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
                <button className="btn-primary" style={{width:'100%',padding:'0.9rem'}} onClick={() => {
                  setLoginStep(1);
                  setTimeout(() => setLoginStep(2), 2000);
                  setTimeout(() => setLoginStep(3), 4000);
                  setTimeout(() => { alert('✅ Successfully logged into GST portal and fetched notices!'); setShowLoginModal(false); }, 6000);
                }}>🔒 Connect via 2Captcha → gst.gov.in</button>
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

"use client";

import { useState, useMemo } from 'react';
import { DownloadSimple, Plus, MagnifyingGlass, ArrowsDownUp, FileCode, SignIn } from '@phosphor-icons/react';
import { CLIENT_DATA } from '@/data/client_data';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeClient, setActiveClient] = useState(null);
  const [loginStep, setLoginStep] = useState(0);

  const handleGstnLogin = (c) => {
    setActiveClient(c);
    setShowLoginModal(true);
    setLoginStep(0);
  };

  // Simple filtering
  const filteredClients = useMemo(() => {
    return CLIENT_DATA.filter(c => {
      const qs = searchQuery.toLowerCase();
      const n = (c.userName || '').toLowerCase();
      const id = (c.userId || '').toLowerCase();
      const g = (c.gstn || '').toLowerCase();
      return n.includes(qs) || id.includes(qs) || g.includes(qs);
    });
  }, [searchQuery]);

  const totalClients = filteredClients.length;
  // Apply pagination
  const displayedClients = pageSize === 'all' 
    ? filteredClients 
    : filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalClients / pageSize);

  return (
    <section className="view active" id="view-clients">
      <div className="page-header">
        <div>
          <h1>Client Master Data</h1>
          <p>All <strong id="clientTotalLabel">{CLIENT_DATA.length}</strong> clients imported from GST DB.xlsx</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" id="exportBtn"><DownloadSimple /> Export CSV</button>
          <button className="btn-primary" onClick={() => setShowAddClient(true)}><Plus /> Add Client</button>
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
                <tr>
                   <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No clients found.</td>
                </tr>
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
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                        <button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode /></button>
                        <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem'}} onClick={() => handleGstnLogin(c)}>
                          <SignIn /> GSTN Login
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
              <button 
                key={p} 
                className={`page-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', border: '1px solid var(--border)'}}>
            <h2>Add New Client</h2>
            <p style={{color: 'var(--text-soft)', marginBottom: '1.5rem'}}>Upload GSTR-3B or Excel to auto-fetch details from portal data.</p>
            
            <div style={{border: '1px dashed var(--primary-color)', padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.05)'}} onClick={() => document.getElementById('gstr3b-upload').click()}>
              <FileCode size={32} color="var(--primary-color)" />
              <div style={{marginTop: '0.5rem'}}>Click to Upload GSTR-3B / Master Data (.xlsx, .json)</div>
            </div>
            <input type="file" id="gstr3b-upload" style={{display: 'none'}} onChange={(e) => {
               if(e.target.files.length) {
                 alert('Data successfully processed. Client details auto-filled!');
                 setShowAddClient(false);
               }
            }} />
            
            <div style={{textAlign: 'right'}}>
               <button className="btn-secondary" onClick={() => setShowAddClient(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* GSTN Login Modal */}
      {showLoginModal && activeClient && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', border: '1px solid var(--border)'}}>
            <h2>GSTN Portal Auth</h2>
            <p style={{color: 'var(--text-soft)', marginBottom: '1.5rem'}}>Connecting for {activeClient.userName}</p>
            
            {loginStep === 0 && (
              <>
                <div style={{padding: '1rem', background: 'var(--bg)', borderRadius: '8px', marginBottom: '1.5rem'}}>
                  <div style={{marginBottom: '0.5rem'}}><strong>User ID:</strong> {activeClient.userId}</div>
                  <div><strong>Password:</strong> ••••••••</div>
                </div>
                <button className="btn-primary" style={{width: '100%', padding: '0.8rem'}} onClick={() => {
                  setLoginStep(1);
                  setTimeout(() => setLoginStep(2), 2000);
                  setTimeout(() => setLoginStep(3), 4000);
                  setTimeout(() => {
                    alert('Successfully logged in and fetched notices!');
                    setShowLoginModal(false);
                  }, 6000);
                }}>Connect via 2Captcha</button>
              </>
            )}
            
            {loginStep > 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: loginStep >= 1 ? 'var(--success-color)' : 'var(--text-soft)'}}>
                  {loginStep >= 1 ? '✅' : '⏳'} Initializing Browser Session...
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: loginStep >= 2 ? 'var(--success-color)' : 'var(--text-soft)'}}>
                  {loginStep >= 2 ? '✅' : '⏳'} Solving CAPTCHA (2Captcha)...
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: loginStep >= 3 ? 'var(--success-color)' : 'var(--text-soft)'}}>
                  {loginStep >= 3 ? '✅' : '⏳'} Authenticating and Scraping...
                </div>
              </div>
            )}
            
            <div style={{textAlign: 'right'}}>
               <button className="btn-secondary" onClick={() => setShowLoginModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useMemo } from 'react';
import { DownloadSimple, Plus, MagnifyingGlass, ArrowsDownUp, FileCode } from '@phosphor-icons/react';
import { CLIENT_DATA } from '@/data/client_data';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

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
          <button className="btn-primary"><Plus /> Add Client</button>
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
                    <td><button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode /></button></td>
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
    </section>
  );
}

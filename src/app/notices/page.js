"use client";

import { useState } from 'react';
import { WarningOctagon, EnvelopeOpen, CheckSquare, CurrencyInr, FileCode, CheckCircle, Warning } from '@phosphor-icons/react';
import { NOTICES_DB } from '@/data/notices_data';

export default function NoticesPage() {
  const [notices] = useState(NOTICES_DB.notices || []);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredNotices = notices.filter(n => {
    if (filterType && n.type !== filterType) return false;
    if (filterStatus && n.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Critical': return <span className="status-badge critical"><WarningOctagon /> Critical</span>;
      case 'Open': return <span className="status-badge warning"><Warning /> Open</span>;
      case 'Replied': return <span className="status-badge success"><CheckCircle /> Replied</span>;
      case 'Drafted': return <span className="status-badge info">Drafted</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <section className="view active" id="view-notices">
      <div className="page-header">
        <div>
          <h1>GST Notices &amp; Orders</h1>
          <p>Manage, track and draft replies for all active notices across clients.</p>
        </div>
        <div className="header-actions">
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="SCN u/s 73">SCN u/s 73</option>
            <option value="SCN u/s 74">SCN u/s 74</option>
            <option value="ASMT-10">ASMT-10</option>
            <option value="ADT-02">ADT-02</option>
            <option value="GSTR-3A">GSTR-3A</option>
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Critical">Critical</option>
            <option value="Open">Open</option>
            <option value="Drafted">Drafted</option>
            <option value="Replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Notice KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><WarningOctagon /></div>
          <div className="kpi-body"><p>Critical</p><h2>{notices.filter(n => n.status === 'Critical').length}</h2></div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><EnvelopeOpen /></div>
          <div className="kpi-body"><p>Open</p><h2>{notices.filter(n => n.status === 'Open').length}</h2></div>
        </div>
        <div className="kpi-card kpi-indigo">
          <div className="kpi-icon"><CheckSquare /></div>
          <div className="kpi-body"><p>Replied</p><h2>{notices.filter(n => n.status === 'Replied').length}</h2></div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><CurrencyInr /></div>
          <div className="kpi-body"><p>Total Demand</p><h2>₹22.5L</h2></div>
        </div>
      </div>

      <div className="section-card no-pad">
        <div className="sc-header">
          <h2>Active Notices <span className="sc-count">{filteredNotices.length}</span></h2>
        </div>
        <div className="table-wrap">
          <table id="noticesTable">
            <thead>
              <tr>
                <th>Notice No.</th>
                <th>Client / GSTIN</th>
                <th>Type / Form</th>
                <th>Section</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Demand</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((n, i) => (
                <tr key={n.notice_id || i}>
                  <td><strong>{n.notice_id}</strong></td>
                  <td>
                    <div style={{fontWeight:500}}>{n.trade_name}</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text-soft)'}}>{n.gstin}</div>
                  </td>
                  <td>{n.type}</td>
                  <td><span className="badge-outline">{n.section}</span></td>
                  <td>{n.issue_date}</td>
                  <td style={{color: n.status === 'Critical' ? 'var(--danger-color)' : 'inherit', fontWeight: n.status==='Critical' ? 600 : 'normal'}}>{n.due_date}</td>
                  <td>{n.demand || '—'}</td>
                  <td>{getStatusBadge(n.status)}</td>
                  <td>
                    <div className="action-cell">
                      <button className="icon-btn-sm tooltip" data-tip="Generate Draft"><FileCode /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNotices.length === 0 && (
                <tr>
                   <td colSpan="9" style={{textAlign: 'center', padding: '2rem'}}>No notices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

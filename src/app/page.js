"use client";

import { useState, useEffect } from 'react';
import { UsersThree, Buildings, WarningCircle, ClockCountdown, CheckCircle, XCircle, Key, ChartBar, CalendarBlank, Plus, ArrowUpRight, ArrowDownRight, Minus, FileCode } from '@phosphor-icons/react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/data/client_data';

export default function Dashboard() {
  const [recentClients, setRecentClients] = useState([]);
  
  useEffect(() => {
    // Just get the first 5 clients for the dashboard preview
    setRecentClients(CLIENT_DATA.slice(0, 5));
  }, []);

  return (
    <section className="view active" id="view-dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time insight across all {CLIENT_DATA.length} clients in MARKUP GST Pro.</p>
        </div>
        <div className="header-actions">
          <span className="date-badge"><CalendarBlank /> <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
          <button className="btn-primary"><Plus /> Add Client</button>
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
        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><ClockCountdown /></div>
          <div className="kpi-body">
            <p>Pending Returns</p>
            <h2>142</h2>
            <span className="kpi-trend neutral"><Minus /> Due in 3 days</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        <div className="qs-box">
          <CheckCircle />
          <div>
            <span className="qs-val">{CLIENT_DATA.filter(c => c.gstn).length}</span>
            <span className="qs-label">Clients with GSTN</span>
          </div>
        </div>
        <div className="qs-box">
          <XCircle />
          <div>
            <span className="qs-val">{CLIENT_DATA.filter(c => !c.gstn).length}</span>
            <span className="qs-label">Missing GSTN</span>
          </div>
        </div>
        <div className="qs-box">
          <Key />
          <div>
            <span className="qs-val">{CLIENT_DATA.filter(c => c.password).length}</span>
            <span className="qs-label">With Credentials</span>
          </div>
        </div>
        <div className="qs-box">
          <ChartBar />
          <div>
            <span className="qs-val">Maharashtra</span>
            <span className="qs-label">Primary State (27)</span>
          </div>
        </div>
      </div>

      {/* Recent clients preview in dashboard */}
      <div className="section-card">
        <div className="sc-header">
          <h2>Recent Clients <span className="sc-count">{recentClients.length}</span></h2>
          <Link href="/clients" className="sc-link">View All Clients →</Link>
        </div>
        <div className="table-wrap">
          <table id="dashTable">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>User ID</th>
                <th>Password</th>
                <th>GSTN</th>
                <th>State</th>
                <th>Actions</th>
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
                    <div className="action-cell">
                      <button className="icon-btn-sm tooltip" data-tip="Generate Notice Reply"><FileCode /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

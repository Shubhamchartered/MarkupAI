"use client";

import { useState, useMemo } from 'react';
import { UserList, Plus, MagnifyingGlass, ArrowsDownUp, X, UploadSimple, ArrowLeft, Eye, WarningOctagon, CheckCircle, Clock, FileText, CaretRight } from '@phosphor-icons/react';
import { IT_CLIENT_DATA } from '@/data/it_client_data';
import { IT_NOTICES_DB } from '@/data/it_notices_data';
import { parseExcelSheet2 } from '@/lib/excel_parser';
import Link from 'next/link';

/* ── Taxpayer Detail Modal ───────────────────────────────────── */
function TaxpayerDetail({ taxpayer, onClose }) {
  const linked = IT_NOTICES_DB.notices.filter(n => n.pan === taxpayer.pan);
  const appeals = IT_NOTICES_DB.appeals.filter(a => a.pan === taxpayer.pan);

  const statusColor = (s) => {
    if (s === 'Critical') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' };
    if (s === 'Open') return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' };
    return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' };
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', width: '95%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), transparent)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' }}>{taxpayer.name}</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-soft)', flexWrap: 'wrap' }}>
              <span>PAN: <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{taxpayer.pan}</strong></span>
              {taxpayer.tan && <span>TAN: <strong>{taxpayer.tan}</strong></span>}
              {taxpayer.password && <span>Password: <strong>{taxpayer.password}</strong></span>}
              <span>AY: <strong>{taxpayer.ay}</strong></span>
              <span>Type: <strong>{taxpayer.type}</strong></span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={16} /></button>
        </div>

        {/* timeline */}
        <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notice Lifecycle Timeline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {['Notice Received', 'Under Review', 'Draft Prepared', 'Reply Filed', 'Order Received', 'Appeal Filed', 'Disposed'].map((step, i) => {
              const active = i <= 2;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700,
                    background: active ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-elevated)',
                    color: active ? '#fff' : 'var(--text-soft)',
                    border: active ? 'none' : '1px solid var(--border)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.72rem', fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text-soft)', whiteSpace: 'nowrap' }}>{step}</span>
                  {i < 6 && <div style={{ width: 20, height: 2, background: active ? '#10b981' : 'var(--border)' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notices */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          {linked.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-soft)' }}>
              <CheckCircle size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600 }}>No active notices for this taxpayer</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {linked.map(n => {
                const sc = statusColor(n.status);
                const daysLeft = Math.ceil((new Date(n.dueDate) - new Date()) / 86400000);
                return (
                  <div key={n.noticeId} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg)' }}>
                    <div style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n.noticeId}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>§{n.section} — {n.type}</span>
                        <span style={{ padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{n.status}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: daysLeft <= 5 ? '#ef4444' : 'var(--text-soft)', fontWeight: daysLeft <= 5 ? 700 : 400 }}>
                        {daysLeft <= 0 ? 'OVERDUE' : `${daysLeft} days left`}
                      </div>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                      {n.issuesRaised}
                    </div>
                    {n.demandAmount > 0 && (
                      <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem' }}>
                        Demand: <strong style={{ color: '#ef4444' }}>₹{Number(n.demandAmount).toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Taxpayers Page ─────────────────────────────────────── */
export default function TaxpayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [taxpayers, setTaxpayers] = useState(IT_CLIENT_DATA);
  const [selectedTaxpayer, setSelectedTaxpayer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('');
  const [excelResult, setExcelResult] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  // New taxpayer form
  const [newName, setNewName] = useState('');
  const [newPAN, setNewPAN] = useState('');
  const [newType, setNewType] = useState('Individual');
  const [newAY, setNewAY] = useState('2025-26');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return taxpayers.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.pan.toLowerCase().includes(q) || 
      t.type.toLowerCase().includes(q)
    );
  }, [searchQuery, taxpayers]);

  const handleSaveNew = () => {
    if (!newName || !newPAN) { alert('Name and PAN are required.'); return; }
    setTaxpayers(prev => [...prev, {
      name: newName, pan: newPAN.toUpperCase(), tan: '', ay: newAY,
      email: newEmail, phone: newPhone, type: newType, status: 'Active',
      assignedTo: 'CA Admin', noticeCount: 0, earliestDue: null, address: '',
    }]);
    setShowAddModal(false); setAddMode('');
    setNewName(''); setNewPAN(''); setNewEmail(''); setNewPhone('');
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelLoading(true);
    try {
      const result = await parseExcelSheet2(file);
      setExcelResult(result);
      if (result.success && result.data.length > 0) {
        const newTaxpayers = result.data.map(d => ({
          name: d.userName, pan: d.userId, tan: '', ay: d.ay || '2025-26',
          email: d.email || '', phone: d.phone || '', type: d.type || 'Individual',
          status: 'Active', assignedTo: 'CA Admin', noticeCount: 0, earliestDue: null, address: '',
        }));
        setTaxpayers(prev => [...newTaxpayers, ...prev]);
      }
    } catch (err) {
      setExcelResult({ success: false, errors: [err.message] });
    }
    setExcelLoading(false);
  };

  return (
    <section className="view active" id="view-it-taxpayers">
      <div className="page-header">
        <div>
          <h1>Taxpayer Directory</h1>
          <p>All <strong>{taxpayers.length}</strong> Income Tax taxpayers in TaxGuard AI</p>
        </div>
        <div className="header-actions">
          <Link href="/income-tax-dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> IT Dashboard
          </Link>
          <button className="btn-primary" onClick={() => { setShowAddModal(true); setAddMode(''); setExcelResult(null); }}>
            <Plus /> Add Taxpayer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="fb-search">
          <MagnifyingGlass />
          <input type="text" placeholder="Search by name, PAN, type…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={14} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="section-card no-pad">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="th-num">#</th>
                <th className="sortable">Name <ArrowsDownUp /></th>
                <th>PAN</th>
                <th>Type</th>
                <th>AY</th>
                <th>Notices</th>
                <th>Earliest Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No taxpayers found.</td></tr>
              ) : filtered.map((t, i) => {
                const statusStyles = {
                  'Active': { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
                  'Under Scrutiny': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
                  'Under Reassessment': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
                  'Search Case': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
                };
                const ss = statusStyles[t.status] || statusStyles['Active'];
                return (
                  <tr key={t.pan + i}>
                    <td className="td-num">#{i + 1}</td>
                    <td><strong>{t.name}</strong></td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>{t.pan}</span></td>
                    <td>{t.type}</td>
                    <td>{t.ay}</td>
                    <td>
                      {t.noticeCount > 0 ? (
                        <span style={{ padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: t.noticeCount >= 3 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: t.noticeCount >= 3 ? '#ef4444' : '#f59e0b' }}>{t.noticeCount}</span>
                      ) : <span style={{ color: 'var(--text-soft)' }}>—</span>}
                    </td>
                    <td>
                      {t.earliestDue ? (
                        <span style={{ fontSize: '0.82rem', color: new Date(t.earliestDue) < new Date() ? '#ef4444' : 'var(--text)', fontWeight: new Date(t.earliestDue) < new Date() ? 700 : 400 }}>
                          {new Date(t.earliestDue).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      ) : <span style={{ color: 'var(--text-soft)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ padding: '0.12rem 0.5rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, background: ss.bg, color: ss.color }}>{t.status}</span>
                    </td>
                    <td>
                      <button className="icon-btn-sm tooltip" data-tip="View Details" onClick={() => setSelectedTaxpayer(t)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filtered.length} of {taxpayers.length} taxpayers</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTaxpayer && <TaxpayerDetail taxpayer={selectedTaxpayer} onClose={() => setSelectedTaxpayer(null)} />}

      {/* Add Taxpayer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '560px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Taxpayer</h2>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Add individually or import from Excel Sheet 2</p>
              </div>
              <button onClick={() => { setShowAddModal(false); setAddMode(''); setExcelResult(null); }} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}><X size={16} /></button>
            </div>

            {addMode === '' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => setAddMode('manual')} style={{ padding: '1.1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', width: '100%', color: 'var(--text)' }}>
                  <span style={{ fontSize: '1.5rem' }}>✏️</span>
                  <div><div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Manual Entry</div><div style={{ color: 'var(--text-soft)', fontSize: '0.78rem' }}>Enter PAN, name, and details manually</div></div>
                </button>
                <button onClick={() => setAddMode('excel')} style={{ padding: '1.1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', width: '100%', color: 'var(--text)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                  <div><div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Import from Excel (Sheet 2)</div><div style={{ color: 'var(--text-soft)', fontSize: '0.78rem' }}>Upload .xlsx — reads Sheet 2 for PAN/TAN credentials</div></div>
                </button>
              </div>
            )}

            {addMode === 'manual' && (
              <div>
                <button onClick={() => setAddMode('')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1rem', fontSize: '0.82rem' }}><ArrowLeft size={14} /> Back</button>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  <div className="mf-group"><label className="mf-label">Full Name / Firm Name *</label><input className="mf-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Rajesh Kumar Sharma" /></div>
                  <div className="mf-group"><label className="mf-label">PAN *</label><input className="mf-input" value={newPAN} onChange={e => setNewPAN(e.target.value)} placeholder="ABCPS1234K" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="mf-group">
                      <label className="mf-label">Type</label>
                      <select className="mf-input" value={newType} onChange={e => setNewType(e.target.value)} style={{ padding: '0.55rem 0.75rem' }}>
                        <option>Individual</option><option>HUF</option><option>Firm</option><option>Company</option><option>AOP/BOI</option><option>Trust</option>
                      </select>
                    </div>
                    <div className="mf-group"><label className="mf-label">Assessment Year</label><input className="mf-input" value={newAY} onChange={e => setNewAY(e.target.value)} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="mf-group"><label className="mf-label">Email</label><input className="mf-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
                    <div className="mf-group"><label className="mf-label">Phone</label><input className="mf-input" value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button className="btn-secondary" onClick={() => { setShowAddModal(false); setAddMode(''); }}>Cancel</button>
                  <button className="btn-primary" onClick={handleSaveNew}>✅ Save Taxpayer</button>
                </div>
              </div>
            )}

            {addMode === 'excel' && (
              <div>
                <button onClick={() => { setAddMode(''); setExcelResult(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', marginBottom: '1rem', fontSize: '0.82rem' }}><ArrowLeft size={14} /> Back</button>
                
                {!excelResult && (
                  <div style={{ border: '2px dashed var(--border)', padding: '3rem', textAlign: 'center', borderRadius: '14px', background: 'var(--bg)', cursor: 'pointer' }} onClick={() => document.getElementById('it-excel-upload').click()}>
                    <UploadSimple size={40} color="#10b981" style={{ marginBottom: '0.75rem' }} />
                    <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{excelLoading ? 'Parsing Sheet 2…' : 'Click to Upload Excel (.xlsx)'}</div>
                    <div style={{ color: 'var(--text-soft)', fontSize: '0.82rem' }}>Reads <strong>Sheet 2</strong> with columns: userName, userId (PAN/TAN), password</div>
                  </div>
                )}
                <input type="file" id="it-excel-upload" style={{ display: 'none' }} accept=".xlsx,.xls" onChange={handleExcelUpload} />

                {excelResult && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: excelResult.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${excelResult.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, color: excelResult.success ? '#10b981' : '#ef4444', marginBottom: '0.3rem' }}>
                        {excelResult.success ? `✅ Successfully imported ${excelResult.data.length} taxpayers from "${excelResult.sheetName}"` : '❌ Import had issues'}
                      </div>
                      {excelResult.errors?.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.3rem' }}>
                          {excelResult.errors.slice(0, 5).map((err, i) => <div key={i}>⚠️ {err}</div>)}
                        </div>
                      )}
                    </div>
                    {excelResult.data.length > 0 && (
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <table style={{ fontSize: '0.8rem' }}>
                          <thead><tr><th>Name</th><th>PAN/TAN</th><th>Type</th></tr></thead>
                          <tbody>
                            {excelResult.data.slice(0, 10).map((d, i) => (
                              <tr key={i}><td>{d.userName}</td><td style={{ fontFamily: 'monospace' }}>{d.userId}</td><td>{d.idType}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button className="btn-primary" onClick={() => { setShowAddModal(false); setAddMode(''); setExcelResult(null); }} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Done</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

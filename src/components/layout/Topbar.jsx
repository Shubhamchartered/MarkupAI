"use client";

import { List, MagnifyingGlass, Sun, Moon, Bell, CaretDown, Buildings, SignOut } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Topbar({ toggleSidebar }) {
  const [theme, setTheme] = useState('dark');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [firmName, setFirmName] = useState('CA Shubham & Associates');
  const [firmGSTN, setFirmGSTN] = useState('27AADCA1234F1Z9');
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('markup_auth');
    router.replace('/login');
  };

  return (
    <header className="topbar" id="topbar">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <List />
      </button>

      <div className="search-wrap">
        <MagnifyingGlass />
        <input type="text" id="globalSearch" placeholder="Search clients, User ID, GSTN…" autoComplete="off" />
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-right">
        <Link href="/select-module" className="icon-btn" title="Switch Module" style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.8rem', textDecoration:'none', color:'var(--text-soft)', padding:'0.4rem 0.8rem', border:'1px solid var(--border)', borderRadius:'8px' }}>
          <Buildings size={16} /> Main Dashboard
        </Link>

        <button className="icon-btn" onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        <button className="icon-btn notif-btn" title="Notifications">
          <Bell />
          <span className="notif-dot"></span>
        </button>

        {/* User Dropdown */}
        <div className="topbar-user-wrap" ref={menuRef} style={{ position: 'relative' }}>
          <div className="topbar-user" onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ cursor: 'pointer' }}>
            <img src="https://ui-avatars.com/api/?name=CA+Admin&background=4f46e5&color=fff&size=36" alt="User" />
            <span>CA Admin</span>
            <CaretDown style={{ transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '0.5rem', minWidth: '200px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 9999
            }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>CA Admin</div>
                <div style={{ color: 'var(--text-soft)', fontSize: '0.75rem' }}>admin@markup.ai</div>
              </div>
              <button onClick={() => { setShowFirmModal(true); setUserMenuOpen(false); }} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.65rem 1rem', textAlign: 'left', color: 'var(--text)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem'
              }}>
                <Buildings size={16} /> Firm Details
              </button>
              <button onClick={handleLogout} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.65rem 1rem', textAlign: 'left', color: 'var(--danger-color)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem'
              }}>
                <SignOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Firm Details Modal */}
      {showFirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '480px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Firm Details</h2>
            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label">Firm / CA Name</label>
              <input className="mf-input" value={firmName} onChange={e => setFirmName(e.target.value)} />
            </div>
            <div className="mf-group" style={{ marginBottom: '1rem' }}>
              <label className="mf-label">Firm GSTN</label>
              <input className="mf-input" value={firmGSTN} onChange={e => setFirmGSTN(e.target.value)} />
            </div>
            <div className="mf-group" style={{ marginBottom: '1.5rem' }}>
              <label className="mf-label">Email</label>
              <input className="mf-input" defaultValue="admin@markup.ai" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowFirmModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { alert('Firm details saved!'); setShowFirmModal(false); }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { List, MagnifyingGlass, Sun, Moon, Bell, CaretDown, Buildings, Receipt, SignOut, ArrowsLeftRight } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { searchClients } from '@/lib/notice_sync';

export default function Topbar({ toggleSidebar }) {
  const [theme, setTheme] = useState('dark');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [firmName, setFirmName] = useState('CA Shubham & Associates');
  const [firmGSTN, setFirmGSTN] = useState('27AADCA1234F1Z9');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const isITRoute = pathname?.startsWith('/income-tax');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search against CLIENT_DATA
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchClients(searchQuery, 8);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (client) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/clients?q=${encodeURIComponent(client.userName)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('markup_auth');
    router.replace('/login');
  };

  return (
    <header className="topbar" id="topbar">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <List />
      </button>

      <div className="search-wrap" ref={searchRef} style={{ position: 'relative' }}>
        <MagnifyingGlass />
        <input
          type="text"
          id="globalSearch"
          placeholder={isITRoute ? 'Search taxpayers, PAN…' : 'Search clients, User ID, GSTN…'}
          autoComplete="off"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
        />
        <kbd>⌘K</kbd>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            zIndex: 9999, maxHeight: '380px', overflowY: 'auto',
          }}>
            <div style={{ padding: '0.5rem 1rem 0.3rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {searchResults.length} result{searchResults.length > 1 ? 's' : ''} found
            </div>
            {searchResults.map((c, i) => (
              <button
                key={c.userId || i}
                onClick={() => handleSelectResult(c)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 800
                }}>
                  {(c.userName || '??').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.userName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', gap: '0.75rem' }}>
                    <span>{c.userId}</span>
                    <span style={{ fontFamily: 'monospace' }}>{c.gstn}</span>
                  </div>
                </div>
                {c.noticeCount > 0 && (
                  <span style={{
                    padding: '0.1rem 0.45rem', borderRadius: '99px', fontSize: '0.68rem',
                    fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#EF4444',
                    border: '1px solid rgba(239,68,68,0.25)', flexShrink: 0,
                  }}>
                    {c.noticeCount} notice{c.noticeCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            zIndex: 9999, padding: '1.5rem', textAlign: 'center',
            color: 'var(--text-soft)', fontSize: '0.88rem',
          }}>
            No clients found for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* Context badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '8px', background: isITRoute ? 'rgba(14,165,233,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${isITRoute ? 'rgba(14,165,233,0.25)' : 'rgba(99,102,241,0.2)'}`, fontSize: '0.72rem', fontWeight: 700, color: isITRoute ? '#0ea5e9' : '#6366F1' }}>
          {isITRoute ? <Buildings size={13} /> : <Receipt size={13} />}
          {isITRoute ? 'Income Tax' : 'GST'}
        </div>

        <Link href="/select-module" className="icon-btn" title="Switch Module" style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.8rem', textDecoration:'none', color:'var(--text-soft)', padding:'0.4rem 0.8rem', border:'1px solid var(--border)', borderRadius:'8px' }}>
          <ArrowsLeftRight size={14} /> {isITRoute ? 'Switch to GST' : 'Switch Module'}
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

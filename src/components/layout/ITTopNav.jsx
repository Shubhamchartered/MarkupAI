"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquaresFour, WarningOctagon, FileText, Gavel, ArrowsLeftRight,
  MagnifyingGlass, Bell, ArrowLeft, CaretDown, ShieldCheck, Sun, Moon, Brain
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  {
    label: 'IT Dashboard',
    href: '/income-tax-dashboard',
    icon: <SquaresFour size={15} weight="duotone" />,
    exact: true,
  },
  {
    label: 'AI Engine',
    href: '/income-tax-dashboard/ai-search',
    icon: <Brain size={15} weight="duotone" color="#0ea5e9" />,
  },
  {
    label: 'Income Tax Notice',
    icon: <WarningOctagon size={15} weight="duotone" />,
    dropdown: true,
    children: [
      { label: 'IT Notices', href: '/income-tax-dashboard/notices', icon: <WarningOctagon size={13} /> },
      { label: 'IT Notice Drafts', href: '/income-tax-dashboard/drafting', icon: <FileText size={13} /> },
      { label: 'Assessment', href: '/income-tax-dashboard/assessments', icon: <Gavel size={13} /> },
      { label: 'Cross-Act Verify', href: '/income-tax-dashboard/cross-act', icon: <ArrowsLeftRight size={13} /> },
    ],
  },
  {
    label: 'Client Alerts',
    href: '/income-tax-dashboard/alerts',
    icon: <Bell size={15} />,
  },
];

export default function ITTopNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  }, []);

  const toggleTheme = () => {
    const newT = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newT);
    setTheme(newT);
  };

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  const isGroupActive = (children) => children?.some(c => pathname?.startsWith(c.href));

  // Close menus if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.it-topnav-dropdown')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="it-topnav" id="itTopNav">
      {/* Left: Brand */}
      <div className="it-topnav-brand">
        <div className="it-topnav-logo">
          <span>TAX</span>
        </div>
        <span className="it-topnav-name">TaxGuard<span>.AI</span></span>
        <Link href="/" className="it-topnav-switch">
          <ArrowLeft size={11} /> GST Module
        </Link>
      </div>

      {/* Center: Nav links */}
      <nav className="it-topnav-links" style={{ justifyContent: 'center' }}>
        {NAV_ITEMS.map((item) => {
          if (item.dropdown) {
            const active = isGroupActive(item.children);
            const isOpen = openMenu === item.label;
            return (
              <div
                key={item.label}
                className={`it-topnav-dropdown ${isOpen ? 'open' : ''} ${active ? 'it-nav-active' : ''}`}
              >
                <button 
                  className={`it-topnav-link ${active ? 'it-nav-active' : ''}`}
                  onClick={() => setOpenMenu(isOpen ? null : item.label)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <CaretDown size={11} className={`it-topnav-caret ${isOpen ? 'rotated' : ''}`} />
                </button>
                <div className="it-topnav-menu">
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`it-topnav-menu-item ${isActive(child.href) ? 'it-nav-active' : ''}`}
                      onClick={() => setOpenMenu(null)}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`it-topnav-link ${isActive(item.href, item.exact) ? 'it-nav-active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="it-topnav-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun weight="duotone" /> : <Moon weight="duotone" />}
        </button>
        <button className="icon-btn notif-dot">
          <Bell weight="duotone" />
        </button>
        <div className={`it-topnav-dropdown ${openMenu === 'Admin' ? 'open' : ''}`}>
          <div className="topbar-user" onClick={() => setOpenMenu(openMenu === 'Admin' ? null : 'Admin')} style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=e0f2fe" alt="User" style={{ borderColor: 'var(--sky-500)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <span style={{ lineHeight: '1.2' }}>CA Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', lineHeight: '1' }}>IT Module</span>
            </div>
            <CaretDown size={11} style={{ color: 'var(--text-soft)' }} className={`it-topnav-caret ${openMenu === 'Admin' ? 'rotated' : ''}`} />
          </div>
          
          <div className="it-topnav-menu" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
            <Link href="#" className="it-topnav-menu-item" onClick={() => setOpenMenu(null)}>
              <span style={{ fontSize: '1.2rem' }}>👤</span>
              <span>Profile</span>
            </Link>
            <Link href="#" className="it-topnav-menu-item" onClick={() => setOpenMenu(null)}>
              <span style={{ fontSize: '1.2rem' }}>💎</span>
              <span>Subscription Plan</span>
            </Link>
            <div style={{ height: '1px', background: 'var(--border)', margin: '0.4rem 0' }} />
            <Link href="/login" className="it-topnav-menu-item" onClick={() => { localStorage.removeItem('markup_auth'); setOpenMenu(null); }} style={{ color: 'var(--danger)' }}>
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain, SquaresFour, UsersThree, 
  UserList, WarningOctagon, Scales, ChatCircleDots,
  CaretDown, ShieldCheck, Sun, Moon, Bell, ArrowRight
} from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  {
    label: 'AI Engine',
    href: '/ai',
    icon: <Brain size={15} weight="duotone" color="#8B5CF6" />,
  },
  {
    label: 'GST Dashboard',
    href: '/',
    icon: <SquaresFour size={15} weight="duotone" />,
    exact: true,
  },
  {
    label: 'Client',
    icon: <UsersThree size={15} weight="duotone" />,
    dropdown: true,
    children: [
      { label: 'All Clients', href: '/clients', icon: <UserList size={13} /> },
      { label: 'Notices & Matter', href: '/notices', icon: <WarningOctagon size={13} /> },
      { label: 'Litigation Drafts', href: '/legal', icon: <Scales size={13} /> },
    ],
  },
  {
    label: 'Client Alerts',
    href: '/comms',
    icon: <ChatCircleDots size={15} weight="duotone" color="#f59e0b" />,
  },
];

export default function GSTTopNav() {
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
    <div className="it-topnav" id="gstTopNav">
      {/* Left: Brand */}
      <div className="it-topnav-brand">
        <div className="it-topnav-logo" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          <span>M</span>
        </div>
        <span className="it-topnav-name" style={{ color: 'var(--indigo-500)' }}>MARKUP<span style={{ color: '#8B5CF6' }}>.AI</span></span>
        
        {/* Switch Module */}
        <Link href="/income-tax-dashboard" className="it-topnav-switch" style={{ marginLeft: '1rem', borderColor: 'var(--indigo-500)', color: 'var(--indigo-500)', background: 'rgba(99,102,241,0.06)' }}>
          Income Tax Dashboard <ArrowRight size={11} />
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
                className={`it-topnav-dropdown ${isOpen ? 'open' : ''} ${active ? 'gst-nav-active' : ''}`}
              >
                <button 
                  className={`it-topnav-link ${active ? 'gst-nav-active' : ''}`}
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
                      className={`it-topnav-menu-item ${isActive(child.href) ? 'gst-nav-active' : ''}`}
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
              className={`it-topnav-link ${isActive(item.href, item.exact) ? 'gst-nav-active' : ''}`}
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
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=e0e7ff" alt="User" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <span style={{ lineHeight: '1.2' }}>CA Admin</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', lineHeight: '1' }}>GST Module</span>
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

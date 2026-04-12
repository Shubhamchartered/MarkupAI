"use client";

import { List, MagnifyingGlass, Sun, Moon, Bell, CaretDown } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

export default function Topbar({ toggleSidebar }) {
  const [theme, setTheme] = useState('dark');

  // Skip the effect on first render to match SSR and apply strictly on the client
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        <button className="icon-btn notif-btn" title="Notifications">
          <Bell />
          <span className="notif-dot"></span>
        </button>
        <div className="topbar-user">
          <img src="https://ui-avatars.com/api/?name=CA+Admin&background=4f46e5&color=fff&size=36" alt="User" />
          <span>CA Admin</span>
          <CaretDown />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Receipt, Brain, SquaresFour, UsersThree, 
  CaretDown, UserList, WarningOctagon, Scales, 
  ChatCircleDots, FileCode, Export, Gear 
} from '@phosphor-icons/react';

export default function Sidebar() {
  const pathname = usePathname();
  const [clientOpen, setClientOpen] = useState(true);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><Receipt weight="bold" /></div>
        <div className="brand-text">
          <span className="brand-name">MARKUP</span>
          <span className="brand-sub">GST Pro</span>
        </div>
      </div>

      <nav className="sidebar-nav" id="mainNav">
        <div className="nav-section-label">MAIN MENU</div>

        <Link href="/ai" className={`nav-link ${pathname === '/ai' ? 'active' : ''}`}>
          <Brain />
          <span>AI Engine</span>
          <span className="nav-badge" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>AI</span>
        </Link>

        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          <SquaresFour />
          <span>Dashboard</span>
        </Link>

        {/* Client Group */}
        <div className={`nav-group ${clientOpen ? 'expanded' : ''}`} id="navGroupClient">
          <button 
            className="nav-link nav-group-toggle" 
            onClick={() => setClientOpen(!clientOpen)}
          >
            <UsersThree />
            <span>Client</span>
            <span className="nav-badge">381</span>
            <CaretDown className="nav-caret" style={{ transform: clientOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          
          <div className="nav-submenu" style={{ display: clientOpen ? 'block' : 'none' }}>
            <Link href="/clients" className={`nav-link nav-sub ${pathname === '/clients' ? 'active' : ''}`}>
              <UserList />
              <span>All Clients</span>
            </Link>
            <Link href="/notices" className={`nav-link nav-sub ${pathname === '/notices' ? 'active' : ''}`}>
              <WarningOctagon />
              <span>Notices</span>
              <span className="nav-badge danger">8</span>
            </Link>
            <Link href="/legal" className={`nav-link nav-sub ${pathname === '/legal' ? 'active' : ''}`}>
              <Scales />
              <span>Litigation Drafts</span>
            </Link>
            <Link href="/matter" className={`nav-link nav-sub ${pathname === '/matter' ? 'active' : ''}`}>
              <FileCode />
              <span>Matter Record</span>
            </Link>
            <Link href="/comms" className={`nav-link nav-sub ${pathname === '/comms' ? 'active' : ''}`}>
              <ChatCircleDots />
              <span>Client Alerts</span>
            </Link>
          </div>
        </div>

        <div className="nav-section-label" style={{ marginTop: '1.5rem' }}>SYSTEM</div>
        <a href="#" className="nav-link">
          <Export />
          <span>Export Data</span>
        </a>
        <a href="#" className="nav-link">
          <Gear />
          <span>Settings</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <img src="https://ui-avatars.com/api/?name=CA+Admin&background=4f46e5&color=fff&size=40" alt="Admin" />
          <div>
            <div className="su-name">CA Admin</div>
            <div className="su-role">Tax Professional</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

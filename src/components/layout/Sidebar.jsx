"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, SquaresFour, UsersThree, 
  CaretDown, UserList, WarningOctagon, Scales, 
  ChatCircleDots, Export, Gear, SparkleIcon
} from '@phosphor-icons/react';

// Brand logo using text instead of Receipt icon for new branding
function MarkupLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-1px'
      }}>M</div>
      <div className="brand-text">
        <span className="brand-name" style={{ letterSpacing: '0.05em' }}>MARKUP</span>
        <span className="brand-sub" style={{ color: '#8B5CF6', fontWeight: 700 }}>.AI</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [clientOpen, setClientOpen] = useState(true);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <MarkupLogo />
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
          <span>GST Dashboard</span>
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
            <CaretDown className={`nav-caret ${clientOpen ? 'open' : ''}`} />
          </button>
          
          <div className={`nav-submenu ${clientOpen ? 'open' : ''}`}>
            <Link href="/clients" className={`nav-link nav-sub ${pathname === '/clients' ? 'active' : ''}`}>
              <UserList />
              <span>All Clients</span>
            </Link>
            <Link href="/notices" className={`nav-link nav-sub ${pathname === '/notices' ? 'active' : ''}`}>
              <WarningOctagon />
              <span>Notices & Matter</span>
              <span className="nav-badge danger">8</span>
            </Link>
            <Link href="/legal" className={`nav-link nav-sub ${pathname === '/legal' ? 'active' : ''}`}>
              <Scales />
              <span>Litigation Drafts</span>
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

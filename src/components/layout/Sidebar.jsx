"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, SquaresFour, UsersThree, 
  CaretDown, UserList, WarningOctagon, Scales, 
  ChatCircleDots, Buildings, Gavel, MagnifyingGlass,
  FileText, TreeStructure, ArrowsLeftRight
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
  const [itOpen, setITOpen] = useState(pathname?.startsWith('/income-tax'));

  const isITActive = pathname?.startsWith('/income-tax');

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

        {/* Client Group (GST) */}
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

        {/* ── Income Tax Group ─── */}
        <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>INCOME TAX</div>
        
        <div className={`nav-group ${itOpen ? 'expanded' : ''}`} id="navGroupIT">
          <button 
            className={`nav-link nav-group-toggle ${isITActive ? 'group-active' : ''}`}
            onClick={() => setITOpen(!itOpen)}
          >
            <Buildings />
            <span>TaxGuard AI</span>
            <span className="nav-badge" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>IT</span>
            <CaretDown className={`nav-caret ${itOpen ? 'open' : ''}`} />
          </button>

          <div className={`nav-submenu ${itOpen ? 'open' : ''}`}>
            <Link href="/income-tax-dashboard" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard' ? 'active' : ''}`}>
              <SquaresFour />
              <span>IT Dashboard</span>
            </Link>
            <Link href="/income-tax-dashboard/taxpayers" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/taxpayers' ? 'active' : ''}`}>
              <UserList />
              <span>Taxpayers</span>
            </Link>
            <Link href="/income-tax-dashboard/notices" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/notices' ? 'active' : ''}`}>
              <WarningOctagon />
              <span>IT Notices</span>
              <span className="nav-badge danger">10</span>
            </Link>
            <Link href="/income-tax-dashboard/drafting" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/drafting' ? 'active' : ''}`}>
              <FileText />
              <span>IT Drafting</span>
            </Link>
            <Link href="/income-tax-dashboard/assessments" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/assessments' ? 'active' : ''}`}>
              <Gavel />
              <span>Assessments</span>
            </Link>
            <Link href="/income-tax-dashboard/ai-search" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/ai-search' ? 'active' : ''}`}>
              <MagnifyingGlass />
              <span>AI Legal Search</span>
            </Link>
            <Link href="/income-tax-dashboard/cross-act" className={`nav-link nav-sub ${pathname === '/income-tax-dashboard/cross-act' ? 'active' : ''}`}>
              <ArrowsLeftRight />
              <span>Cross-Act</span>
            </Link>
          </div>
        </div>

      </nav>
    </aside>
  );
}

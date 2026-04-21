"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, SquaresFour, UsersThree, 
  CaretDown, UserList, WarningOctagon, Scales, 
  ChatCircleDots, Buildings, Gavel, MagnifyingGlass,
  FileText, ArrowsLeftRight, Bell, ArrowLeft, ArrowRight,
  PaperPlaneTilt, ShieldCheck
} from '@phosphor-icons/react';

/* ── Brand Logo ─── */
function GSTLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>M</div>
      <div className="brand-text">
        <span className="brand-name" style={{ letterSpacing: '0.05em' }}>MARKUP</span>
        <span className="brand-sub" style={{ color: '#8B5CF6', fontWeight: 700 }}>.AI</span>
      </div>
    </div>
  );
}

/* ── GST Sidebar ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const [clientOpen, setClientOpen] = useState(true);
  const [itOpen, setItOpen] = useState(false);

  const isActive = (href) => pathname === href;
  const isGroupActive = (prefix) => pathname?.startsWith(prefix);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <GSTLogo />
      </div>

      <nav className="sidebar-nav" id="mainNav">

        <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>MAIN MENU</div>

        <Link href="/ai" className={`nav-link ${isActive('/ai') ? 'active' : ''}`}>
          <Brain />
          <span>AI Engine</span>
          <span className="nav-badge" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>AI</span>
        </Link>

        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <SquaresFour />
          <span>GST Dashboard</span>
        </Link>

        {/* Client Group */}
        <div className={`nav-group ${clientOpen ? 'expanded' : ''}`} id="navGroupClient">
          <button className="nav-link nav-group-toggle" onClick={() => setClientOpen(!clientOpen)}>
            <UsersThree />
            <span>Client</span>
            <span className="nav-badge">381</span>
            <CaretDown className={`nav-caret ${clientOpen ? 'open' : ''}`} />
          </button>
          <div className={`nav-submenu ${clientOpen ? 'open' : ''}`}>
            <Link href="/clients" className={`nav-link nav-sub ${isActive('/clients') ? 'active' : ''}`}>
              <UserList /><span>All Clients</span>
            </Link>
            <Link href="/notices" className={`nav-link nav-sub ${isActive('/notices') ? 'active' : ''}`}>
              <WarningOctagon /><span>Notices &amp; Matter</span>
              <span className="nav-badge danger">8</span>
            </Link>
            <Link href="/legal" className={`nav-link nav-sub ${isActive('/legal') ? 'active' : ''}`}>
              <Scales /><span>Litigation Drafts</span>
            </Link>
            <Link href="/comms" className={`nav-link nav-sub ${isActive('/comms') ? 'active' : ''}`}>
              <ChatCircleDots /><span>Client Alerts</span>
            </Link>
          </div>
        </div>

        {/* Income Tax Module */}
        <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>INCOME TAX</div>

        {/* IT Dashboard link */}
        <Link href="/income-tax-dashboard"
          className={`nav-link ${isActive('/income-tax-dashboard') ? 'active it-active' : ''}`}
          style={{ color: isGroupActive('/income-tax') ? 'var(--sky-400)' : undefined }}>
          <Buildings />
          <span>IT Dashboard</span>
          <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </Link>

        {/* Income Tax Notice dropdown */}
        <div className={`nav-group ${itOpen ? 'expanded' : ''}`} id="navGroupIT">
          <button
            className={`nav-link nav-group-toggle ${isGroupActive('/income-tax-dashboard/notices') || isGroupActive('/income-tax-dashboard/drafting') || isGroupActive('/income-tax-dashboard/assessments') || isGroupActive('/income-tax-dashboard/cross-act') ? 'group-active' : ''}`}
            onClick={() => setItOpen(!itOpen)}
            style={{ color: itOpen ? 'var(--sky-400)' : undefined }}
          >
            <WarningOctagon style={{ color: 'var(--sky-400)' }} />
            <span>Income Tax Notice</span>
            <CaretDown className={`nav-caret ${itOpen ? 'open' : ''}`} />
          </button>
          <div className={`nav-submenu ${itOpen ? 'open' : ''}`} style={{ maxHeight: itOpen ? '260px' : '0' }}>
            <Link href="/income-tax-dashboard/notices"
              className={`nav-link nav-sub ${pathname?.startsWith('/income-tax-dashboard/notices') ? 'active' : ''}`}
              style={{ color: pathname?.startsWith('/income-tax-dashboard/notices') ? 'var(--sky-400)' : undefined }}>
              <WarningOctagon size={14} /><span>IT Notices</span>
            </Link>
            <Link href="/income-tax-dashboard/drafting"
              className={`nav-link nav-sub ${pathname?.startsWith('/income-tax-dashboard/drafting') ? 'active' : ''}`}
              style={{ color: pathname?.startsWith('/income-tax-dashboard/drafting') ? 'var(--sky-400)' : undefined }}>
              <FileText size={14} /><span>IT Notice Drafts</span>
            </Link>
            <Link href="/income-tax-dashboard/assessments"
              className={`nav-link nav-sub ${pathname?.startsWith('/income-tax-dashboard/assessments') ? 'active' : ''}`}
              style={{ color: pathname?.startsWith('/income-tax-dashboard/assessments') ? 'var(--sky-400)' : undefined }}>
              <Gavel size={14} /><span>Assessment</span>
            </Link>
            <Link href="/income-tax-dashboard/cross-act"
              className={`nav-link nav-sub ${pathname?.startsWith('/income-tax-dashboard/cross-act') ? 'active' : ''}`}
              style={{ color: pathname?.startsWith('/income-tax-dashboard/cross-act') ? 'var(--sky-400)' : undefined }}>
              <ArrowsLeftRight size={14} /><span>Cross-Act Verify</span>
            </Link>
          </div>
        </div>

        {/* AI Legal Search */}
        <Link href="/income-tax-dashboard/ai-search"
          className={`nav-link ${pathname?.startsWith('/income-tax-dashboard/ai-search') ? 'active' : ''}`}
          style={{ color: pathname?.startsWith('/income-tax-dashboard/ai-search') ? 'var(--sky-400)' : undefined }}>
          <MagnifyingGlass style={{ color: '#0ea5e9' }} />
          <span>AI Legal Search</span>
          <span className="nav-badge" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', fontSize: '0.6rem' }}>AI</span>
        </Link>

        {/* Client Alerts */}
        <Link href="/income-tax-dashboard/alerts"
          className={`nav-link ${pathname?.startsWith('/income-tax-dashboard/alerts') ? 'active' : ''}`}
          style={{ color: pathname?.startsWith('/income-tax-dashboard/alerts') ? 'var(--sky-400)' : undefined }}>
          <Bell style={{ color: '#0ea5e9' }} />
          <span>Client Alerts</span>
        </Link>

      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-switch-footer">
          <PaperPlaneTilt size={16} color="var(--indigo-500)" />
          <span>MARKUP.AI — GST Module</span>
        </div>
      </div>
    </aside>
  );
}

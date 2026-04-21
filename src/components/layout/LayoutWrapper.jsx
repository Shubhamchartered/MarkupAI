"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import GSTTopNav from './GSTTopNav';
import ITTopNav from './ITTopNav';

/* ─── Breadcrumb map for IT pages ─── */
const IT_BREADCRUMBS = {
  '/income-tax-dashboard': ['TaxGuard AI', 'IT Dashboard'],
  '/income-tax-dashboard/notices': ['TaxGuard AI', 'Income Tax Notice', 'IT Notices'],
  '/income-tax-dashboard/drafting': ['TaxGuard AI', 'Income Tax Notice', 'IT Notice Drafts'],
  '/income-tax-dashboard/assessments': ['TaxGuard AI', 'Income Tax Notice', 'Assessment'],
  '/income-tax-dashboard/cross-act': ['TaxGuard AI', 'Income Tax Notice', 'Cross-Act Verify'],
  '/income-tax-dashboard/ai-search': ['TaxGuard AI', 'AI Legal Search'],
  '/income-tax-dashboard/alerts': ['TaxGuard AI', 'Client Alerts'],
};

const GST_BREADCRUMBS = {
  '/': ['MARKUP.AI', 'GST Dashboard'],
  '/ai': ['MARKUP.AI', 'AI Engine'],
  '/clients': ['MARKUP.AI', 'Client', 'All Clients'],
  '/notices': ['MARKUP.AI', 'Client', 'Notices & Matter'],
  '/legal': ['MARKUP.AI', 'Client', 'Litigation Drafts'],
  '/comms': ['MARKUP.AI', 'Client', 'Client Alerts'],
};

function Breadcrumb({ pathname, isIT }) {
  const crumbs = isIT 
    ? (IT_BREADCRUMBS[pathname] || ['TaxGuard AI', 'IT Module'])
    : (GST_BREADCRUMBS[pathname] || ['MARKUP.AI', 'GST Module']);
    
  return (
    <div className="it-page-breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {i > 0 && <span className="bc-sep">›</span>}
          <span className={i === crumbs.length - 1 ? 'bc-active' : ''}>{crumb}</span>
        </span>
      ))}
    </div>
  );
}

export default function LayoutWrapper({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const isAuth = localStorage.getItem('markup_auth') === 'true';
    if (!isAuth && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router]);

  const isAuthPage = pathname === '/login' || pathname === '/select-module';
  const isITRoute = pathname?.startsWith('/income-tax');

  if (!mounted) return null;

  const isAuth = localStorage.getItem('markup_auth') === 'true';
  if (!isAuth && pathname !== '/login') return null;

  if (isAuthPage) {
    return <div className="layout-auth">{children}</div>;
  }

  /* ── IT Module: Horizontal top nav layout ── */
  if (isITRoute) {
    return (
      <div className="layout-it">
        <ITTopNav />
        <div className="it-main-wrapper">
          <div className="it-content-area" id="contentArea">
            <Breadcrumb pathname={pathname} isIT={true} />
            {children}
          </div>
        </div>
      </div>
    );
  }

  /* ── GST Module: Horizontal top nav layout ── */
  return (
    <div className="layout-it">
      <GSTTopNav />
      <div className="it-main-wrapper">
        <div className="it-content-area" id="contentArea">
          <Breadcrumb pathname={pathname} isIT={false} />
          {children}
        </div>
      </div>
    </div>
  );
}

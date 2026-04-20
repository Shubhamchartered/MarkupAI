"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  if (!mounted) {
    return null; // Don't render until client side is hydrated to prevent mismatch and content flash
  }

  const isAuth = localStorage.getItem('markup_auth') === 'true';
  if (!isAuth && pathname !== '/login') {
    return null; // prevent protected content from flashing before redirect completes
  }

  if (isAuthPage) {
    return <div className="layout-auth">{children}</div>;
  }

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar />
      <div className="main-wrapper">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content-area" id="contentArea">
          {children}
        </div>
      </div>
    </div>
  );
}

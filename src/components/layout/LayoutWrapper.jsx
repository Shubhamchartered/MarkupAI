"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/select-module';

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

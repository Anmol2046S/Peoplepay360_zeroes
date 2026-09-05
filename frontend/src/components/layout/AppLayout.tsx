import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      <div className="main-content">
        <Header onToggleMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
export default AppLayout;

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { BreadcrumbProvider } from '../contexts/BreadcrumbContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayoutContent = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          {/* Accessible Interactive Breadcrumbs */}
          <Breadcrumb />

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-6 pb-6 pt-2 h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <BreadcrumbProvider>
      <DashboardLayoutContent />
    </BreadcrumbProvider>
  );
};

export default DashboardLayout;

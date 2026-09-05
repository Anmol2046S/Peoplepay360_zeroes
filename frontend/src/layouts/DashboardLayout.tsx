import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          {/* Breadcrumbs */}
          <div className="px-6 pt-5 pb-1 flex items-center text-xs font-medium text-gray-400 dark:text-gray-500 capitalize tracking-wide">
            Home <span className="mx-2 text-gray-300 dark:text-gray-700">/</span> {location.pathname.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ')}
          </div>
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

export default DashboardLayout;

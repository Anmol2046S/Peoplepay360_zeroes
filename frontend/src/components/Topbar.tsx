import { Search, Bell, HelpCircle, Plus, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800/80 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 transition-colors duration-300">
      <div className="flex-1 max-w-2xl flex items-center">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search employees, payroll, attendance or actions... (Ctrl+K)" 
            className="w-full pl-11 pr-4 py-2.5 bg-gray-100/50 dark:bg-slate-900/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 font-medium text-gray-700 dark:text-slate-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded transition-colors">Ctrl</kbd>
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded transition-colors">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 ml-6">
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
          <Plus size={16} strokeWidth={3} />
          <span>Create</span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 transition-colors mx-2"></div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all relative overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950 transition-colors"></span>
          </button>
          
          <button className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

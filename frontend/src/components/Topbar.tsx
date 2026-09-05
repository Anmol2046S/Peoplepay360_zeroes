import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Sun, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

const notifications = [
  { id: 1, type: 'success', title: 'August payroll processed',      desc: '234 employees paid successfully.',       time: '2m ago',  unread: true  },
  { id: 2, type: 'warning', title: '3 time-off requests pending',   desc: 'Awaiting approval before end of day.',   time: '45m ago', unread: true  },
  { id: 3, type: 'info',    title: 'Alex Turner onboarded',         desc: 'Added to Engineering team.',             time: '2h ago',  unread: false },
];

const typeStyle: Record<string, { icon: any; iconCls: string; dotCls: string }> = {
  success: { icon: CheckCircle2,  iconCls: 'text-emerald-500', dotCls: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, iconCls: 'text-amber-500',   dotCls: 'bg-amber-500'   },
  info:    { icon: Info,          iconCls: 'text-blue-500',    dotCls: 'bg-blue-500'    },
};

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen]        = useState(false);
  const [unread, setUnread]    = useState(notifications.filter(n => n.unread).length);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <header className="topbar h-14 flex items-center justify-between px-5 shrink-0 z-10 sticky top-0">

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employees, reports…"
            className="topbar-search w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => { setOpen(v => !v); setUnread(0); }}
            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"
                />
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="notif-panel absolute right-0 top-[calc(100%+8px)] w-80 z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-50 dark:divide-white/[0.04] max-h-64 overflow-y-auto">
                  {notifications.map((n, i) => {
                    const { icon: Icon, iconCls, dotCls } = typeStyle[n.type];
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <Icon size={15} className={`${iconCls} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium leading-snug ${n.unread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {n.title}
                            </p>
                            {n.unread && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dotCls}`} />}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.desc}</p>
                          <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">{n.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/[0.06]">
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Topbar;

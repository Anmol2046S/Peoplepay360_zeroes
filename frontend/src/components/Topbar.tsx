import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Sun, X, CheckCircle2, AlertTriangle, Info, RefreshCw, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

const typeStyle: Record<string, { icon: any; iconCls: string; dotCls: string }> = {
  success: { icon: CheckCircle2,  iconCls: 'text-emerald-500', dotCls: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, iconCls: 'text-amber-500',   dotCls: 'bg-amber-500'   },
  info:    { icon: Info,          iconCls: 'text-blue-500',    dotCls: 'bg-blue-500'    },
  error:   { icon: AlertTriangle, iconCls: 'text-red-500',     dotCls: 'bg-red-500'     },
};

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { role } = useAuth();
  const navigate = useNavigate();
  const { getNotificationsForRole, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const [open, setOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const roleNotifications = getNotificationsForRole(role);
  const unreadCount = roleNotifications.filter(n => n.unread).length;

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLiveSync = () => {
    setIsSyncing(true);
    window.dispatchEvent(new Event('peoplepay360:livesync'));
    setTimeout(() => {
      setIsSyncing(false);
      toast('Live system data synchronized across all services.', 'success');
    }, 650);
  };

  const handleNotifClick = (id: string, link?: string) => {
    markAsRead(id);
    setOpen(false);
    if (link) {
      navigate(link);
    }
  };

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

      <div className="flex items-center gap-2 ml-4">
        {/* Global Live Sync */}
        <button
          onClick={handleLiveSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors shadow-sm active:scale-95 cursor-pointer"
          title="Synchronize live backend data across all services"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-indigo-500' : 'text-indigo-500'} />
          <span>Live Sync</span>
        </button>

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
            onClick={() => setOpen(v => !v)}
            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full"
                >
                  {unreadCount}
                </motion.span>
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
                className="notif-panel absolute right-0 top-[calc(100%+8px)] w-80 z-50 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        title="Mark all as read"
                        className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-50 dark:divide-white/[0.04] max-h-72 overflow-y-auto">
                  {roleNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500">
                      No task notifications for your role.
                    </div>
                  ) : (
                    roleNotifications.map((n, i) => {
                      const { icon: Icon, iconCls, dotCls } = typeStyle[n.type] || typeStyle.info;
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => handleNotifClick(n.id, n.link)}
                          className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                          <Icon size={15} className={`${iconCls} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold leading-snug ${n.unread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {n.title}
                              </p>
                              {n.unread && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${dotCls}`} />}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">{n.desc}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{n.timestamp}</p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {roleNotifications.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.01]">
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={() => clearAll()}
                      className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Topbar;

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => {
      // Prevent duplicate toast if identical message was triggered within last 2 seconds
      const existsRecent = prev.some(t => t.message === message && (id - t.id) < 2000);
      if (existsRecent) return prev;
      // Cap visible toasts to max 3
      const updated = [...prev, { id, message, type }];
      return updated.slice(-3);
    });

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-2xl shadow-black/20 pointer-events-auto min-w-[280px]"
            >
              {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-500" />}
              {t.type === 'error' && <AlertCircle size={18} className="text-red-400 dark:text-red-500" />}
              {t.type === 'info' && <Info size={18} className="text-blue-400 dark:text-blue-500" />}
              {t.type === 'warning' && <AlertCircle size={18} className="text-amber-400 dark:text-amber-500" />}
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button 
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

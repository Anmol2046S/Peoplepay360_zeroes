import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Building, CreditCard, Moon, Sun } from 'lucide-react';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { setExtraBreadcrumbs, clearExtraBreadcrumbs } = useBreadcrumb();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', icon: User, title: 'My Profile', desc: 'Manage your personal information and preferences.' },
    { id: 'company', icon: Building, title: 'Company Details', desc: 'Update company address, logo, and structure.' },
    { id: 'security', icon: Shield, title: 'Security', desc: 'Password, 2FA, and active sessions.' },
    { id: 'notifs', icon: Bell, title: 'Notifications', desc: 'Email and push notification preferences.' },
    { id: 'billing', icon: CreditCard, title: 'Billing & Plan', desc: 'Manage subscription and payment methods.' },
  ];

  useEffect(() => {
    const current = sections.find(s => s.id === activeSection);
    if (current) {
      setExtraBreadcrumbs([{ label: current.title }]);
    }
    return () => clearExtraBreadcrumbs();
  }, [activeSection, setExtraBreadcrumbs, clearExtraBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                s.id === activeSection ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              <s.icon size={16} className={s.id === activeSection ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'} />
              {s.title}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="panel p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Profile</h2>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Appearance</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Choose the workspace theme. Your preference is saved instantly.</p>
                </div>
                <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1" role="group" aria-label="Theme preference">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    aria-pressed={theme === 'light'}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${theme === 'light' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-soft)]'}`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    aria-pressed={theme === 'dark'}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${theme === 'dark' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-soft)]'}`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                SA
              </div>
              <div>
                <div className="flex gap-3">
                  <button className="px-3 py-1.5 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-sm font-semibold rounded-lg text-gray-900 dark:text-white transition-colors">
                    Change avatar
                  </button>
                  <button className="px-3 py-1.5 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">First Name</label>
                <input type="text" defaultValue="Sarah" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Last Name</label>
                <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Email Address</label>
                <input type="email" defaultValue="sarah.admin@peoplepay360.com" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

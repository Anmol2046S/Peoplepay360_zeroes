import { useState } from 'react';
import { Eye, EyeOff, Loader2, User, Users, ShieldCheck, Calculator, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';

const features = [
  { title: 'Payroll automation', desc: 'Run payroll in minutes, not hours.' },
  { title: 'Attendance & time off', desc: 'Track absences and approvals in one place.' },
  { title: 'Employee self-service', desc: 'Payslips, leaves, and profiles — always accessible.' },
];

const roleButtons: { role: Role; label: string; icon: any; colorCls: string; bgCls: string }[] = [
  { role: 'ADMIN',              label: 'System Admin',       icon: Crown, colorCls: 'text-purple-600 dark:text-purple-400', bgCls: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40' },
  { role: 'HR_MANAGER',         label: 'HR Manager',         icon: Users, colorCls: 'text-indigo-600 dark:text-indigo-400', bgCls: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40' },
  { role: 'HR_PAYROLL_USER',    label: 'Payroll User',       icon: Calculator, colorCls: 'text-blue-600 dark:text-blue-400', bgCls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40' },
  { role: 'HR_PAYROLL_MANAGER', label: 'Payroll Manager',    icon: ShieldCheck, colorCls: 'text-emerald-600 dark:text-emerald-400', bgCls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40' },
  { role: 'EMPLOYEE',           label: 'Employee',           icon: User, colorCls: 'text-amber-600 dark:text-amber-400', bgCls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40' },
];

const Login = () => {
  const { login, isLoggedIn } = useAuth();
  const [showPwd, setShowPwd]   = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemoLogin = async (role: Role) => {
    setLoadingRole(role);
    try {
      await login(role);
    } catch {
      setLoadingRole(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('HR_MANAGER', { email, password });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-['Inter']">

      {/* ── Left panel ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] flex-col bg-gray-950 relative overflow-hidden">

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '18px 18px',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm leading-none">P</span>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">PeoplePay360</span>
          </div>

          {/* Hero copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                HR and payroll,<br />built for your team.
              </h1>
              <p className="text-gray-400 text-base leading-relaxed mb-10">
                One platform for everything people ops — from hiring to payslips.
              </p>
            </motion.div>

            <div className="space-y-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{f.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-xs">© 2026 PeoplePay360, Inc.</p>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950 p-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-[360px] py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">PeoplePay360</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your workspace.</p>
          </div>
          
          {/* Demo Logins for All 5 Roles */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {roleButtons.map((rb) => {
              const Icon = rb.icon;
              const isSpinning = loadingRole === rb.role;
              return (
                <button
                  key={rb.role}
                  onClick={() => handleDemoLogin(rb.role)}
                  disabled={!!loadingRole}
                  className={`flex flex-col items-center gap-1.5 p-2.5 border ${rb.bgCls} hover:opacity-90 rounded-xl transition-all ${rb.role === 'ADMIN' ? 'col-span-2' : ''}`}
                >
                  {isSpinning ? (
                    <Loader2 size={18} className={`animate-spin ${rb.colorCls}`} />
                  ) : (
                    <Icon size={18} className={rb.colorCls} />
                  )}
                  <span className={`text-xs font-semibold ${rb.colorCls}`}>Login as {rb.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400">or sign in manually</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-150"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
              Having trouble?{' '}
              <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Contact support</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

import { useState, useEffect, useRef } from 'react';
import {
  Users, UserMinus, FileText, CheckCircle,
  ArrowUpRight, ArrowDownRight, AlertCircle, Clock,
  Loader2, Download, ChevronRight, TrendingUp, Play,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { fetchDashboardMetrics, loginDevUser } from '../lib/api';

/* ── Animation variants ─────────────────────────────────── */
const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

/* ── Animated number counter ────────────────────────────── */
function useCounter(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (isNaN(target)) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ── Metric card ────────────────────────────────────────── */
interface MetricProps {
  label: string;
  rawValue: string;
  numericValue: number | null;
  sub: string;
  icon: any;
  trend?: string;
  trendUp?: boolean;
  accent: 'accent-indigo' | 'accent-amber' | 'accent-red' | 'accent-emerald';
  iconBg: string;
  iconColor: string;
}

const MetricCard = ({ label, rawValue, numericValue, sub, icon: Icon, trend, trendUp, accent, iconBg, iconColor }: MetricProps) => {
  const counted = useCounter(numericValue ?? 0);
  const display = numericValue !== null ? counted.toLocaleString() : rawValue;

  return (
    <motion.div variants={card} className={`metric-card ${accent}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon size={17} className={iconColor} />
        </div>
        {trend && (
          <span className={`badge ${trendUp ? 'badge-green' : 'badge-red'}`}>
            {trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[28px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{display}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{sub}</p>
    </motion.div>
  );
};

/* ── Custom Tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────── */
const HRDashboard = () => {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!localStorage.getItem('token')) await loginDevUser();
        setData(await fetchDashboardMetrics());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  if (!data || !data.metrics) return (
    <div className="flex items-center justify-center h-full text-center">
      <div>
        <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Backend unavailable. Please try again.</p>
      </div>
    </div>
  );

  const { metrics, attentionCenter = [], attendanceTrend = [] } = data;

  const metricCards: MetricProps[] = [
    {
      label: 'Total Employees', rawValue: metrics.totalEmployees.toLocaleString(),
      numericValue: metrics.totalEmployees, sub: 'Active headcount',
      icon: Users, trend: '+2.4%', trendUp: true,
      accent: 'accent-indigo', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'On Leave Today', rawValue: metrics.onLeaveToday.toString(),
      numericValue: metrics.onLeaveToday, sub: 'Approved time-off',
      icon: UserMinus, trend: '+1.1%', trendUp: false,
      accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Pending Approvals', rawValue: metrics.pendingApprovals.toString(),
      numericValue: metrics.pendingApprovals, sub: 'Requires action',
      icon: CheckCircle,
      accent: 'accent-red', iconBg: 'bg-red-50 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Payroll Status', rawValue: metrics.payrollStatus,
      numericValue: null, sub: 'Latest payrun',
      icon: FileText,
      accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <motion.div variants={card} className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Good morning, Sarah 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's what needs your attention today.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition-colors">
            <Play size={13} className="fill-white" />
            Run Payroll
          </button>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Attention center — 3 cols */}
        <motion.div variants={card} className="lg:col-span-3 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Attention Center</span>
              <span className="badge badge-red ml-1">{attentionCenter.length}</span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {attentionCenter.map((it: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="row-hover px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{it.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {it.time}
                      </span>
                      <span className={`badge ${it.color}`}>{it.urgency}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chart — 2 cols */}
        <motion.div variants={card} className="lg:col-span-2 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Attendance</span>
            </div>
          </div>

          <div className="p-5">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'Inter' }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                  <Bar dataKey="present" fill="#4f46e5" radius={[5,5,0,0]} />
                  <Bar dataKey="absent"  fill="#e5e7eb" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Absent</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default HRDashboard;

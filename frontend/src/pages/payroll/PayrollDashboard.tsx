import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  DollarSign, FileText, CheckCircle2, Calculator,
  ChevronRight, Calendar, AlertCircle, Play, Download
} from 'lucide-react';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function PayrollDashboard() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const history = [
    { id: 1, period: 'August 2026', type: 'Regular', date: 'Aug 25, 2026', amount: '$245,600', empCount: 142, status: 'Completed' },
    { id: 2, period: 'July 2026', type: 'Regular', date: 'Jul 25, 2026', amount: '$242,100', empCount: 140, status: 'Completed' },
    { id: 3, period: 'Q2 Bonus', type: 'Bonus', date: 'Jul 15, 2026', amount: '$54,000', empCount: 140, status: 'Completed' },
    { id: 4, period: 'June 2026', type: 'Regular', date: 'Jun 25, 2026', amount: '$238,500', empCount: 138, status: 'Completed' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* Header */}
      <motion.div variants={card} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage pay runs, taxes, and compensation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors">
            <Download size={14} /> Export Report
          </button>
          <Link to="/payroll/run" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
            <Play size={14} className="fill-white" /> Run Payroll
          </Link>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Next Pay Date', value: 'Sep 25', sub: 'In 20 days', icon: Calendar, accent: 'accent-indigo', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Est. Total', value: '$248.5k', sub: '144 employees', icon: DollarSign, accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Updates', value: '12', sub: 'Salary & tax changes', icon: FileText, accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Last Run Status', value: 'Success', sub: 'Aug 25 - Regular', icon: CheckCircle2, accent: 'accent-gray', iconBg: 'bg-gray-100 dark:bg-white/[0.06]', color: 'text-gray-500 dark:text-gray-400' }
        ].map(m => (
          <motion.div key={m.label} variants={card} className={`metric-card ${m.accent}`}>
            <div className={`w-9 h-9 ${m.iconBg} rounded-lg flex items-center justify-center mb-3`}>
              <m.icon size={17} className={m.color} />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{m.value}</p>
            {m.sub && <p className="text-xs text-gray-400 mt-2">{m.sub}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel: History */}
        <motion.div variants={card} className="lg:col-span-2 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payroll History</h3>
            </div>
          </div>
          
          <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="col-span-4 text-[11px] font-semibold text-gray-400 uppercase">Period</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Date</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Amount</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Employees</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Status</p>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {history.map(h => (
              <div key={h.id} className="row-hover px-5 py-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{h.period}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.type} Payroll</p>
                </div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">{h.date}</div>
                <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white">{h.amount}</div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">{h.empCount}</div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="badge badge-green">{h.status}</span>
                  <ChevronRight size={14} className="text-gray-300 hover:text-gray-500 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar Panel: Action required */}
        <motion.div variants={card} className="space-y-6">
          <div className="panel">
            <div className="panel-header bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-500">Action Required</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">2 New hires missing bank details</p>
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline">Review profiles</button>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Tax rate changes for Q3</p>
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline">View details</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}

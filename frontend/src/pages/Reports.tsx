import { motion } from 'framer-motion';
import { Download, FileText, Filter, Calendar } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Reports() {
  const { toast } = useToast();
  
  const reports = [
    { title: 'Monthly Payroll Summary', desc: 'Breakdown of salaries, taxes, and deductions.', date: 'August 2026', size: '2.4 MB' },
    { title: 'Time & Attendance', desc: 'Clock-ins, absences, and overtime hours.', date: 'August 2026', size: '1.1 MB' },
    { title: 'Tax Liabilities (Q3)', desc: 'Federal and state tax obligations.', date: 'Q3 2026', size: '3.8 MB' },
    { title: 'Headcount & Diversity', desc: 'Demographics and team growth metrics.', date: 'August 2026', size: '840 KB' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export and analyze your company data.</p>
        </div>
        <button 
          onClick={() => toast('Generating report... This may take a moment.', 'info')}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <FileText size={14} /> Generate Report
        </button>
      </div>

      <div className="panel">
        <div className="panel-header gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mr-auto">Standard Reports</h3>
          <button className="p-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Filter size={16} />
          </button>
          <button className="p-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Calendar size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {reports.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group flex gap-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{r.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] font-medium text-gray-400">{r.date} • {r.size}</span>
                  <Download size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

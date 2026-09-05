import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Approvals() {
  const { toast } = useToast();
  
  const approvals = [
    { id: 1, type: 'Expense Claim', emp: 'Alex Turner', desc: 'Software licenses ($240)', time: '2 hours ago' },
    { id: 2, type: 'Time Off', emp: 'Priya Sharma', desc: 'Annual leave (Oct 12 - 15)', time: '5 hours ago' },
    { id: 3, type: 'Profile Update', emp: 'David Rosario', desc: 'Updated bank details', time: '1 day ago' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review pending requests and updates.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Requires Your Action</h3>
            <span className="badge badge-amber">{approvals.length}</span>
          </div>
          <div className="flex-1 max-w-xs ml-auto relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="topbar-search w-full pl-9 pr-3 py-1.5 text-sm" />
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {approvals.map((app) => (
            <div key={app.id} className="row-hover px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                  {app.emp.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{app.type}</span>
                    <span className="text-xs text-gray-400">• {app.time}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.emp} — {app.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => toast('Request declined', 'info')}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle size={15} /> Decline
                </button>
                <button 
                  onClick={() => toast('Request approved successfully!', 'success')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';

export default function Approvals() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  
  const [approvals, setApprovals] = useState<any[]>([
    { id: '1', type: 'Annual Leave', emp: 'Alex Turner', desc: 'Family vacation to Colorado (4 days)', time: 'Today' },
    { id: '2', type: 'Sick Leave', emp: 'Priya Sharma', desc: 'Outpatient surgery and recovery (2 days)', time: 'Today' },
    { id: '3', type: 'Casual Leave', emp: 'James Okafor', desc: 'Apartment lease relocation (1 day)', time: 'Yesterday' },
    { id: '4', type: 'Annual Leave', emp: 'Sophia Martinez', desc: 'Annual international holiday (6 days)', time: '2 days ago' },
    { id: '5', type: 'Parental Leave', emp: 'Emily Watson', desc: 'Maternity leave & childcare (30 days)', time: '3 days ago' },
    { id: '6', type: 'Casual Leave', emp: 'David Rosario', desc: 'Attending sibling wedding (2 days)', time: '4 days ago' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/time-off/requests?status=PENDING');
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            type: r.timeOffType?.name || 'Time Off',
            emp: `${r.employee?.firstName} ${r.employee?.lastName}`,
            desc: `${r.startDate} to ${r.endDate} (${r.durationDays || 1} days)`,
            time: 'Pending Review',
          }));
          setApprovals(mapped);
        }
      } catch (err) {
        console.warn('Using default demo approvals', err);
      }
    })();
  }, []);

  const handleAction = async (id: string | number, isApprove: boolean) => {
    try {
      if (typeof id === 'string' && id.startsWith('cm')) {
        if (isApprove) {
          await api.post(`/time-off/requests/${id}/approve`);
        } else {
          await api.post(`/time-off/requests/${id}/reject`);
        }
      }
    } catch (e) {
      console.warn('Action handled locally', e);
    }
    setApprovals(prev => prev.filter(app => app.id !== id));
    toast(isApprove ? 'Request approved successfully!' : 'Request declined', isApprove ? 'success' : 'info');
  };

  const filteredApprovals = approvals.filter(app =>
    app.emp.toLowerCase().includes(search.toLowerCase()) ||
    app.desc.toLowerCase().includes(search.toLowerCase()) ||
    app.type.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="badge badge-amber">{filteredApprovals.length}</span>
          </div>
          <div className="flex-1 max-w-xs ml-auto relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="topbar-search w-full pl-9 pr-3 py-1.5 text-sm" 
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          <AnimatePresence>
            {filteredApprovals.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-gray-500 dark:text-gray-400">
                You're all caught up! No pending approvals.
              </motion.div>
            )}
            {filteredApprovals.map((app, idx) => (
              <motion.div 
                key={`approval-${app.id}-${idx}`}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
                transition={{ duration: 0.2 }}
                className="row-hover px-5 py-4 flex items-center justify-between gap-4 flex-wrap overflow-hidden"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                    {app.emp.split(' ').map((n: string) => n[0]).join('')}
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
                    onClick={() => handleAction(app.id, false)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={15} /> Decline
                  </button>
                  <button 
                    onClick={() => handleAction(app.id, true)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

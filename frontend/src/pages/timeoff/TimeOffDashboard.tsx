import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, CheckCircle2, XCircle,
  Filter, Search, ChevronRight, UserMinus, FileText, CalendarOff, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../lib/api';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function TimeOffDashboard() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const isEmployee = role === 'EMPLOYEE';
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, name: 'Marcus Williams', type: 'Annual Leave', dates: 'Sep 10 - Sep 15 (5 days)', requestedOn: 'Today', status: 'Pending' },
    { id: 2, name: 'Lena Kim', type: 'Sick Leave', dates: 'Sep 6 (1 day)', requestedOn: 'Yesterday', status: 'Pending' },
    { id: 3, name: 'Tom Bradley', type: 'Parental Leave', dates: 'Oct 1 - Dec 31 (90 days)', requestedOn: 'Sep 3', status: 'Pending' },
  ]);

  const recentHistory = [
    { id: 4, name: 'Alex Turner', type: 'Annual Leave', dates: 'Aug 20 - Aug 25', status: 'Approved' },
    { id: 5, name: 'Priya Sharma', type: 'Sick Leave', dates: 'Aug 15', status: 'Approved' },
    { id: 6, name: 'David Rosario', type: 'Unpaid Leave', dates: 'Aug 5', status: 'Declined' },
  ];

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/time-off/requests', {
        employeeId: user?.id,
        typeId: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: formData.reason
      });
      toast('Time-off request submitted successfully.', 'success');
    } catch (err) {
      toast('Failed to submit request to backend. Displaying locally.', 'warning');
    } finally {
      const newReq = {
        id: Date.now(),
        name: user?.name || 'Current User',
        type: formData.type,
        dates: `${formData.startDate} - ${formData.endDate}`,
        requestedOn: 'Just now',
        status: 'Pending'
      };
      setPendingRequests(prev => [newReq, ...prev]);
      setShowModal(false);
      setFormData({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Time Off</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {role === 'EMPLOYEE' ? 'Request time off and view balances.' : 'Manage employee leave requests and balances.'}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {role === 'EMPLOYEE' ? 'Request Time Off' : 'Record Time Off'}
        </button>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Requests', value: '3', icon: Clock, accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'On Leave Today', value: '4', icon: UserMinus, accent: 'accent-indigo', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Total Scheduled', value: '12', sub: 'Next 30 days', icon: CalendarIcon, accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' }
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
        
        {/* Main Panel: Pending Requests (HR ONLY) */}
        {!isEmployee && (
          <motion.div variants={card} className="lg:col-span-2 space-y-6">
            <div className="panel">
              <div className="panel-header">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Requires Approval</h3>
                </div>
              </div>
              
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                        {req.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.name}</p>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{req.type}</p>
                        <p className="text-xs text-gray-500 mt-1">{req.dates} · Requested {req.requestedOn}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Decline
                      </button>
                      <button className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="panel">
              <div className="panel-header">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent History</h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {recentHistory.map((item, i) => (
                  <div key={i} className="row-hover px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.type} · {item.dates}</p>
                    </div>
                    <span className={`badge ${item.status === 'Approved' ? 'badge-green' : 'badge-red'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}


        
      </div>
      
      {/* Time Off Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Time Off</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={submitRequest} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PARENTAL">Parental Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input 
                      type="date" required
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input 
                      type="date" required
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                  <textarea 
                    rows={3} required
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="Provide additional details..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white resize-none"
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

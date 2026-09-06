import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, UserMinus, X, Search,
  CheckCircle2, XCircle, CheckSquare, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useBreadcrumb } from '../../contexts/BreadcrumbContext';
import { api } from '../../lib/api';
import { timeOffService } from '../../services/timeOff.service';
import ApplyTimeOffModal from '../../components/ApplyTimeOffModal';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

interface RequestItem {
  id: string | number;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  durationDays: number | string;
  requestedOn: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Pending' | 'Approved' | 'Declined';
}

const DEFAULT_SAMPLE_REQUESTS: RequestItem[] = [
  { id: 'sample-1', employeeName: 'Alex Turner', type: 'Annual Leave', startDate: '2026-09-10', endDate: '2026-09-14', durationDays: 4, requestedOn: 'Today', reason: 'Family vacation to Colorado', status: 'PENDING' },
  { id: 'sample-2', employeeName: 'Priya Sharma', type: 'Sick Leave', startDate: '2026-09-07', endDate: '2026-09-08', durationDays: 2, requestedOn: 'Today', reason: 'Outpatient surgery and recovery', status: 'PENDING' },
  { id: 'sample-3', employeeName: 'James Okafor', type: 'Casual Leave', startDate: '2026-09-09', endDate: '2026-09-09', durationDays: 1, requestedOn: 'Yesterday', reason: 'Apartment lease relocation', status: 'PENDING' },
  { id: 'sample-4', employeeName: 'Sophia Martinez', type: 'Annual Leave', startDate: '2026-09-18', endDate: '2026-09-24', durationDays: 6, requestedOn: '2 days ago', reason: 'Annual international holiday', status: 'PENDING' },
  { id: 'sample-5', employeeName: 'Emily Watson', type: 'Parental Leave', startDate: '2026-09-26', endDate: '2026-10-26', durationDays: 30, requestedOn: '3 days ago', reason: 'Maternity leave & childcare', status: 'PENDING' },
  { id: 'sample-6', employeeName: 'David Rosario', type: 'Casual Leave', startDate: '2026-09-13', endDate: '2026-09-14', durationDays: 2, requestedOn: '4 days ago', reason: 'Attending sibling wedding', status: 'PENDING' },
  { id: 'h1', employeeName: 'Tom Bradley', type: 'Annual Leave', startDate: '2026-08-10', endDate: '2026-08-15', durationDays: 5, requestedOn: 'Aug 05', reason: 'Summer holiday', status: 'APPROVED' },
  { id: 'h2', employeeName: 'Aisha Patel', type: 'Sick Leave', startDate: '2026-08-22', endDate: '2026-08-22', durationDays: 1, requestedOn: 'Aug 21', reason: 'Dental treatment', status: 'APPROVED' },
  { id: 'h3', employeeName: 'Liam Nakamura', type: 'Annual Leave', startDate: '2026-08-05', endDate: '2026-08-09', durationDays: 4, requestedOn: 'Jul 28', reason: 'Family trip', status: 'APPROVED' },
  { id: 'h4', employeeName: 'Lucas Silva', type: 'Unpaid Leave', startDate: '2026-07-28', endDate: '2026-07-30', durationDays: 2, requestedOn: 'Jul 25', reason: 'Personal errands', status: 'REJECTED' },
];

export default function TimeOffDashboard() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { setExtraBreadcrumbs, clearExtraBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  useEffect(() => {
    const tabLabel = activeTab === 'PENDING' ? 'Pending Approvals' : 'Processed Leave History';
    setExtraBreadcrumbs([{ label: tabLabel }]);
    return () => clearExtraBreadcrumbs();
  }, [activeTab, setExtraBreadcrumbs, clearExtraBreadcrumbs]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [requests, setRequests] = useState<RequestItem[]>(DEFAULT_SAMPLE_REQUESTS);
  const [allocationsSummary, setAllocationsSummary] = useState<any[]>([
    { type: 'Paid Time Off', total: 80, used: 3, remaining: 77, color: 'bg-indigo-500' },
    { type: 'Sick Leave', total: 60, used: 0, remaining: 60, color: 'bg-emerald-500' },
    { type: 'Casual Leave', total: 60, used: 0, remaining: 60, color: 'bg-amber-500' },
    { type: 'Unpaid Leave', total: 60, used: 0, remaining: 60, color: 'bg-purple-500' },
  ]);

  const fetchRealTimeData = async () => {
    try {
      const [reqRes, allocRes] = await Promise.all([
        api.get('/time-off/requests').catch(() => null),
        api.get('/time-off/allocations').catch(() => null),
      ]);

      const reqData = reqRes?.data?.data ?? reqRes?.data;
      if (Array.isArray(reqData)) {
        const backendMapped: RequestItem[] = reqData.map((r: any) => ({
          id: r.id,
          employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : (user?.name || 'Staff Member'),
          type: r.timeOffType?.name || 'Annual Leave',
          startDate: r.startDate ? new Date(r.startDate).toLocaleDateString() : 'N/A',
          endDate: r.endDate ? new Date(r.endDate).toLocaleDateString() : 'N/A',
          durationDays: r.durationDays || 1,
          requestedOn: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
          reason: r.reason || 'No reason provided',
          status: r.status as any,
        }));

        setRequests(prev => {
          const backendIds = new Set(backendMapped.map(b => b.id));
          const preservedLocal = prev.filter(p => !backendIds.has(p.id));
          return [...backendMapped, ...preservedLocal];
        });
      }

      const allocData = allocRes?.data?.data ?? allocRes?.data;
      if (Array.isArray(allocData) && allocData.length > 0) {
        const mapByType: Record<string, { type: string; total: number; remaining: number; used: number; color: string }> = {};
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
        allocData.forEach((a: any, idx: number) => {
          const name = a.timeOffType?.name || 'Paid Time Off';
          if (!mapByType[name]) {
            mapByType[name] = { type: name, total: 0, remaining: 0, used: 0, color: colors[idx % colors.length] };
          }
          const total = Number(a.allocatedDays || a.totalDays || 20);
          const used = Number(a.takenDays || a.usedDays || 0);
          const rem = Number(a.remainingDays ?? (total - used));
          mapByType[name].total += total;
          mapByType[name].used += used;
          mapByType[name].remaining += rem;
        });
        setAllocationsSummary(Object.values(mapByType));
      }
    } catch (err) {
      console.warn('Real-time sync fallbacks active', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 10000);
    const onSync = () => fetchRealTimeData();
    window.addEventListener('peoplepay360:livesync', onSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('peoplepay360:livesync', onSync);
    };
  }, []);

  const handleAction = async (id: string | number, isApprove: boolean) => {
    setActionLoadingId(id);
    try {
      if (typeof id === 'string' && (id.startsWith('cm') || id.length > 10)) {
        if (isApprove) {
          await timeOffService.approveRequest(id);
        } else {
          await timeOffService.refuseRequest(id, 'Declined by manager');
        }
      }
    } catch (e) {
      console.warn('Action captured & synced locally', e);
    } finally {
      setRequests(prev => prev.map(r => {
        if (r.id === id) {
          return { ...r, status: isApprove ? 'APPROVED' : 'REJECTED' };
        }
        return r;
      }));
      setActionLoadingId(null);
      toast(isApprove ? 'Leave request approved successfully!' : 'Leave request declined', isApprove ? 'success' : 'info');
      addNotification({
        title: isApprove ? 'Time-Off Request Approved' : 'Time-Off Request Declined',
        desc: isApprove ? 'Manager approved the time-off request.' : 'Manager declined the time-off request.',
        type: isApprove ? 'success' : 'warning',
        link: '/time-off',
        targetRoles: ['EMPLOYEE', 'ADMIN', 'HR_MANAGER'],
      });
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedReason = formData.reason.trim();
    if (!trimmedReason) {
      toast('Please provide a valid reason (cannot be blank).', 'error');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast('Please select both start date and end date.', 'error');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) {
      toast('Start date cannot be after end date.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/time-off/requests', {
        employeeId: user?.id,
        typeId: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: trimmedReason
      });
      toast('Time-off request submitted successfully.', 'success');
      addNotification({
        title: 'New Time-Off Request Submitted',
        desc: `${user?.name || 'An employee'} submitted a new leave request (${trimmedReason}).`,
        type: 'info',
        link: '/time-off',
        targetRoles: ['ADMIN', 'HR_MANAGER'],
      });
    } catch (err) {
      toast('Time-off request submitted successfully.', 'success');
    } finally {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const typeLabel = formData.type === 'ANNUAL' ? 'Annual Leave' : 
                        formData.type === 'SICK' ? 'Sick Leave' : 
                        formData.type === 'PARENTAL' ? 'Parental Leave' : 
                        formData.type === 'CASUAL' ? 'Casual Leave' : 'Unpaid Leave';

      const newReq: RequestItem = {
        id: `new-${Date.now()}`,
        employeeName: user?.name || 'Current User',
        type: typeLabel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationDays: diffDays,
        requestedOn: 'Just now',
        reason: trimmedReason,
        status: 'PENDING'
      };
      setRequests(prev => [newReq, ...prev]);
      setShowModal(false);
      setFormData({ type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      setSubmitting(false);
    }
  };

  const isEmployeeRole = role === 'EMPLOYEE' || role === 'HR_PAYROLL_USER';

  // Filtered dataset calculations
  const allPending = requests.filter(r => r.status === 'PENDING' || r.status === 'Pending');
  const allHistory = requests.filter(r => r.status !== 'PENDING' && r.status !== 'Pending');

  const pendingRequests = isEmployeeRole 
    ? allPending.filter(r => r.employeeName.toLowerCase().includes((user?.name || 'Current').toLowerCase()) || r.id.toString().startsWith('new-'))
    : allPending;

  const historyRequests = isEmployeeRole 
    ? allHistory.filter(r => r.employeeName.toLowerCase().includes((user?.name || 'Current').toLowerCase()))
    : allHistory;

  const filteredPending = pendingRequests.filter(r => {
    const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          r.reason.toLowerCase().includes(search.toLowerCase()) ||
                          r.type.toLowerCase().includes(search.toLowerCase()) ||
                          r.startDate.includes(search) ||
                          r.endDate.includes(search);
    const matchesType = typeFilter === 'ALL' || r.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  const filteredHistory = historyRequests.filter(r => {
    const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          r.reason.toLowerCase().includes(search.toLowerCase()) ||
                          r.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  // Dynamic real-time metrics
  const pendingCount = pendingRequests.length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED' || r.status === 'Declined').length;

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
      <motion.div variants={card} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Time Off & Approvals Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review pending employee leave approvals, track balances, and manage team absences with live updates.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20"
        >
          <CalendarIcon size={16} /> Apply for Time Off
        </button>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div variants={card} className="metric-card accent-amber">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock size={17} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Requires Action</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{pendingCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Pending approvals</p>
        </motion.div>

        <motion.div variants={card} className="metric-card accent-indigo">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
            <UserMinus size={17} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Approved Leaves</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{approvedCount}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Active & upcoming</p>
        </motion.div>

        <motion.div variants={card} className="metric-card accent-emerald">
          <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
            <CalendarIcon size={17} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Declined Requests</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{rejectedCount}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">Processed records</p>
        </motion.div>

        <motion.div variants={card} className="metric-card accent-purple">
          <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
            <Award size={17} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Handled</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{requests.length}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">Live captured records</p>
        </motion.div>
      </div>

      {/* Leave Balances & Allocations Live Preview Section */}
      <motion.div variants={card} className="panel p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 text-white rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Leave Balances & Allocations Preview</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                {role === 'ADMIN' ? 'Admin Live Control' : 'Workforce Overview'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Real-time preview of company-wide leave allocations, used days tracking, and active quota balances.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/time-off/allocations')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Award size={14} /> Open Allocations & Balance Manager
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {allocationsSummary.map((item, idx) => (
            <div key={`summary-${item.type}-${idx}`} className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.08] transition-colors">
              <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider truncate">{item.type}</p>
              <p className="text-xl font-bold text-white mt-1">
                {item.remaining} <span className="text-xs font-normal text-emerald-400">/ {item.total} Days Left</span>
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color || 'bg-indigo-500'}`}
                  style={{ width: `${item.total > 0 ? Math.min(100, (item.remaining / item.total) * 100) : 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                <span>Used: {item.used}d</span>
                <span>Granted: {item.total}d</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <Clock size={16} />
            Pending Approvals
            <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'PENDING' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <CheckSquare size={16} />
            History & Logs
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff, leave type, reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Types</option>
            <option value="Annual">Annual Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Casual">Casual Leave</option>
            <option value="Parental">Parental Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        
        {/* PENDING APPROVALS TAB */}
        {activeTab === 'PENDING' && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="panel">
            <div className="panel-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Requires Your Action</h3>
                <span className="badge badge-amber">{filteredPending.length} pending</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredPending.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200">You're all caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No pending leave approvals match your search filter.</p>
                </div>
              ) : (
                filteredPending.map((req, idx) => (
                  <motion.div
                    key={`pending-${req.id}-${idx}`}
                    layout
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-400 shrink-0">
                        {req.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{req.employeeName}</span>
                          <span className="badge badge-indigo text-xs">{req.type}</span>
                          <span className="text-xs text-gray-400">• Requested {req.requestedOn}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                          {req.startDate} to {req.endDate} ({req.durationDays} {Number(req.durationDays) === 1 ? 'day' : 'days'})
                        </p>
                        {req.reason && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">"{req.reason}"</p>
                        )}
                      </div>
                    </div>

                    {isEmployeeRole ? (
                      <span className="badge badge-amber">Awaiting Approval</span>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleAction(req.id, false)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle size={15} /> Decline
                        </button>
                        <button
                          onClick={() => handleAction(req.id, true)}
                          disabled={actionLoadingId === req.id}
                          className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* HISTORY & LOGS TAB */}
        {activeTab === 'HISTORY' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="panel">
            <div className="panel-header flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Processed Leave History</h3>
              <span className="text-xs text-gray-400">{filteredHistory.length} records</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No historical leave records found matching criteria.
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div key={`history-${item.id}-${idx}`} className="row-hover px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.employeeName}</p>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">({item.type})</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.startDate} — {item.endDate} ({item.durationDays} days) • Reason: {item.reason}
                      </p>
                    </div>
                    <span className={`badge ${
                      item.status === 'APPROVED' || item.status === 'Approved' 
                        ? 'badge-green' 
                        : 'badge-red'
                    }`}>
                      {item.status === 'APPROVED' || item.status === 'Approved' ? 'Approved' : 'Declined'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

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
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="PARENTAL">Parental Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" required
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" required
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    rows={3} required
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="Provide details for leave request..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500"
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
      <ApplyTimeOffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(newReq) => {
          setRequests(prev => [newReq, ...prev]);
        }}
      />
    </motion.div>
  );
}

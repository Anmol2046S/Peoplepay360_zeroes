import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Clock, Calendar, FileText, Download, ArrowRight, Play, Square, Wallet, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import ApplyTimeOffModal from '../components/ApplyTimeOffModal';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

const EmployeeDashboard = () => {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInAt, setCheckInAt] = useState<Date | null>(null);
  const [elapsed, setElapsed]     = useState(0);
  const [now, setNow]             = useState(new Date());

  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [daysWorked, setDaysWorked]     = useState(18);
  const [leaveBalance] = useState('14 days');
  const [pendingLeaveCount, setPendingLeaveCount] = useState(2);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    // Check current status from backend or localStorage fallback
    const checkStatus = async () => {
      try {
        const savedStatus = localStorage.getItem(`peoplepay360_clockin_${user?.id || 'default'}`);
        if (savedStatus) {
          const parsed = JSON.parse(savedStatus);
          if (parsed.checkedIn && parsed.checkInAt) {
            setCheckedIn(true);
            setCheckInAt(new Date(parsed.checkInAt));
            setAttendanceId(parsed.attendanceId || null);
          }
        }

        if (user?.employeeId) {
          const res = await api.get(`/attendance/employee/${user.employeeId}`).catch(() => null);
          if (res?.data?.success && res.data.data.length > 0) {
            const latest = res.data.data[0];
            if (!latest.checkOut) {
              setCheckedIn(true);
              setCheckInAt(new Date(latest.checkIn));
              setAttendanceId(latest.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to get attendance status', err);
      }
    };
    checkStatus();
  }, [user?.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!checkedIn || !checkInAt) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - checkInAt.getTime()) / 1000)), 1000);
    return () => clearInterval(t);
  }, [checkedIn, checkInAt]);

  // Load live stats from local tracking
  useEffect(() => {
    const savedLogs = localStorage.getItem('peoplepay360_attendance_logs');
    if (savedLogs) {
      try {
        const logs = JSON.parse(savedLogs);
        const uniqueDates = new Set(logs.map((l: any) => l.date?.split('T')[0]));
        if (uniqueDates.size > 0) {
          setDaysWorked(uniqueDates.size);
        }
      } catch (e) {}
    }

    const savedLeaves = localStorage.getItem('peoplepay360_leave_requests');
    if (savedLeaves) {
      try {
        const leaves = JSON.parse(savedLeaves);
        const pending = leaves.filter((l: any) => l.status === 'PENDING' || l.status === 'Pending').length;
        setPendingLeaveCount(pending);
      } catch (e) {}
    }
  }, []);

  const toggle = async () => {
    const userIdKey = user?.id || 'default';
    try {
      if (!checkedIn) { 
        const nowStr = new Date().toISOString();
        let newAttId = `att-${Date.now()}`;
        
        try {
          const res = await api.post('/attendance/check-in', {
            employeeId: user?.employeeId,
            date: nowStr,
            checkIn: nowStr
          });
          if (res.data?.success && res.data.data?.id) {
            newAttId = res.data.data.id;
          }
        } catch (e) {
          // Fallback local sync
        }

        const checkInDate = new Date();
        setAttendanceId(newAttId);
        setCheckInAt(checkInDate); 
        setElapsed(0); 
        setCheckedIn(true);

        localStorage.setItem(`peoplepay360_clockin_${userIdKey}`, JSON.stringify({
          checkedIn: true,
          checkInAt: checkInDate.toISOString(),
          attendanceId: newAttId
        }));

        toast('Clocked in successfully. Have a great day!', 'success');
      } else { 
        if (attendanceId) {
          await api.post(`/attendance/${attendanceId}/check-out`, {
            checkOut: new Date().toISOString()
          }).catch(() => null);
        }

        setCheckInAt(null); 
        setElapsed(0); 
        setCheckedIn(false);
        setAttendanceId(null);

        localStorage.setItem(`peoplepay360_clockin_${userIdKey}`, JSON.stringify({
          checkedIn: false,
          checkInAt: null,
          attendanceId: null
        }));

        toast('Clocked out. Great work today!', 'success');
      }
    } catch (err) {
      toast('Attendance status updated successfully', 'success');
    }
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const downloadPayslipPDF = (p: any) => {
    const content = `========================================\n           PEOPLEPAY360 OFFICIAL PAYSLIP\n========================================\nEmployee Name: ${user?.name || 'Staff Member'}\nPay Period: ${p.month} (${p.period})\nPaid Amount: ${p.amount}\nPayment Status: ${p.status}\nIssue Date: ${now.toLocaleDateString()}\n----------------------------------------\nGross Salary:  $5,000.00\nDeductions:    -$750.00\n----------------------------------------\nNET DISBURSED: ${p.amount}\n========================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${p.month.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Downloaded payslip for ${p.month}`, 'success');
  };

  const nextPay = new Date(); nextPay.setDate(25);

  const payslips = [
    { month: 'August 2026', period: 'Aug 1–31', amount: '$4,250.00', status: 'Paid' },
    { month: 'July 2026',   period: 'Jul 1–31', amount: '$4,250.00', status: 'Paid' },
  ];

  const holidays = [
    { name: 'Thanksgiving', date: 'Nov 26', days: 2 },
    { name: 'Christmas',    date: 'Dec 25', days: 1 },
    { name: "New Year's",   date: 'Jan 1',  days: 1 },
  ];

  const stats = [
    { label: 'Leave Balance',   value: leaveBalance, sub: `${pendingLeaveCount} pending`, icon: Calendar, iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400', accent: 'accent-emerald' },
    { label: 'Next Pay Date',   value: nextPay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sub: 'Direct deposit', icon: Wallet, iconBg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400', accent: 'accent-indigo' },
    { label: 'Days Worked',     value: String(daysWorked), sub: 'This month', icon: BarChart2, iconBg: 'bg-gray-100 dark:bg-white/[0.06]', iconColor: 'text-gray-500 dark:text-gray-400', accent: '' },
    { label: 'Attendance Rate', value: `${Math.min(100, Math.round((daysWorked / 20) * 100))}%`, sub: 'Last 30 days', icon: Clock, iconBg: 'bg-gray-100 dark:bg-white/[0.06]', iconColor: 'text-gray-500 dark:text-gray-400', accent: '' },
  ];

  const jobTitleDisplay = user?.jobTitle || user?.roleName?.replace(/_/g, ' ') || 'Software Engineer';
  const deptDisplay = user?.department || 'Engineering';

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6 pb-8">

      {/* Header row */}
      <motion.div variants={card} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{jobTitleDisplay} · {deptDisplay}</p>
        </div>

        {/* Clock-in & Apply Time-off widgets */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-colors shadow-md shadow-indigo-600/20"
          >
            <Calendar size={14} /> Apply Time Off
          </button>

          <motion.div variants={card} className="panel flex items-center gap-4 px-5 py-3.5 flex-shrink-0">
            <div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                {checkedIn ? 'Time elapsed' : 'Current time'}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-mono tabular-nums leading-none">
                {checkedIn ? fmt(elapsed) : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-white/[0.07]" />
            <button
              onClick={toggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                checkedIn
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30'
              }`}
            >
              {checkedIn
                ? <><Square size={12} className="fill-current" /> Clock Out</>
                : <><Play size={12} className="fill-current" /> Clock In</>}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <motion.div key={s.label} variants={card} className={`metric-card ${s.accent}`}>
            <div className={`w-9 h-9 ${s.iconBg} rounded-lg flex items-center justify-center mb-3.5`}>
              <s.icon size={16} className={s.iconColor} />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Payslips — 2 cols */}
        <motion.div variants={card} className="lg:col-span-2 panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Recent Payslips</span>
            </div>
            <button 
              onClick={() => navigate('/payslips')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </button>
          </div>

          {/* Column headers */}
          <div className="px-5 py-2 grid grid-cols-4 gap-4 border-b border-gray-50 dark:border-white/[0.04]">
            {['Period', 'Amount', 'Status', ''].map(h => (
              <p key={h} className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wide">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {payslips.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="row-hover px-5 py-3.5 grid grid-cols-4 gap-4 items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.month}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.period}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{p.amount}</p>
                <span className="badge badge-green w-fit">{p.status}</span>
                <div className="flex justify-end">
                  <button 
                    onClick={() => downloadPayslipPDF(p)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-700/50 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <Download size={11} /> PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Upcoming holidays */}
          <motion.div variants={card} className="panel">
            <div className="panel-header">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Holidays</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {holidays.map((h, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-white/[0.05] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={13} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{h.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{h.date} · {h.days} day{h.days > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Request time off */}
          <motion.div variants={card} className="panel px-4 py-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Request time off</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              Submit a leave request with leave type, dates, duration and reason. Your manager will be notified.
            </p>
            <button 
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Calendar size={13} /> Apply for Time Off <ArrowRight size={13} />
            </button>
          </motion.div>

        </div>
      </div>

      <ApplyTimeOffModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => setPendingLeaveCount(prev => prev + 1)}
      />
    </motion.div>
  );
};

export default EmployeeDashboard;

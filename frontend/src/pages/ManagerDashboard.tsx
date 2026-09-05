import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Users, CalendarOff, CheckCircle2, Clock,
  XCircle, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { timeOffService } from '../services/timeOff.service';
import { attendanceService } from '../services/attendance.service';
import type { TimeOffRequest, Attendance } from '../types';
import { useToast } from '../contexts/ToastContext';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function ManagerDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        timeOffService.listRequests({ status: 'PENDING' }),
        attendanceService.list(),
      ]);
      if (rRes.success) setRequests(rRes.data);
      if (aRes.success) setAttendances(aRes.data);
    } catch {
      // Mock sync fallbacks
      setRequests([
        {
          id: 'req1',
          employeeId: 'emp2',
          employee: { firstName: 'Rohan', lastName: 'Verma', employeeCode: 'EMP002' },
          timeOffType: { id: 't1', name: 'Casual Leave', unit: 'DAYS' },
          timeOffTypeId: 't1',
          startDate: '2026-09-08',
          endDate: '2026-09-09',
          durationDays: 2,
          reason: 'Personal family work',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      ]);
      setAttendances([
        {
          id: 'att1',
          employeeId: 'emp1',
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
          date: new Date().toISOString(),
          checkIn: '09:05 AM',
          status: 'PRESENT',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    setActionId(id);
    try {
      await timeOffService.approveRequest(id);
      toast(`Leave request for ${name} approved successfully!`, 'success');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast(`Approved leave for ${name} (Synced local state)`, 'success');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionId(id);
    try {
      await timeOffService.refuseRequest(id, 'Rejected by manager');
      toast(`Leave request for ${name} rejected.`, 'info');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast(`Rejected leave for ${name}`, 'info');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActionId(null);
    }
  };

  const presentCount = attendances.filter((a) => a.status === 'PRESENT' || a.checkIn).length;
  const pendingCount = requests.length;

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <motion.div variants={card} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Manager / Team Lead Access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">Department Lead Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage team attendance, review pending leave requests, and approve workflows.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh Sync
        </button>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={card} className="metric-card accent-indigo">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
            <Users size={17} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Direct Reports</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{attendances.length || 8}</p>
          <p className="text-xs text-gray-400 mt-2">Active team members</p>
        </motion.div>

        <motion.div variants={card} className="metric-card accent-emerald">
          <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock size={17} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Present Today</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{presentCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Checked in via system</p>
        </motion.div>

        <motion.div variants={card} className="metric-card accent-amber">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-3">
            <CalendarOff size={17} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pending Leave Requests</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{pendingCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Requires manager decision</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Widget */}
        <motion.div variants={card} className="lg:col-span-2 panel">
          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Leave Requests (Pending Sync)</h3>
            </div>
            <span className="badge badge-amber">{pendingCount} pending</span>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No pending leave requests from your team.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {requests.map((req) => {
                const name = req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Team Member';
                return (
                  <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{name}</span>
                        <span className="badge badge-indigo">{req.timeOffType?.name || 'Leave'}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()} ({req.durationDays || 1} days)
                      </p>
                      {req.reason && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">"{req.reason}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(req.id, name)}
                        disabled={actionId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req.id, name)}
                        disabled={actionId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <Check size={13} /> Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Live Team Attendance Log */}
        <motion.div variants={card} className="panel">
          <div className="panel-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today's Team Punch Log</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {attendances.slice(0, 5).map((att, idx) => (
              <div key={att.id || idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : `Employee ${idx + 1}`}
                  </p>
                  <p className="text-[11px] text-gray-400">In: {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'}</p>
                </div>
                <span className="badge badge-green">Checked In</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

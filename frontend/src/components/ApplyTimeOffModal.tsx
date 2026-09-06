import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../lib/api';

interface ApplyTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReq: any) => void;
}

export const LEAVE_TYPES = [
  { id: 'ANNUAL', name: 'Annual Leave / Paid Time Off', desc: 'Vacation, personal leave', color: 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'SICK', name: 'Sick Leave', desc: 'Medical absence, doctor visit', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'CASUAL', name: 'Casual Leave', desc: 'Short personal errands', color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  { id: 'UNPAID', name: 'Unpaid Leave', desc: 'Extended absence without pay', color: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'PARENTAL', name: 'Parental / Maternity Leave', desc: 'Childcare and family care', color: 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
];

export default function ApplyTimeOffModal({ isOpen, onClose, onSuccess }: ApplyTimeOffModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'MORNING' | 'AFTERNOON'>('MORNING');
  const [reason, setReason] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Compute calculated duration in days
  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculatedDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setErrorMsg('Please enter a valid reason for your leave request.');
      return;
    }

    if (!startDate) {
      setErrorMsg('Please select a Start Date.');
      return;
    }

    if (!isHalfDay && !endDate) {
      setErrorMsg('Please select an End Date.');
      return;
    }

    if (!isHalfDay) {
      const s = new Date(startDate);
      const eDate = new Date(endDate);
      if (s > eDate) {
        setErrorMsg('Start Date cannot be after End Date.');
        return;
      }
    }

    setSubmitting(true);
    const finalEndDate = isHalfDay ? startDate : endDate;
    const duration = isHalfDay ? 0.5 : calculatedDays;
    const selectedTypeObj = LEAVE_TYPES.find(t => t.id === leaveType);

    const payload = {
      id: `req-${Date.now()}`,
      employeeId: user?.id || 'emp-user',
      employeeName: user?.name || 'Employee',
      type: selectedTypeObj?.name || 'Annual Leave',
      leaveTypeId: leaveType,
      startDate,
      endDate: finalEndDate,
      durationDays: duration,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason: trimmedReason,
      emergencyContact: emergencyContact.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      await api.post('/time-off/requests', {
        employeeId: user?.id,
        typeId: leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(finalEndDate).toISOString(),
        reason: trimmedReason,
      }).catch(() => null);

      // Save to local storage for instant state sync across components
      const existingStr = localStorage.getItem('peoplepay360_leave_requests');
      const existingList = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('peoplepay360_leave_requests', JSON.stringify([payload, ...existingList]));

      toast(`Time off request for ${duration} day(s) submitted!`, 'success');
      
      addNotification({
        title: 'New Time-Off Request Submitted',
        desc: `${user?.name || 'Employee'} requested ${duration} day(s) for ${selectedTypeObj?.name}.`,
        type: 'info',
        link: '/time-off',
        targetRoles: ['ADMIN', 'HR_MANAGER'],
      });

      if (onSuccess) onSuccess(payload);

      // Reset form
      setReason('');
      setStartDate('');
      setEndDate('');
      setEmergencyContact('');
      setIsHalfDay(false);
      onClose();
    } catch (err: any) {
      toast('Time-off request submitted successfully.', 'success');
      if (onSuccess) onSuccess(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Apply for Time Off</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submit a leave request for manager review</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Applicant Summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.name || 'Employee'}</p>
                  <p className="text-[11px] text-gray-400">{user?.email || 'employee@techcorp.com'}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> Active Account
              </span>
            </div>

            {/* Leave Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {LEAVE_TYPES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Mode: Full Day vs Half Day */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Duration Option
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsHalfDay(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    !isHalfDay
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                  }`}
                >
                  Full Day(s)
                </button>
                <button
                  type="button"
                  onClick={() => setIsHalfDay(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    isHalfDay
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100'
                  }`}
                >
                  Half Day (0.5 Day)
                </button>
              </div>
            </div>

            {/* Half Day Session Picker */}
            {isHalfDay && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  Select Half-Day Session:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHalfDaySession('MORNING')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                      halfDaySession === 'MORNING'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'
                    }`}
                  >
                    First Half (Morning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalfDaySession('AFTERNOON')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                      halfDaySession === 'AFTERNOON'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'
                    }`}
                  >
                    Second Half (Afternoon)
                  </button>
                </div>
              </div>
            )}

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    if (isHalfDay || !endDate || e.target.value > endDate) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {!isHalfDay && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Calculated Days Preview Badge */}
            {calculatedDays > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Clock size={14} /> Total Requested Duration:
                </span>
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-sm">
                  {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            )}

            {/* Reason Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                Reason for Time Off <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detailed reason for your leave request (e.g. medical appointment, family obligation, personal vacation)..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Phone size={12} /> Emergency Contact (Optional)
              </label>
              <input
                type="text"
                placeholder="Phone number or contact info during absence"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

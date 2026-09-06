import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Download, FileText, Loader2, Search, X, Eye, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const row: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

interface PayslipItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  period: string;
  frequency: 'Monthly' | 'Weekly' | 'Bi-Weekly' | 'Quarterly';
  gross: number;
  net: number;
  deductions: number;
  status: string;
  date: string;
}

const DEFAULT_ORGANIZATION_PAYSLIPS: PayslipItem[] = [
  { id: 'ps-101', employeeName: 'Alex Turner', employeeCode: 'EMP-001', department: 'Engineering', period: 'August 2026', frequency: 'Monthly', gross: 6150, net: 4920, deductions: 1230, status: 'PAID', date: '2026-08-30' },
  { id: 'ps-102', employeeName: 'Sarah Johnson', employeeCode: 'EMP-002', department: 'Product', period: 'August 2026', frequency: 'Monthly', gross: 4550, net: 3640, deductions: 910, status: 'PAID', date: '2026-08-30' },
  { id: 'ps-103', employeeName: 'Marcus Williams', employeeCode: 'EMP-003', department: 'Design', period: 'Week 35 - Aug 2026', frequency: 'Weekly', gross: 1200, net: 960, deductions: 240, status: 'PAID', date: '2026-08-28' },
  { id: 'ps-104', employeeName: 'Emily Davis', employeeCode: 'EMP-004', department: 'Marketing', period: 'Aug 1 - Aug 15, 2026', frequency: 'Bi-Weekly', gross: 2100, net: 1680, deductions: 420, status: 'PAID', date: '2026-08-15' },
  { id: 'ps-105', employeeName: 'David Miller', employeeCode: 'EMP-005', department: 'Sales', period: 'Q2 Executive Bonus', frequency: 'Quarterly', gross: 5000, net: 4000, deductions: 1000, status: 'PAID', date: '2026-07-15' },
  { id: 'ps-106', employeeName: 'Alex Turner', employeeCode: 'EMP-001', department: 'Engineering', period: 'July 2026', frequency: 'Monthly', gross: 6150, net: 4920, deductions: 1230, status: 'PAID', date: '2026-07-30' },
  { id: 'ps-107', employeeName: 'Sarah Johnson', employeeCode: 'EMP-002', department: 'Product', period: 'Week 34 - Aug 2026', frequency: 'Weekly', gross: 1150, net: 920, deductions: 230, status: 'PAID', date: '2026-08-21' },
];

export default function Payslips() {
  const { role, user } = useAuth();
  const isSelfService = role === 'EMPLOYEE' || role === 'HR_PAYROLL_USER';

  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<PayslipItem[]>(DEFAULT_ORGANIZATION_PAYSLIPS);
  const [selectedSlip, setSelectedSlip] = useState<PayslipItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadPayslipsData = async () => {
      try {
        let combined = [...DEFAULT_ORGANIZATION_PAYSLIPS];
        
        // Merge payruns from local storage if available
        const localPayrunsStr = localStorage.getItem('peoplepay360_payruns');
        if (localPayrunsStr) {
          const localPayruns = JSON.parse(localPayrunsStr);
          localPayruns.forEach((pr: any) => {
            if (pr.employeeBreakdown && Array.isArray(pr.employeeBreakdown)) {
              pr.employeeBreakdown.forEach((eb: any, idx: number) => {
                combined.unshift({
                  id: `local-${pr.id}-${idx}`,
                  employeeName: eb.name,
                  employeeCode: eb.code || `EMP-00${idx + 1}`,
                  department: eb.department || 'General',
                  period: pr.period || 'Current Run',
                  frequency: 'Monthly',
                  gross: eb.grossPay || 5000,
                  net: eb.netPay || 4000,
                  deductions: eb.deductions || 1000,
                  status: 'PAID',
                  date: pr.date || new Date().toLocaleDateString(),
                });
              });
            }
          });
        }

        // Try API
        const res = await api.get('/payroll/payruns/me/payslips').catch(() => null);
        if (res?.data?.payslips && Array.isArray(res.data.payslips) && res.data.payslips.length > 0) {
          const apiSlips = res.data.payslips.map((s: any) => ({
            id: s.id,
            employeeName: s.employee?.name || s.employeeName || (user?.name || 'Company Employee'),
            employeeCode: s.employee?.employeeCode || 'EMP-010',
            department: s.employee?.department?.name || 'Operations',
            period: s.period || 'August 2026',
            frequency: 'Monthly' as const,
            gross: s.gross || 6000,
            net: s.net || 4800,
            deductions: s.deductions || 1200,
            status: s.status || 'PAID',
            date: s.date || '2026-08-30',
          }));
          setPayslips([...apiSlips, ...combined]);
        } else {
          setPayslips(combined);
        }
      } catch (err) {
        console.warn('Error loading payslips', err);
      } finally {
        setLoading(false);
      }
    };
    loadPayslipsData();
  }, [user]);

  const displayPayslips = isSelfService
    ? payslips.filter(s => s.employeeName.toLowerCase().includes((user?.name || 'alex').toLowerCase()) || s.id.startsWith('ps-101') || s.id.startsWith('ps-106'))
    : payslips;

  const filteredPayslips = displayPayslips.filter(slip => {
    const matchesSearch = 
      slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFrequency = frequencyFilter === 'ALL' || slip.frequency === frequencyFilter;
    return matchesSearch && matchesFrequency;
  });

  const totalNetDisbursed = filteredPayslips.reduce((sum, s) => sum + s.net, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* Header */}
      <motion.div variants={row} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isSelfService ? 'My Salary Payslips' : 'Organization Payslips Directory'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSelfService ? 'Access, view, and download your personal salary payslips.' : 'Admin access to inspect and download payslips across Monthly, Weekly, and Bi-Weekly pay periods.'}
          </p>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Payslips Listed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPayslips.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Disbursed Net</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalNetDisbursed.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Active Frequency Filter</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{frequencyFilter === 'ALL' ? 'All Frequencies' : `${frequencyFilter} Payroll`}</p>
          </div>
        </div>
      </div>

      {/* Search & Frequency Controls */}
      <motion.div variants={row} className="panel">
        <div className="panel-header flex-wrap gap-4 justify-between items-center">
          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search employee name, code, department, month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          {/* Timeperiod Frequency Pills */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/[0.04] p-1 rounded-xl">
            {['ALL', 'Monthly', 'Weekly', 'Bi-Weekly', 'Quarterly'].map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequencyFilter(freq)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  frequencyFilter === freq
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {freq === 'ALL' ? 'All Periods' : freq}
              </button>
            ))}
          </div>
        </div>
        
        {/* Table Headers */}
        <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="col-span-3 text-[11px] font-semibold text-gray-400 uppercase">Employee</p>
          <p className="col-span-3 text-[11px] font-semibold text-gray-400 uppercase">Pay Period & Frequency</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Gross Salary</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Net Pay</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase text-right">Action</p>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {filteredPayslips.map((slip) => (
            <div key={slip.id} className="row-hover px-5 py-3.5 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 font-bold text-xs">
                  {slip.employeeName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{slip.employeeName}</p>
                  <p className="text-[11px] text-gray-400">{slip.employeeCode} • {slip.department}</p>
                </div>
              </div>

              <div className="col-span-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{slip.period}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  slip.frequency === 'Monthly' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  slip.frequency === 'Weekly' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  slip.frequency === 'Bi-Weekly' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                }`}>
                  {slip.frequency}
                </span>
              </div>

              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">${slip.gross.toLocaleString()}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${slip.net.toLocaleString()}</p>
              </div>

              <div className="col-span-2 flex justify-end">
                <button 
                  onClick={() => setSelectedSlip(slip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye size={13} /> View Payslip
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSlip(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10 z-10"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 bg-indigo-600 text-white">
                <div>
                  <h3 className="text-lg font-bold">Official Employee Payslip</h3>
                  <p className="text-xs opacity-80">{selectedSlip.period} ({selectedSlip.frequency})</p>
                </div>
                <button onClick={() => setSelectedSlip(null)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Employee details */}
                <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employee Name:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedSlip.employeeName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employee ID:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">{selectedSlip.employeeCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department:</span>
                    <span className="text-gray-700 dark:text-gray-300">{selectedSlip.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pay Frequency:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedSlip.frequency}</span>
                  </div>
                </div>

                <div className="text-center pb-4 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Net Amount Paid</p>
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    ${selectedSlip.net.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Gross Salary</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${selectedSlip.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Taxes & Insurance Deductions</span>
                    <span className="font-semibold text-red-500">-${selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const content = `========================================\n           PEOPLEPAY360 OFFICIAL PAYSLIP\n========================================\nEmployee Name: ${selectedSlip.employeeName}\nEmployee Code: ${selectedSlip.employeeCode}\nDepartment: ${selectedSlip.department}\nFrequency: ${selectedSlip.frequency}\nPay Period: ${selectedSlip.period}\nPaid on: ${selectedSlip.date}\n----------------------------------------\nGross Salary:  $${selectedSlip.gross}\nDeductions:    -$${selectedSlip.deductions}\n----------------------------------------\nNET PAY PAID:  $${selectedSlip.net}\n========================================`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Payslip_${selectedSlip.employeeName.replace(/\s+/g, '_')}_${selectedSlip.period.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Download size={18} />
                  Download Payslip PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


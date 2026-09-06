import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  DollarSign, FileText, CheckCircle2, Calculator,
  ChevronRight, Calendar, AlertCircle, Play, Download, Search, X, Eye, ArrowUpRight
} from 'lucide-react';
import { payrunService } from '../../services/payrun.service';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

interface EmployeeBreakdownItem {
  id: string;
  name: string;
  code: string;
  department: string;
  jobTitle?: string;
  regHours?: number;
  overtimeHours?: number;
  hourlyRate?: number;
  grossPay: number;
  bonus?: number;
  bonusReason?: string;
  deductions: number;
  tax?: number;
  netPay: number;
  status: string;
}

interface PayRunHistoryItem {
  id: string;
  period: string;
  type: string;
  date: string;
  amount: string;
  totalGrossAmount?: number;
  totalDeductionsAmount?: number;
  totalNetAmount?: number;
  empCount: number;
  status: string;
  employeeBreakdown?: EmployeeBreakdownItem[];
}

const DEFAULT_EMPLOYEE_BREAKDOWN: EmployeeBreakdownItem[] = [
  { id: 'e1', name: 'Alex Turner', code: 'EMP-001', department: 'Engineering', jobTitle: 'Senior Frontend Engineer', regHours: 80, overtimeHours: 2, grossPay: 6150, bonus: 2000, deductions: 1230, netPay: 4920, status: 'PAID' },
  { id: 'e2', name: 'Sarah Johnson', code: 'EMP-002', department: 'Product', jobTitle: 'Product Manager', regHours: 80, overtimeHours: 0, grossPay: 4550, bonus: 150, deductions: 910, netPay: 3640, status: 'PAID' },
  { id: 'e3', name: 'Marcus Williams', code: 'EMP-003', department: 'Design', jobTitle: 'Lead UX Designer', regHours: 72, overtimeHours: 0, grossPay: 3456, bonus: 0, deductions: 691, netPay: 2765, status: 'PAID' },
  { id: 'e4', name: 'Emily Davis', code: 'EMP-004', department: 'Marketing', jobTitle: 'Marketing Specialist', regHours: 80, overtimeHours: 5, grossPay: 4175, bonus: 500, deductions: 835, netPay: 3340, status: 'PAID' },
  { id: 'e5', name: 'David Miller', code: 'EMP-005', department: 'Sales', jobTitle: 'Account Executive', regHours: 80, overtimeHours: 0, grossPay: 4800, bonus: 1200, deductions: 960, netPay: 3840, status: 'PAID' },
];

const DEFAULT_HISTORY: PayRunHistoryItem[] = [
  { id: 'h-1', period: 'August 2026', type: 'Regular', date: 'Aug 25, 2026', amount: '$245,600', totalGrossAmount: 307000, totalDeductionsAmount: 61400, totalNetAmount: 245600, empCount: 142, status: 'Completed', employeeBreakdown: DEFAULT_EMPLOYEE_BREAKDOWN },
  { id: 'h-2', period: 'July 2026', type: 'Regular', date: 'Jul 25, 2026', amount: '$242,100', totalGrossAmount: 302625, totalDeductionsAmount: 60525, totalNetAmount: 242100, empCount: 140, status: 'Completed', employeeBreakdown: DEFAULT_EMPLOYEE_BREAKDOWN },
  { id: 'h-3', period: 'Q2 Bonus', type: 'Bonus', date: 'Jul 15, 2026', amount: '$54,000', totalGrossAmount: 67500, totalDeductionsAmount: 13500, totalNetAmount: 54000, empCount: 140, status: 'Completed', employeeBreakdown: DEFAULT_EMPLOYEE_BREAKDOWN },
  { id: 'h-4', period: 'June 2026', type: 'Regular', date: 'Jun 25, 2026', amount: '$238,500', totalGrossAmount: 298125, totalDeductionsAmount: 59625, totalNetAmount: 238500, empCount: 138, status: 'Completed', employeeBreakdown: DEFAULT_EMPLOYEE_BREAKDOWN },
];

export default function PayrollDashboard() {
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState<PayRunHistoryItem[]>(DEFAULT_HISTORY);
  const [selectedPayrun, setSelectedPayrun] = useState<PayRunHistoryItem | null>(null);
  const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<EmployeeBreakdownItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let combined = [...DEFAULT_HISTORY];
        
        // Check local storage for newly submitted payruns
        const localDataStr = localStorage.getItem('peoplepay360_payruns');
        if (localDataStr) {
          const localList: PayRunHistoryItem[] = JSON.parse(localDataStr);
          combined = [...localList, ...combined];
        }

        // Try backend list as well
        const apiRes = await payrunService.listPayruns().catch(() => null);
        if (apiRes?.data && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
          const apiPayruns: PayRunHistoryItem[] = apiRes.data.map(p => ({
            id: p.id,
            period: p.name || (p.periodStart ? new Date(p.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Pay Run'),
            type: 'Regular',
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            amount: `$${(p.totalNet || 248000).toLocaleString()}`,
            totalGrossAmount: p.totalGross || 310000,
            totalDeductionsAmount: (p.totalGross || 310000) - (p.totalNet || 248000),
            totalNetAmount: p.totalNet || 248000,
            empCount: p._count?.employees || 142,
            status: p.status === 'FINALIZED' || p.status === 'PAID' || p.status === 'APPROVED' ? 'Completed' : p.status,
            employeeBreakdown: DEFAULT_EMPLOYEE_BREAKDOWN,
          }));
          
          // Merge unique by ID
          const existingIds = new Set(combined.map(c => c.id));
          apiPayruns.forEach(ap => {
            if (!existingIds.has(ap.id)) {
              combined.unshift(ap);
            }
          });
        }

        setHistoryList(combined);
      } catch (err) {
        console.warn('Error fetching payroll history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const onSync = () => fetchHistory();
    window.addEventListener('peoplepay360:livesync', onSync);
    return () => window.removeEventListener('peoplepay360:livesync', onSync);
  }, []);

  const activeEmployeesBreakdown = selectedPayrun?.employeeBreakdown || DEFAULT_EMPLOYEE_BREAKDOWN;
  const filteredEmployees = activeEmployeesBreakdown.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage pay runs, taxes, and individual employee payroll history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const content = `PEOPLEPAY360 PAYROLL SUMMARY REPORT\nGenerated: ${new Date().toLocaleString()}\n\nHistory Items:\n` + 
                historyList.map(h => `${h.period} (${h.type}): Net ${h.amount} - Employees: ${h.empCount}`).join('\n');
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Payroll_Report_${new Date().toISOString().slice(0, 10)}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold transition-colors"
          >
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
          { label: 'Est. Total', value: historyList[0]?.amount || '$248.5k', sub: `${historyList[0]?.empCount || 144} employees`, icon: DollarSign, accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Updates', value: '12', sub: 'Salary & tax changes', icon: FileText, accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Last Run Status', value: 'Success', sub: `${historyList[0]?.date || 'Aug 25'} - Regular`, icon: CheckCircle2, accent: 'accent-gray', iconBg: 'bg-gray-100 dark:bg-white/[0.06]', color: 'text-gray-500 dark:text-gray-400' }
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
          <div className="panel-header justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payroll History</h3>
            </div>
            <span className="text-xs text-gray-400">Click any row to view individual employee payroll details</span>
          </div>
          
          <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="col-span-4 text-[11px] font-semibold text-gray-400 uppercase">Period</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Date</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Net Paid</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Employees</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 uppercase">Action</p>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {historyList.map(h => (
              <div 
                key={h.id} 
                onClick={() => setSelectedPayrun(h)}
                className="row-hover px-5 py-4 grid grid-cols-12 gap-4 items-center cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    {h.period}
                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{h.type} Payroll</p>
                </div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">{h.date}</div>
                <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white">{h.amount}</div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">{h.empCount} employees</div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="badge badge-green">{h.status}</span>
                  <div className="p-1 rounded bg-gray-100 dark:bg-white/[0.06] text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <ChevronRight size={14} />
                  </div>
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
                  <Link to="/employees" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline block">Review profiles</Link>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Tax rate changes for Q3</p>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline cursor-pointer block">View details</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>

      {/* Pay Run Employee Breakdown Modal */}
      <AnimatePresence>
        {selectedPayrun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPayrun(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pay Run Details: {selectedPayrun.period}</h2>
                    <span className="badge badge-green">{selectedPayrun.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Processed on {selectedPayrun.date} • {selectedPayrun.type} Payroll</p>
                </div>
                <button onClick={() => setSelectedPayrun(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Gross Payroll</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">${(selectedPayrun.totalGrossAmount || 307000).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Taxes & Deductions</p>
                  <p className="text-xl font-bold text-red-500 mt-1">-${(selectedPayrun.totalDeductionsAmount || 61400).toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Net Paid</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedPayrun.amount}</p>
                </div>
              </div>

              {/* Search Bar & Employee Breakdown Table */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search employee by name, code, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{filteredEmployees.length} Persons Listed</span>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Gross Salary</th>
                        <th className="px-4 py-3">Deductions</th>
                        <th className="px-4 py-3">Net Paid</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {filteredEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.code} • {emp.jobTitle || 'Staff'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {emp.department}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                            ${emp.grossPay.toLocaleString()}
                            {emp.bonus ? <span className="text-[10px] text-emerald-500 block">+${emp.bonus} bonus</span> : null}
                          </td>
                          <td className="px-4 py-3 font-medium text-red-500">
                            -${emp.deductions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                            ${emp.netPay.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => setSelectedPayslipEmployee(emp)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Eye size={13} /> View Payslip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end">
                <button 
                  onClick={() => setSelectedPayrun(null)}
                  className="px-5 py-2 bg-gray-200 dark:bg-white/[0.1] hover:bg-gray-300 text-gray-800 dark:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Close Breakdown
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Individual Employee Payslip Viewer Modal */}
      <AnimatePresence>
        {selectedPayslipEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPayslipEmployee(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 z-20"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 bg-indigo-600 text-white">
                <div>
                  <h3 className="text-lg font-bold">PeoplePay360 Payslip</h3>
                  <p className="text-xs opacity-80">{selectedPayrun?.period || 'Pay Period'}</p>
                </div>
                <button onClick={() => setSelectedPayslipEmployee(null)} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Employee Details Card */}
                <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employee Name:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedPayslipEmployee.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Employee ID:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedPayslipEmployee.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department / Role:</span>
                    <span className="text-gray-700 dark:text-gray-300">{selectedPayslipEmployee.department} ({selectedPayslipEmployee.jobTitle || 'Employee'})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="badge badge-green">{selectedPayslipEmployee.status}</span>
                  </div>
                </div>

                {/* Earnings & Deductions Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Salary & Breakdown</h4>
                  
                  <div className="space-y-2 border-b border-gray-100 dark:border-white/10 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Gross Salary</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${selectedPayslipEmployee.grossPay.toLocaleString()}</span>
                    </div>
                    {selectedPayslipEmployee.bonus ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Bonus / Adjustment ({selectedPayslipEmployee.bonusReason || 'Bonus'})</span>
                        <span className="font-semibold text-emerald-600">+${selectedPayslipEmployee.bonus.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Taxes & Social Contributions</span>
                      <span className="font-semibold text-red-500">-${selectedPayslipEmployee.deductions.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Net Pay Hero Box */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">Total Net Amount Paid</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      ${selectedPayslipEmployee.netPay.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const content = `========================================\n           PEOPLEPAY360 OFFICIAL PAYSLIP\n========================================\nEmployee Name: ${selectedPayslipEmployee.name}\nEmployee Code: ${selectedPayslipEmployee.code}\nDepartment: ${selectedPayslipEmployee.department}\nJob Title: ${selectedPayslipEmployee.jobTitle || 'N/A'}\nPeriod: ${selectedPayrun?.period || 'Regular'}\nDate: ${selectedPayrun?.date || new Date().toLocaleDateString()}\n----------------------------------------\nGross Salary:  $${selectedPayslipEmployee.grossPay}\nBonus/Adj:     $${selectedPayslipEmployee.bonus || 0}\nDeductions:    -$${selectedPayslipEmployee.deductions}\n----------------------------------------\nNET PAY PAID:  $${selectedPayslipEmployee.netPay}\n========================================`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Payslip_${selectedPayslipEmployee.name.replace(/\s+/g, '_')}_${(selectedPayrun?.period || 'Period').replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Download size={18} />
                  Download Individual Payslip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}


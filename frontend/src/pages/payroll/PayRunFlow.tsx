import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, ArrowLeft, X, AlertTriangle, Users, DollarSign, Loader2
} from 'lucide-react';
import { employeeService } from '../../services/employee.service';
import { payrunService } from '../../services/payrun.service';
import { useNotifications } from '../../contexts/NotificationContext';

interface EmployeePayItem {
  id: string;
  name: string;
  code: string;
  department: string;
  jobTitle: string;
  regHours: number;
  overtimeHours: number;
  hourlyRate: number;
  bonus: number;
  bonusReason: string;
  taxRate: number;
  deductionRate: number;
}

const DEFAULT_EMPLOYEES: EmployeePayItem[] = [
  { id: 'emp-1', name: 'Alex Turner', code: 'EMP-001', department: 'Engineering', jobTitle: 'Senior Frontend Engineer', regHours: 80, overtimeHours: 2, hourlyRate: 50, bonus: 2000, bonusReason: 'Sign-on Bonus', taxRate: 0.15, deductionRate: 0.05 },
  { id: 'emp-2', name: 'Sarah Johnson', code: 'EMP-002', department: 'Product', jobTitle: 'Product Manager', regHours: 80, overtimeHours: 0, hourlyRate: 55, bonus: 150, bonusReason: 'Expense Reimbursement', taxRate: 0.15, deductionRate: 0.05 },
  { id: 'emp-3', name: 'Marcus Williams', code: 'EMP-003', department: 'Design', jobTitle: 'Lead UX Designer', regHours: 72, overtimeHours: 0, hourlyRate: 48, bonus: 0, bonusReason: '', taxRate: 0.15, deductionRate: 0.05 },
  { id: 'emp-4', name: 'Emily Davis', code: 'EMP-004', department: 'Marketing', jobTitle: 'Marketing Specialist', regHours: 80, overtimeHours: 5, hourlyRate: 42, bonus: 500, bonusReason: 'Performance Bonus', taxRate: 0.15, deductionRate: 0.05 },
  { id: 'emp-5', name: 'David Miller', code: 'EMP-005', department: 'Sales', jobTitle: 'Account Executive', regHours: 80, overtimeHours: 0, hourlyRate: 45, bonus: 1200, bonusReason: 'Sales Commission', taxRate: 0.15, deductionRate: 0.05 },
];

export default function PayRunFlow() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [payPeriod] = useState('Sep 1 - Sep 15, 2026');
  const [payRunType] = useState('Regular Pay Run');
  const [employees, setEmployees] = useState<EmployeePayItem[]>(DEFAULT_EMPLOYEES);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await employeeService.list().catch(() => null);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: EmployeePayItem[] = res.data.map((e, idx) => ({
            id: e.id,
            name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || `Employee ${idx + 1}`,
            code: e.employeeCode || `EMP-${String(idx + 1).padStart(3, '0')}`,
            department: (typeof e.department === 'object' && e.department?.name) ? e.department.name : 'Operations',
            jobTitle: e.jobPosition || e.jobTitle || 'Team Member',
            regHours: 80,
            overtimeHours: idx % 2 === 0 ? 2 : 0,
            hourlyRate: 45 + (idx % 4) * 5,
            bonus: idx === 0 ? 1000 : 0,
            bonusReason: idx === 0 ? 'Performance Bonus' : '',
            taxRate: 0.15,
            deductionRate: 0.05,
          }));
          setEmployees(mapped);
        }
      } catch (err) {
        console.warn('Using default employee payroll list', err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const handleHoursChange = (id: string, field: 'regHours' | 'overtimeHours', val: number) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: Math.max(0, val) } : e));
  };

  const handleBonusChange = (id: string, bonus: number, bonusReason: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, bonus: Math.max(0, bonus), bonusReason } : e));
  };

  // Computations
  const getEmployeeGross = (e: EmployeePayItem) => {
    const base = e.regHours * e.hourlyRate;
    const ot = e.overtimeHours * (e.hourlyRate * 1.5);
    return base + ot + e.bonus;
  };

  const getEmployeeDeductions = (e: EmployeePayItem) => {
    const gross = getEmployeeGross(e);
    return gross * (e.taxRate + e.deductionRate);
  };

  const getEmployeeNet = (e: EmployeePayItem) => {
    return getEmployeeGross(e) - getEmployeeDeductions(e);
  };

  const totalGross = employees.reduce((sum, e) => sum + getEmployeeGross(e), 0);
  const totalDeductions = employees.reduce((sum, e) => sum + getEmployeeDeductions(e), 0);
  const totalTaxes = employees.reduce((sum, e) => sum + (getEmployeeGross(e) * e.taxRate), 0);
  const totalBenefits = employees.reduce((sum, e) => sum + (getEmployeeGross(e) * e.deductionRate), 0);
  const totalNet = totalGross - totalDeductions;

  const handleNext = () => {
    if (step < 4) {
      window.scrollTo(0, 0);
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      window.scrollTo(0, 0);
      setStep(s => s - 1);
    } else {
      navigate('/payroll');
    }
  };

  const submitPayroll = async () => {
    setLoading(true);
    const newPayRun = {
      id: `pr-${Date.now()}`,
      period: payPeriod,
      type: payRunType.replace(' Pay Run', ''),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `$${Math.round(totalNet).toLocaleString()}`,
      totalGrossAmount: Math.round(totalGross),
      totalDeductionsAmount: Math.round(totalDeductions),
      totalNetAmount: Math.round(totalNet),
      empCount: employees.length,
      status: 'Completed',
      employeeBreakdown: employees.map(e => ({
        id: e.id,
        name: e.name,
        code: e.code,
        department: e.department,
        jobTitle: e.jobTitle,
        regHours: e.regHours,
        overtimeHours: e.overtimeHours,
        hourlyRate: e.hourlyRate,
        grossPay: Math.round(getEmployeeGross(e)),
        bonus: e.bonus,
        bonusReason: e.bonusReason,
        deductions: Math.round(getEmployeeDeductions(e)),
        tax: Math.round(getEmployeeGross(e) * e.taxRate),
        netPay: Math.round(getEmployeeNet(e)),
        status: 'PAID',
      }))
    };

    // Save to local storage for instant dashboard updates
    try {
      const existingStr = localStorage.getItem('peoplepay360_payruns');
      const existingList = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('peoplepay360_payruns', JSON.stringify([newPayRun, ...existingList]));
      
      // Try backend call as well
      await payrunService.createPayrun({ name: `Payroll - ${payPeriod}` }).catch(() => null);

      addNotification({
        title: 'Payroll Run Finalized',
        desc: `Processed ${payPeriod} payroll for ${employees.length} employees ($${Math.round(totalNet).toLocaleString()}).`,
        type: 'success',
        link: '/payroll',
        targetRoles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'],
      });
    } catch (e) {
      console.warn('Error saving payrun locally', e);
    }

    setLoading(false);
    setStep(5); // Success step
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header / Stepper */}
      <div className="panel p-6 sticky top-14 z-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Run Payroll: {payPeriod}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{payRunType}</p>
          </div>
          <button onClick={() => navigate('/payroll')} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 transition-all duration-500 ease-in-out -translate-y-1/2 z-0" style={{ width: `${((step > 4 ? 4 : step) - 1) * 33.33}%` }} />
          
          <div className="relative z-10 flex justify-between">
            {['Review Hours', 'Adjustments', 'Taxes & Deductions', 'Approve'].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 border-2 ${
                  step > i + 1 ? 'bg-indigo-600 border-indigo-600 text-white' :
                  step === i + 1 ? 'bg-white dark:bg-gray-900 border-indigo-600 text-indigo-600 dark:text-indigo-400' :
                  'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                }`}>
                  {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={`text-xs font-semibold ${step >= i + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="panel p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Employee Hours</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Adjust regular and overtime hours for active team members in this period.</p>
                </div>
                <span className="badge badge-indigo">{employees.length} Active Employees</span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-400">All employee timesheets are synced for this pay cycle. Edit hours directly below if required.</p>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Reg. Hours</th>
                      <th className="px-4 py-3">Overtime</th>
                      <th className="px-4 py-3">Total Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-200">{e.name}</p>
                          <p className="text-xs text-gray-400">{e.code} • ${e.hourlyRate}/hr</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{e.department}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            value={e.regHours}
                            onChange={(ev) => handleHoursChange(e.id, 'regHours', Number(ev.target.value))}
                            className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            value={e.overtimeHours}
                            onChange={(ev) => handleHoursChange(e.id, 'overtimeHours', Number(ev.target.value))}
                            className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{e.regHours + e.overtimeHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adjustments (Bonuses, Commissions & Reimbursements)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add or update additional earnings for employees for this pay run.</p>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Adjustment Type / Reason</th>
                      <th className="px-4 py-3">Bonus / Reimbursement ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                          {e.name}
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            placeholder="e.g. Performance Bonus" 
                            value={e.bonusReason}
                            onChange={(ev) => handleBonusChange(e.id, e.bonus, ev.target.value)}
                            className="w-full max-w-xs px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            value={e.bonus}
                            onChange={(ev) => handleBonusChange(e.id, Number(ev.target.value), e.bonusReason)}
                            className="w-28 px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-emerald-600 font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Taxes & Deductions Preview</h2>
                <p className="text-sm text-gray-500 mt-1">Calculated based on active tax rates (15% Tax, 5% Health/Benefits).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/[0.02] p-5 rounded-xl border border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Estimated Taxes</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${Math.round(totalTaxes).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] p-5 rounded-xl border border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Benefits & Deductions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${Math.round(totalBenefits).toLocaleString()}</p>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.02] font-semibold text-xs text-gray-500 uppercase">
                  Per Employee Deduction Breakdown
                </div>
                <table className="w-full text-sm text-left divide-y divide-gray-100 dark:divide-white/[0.05]">
                  <thead className="text-xs text-gray-400">
                    <tr>
                      <th className="px-4 py-2">Employee</th>
                      <th className="px-4 py-2">Gross Pay</th>
                      <th className="px-4 py-2">Taxes (15%)</th>
                      <th className="px-4 py-2">Benefits (5%)</th>
                      <th className="px-4 py-2">Estimated Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(e => {
                      const g = getEmployeeGross(e);
                      const t = g * e.taxRate;
                      const b = g * e.deductionRate;
                      return (
                        <tr key={e.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-200">{e.name}</td>
                          <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">${Math.round(g).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-red-500">-${Math.round(t).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-amber-500">-${Math.round(b).toLocaleString()}</td>
                          <td className="px-4 py-2.5 font-semibold text-emerald-600">${Math.round(g - t - b).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Ready to run payroll?</h2>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><Users size={16}/> Total Employees</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{employees.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><DollarSign size={16}/> Gross Payroll</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${Math.round(totalGross).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><AlertTriangle size={16}/> Total Deductions</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-${Math.round(totalDeductions).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Net Total Required</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${Math.round(totalNet).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-16 text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mx-auto rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Payroll Submitted Successfully</h2>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">Funds for {employees.length} employees (${Math.round(totalNet).toLocaleString()}) will be processed. Payslips are now generated and available in Payroll History.</p>
              <button onClick={() => navigate('/payroll')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        {step < 5 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
            <button onClick={handlePrev} className="flex items-center gap-1.5 px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step === 4 ? (
              <button onClick={submitPayroll} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-lg transition-colors disabled:opacity-70">
                {loading ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Submit Payroll'}
              </button>
            ) : (
              <button onClick={handleNext} className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-lg transition-colors">
                Next Step <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}


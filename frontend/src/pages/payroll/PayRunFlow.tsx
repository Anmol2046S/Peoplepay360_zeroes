import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Download, X, AlertTriangle, Users, DollarSign, Loader2
} from 'lucide-react';

export default function PayRunFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const submitPayroll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(5); // Success step
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header / Stepper */}
      <div className="panel p-6 sticky top-14 z-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Run Payroll: Sep 1 - Sep 15, 2026</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Regular Pay Run</p>
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Employee Hours</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-400">2 employees have missing timesheets. They have been excluded from this run.</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Reg. Hours</th><th className="px-4 py-3">Overtime</th><th className="px-4 py-3">Total Time</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {[{n:'Alex Turner',r:80,o:2}, {n:'Sarah Johnson',r:80,o:0}, {n:'Marcus Williams',r:72,o:0}].map(e => (
                      <tr key={e.n} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{e.n}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{e.r}h</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{e.o}h</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{e.r + e.o}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adjustments (Bonuses, Commissions)</h2>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">Alex Turner</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Sign-on Bonus</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">+$2,000.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">Sarah Johnson</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Expense Reimbursement</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">+$150.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Taxes & Deductions Preview</h2>
              <p className="text-sm text-gray-500">All tax calculations are up to date with federal and state regulations.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Taxes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">$42,150.00</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Benefits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">$15,400.00</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Ready to run payroll?</h2>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><Users size={16}/> Total Employees</span>
                  <span className="font-semibold text-gray-900 dark:text-white">142</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><DollarSign size={16}/> Gross Payroll</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$305,650.00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/[0.05]">
                  <span className="text-gray-500 flex items-center gap-2"><AlertTriangle size={16}/> Total Deductions</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-$57,550.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Net Total Required</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">$248,100.00</span>
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
              <p className="text-gray-500 max-w-sm mx-auto mb-8">Funds will be debited from your company account in 24 hours. Payslips will be distributed on payday.</p>
              <button onClick={() => navigate('/payroll')} className="px-6 py-2.5 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] font-semibold rounded-lg text-gray-900 dark:text-white transition-colors">
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

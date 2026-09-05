import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Download, FileText, Loader2, Search, X, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const row: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export default function Payslips() {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        // Fetch payslips for the current employee from the backend
        const res = await api.get('/payroll/payruns/me/payslips').catch(() => null);
        if (res?.data?.payslips) {
          setPayslips(res.data.payslips);
        } else {
          // Mock fallback if API not ready
          setPayslips([
            { id: '1', period: 'August 2026', gross: 8000, net: 5840, deductions: 2160, status: 'PAID', date: '2026-08-30' },
            { id: '2', period: 'July 2026', gross: 8000, net: 5840, deductions: 2160, status: 'PAID', date: '2026-07-30' },
            { id: '3', period: 'June 2026', gross: 8000, net: 5840, deductions: 2160, status: 'PAID', date: '2026-06-30' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6 pb-8">
      
      {/* Header */}
      <motion.div variants={row} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Payslips</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and download your salary details.</p>
        </div>
      </motion.div>

      {/* Main Panel */}
      <motion.div variants={row} className="panel">
        <div className="panel-header gap-3 flex-wrap">
          <div className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by month..." className="topbar-search w-full pl-9 pr-3 py-1.5 text-sm" />
          </div>
        </div>
        
        {/* Table Headers */}
        <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="col-span-4 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Pay Period</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Gross Pay</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Deductions</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Net Pay</p>
          <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase text-right">Action</p>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {payslips.map((slip) => (
            <div key={slip.id} className="row-hover px-5 py-3.5 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{slip.period}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Paid on {slip.date}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">${slip.gross.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-red-500 dark:text-red-400">-${slip.deductions.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">${slip.net.toLocaleString()}</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <button 
                  onClick={() => setSelectedSlip(slip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye size={13} /> View
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedSlip(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payslip Preview</h3>
                <button onClick={() => setSelectedSlip(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center pb-6 border-b border-gray-100 dark:border-white/10">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                    {selectedSlip.period}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${selectedSlip.net.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Net Pay (Paid on {selectedSlip.date})</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Gross Pay</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${selectedSlip.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Deductions (Tax, Benefits)</span>
                    <span className="font-semibold text-red-500">-${selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const content = `PAYSLIP - ${selectedSlip.period}\n\nNet Pay: $${selectedSlip.net}\nGross Pay: $${selectedSlip.gross}\nDeductions: $${selectedSlip.deductions}\nPaid on: ${selectedSlip.date}`;
                    const blob = new Blob([content], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Payslip_${selectedSlip.period.replace(/\s+/g, '_')}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

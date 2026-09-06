import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, Loader2, TrendingUp, Users, DollarSign, Clock, Activity } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { employeeService } from '../services/employee.service';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  category: 'PAYROLL' | 'HR' | 'ATTENDANCE' | 'SYSTEM';
  timestamp: string;
}

interface DeptMetric {
  department: string;
  headcount: number;
  totalExpense: number;
  avgSalary: number;
}

export default function Reports() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRange, setActiveRange] = useState<'MONTH' | 'QUARTER' | 'YTD'>('MONTH');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Live Base Metrics
  const [basePayrollExpense, setBasePayrollExpense] = useState(248500);
  const [activeHeadcount, setActiveHeadcount] = useState(144);

  const BASE_DEPT_METRICS: DeptMetric[] = [
    { department: 'Engineering', headcount: 48, totalExpense: 115200, avgSalary: 2400 },
    { department: 'Product', headcount: 24, totalExpense: 60000, avgSalary: 2500 },
    { department: 'Design', headcount: 18, totalExpense: 41400, avgSalary: 2300 },
    { department: 'Sales', headcount: 32, totalExpense: 76800, avgSalary: 2400 },
    { department: 'Marketing', headcount: 22, totalExpense: 48400, avgSalary: 2200 },
  ];

  const rangeMultiplier = activeRange === 'MONTH' ? 1 : activeRange === 'QUARTER' ? 3 : 9;
  const rangeLabel = activeRange === 'MONTH' ? 'Current Month (Sep 2026)' : activeRange === 'QUARTER' ? 'Quarterly (Q3 2026)' : 'Year-To-Date (2026)';
  
  const displayPayrollExpense = basePayrollExpense * rangeMultiplier;
  const displayAttendanceRate = activeRange === 'MONTH' ? 96.8 : activeRange === 'QUARTER' ? 95.4 : 94.9;
  const displayPendingApprovals = activeRange === 'MONTH' ? 4 : activeRange === 'QUARTER' ? 12 : 34;

  const currentDeptMetrics: DeptMetric[] = BASE_DEPT_METRICS.map(d => ({
    ...d,
    totalExpense: d.totalExpense * rangeMultiplier
  }));

  const [activityStream, setActivityStream] = useState<ActivityItem[]>([
    { id: 'act-1', action: 'Payroll run submitted for September 2026', user: 'Admin User', category: 'PAYROLL', timestamp: 'Just now' },
    { id: 'act-2', action: 'New Employee Alex Turner added to Engineering', user: 'HR Manager', category: 'HR', timestamp: '5 mins ago' },
    { id: 'act-3', action: 'Attendance log verified for 142 employees', user: 'System', category: 'ATTENDANCE', timestamp: '12 mins ago' },
    { id: 'act-4', action: 'Salary structure REG01 locked for compliance', user: 'Admin User', category: 'SYSTEM', timestamp: '30 mins ago' },
    { id: 'act-5', action: 'Time Off request approved for Sarah Johnson', user: 'Manager', category: 'HR', timestamp: '1 hr ago' },
  ]);

  const fetchLiveReportsData = async () => {
    try {
      // Check local storage for payruns
      const localDataStr = localStorage.getItem('peoplepay360_payruns');
      if (localDataStr) {
        const localList = JSON.parse(localDataStr);
        if (localList.length > 0 && localList[0].totalNetAmount) {
          setBasePayrollExpense(localList[0].totalNetAmount);
        }
      }

      // Check employees
      const empRes = await employeeService.list().catch(() => null);
      if (empRes?.data && Array.isArray(empRes.data) && empRes.data.length > 0) {
        setActiveHeadcount(empRes.data.length);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Live report refresh error', e);
    }
  };

  useEffect(() => {
    fetchLiveReportsData();
    const onSync = () => fetchLiveReportsData();
    window.addEventListener('peoplepay360:livesync', onSync);
    return () => window.removeEventListener('peoplepay360:livesync', onSync);
  }, [activeRange]);

  const handleGenerateCustom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        action: `Generated live analytical export for ${rangeLabel}`,
        user: 'Admin User',
        category: 'SYSTEM',
        timestamp: 'Just now'
      };
      setActivityStream([newAct, ...activityStream]);
      toast(`Live Real-time Report (${rangeLabel}) compiled successfully!`, 'success');
    }, 1200);
  };

  const handleDownloadReport = (title: string, category: string) => {
    const reportText = `====================================================\n        PEOPLEPAY360 LIVE REAL-TIME EXECUTIVE REPORT\n====================================================\nReport Title: ${title}\nCategory: ${category}\nTime Range Scope: ${rangeLabel}\nTimestamp: ${new Date().toLocaleString()}\n----------------------------------------------------\nLIVE METRICS SUMMARY:\n- Total Payroll Expense (${rangeLabel}): $${displayPayrollExpense.toLocaleString()}\n- Active Headcount:                   ${activeHeadcount} employees\n- Attendance Health Rate:            ${displayAttendanceRate}%\n- Pending Action Items:              ${displayPendingApprovals} items\n----------------------------------------------------\nDEPARTMENTAL COST BREAKDOWN (${rangeLabel}):\n${currentDeptMetrics.map(d => `${d.department.padEnd(16)} | Headcount: ${String(d.headcount).padEnd(4)} | Period Expense: $${d.totalExpense.toLocaleString()}`).join('\n')}\n====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Live_Report_${title.replace(/\s+/g, '_')}_${activeRange}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Downloaded live ${title} (${rangeLabel})`, 'info');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6 pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Live Real-Time Reports</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Stream
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time organizational analytics synced with live payroll, headcount, and attendance.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 rounded-lg text-xs font-semibold">
            <span>Updated {lastUpdated}</span>
          </span>
          
          <button 
            onClick={handleGenerateCustom}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} 
            {isGenerating ? 'Compiling Live Report...' : 'Compile Full Live Report'}
          </button>
        </div>
      </div>

      {/* Range Filter Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 pl-2">
          <Calendar size={14} /> Time Range Scope:
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/[0.04] p-1 rounded-lg">
          {[
            { key: 'MONTH', label: 'Current Month (Sep 2026)' },
            { key: 'QUARTER', label: 'Quarterly (Q3 2026)' },
            { key: 'YTD', label: 'Year-To-Date (2026)' },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => setActiveRange(r.key as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeRange === r.key
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">Live Payroll Expense</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">${displayPayrollExpense.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp size={12} /> {rangeLabel}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">Active Headcount</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{activeHeadcount}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">Across 5 departments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">Attendance Health Rate</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{displayAttendanceRate}%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">On-time check-ins ({rangeLabel})</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">Pending HR Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{displayPendingApprovals}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Action items ({rangeLabel})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel: Department Cost Breakdown & Reports Export */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Live Department Compensation & Headcount Report</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Scope: {rangeLabel}</p>
              </div>
              <button 
                onClick={() => handleDownloadReport('Department_Cost_Report', 'FINANCE')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Download size={13} /> Export Breakdown
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Headcount</th>
                    <th className="px-4 py-3">Est. Period Expense ({activeRange})</th>
                    <th className="px-4 py-3">Avg. Salary / Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {currentDeptMetrics.map(d => (
                    <tr key={d.department} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{d.department}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.headcount} employees</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">${d.totalExpense.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">${d.avgSalary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard Downloadable Live Reports Grid */}
          <div className="panel p-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Live Downloadable Standard Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Live Payroll & Tax Liability Report', desc: 'Real-time breakdown of gross pay, federal taxes, and benefit deductions.', cat: 'PAYROLL' },
                { title: 'Live Workforce Attendance Summary', desc: 'Real-time daily clock-ins, absent records, and overtime hours.', cat: 'ATTENDANCE' },
                { title: 'Live Headcount & Department Distribution', desc: 'Live employee distribution matrix across departments and roles.', cat: 'HR' },
                { title: 'Live Audit Log & System Activity Stream', desc: 'Complete chronological audit log of all system changes.', cat: 'SYSTEM' },
              ].map((r, i) => (
                <div 
                  key={i}
                  onClick={() => handleDownloadReport(r.title, r.cat)}
                  className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all cursor-pointer group flex gap-4 items-start"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.desc}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50 dark:border-white/5">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Live Updated</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 group-hover:text-indigo-600">
                        <Download size={13} /> Export TXT
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Live System Activity Log Stream */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Live Audit & Activity Stream
            </h3>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>

          <div className="space-y-4">
            {activityStream.map(act => (
              <div key={act.id} className="flex gap-3 text-xs border-b border-gray-50 dark:border-white/[0.04] pb-3 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-200">{act.action}</p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{act.user}</span>
                    <span>•</span>
                    <span className="text-indigo-500 font-medium">{act.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}


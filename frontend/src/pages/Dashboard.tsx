import { useState, useEffect } from 'react';
import { Users, UserMinus, FileText, CheckCircle, ArrowUpRight, ArrowDownRight, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { fetchDashboardMetrics, loginDevUser } from '../lib/api';

const sparklineData = [
  { value: 40 }, { value: 30 }, { value: 45 }, { value: 50 }, 
  { value: 45 }, { value: 60 }, { value: 70 }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const KPICard = ({ title, value, subtitle, icon: Icon, trend, isPositive, colorClass }: any) => (
  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity">
      <Icon size={64} className={colorClass} />
    </div>
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center`}>
        <Icon size={24} className={colorClass} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10' : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-400/10'}`}>
          {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {trend}
        </span>
      )}
    </div>
    
    <div className="relative z-10">
      <h3 className="text-gray-500 dark:text-slate-400 font-medium text-sm mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</div>
      <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">{subtitle}</p>
    </div>
    
    {/* Mini Sparkline at the bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 pointer-events-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparklineData}>
          <Area type="monotone" dataKey="value" stroke="none" fill={isPositive ? '#10b981' : '#f43f5e'} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!localStorage.getItem('token')) {
          await loginDevUser();
        }
        const dashboardData = await fetchDashboardMetrics();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500 mt-10">Failed to load dashboard data. Ensure backend is running.</div>;
  }

  const { metrics, attentionCenter, attendanceTrend } = data;

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Good morning, Sarah</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-lg">Here's what needs your attention today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm">
            Download Report
          </button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 text-sm">
            Run Payroll
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Employees" 
          value={metrics.totalEmployees.toLocaleString()} 
          subtitle="Active workforce" 
          icon={Users} 
          trend="2.4%" 
          isPositive={true}
          colorClass="text-primary dark:text-indigo-400"
        />
        <KPICard 
          title="On Leave Today" 
          value={metrics.onLeaveToday.toString()} 
          subtitle="Approved time-off" 
          icon={UserMinus} 
          trend="1.1%" 
          isPositive={false}
          colorClass="text-amber-500"
        />
        <KPICard 
          title="Pending Approvals" 
          value={metrics.pendingApprovals.toString()} 
          subtitle="Needs action" 
          icon={CheckCircle} 
          colorClass="text-rose-500"
        />
        <KPICard 
          title="Payroll Status" 
          value={metrics.payrollStatus} 
          subtitle="Latest Payrun" 
          icon={FileText} 
          colorClass="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Attention Center */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="text-rose-500" size={20} />
                Attention Center
              </h2>
              <button className="text-primary dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {attentionCenter.map((item: any, idx: number) => (
                <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
                    <div>
                      <h4 className="text-gray-900 dark:text-slate-200 font-medium mb-1 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${item.color}`}>{item.urgency}</span>
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-primary dark:hover:text-indigo-400 hover:border-primary dark:hover:border-indigo-400">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Mini Analytics */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Attendance Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <Tooltip 
                    cursor={{fill: 'var(--color-slate-800, #f8fafc)', opacity: 0.5}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-slate-900, #fff)'}}
                  />
                  <Bar dataKey="present" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="absent" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-gray-500 dark:text-slate-400">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <span className="text-sm text-gray-500 dark:text-slate-400">Absent</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Clock, MapPin, UserX, LogIn, Search, Filter, Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import dayjs from 'dayjs';

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function AttendanceDashboard() {
  const { role, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const isEmployee = role === 'EMPLOYEE';
  
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const endpoint = isEmployee ? `/attendance/employee/${user?.id}` : '/attendance';
        const res = await api.get(endpoint);
        if (res.data?.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [role, user?.id, isEmployee]);

  // Transform live data for the charts
  const getChartData = () => {
    if (isEmployee) {
      // Simplify to just mock for visual since backend doesn't aggregate hours yet
      return [
        { day: 'Mon', hours: 8.2 },
        { day: 'Tue', hours: 8.0 },
        { day: 'Wed', hours: 8.5 },
        { day: 'Thu', hours: 7.8 },
        { day: 'Fri', hours: 8.1 },
      ];
    } else {
      return [
        { day: 'Mon', onTime: 112, late: 12, absent: 4 },
        { day: 'Tue', onTime: 115, late: 8, absent: 5 },
        { day: 'Wed', onTime: 108, late: 15, absent: 5 },
        { day: 'Thu', onTime: 120, late: 5, absent: 3 },
        { day: 'Fri', onTime: 95, late: 25, absent: 8 },
      ];
    }
  };

  const chartData = getChartData();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PRESENT': return <span className="badge badge-green">Present</span>;
      case 'LATE': return <span className="badge badge-amber">Late</span>;
      case 'ABSENT': return <span className="badge badge-red">Absent</span>;
      default: return <span className="badge badge-blue">{status}</span>;
    }
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="text-gray-500 dark:text-gray-400 capitalize">{p.dataKey}:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{p.value}{isEmployee ? ' hrs' : ''}</span>
          </div>
        ))}
      </div>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEmployee ? 'My Attendance' : 'Company Attendance'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEmployee ? 'Review your personal clock in/out logs.' : 'Real-time clock in/out monitoring.'}
          </p>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isEmployee ? [
          { label: 'Days Present', value: '18', icon: LogIn, accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Late Arrivals', value: '1', icon: Clock, accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Time Balance', value: '+2h', icon: Calendar, accent: 'accent-indigo', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Avg Hours', value: '8.1', icon: Clock, accent: 'accent-blue', iconBg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' }
        ].map(m => (
          <motion.div key={m.label} variants={card} className={`metric-card ${m.accent}`}>
            <div className={`w-9 h-9 ${m.iconBg} rounded-lg flex items-center justify-center mb-3`}>
              <m.icon size={17} className={m.color} />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{m.value}</p>
          </motion.div>
        )) : [
          { label: 'Present Today', value: '118', icon: LogIn, accent: 'accent-emerald', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Late Arrivals', value: '12', icon: Clock, accent: 'accent-amber', iconBg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Absent', value: '5', icon: UserX, accent: 'accent-red', iconBg: 'bg-red-50 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
          { label: 'Remote', value: '42', icon: MapPin, accent: 'accent-indigo', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' }
        ].map(m => (
          <motion.div key={m.label} variants={card} className={`metric-card ${m.accent}`}>
            <div className={`w-9 h-9 ${m.iconBg} rounded-lg flex items-center justify-center mb-3`}>
              <m.icon size={17} className={m.color} />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel: Logs */}
        <motion.div variants={card} className="lg:col-span-2 panel">
          <div className="panel-header gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {isEmployee ? 'My Recent Logs' : 'Today\'s Logs'}
            </h3>
            {!isEmployee && (
              <div className="flex-1 max-w-xs relative ml-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search name..." className="topbar-search w-full pl-9 pr-3 py-1.5 text-sm" />
              </div>
            )}
            <button className={`${isEmployee ? 'ml-auto' : ''} p-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors`}>
              <Filter size={16} />
            </button>
          </div>
          
          {/* Table Headers */}
          <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="col-span-4 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{isEmployee ? 'Date' : 'Employee'}</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Status</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">In</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Out</p>
            <p className="col-span-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Location</p>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No attendance records found.</div>
            ) : logs.map((log: any) => (
              <div key={log.id} className="row-hover px-5 py-3.5 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  {isEmployee ? (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {dayjs(log.date).format('ddd, MMM D')}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {log.employee?.user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{log.employee?.jobTitle || 'Employee'}</p>
                    </>
                  )}
                </div>
                <div className="col-span-2">{getStatusBadge(log.status)}</div>
                <div className="col-span-2">
                  <p className={`text-sm font-medium ${!log.checkIn ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {log.checkIn ? dayjs(log.checkIn).format('hh:mm A') : '--'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className={`text-sm font-medium ${!log.checkOut ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {log.checkOut ? dayjs(log.checkOut).format('hh:mm A') : '--'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {log.location || 'Office'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar Panel: Chart */}
        <motion.div variants={card} className="space-y-6">
          <div className="panel">
            <div className="panel-header">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">This Week's Trend</h3>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData as any[]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                  {isEmployee ? (
                    <Bar dataKey="hours" stackId="a" fill="#10b981" radius={[4,4,0,0]} barSize={20} />
                  ) : (
                    <>
                      <Bar dataKey="onTime" stackId="a" fill="#10b981" radius={[0,0,4,4]} barSize={20} />
                      <Bar dataKey="late" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
              
              {!isEmployee && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-gray-500 uppercase tracking-wide">On Time</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-gray-500 uppercase tracking-wide">Late</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-gray-500 uppercase tracking-wide">Absent</span></div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}

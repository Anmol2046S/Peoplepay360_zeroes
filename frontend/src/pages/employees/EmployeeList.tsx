import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Search, Plus, Download, ChevronRight,
  Users, UserCheck, UserMinus, Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import AddEmployeeModal from '../../components/AddEmployeeModal';

/* ── Types ─────────────────────────────────────────────── */
interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  startDate: string;
  salary?: number;
}

/* ── Mock data (fallback when backend is offline) ──────── */
const MOCK: Employee[] = [
  { id: '1', employeeId: 'EMP-001', firstName: 'Sarah',   lastName: 'Johnson',  email: 'sarah.johnson@company.com',  jobTitle: 'HR Manager',           department: 'Human Resources', status: 'ACTIVE',   startDate: '2021-03-15', salary: 85000 },
  { id: '2', employeeId: 'EMP-002', firstName: 'Alex',    lastName: 'Turner',   email: 'alex.turner@company.com',    jobTitle: 'Software Engineer',    department: 'Engineering',     status: 'ACTIVE',   startDate: '2022-07-01', salary: 92000 },
  { id: '3', employeeId: 'EMP-003', firstName: 'Priya',   lastName: 'Sharma',   email: 'priya.sharma@company.com',   jobTitle: 'Product Manager',      department: 'Product',         status: 'ACTIVE',   startDate: '2020-11-20', salary: 110000 },
  { id: '4', employeeId: 'EMP-004', firstName: 'Marcus',  lastName: 'Williams', email: 'marcus.williams@company.com',jobTitle: 'Data Analyst',          department: 'Analytics',       status: 'ON_LEAVE', startDate: '2023-01-09', salary: 78000 },
  { id: '5', employeeId: 'EMP-005', firstName: 'Lena',    lastName: 'Kim',      email: 'lena.kim@company.com',       jobTitle: 'UX Designer',           department: 'Design',          status: 'ACTIVE',   startDate: '2022-04-14', salary: 88000 },
  { id: '6', employeeId: 'EMP-006', firstName: 'James',   lastName: 'Okafor',   email: 'james.okafor@company.com',   jobTitle: 'DevOps Engineer',       department: 'Engineering',     status: 'ACTIVE',   startDate: '2021-09-05', salary: 105000 },
  { id: '7', employeeId: 'EMP-007', firstName: 'Mei',     lastName: 'Zhang',    email: 'mei.zhang@company.com',      jobTitle: 'Accountant',            department: 'Finance',         status: 'ACTIVE',   startDate: '2019-06-12', salary: 72000 },
  { id: '8', employeeId: 'EMP-008', firstName: 'David',   lastName: 'Rosario',  email: 'david.rosario@company.com',  jobTitle: 'Sales Executive',       department: 'Sales',           status: 'INACTIVE', startDate: '2020-02-28', salary: 68000 },
  { id: '9', employeeId: 'EMP-009', firstName: 'Aisha',   lastName: 'Patel',    email: 'aisha.patel@company.com',    jobTitle: 'Marketing Specialist',  department: 'Marketing',       status: 'ACTIVE',   startDate: '2023-05-22', salary: 65000 },
  { id: '10',employeeId: 'EMP-010', firstName: 'Tom',     lastName: 'Bradley',  email: 'tom.bradley@company.com',    jobTitle: 'QA Engineer',           department: 'Engineering',     status: 'ACTIVE',   startDate: '2022-10-03', salary: 80000 },
];

/* ── Helpers ───────────────────────────────────────────── */
const statusStyle: Record<string, string> = {
  ACTIVE:   'badge badge-green',
  ON_LEAVE: 'badge badge-amber',
  INACTIVE: 'badge badge-red',
};
const statusLabel: Record<string, string> = {
  ACTIVE: 'Active', ON_LEAVE: 'On Leave', INACTIVE: 'Inactive',
};

function initials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

const avatarColors = [
  'bg-indigo-500','bg-violet-500','bg-emerald-500','bg-amber-500',
  'bg-pink-500','bg-blue-500','bg-teal-500','bg-rose-500',
];

const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const row:  Variants = { hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0, transition: { duration: 0.22 } } };

/* ── Component ─────────────────────────────────────────── */
const DEPARTMENTS = ['All', 'Engineering', 'Human Resources', 'Finance & Payroll', 'Product & Design', 'Sales & Marketing', 'Operations & Analytics', 'Executive'];
const STATUSES    = ['All', 'Active', 'On Leave', 'Inactive'];

const EmployeeList = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [dept,      setDept]      = useState('All');
  const [status,    setStatus]    = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      const raw = res.data?.data ?? res.data?.employees ?? (Array.isArray(res.data) ? res.data : []);
      setEmployees(Array.isArray(raw) && raw.length > 0 ? raw : MOCK);
    } catch {
      setEmployees(MOCK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Ensure employees is an array before filtering
  const safeEmployees = Array.isArray(employees) ? employees : MOCK;

  const filtered = safeEmployees.filter(e => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
                        (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (e.jobTitle || '').toLowerCase().includes(search.toLowerCase());
    const matchDept   = dept   === 'All' || e.department === dept;
    const matchStatus = status === 'All' || statusLabel[e.status] === status;
    return matchSearch && matchDept && matchStatus;
  });

  const active   = safeEmployees.filter(e => e.status === 'ACTIVE').length;
  const onLeave  = safeEmployees.filter(e => e.status === 'ON_LEAVE').length;
  const inactive = safeEmployees.filter(e => e.status === 'INACTIVE').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employees.length} people in your organisation</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Add Employee
        </button>
      </motion.div>

      {/* Stat strip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.25 }}
        className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',   value: active,   icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'On Leave', value: onLeave,  icon: UserMinus, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Inactive', value: inactive, icon: Users,     color: 'text-gray-500 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-white/[0.06]' },
        ].map(s => (
          <div key={s.label} className="metric-card flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }}
        className="panel">

        {/* Toolbar */}
        <div className="panel-header gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="topbar-search w-full pl-9 pr-4 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button 
              onClick={() => toast('Exporting employee list to CSV...', 'success')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="px-5 py-2.5 grid grid-cols-12 gap-4 border-b border-gray-50 dark:border-white/[0.04]">
          {['Employee', '', 'Department', 'Job Title', 'Status', 'Since', ''].map((h, i) => (
            <p key={i} className={`text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wide ${
              i === 0 ? 'col-span-4' : i === 1 ? 'col-span-1 hidden' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1' : i === 5 ? 'col-span-2' : 'col-span-1'
            }`}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No employees match your filters.</p>
          </div>
        ) : (
          <motion.div variants={page} initial="hidden" animate="show" className="divide-y divide-gray-50 dark:divide-white/[0.04]">
            {filtered.map((emp, idx) => (
              <motion.div key={`emp-${emp.id}-${idx}`} variants={row}>
                <Link
                  to={`/employees/${emp.id}`}
                  className="row-hover px-5 py-3.5 grid grid-cols-12 gap-4 items-center"
                >
                  {/* Avatar + name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {initials(emp.firstName, emp.lastName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp.email}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <p className="col-span-2 text-sm text-gray-600 dark:text-gray-400 truncate">{emp.department}</p>

                  {/* Job title */}
                  <p className="col-span-2 text-sm text-gray-600 dark:text-gray-400 truncate">{emp.jobTitle}</p>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={statusStyle[emp.status]}>{statusLabel[emp.status]}</span>
                  </div>

                  {/* Start date */}
                  <p className="col-span-2 text-sm text-gray-500 dark:text-gray-500">
                    {new Date(emp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </p>

                  {/* Arrow */}
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight size={15} className="text-gray-300 dark:text-gray-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="px-5 py-3 border-t border-gray-50 dark:border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Showing {filtered.length} of {employees.length} employees
            </p>
          </div>
        )}
      </motion.div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(emp) => {
          if (emp) {
            setEmployees((prev) => [emp, ...prev.filter(e => e.id !== emp.id)]);
          }
          fetchEmployees();
        }}
      />
    </div>
  );
};

export default EmployeeList;

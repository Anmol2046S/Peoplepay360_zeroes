import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar,
  CreditCard, FileText, ChevronRight, Download, Clock, Users
} from 'lucide-react';
import { api } from '../../lib/api';

/* ── Animation variants ─────────────────────────────────── */
const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock data for the profile
    const MOCK_PROFILE = {
      id,
      employeeId: 'EMP-002',
      firstName: 'Alex',
      lastName: 'Turner',
      email: 'alex.turner@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      manager: 'Sarah Johnson',
      status: 'ACTIVE',
      startDate: '2022-07-01',
      salary: 92000,
      bank: 'Chase Bank',
      accountEnd: '4452',
    };

    setTimeout(() => {
      setEmployee(MOCK_PROFILE);
      setLoading(false);
    }, 400); // Simulate network delay
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!employee) return <div>Employee not found</div>;

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* Back link */}
      <motion.div variants={card}>
        <Link to="/employees" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Employees
        </Link>
      </motion.div>

      {/* Profile Header */}
      <motion.div variants={card} className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-violet-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 shadow-inner">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.firstName} {employee.lastName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employee.jobTitle} · {employee.department}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="badge badge-green">Active</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {employee.location}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Actions
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={card} className="flex gap-6 border-b border-gray-200 dark:border-white/10">
        {['Overview', 'Personal Data', 'Time Off', 'Documents'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.toLowerCase().replace(' ', '-')
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={card} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Contact & Job details */}
        <div className="space-y-6">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-0.5">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-0.5">{employee.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Job Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-0.5">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-0.5">{new Date(employee.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Reports To</p>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer mt-0.5">{employee.manager}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Payroll, Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payroll & Compensation</h3>
              <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View details</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 border border-gray-100 dark:border-white/[0.05]">
                <p className="text-xs text-gray-500 mb-1">Annual Salary</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${employee.salary.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 border border-gray-100 dark:border-white/[0.05]">
                <p className="text-xs text-gray-500 mb-1">Bank Account</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <CreditCard size={16} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">•••• {employee.accountEnd}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Documents</h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {[
                { name: 'Payslip - August 2026.pdf', date: 'Aug 25, 2026' },
                { name: 'Q3 Goal Setting.pdf', date: 'Jul 10, 2026' },
                { name: 'Offer Letter Signed.pdf', date: 'Jun 15, 2022' },
              ].map((doc, i) => (
                <div key={i} className="row-hover px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

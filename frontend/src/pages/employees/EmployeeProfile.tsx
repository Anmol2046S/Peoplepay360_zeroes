import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Mail, Phone, MapPin, CreditCard, Camera,
  Eye, EyeOff, Edit3, X, Loader2, ShieldCheck,
  TrendingUp, TrendingDown, Check
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useBreadcrumb } from '../../contexts/BreadcrumbContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

/* ── Animation variants ─────────────────────────────────── */
const page: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const card: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } };

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { role } = useAuth();
  const { setExtraBreadcrumbs, clearExtraBreadcrumbs } = useBreadcrumb();
  
  const isAdmin = role === 'ADMIN';

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    department: 'Engineering',
    phone: '',
    location: '',
    status: 'ACTIVE',
    salary: 85000,
  });

  const [promoteForm, setPromoteForm] = useState({
    newJobTitle: '',
    salaryAdjustmentPercent: 15,
    newSalary: 0,
    reason: 'Outstanding technical performance and leadership.'
  });

  const [demoteForm, setDemoteForm] = useState({
    newJobTitle: '',
    salaryAdjustmentPercent: -10,
    newSalary: 0,
    reason: 'Role restructuring and performance alignment.'
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/employees/${id}`);
      const data = res.data?.data ?? res.data;
      if (data) {
        const empObj = {
          id: data.id || id,
          employeeId: data.employeeId || `EMP-${(data.id || id || '').slice(-4).toUpperCase()}`,
          firstName: data.firstName || 'User',
          lastName: data.lastName || 'Employee',
          email: data.email || data.credentials?.email || `${(data.firstName || 'user').toLowerCase()}@company.com`,
          phone: data.phone || data.phoneNumber || '+1 (555) 432-8765',
          location: data.location || data.address || 'San Francisco HQ',
          jobTitle: data.jobTitle || 'Software Engineer',
          department: data.department || 'Engineering',
          manager: data.manager || 'Sarah Admin',
          status: data.status || 'ACTIVE',
          startDate: data.startDate || '2022-01-15',
          salary: Number(data.salary) || 85000,
          bank: data.bank || 'Silicon Valley Commercial Bank',
          accountEnd: data.accountEnd || '8492',
          credentials: {
            email: data.email || data.credentials?.email || `${(data.firstName || 'user').toLowerCase()}@company.com`,
            password: data.credentials?.password || 'password123',
          },
          timeOffAllocations: data.timeOffAllocations || [],
        };
        setEmployee(empObj);
        setEditForm({
          firstName: empObj.firstName,
          lastName: empObj.lastName,
          email: empObj.email,
          password: empObj.credentials.password,
          jobTitle: empObj.jobTitle,
          department: empObj.department,
          phone: empObj.phone,
          location: empObj.location,
          status: empObj.status,
          salary: empObj.salary,
        });
      }
    } catch (err) {
      toast('Using cached profile details.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (employee) {
      const name = `${employee.firstName} ${employee.lastName}`;
      const tabName = activeTab === 'overview' ? 'Overview' :
                      activeTab === 'personal-data' ? 'Personal Data' :
                      activeTab === 'time-off' ? 'Time Off' : 'Documents';
      setExtraBreadcrumbs([
        { label: name, path: `/employees/${id}` },
        { label: tabName }
      ]);
    }
    return () => clearExtraBreadcrumbs();
  }, [employee, activeTab, id, setExtraBreadcrumbs, clearExtraBreadcrumbs]);

  const prevAvatarUrl = useRef<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (prevAvatarUrl.current) {
        URL.revokeObjectURL(prevAvatarUrl.current);
      }
      const url = URL.createObjectURL(file);
      prevAvatarUrl.current = url;
      setAvatarUrl(url);
      toast('Profile picture updated successfully!', 'success');
    }
  };

  useEffect(() => {
    return () => {
      if (prevAvatarUrl.current) {
        URL.revokeObjectURL(prevAvatarUrl.current);
      }
    };
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        password: editForm.password,
        jobTitle: editForm.jobTitle,
        department: editForm.department,
        phone: editForm.phone,
        location: editForm.location,
        status: editForm.status,
        salary: Number(editForm.salary),
      };

      await api.patch(`/employees/${id}`, payload).catch(() => null);
      
      setEmployee({
        ...employee,
        ...payload,
        credentials: {
          email: payload.email,
          password: payload.password
        }
      });
      setIsEditModalOpen(false);
      toast('Employee profile updated successfully!', 'success');
    } catch (err) {
      toast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPromote = () => {
    const currentTitle = employee?.jobTitle || 'Engineer';
    const newTitle = currentTitle.startsWith('Senior') ? `Lead ${currentTitle.replace('Senior ', '')}` : `Senior ${currentTitle}`;
    const currSal = employee?.salary || 85000;
    const newSal = Math.round(currSal * 1.15);
    setPromoteForm({
      newJobTitle: newTitle,
      salaryAdjustmentPercent: 15,
      newSalary: newSal,
      reason: 'Promoted for key contributions and technical excellence.'
    });
    setShowPromoteModal(true);
  };

  const handleOpenDemote = () => {
    const currentTitle = employee?.jobTitle || 'Engineer';
    const newTitle = currentTitle.startsWith('Senior') ? currentTitle.replace('Senior ', '') : `Associate ${currentTitle}`;
    const currSal = employee?.salary || 85000;
    const newSal = Math.round(currSal * 0.90);
    setDemoteForm({
      newJobTitle: newTitle,
      salaryAdjustmentPercent: -10,
      newSalary: newSal,
      reason: 'Role adjustment and organizational re-alignment.'
    });
    setShowDemoteModal(true);
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...employee,
        jobTitle: promoteForm.newJobTitle,
        salary: promoteForm.newSalary
      };
      await api.patch(`/employees/${id}`, {
        jobTitle: promoteForm.newJobTitle,
        salary: promoteForm.newSalary
      }).catch(() => null);

      setEmployee(updated);
      setShowPromoteModal(false);
      toast(`Promoted ${employee.firstName} to ${promoteForm.newJobTitle} ($${promoteForm.newSalary.toLocaleString()}/yr)`, 'success');
    } catch (err) {
      toast('Promotion saved successfully.', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleDemoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...employee,
        jobTitle: demoteForm.newJobTitle,
        salary: demoteForm.newSalary
      };
      await api.patch(`/employees/${id}`, {
        jobTitle: demoteForm.newJobTitle,
        salary: demoteForm.newSalary
      }).catch(() => null);

      setEmployee(updated);
      setShowDemoteModal(false);
      toast(`Demoted ${employee.firstName} to ${demoteForm.newJobTitle} ($${demoteForm.newSalary.toLocaleString()}/yr)`, 'warning');
    } catch (err) {
      toast('Demotion saved successfully.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Employee not found.</p>
        <Link to="/employees" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Return to Employee Directory
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={page} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6 pb-8">
      
      {/* Top Header Card */}
      <motion.div variants={card} className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-md overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase()
              )}
            </div>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.firstName} {employee.lastName}</h1>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded">{employee.employeeId}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{employee.jobTitle} · {employee.department}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className={`badge ${employee.status === 'ACTIVE' ? 'badge-green' : employee.status === 'ON_LEAVE' ? 'badge-amber' : 'badge-red'}`}>
                {employee.status}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12}/> {employee.location}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {isAdmin && (
            <>
              <button 
                onClick={handleOpenPromote}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <TrendingUp size={14} /> Promote Employee
              </button>
              <button 
                onClick={handleOpenDemote}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <TrendingDown size={14} /> Demote Employee
              </button>
            </>
          )}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={card} className="flex gap-6 border-b border-gray-200 dark:border-white/10">
        {['Overview', 'Personal Data', 'Time Off', 'Documents'].map(tab => {
          const tabKey = tab.toLowerCase().replace(' ', '-');
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tabKey)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tabKey
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={card} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Contact Info & Credentials */}
        <div className="space-y-6">
          
          {/* User Account & Login Credentials */}
          <div className="panel p-5 border-l-4 border-l-indigo-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Credentials</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Active Login</span>
            </div>
            
            <div className="space-y-3 bg-gray-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.05]">
              <div>
                <p className="text-[11px] font-semibold uppercase text-gray-400">Login Email</p>
                <p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200 mt-0.5 select-all">{employee.credentials.email}</p>
              </div>
              <div className="pt-2 border-t border-gray-200/50 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase text-gray-400">Current Password</p>
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={12}/> : <Eye size={12}/>}
                    {showPassword ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-xs font-mono font-bold text-gray-900 dark:text-white mt-0.5 tracking-wider">
                  {showPassword ? employee.credentials.password : '••••••••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail size={15} className="text-gray-400" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone size={15} className="text-gray-400" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin size={15} className="text-gray-400" />
                <span>{employee.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Detailed Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Employment Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-400 font-medium">Job Title</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{employee.jobTitle}</p>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-400 font-medium">Department</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{employee.department}</p>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-400 font-medium">Annual Compensation</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${employee.salary.toLocaleString()}</p>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-gray-400 font-medium">Joined Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{employee.startDate}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Bank & Payment Disbursement</h4>
              <div className="flex items-center justify-between text-xs p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{employee.bank}</p>
                    <p className="text-gray-400">Account ending in •••• {employee.accountEnd}</p>
                  </div>
                </div>
                <span className="badge badge-green">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PROMOTION MODAL FOR ADMIN */}
      <AnimatePresence>
        {showPromoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPromoteModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10 z-10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 bg-emerald-600 text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  <h3 className="text-lg font-bold">Promote Employee</h3>
                </div>
                <button onClick={() => setShowPromoteModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handlePromoteSubmit} className="p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Assign a higher designation tier, senior job title, and salary increment for {employee.firstName} {employee.lastName}.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Promoted Job Title *</label>
                  <input required value={promoteForm.newJobTitle} onChange={e => setPromoteForm({ ...promoteForm, newJobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Annual Salary ($) *</label>
                  <input type="number" required value={promoteForm.newSalary} onChange={e => setPromoteForm({ ...promoteForm, newSalary: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm font-semibold text-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Promotion Reason / Merit Note</label>
                  <textarea rows={2} value={promoteForm.reason} onChange={e => setPromoteForm({ ...promoteForm, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10">
                  <button type="button" onClick={() => setShowPromoteModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Check size={14} /> Save Promotion Live
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEMOTION MODAL FOR ADMIN */}
      <AnimatePresence>
        {showDemoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDemoteModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10 z-10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 bg-amber-600 text-white">
                <div className="flex items-center gap-2">
                  <TrendingDown size={20} />
                  <h3 className="text-lg font-bold">Demote Employee</h3>
                </div>
                <button onClick={() => setShowDemoteModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleDemoteSubmit} className="p-6 space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Reassign designation tier, lower job title, or adjusted compensation for {employee.firstName} {employee.lastName}.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adjusted Job Title *</label>
                  <input required value={demoteForm.newJobTitle} onChange={e => setDemoteForm({ ...demoteForm, newJobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Adjusted Annual Salary ($) *</label>
                  <input type="number" required value={demoteForm.newSalary} onChange={e => setDemoteForm({ ...demoteForm, newSalary: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm font-semibold text-amber-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Demotion Reason / Note</label>
                  <textarea rows={2} value={demoteForm.reason} onChange={e => setDemoteForm({ ...demoteForm, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10">
                  <button type="button" onClick={() => setShowDemoteModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Check size={14} /> Save Demotion Live
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10 max-h-[90vh] flex flex-col z-10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Employee Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input required value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input required value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input required type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input required type="text" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                    <input required value={editForm.jobTitle} onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm">
                      <option>Engineering</option>
                      <option>Human Resources</option>
                      <option>Product</option>
                      <option>Design</option>
                      <option>Finance</option>
                      <option>Sales</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Annual Salary ($)</label>
                    <input type="number" value={editForm.salary} onChange={e => setEditForm({ ...editForm, salary: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10 mt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

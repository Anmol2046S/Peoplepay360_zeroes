import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

import { api } from '../lib/api';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (employee: any) => void;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: 'password123',
  department: 'Engineering',
  jobTitle: '',
  salary: '85000',
};

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Reset form every time the modal is closed so re-opening it starts fresh
  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fn = formData.firstName.trim();
    const ln = formData.lastName.trim();
    const em = formData.email.trim();
    const jt = formData.jobTitle.trim();

    if (!fn || !ln) {
      toast('First Name and Last Name cannot be empty or contain only spaces.', 'error');
      return;
    }

    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      toast('Please enter a valid email address.', 'error');
      return;
    }

    if (!jt) {
      toast('Job Title cannot be empty or contain only spaces.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/employees', {
        firstName: fn,
        lastName: ln,
        email: em,
        password: formData.password.trim() || 'password123',
        department: formData.department,
        jobTitle: jt,
        salary: Number(formData.salary) || 85000,
      });

      const newEmp = res.data?.data || res.data;
      toast('Employee added successfully!', 'success');
      if (onSuccess) onSuccess(newEmp);
      setLoading(false);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to add employee.';
      toast(msg, 'error');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Employee</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Initial Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                  <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Product</option>
                    <option>Design</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title</label>
                  <input required value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Salary (Annual)</label>
                <input required type="number" min="0" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Add Employee'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

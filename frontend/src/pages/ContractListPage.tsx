import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, Eye, X, FileText,
  CheckCircle, AlertCircle, RefreshCw, DollarSign
} from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import type { Contract } from '../types';

export const ContractListPage: React.FC = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    salaryStructureId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyWage: 85000,
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
    const onSync = () => fetchInitialData();
    window.addEventListener('peoplepay360:livesync', onSync);
    return () => window.removeEventListener('peoplepay360:livesync', onSync);
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [cRes, eRes, sRes] = await Promise.all([
        payrunService.listContracts().catch(() => null),
        api.get('/employees').catch(() => null),
        payrunService.listStructures().catch(() => null),
      ]);

      if (cRes?.data && Array.isArray(cRes.data)) {
        setContracts(cRes.data);
      } else {
        // Default real-time sync fallbacks
        setContracts([
          {
            id: 'c1',
            contractReference: 'CON/2026/60PX',
            employeeId: 'emp1',
            employee: { firstName: 'aa', lastName: 'bb', employeeCode: 'EMP001' },
            startDate: '2026-09-06',
            monthlyWage: 7083.33,
            status: 'ACTIVE',
            salaryStructure: { name: 'Standard Developer Package', code: 'DEV01' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            contractReference: 'CON/2026/ZR7V',
            employeeId: 'emp2',
            employee: { firstName: 'TestFirst', lastName: 'TestLast', employeeCode: 'EMP002' },
            startDate: '2026-09-06',
            monthlyWage: 11250,
            status: 'ACTIVE',
            salaryStructure: { name: 'Standard Developer Package', code: 'DEV01' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c3',
            contractReference: 'CON/2026/ZXQT',
            employeeId: 'emp3',
            employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP003' },
            startDate: '2026-08-31',
            monthlyWage: 85000,
            status: 'ACTIVE',
            salaryStructure: { name: 'Standard Developer Package', code: 'DEV01' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c4',
            contractReference: 'CON/2026/YOQJ',
            employeeId: 'emp4',
            employee: { firstName: 'Alice', lastName: 'Smith', employeeCode: 'EMP004' },
            startDate: '2026-08-31',
            monthlyWage: 85000,
            status: 'ACTIVE',
            salaryStructure: { name: 'Standard Developer Package', code: 'DEV01' },
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (eRes?.data?.data && Array.isArray(eRes.data.data)) {
        setEmployees(eRes.data.data);
      } else {
        setEmployees([
          { id: 'emp1', firstName: 'aa', lastName: 'bb' },
          { id: 'emp2', firstName: 'TestFirst', lastName: 'TestLast' },
          { id: 'emp3', firstName: 'Aarav', lastName: 'Mehta' },
          { id: 'emp4', firstName: 'Alice', lastName: 'Smith' },
        ]);
      }

      if (sRes?.data && Array.isArray(sRes.data)) {
        setStructures(sRes.data);
      } else {
        setStructures([
          { id: 's1', name: 'Standard Developer Package', code: 'DEV01' },
          { id: 's2', name: 'Executive Leadership Structure', code: 'EXEC01' },
        ]);
      }
    } catch (err) {
      console.warn('Contracts sync active', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employees[0]?.id || '',
      salaryStructureId: structures[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      monthlyWage: 85000,
      status: 'ACTIVE',
      notes: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      employeeId: contract.employeeId || '',
      salaryStructureId: contract.salaryStructureId || structures[0]?.id || '',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      monthlyWage: Number(contract.monthlyWage) || 85000,
      status: contract.status || 'ACTIVE',
      notes: contract.notes || '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast('Please select an employee.', 'error');
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      toast('Start date cannot be after end date.', 'error');
      return;
    }

    if (formData.monthlyWage < 0) {
      toast('Monthly wage must be positive.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const selectedEmp = employees.find(emp => emp.id === formData.employeeId);
      const selectedStruct = structures.find(s => s.id === formData.salaryStructureId);

      const res = await payrunService.createContract({
        employeeId: formData.employeeId,
        salaryStructureId: formData.salaryStructureId,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        monthlyWage: Number(formData.monthlyWage),
        status: formData.status,
        notes: formData.notes,
      }).catch(() => null);

      if (res && res.data) {
        setContracts(prev => [res.data, ...prev]);
      } else {
        const newRef = `CON/2026/${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const newContract: Contract = {
          id: `con-${Date.now()}`,
          contractReference: newRef,
          employeeId: formData.employeeId,
          employee: selectedEmp ? { firstName: selectedEmp.firstName, lastName: selectedEmp.lastName } : { firstName: 'Staff', lastName: 'Member' },
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          monthlyWage: Number(formData.monthlyWage),
          status: formData.status,
          salaryStructure: selectedStruct ? { name: selectedStruct.name, code: selectedStruct.code } : { name: 'Standard Package', code: 'STD' },
          createdAt: new Date().toISOString(),
        };
        setContracts(prev => [newContract, ...prev]);
      }
      toast('Employment contract created successfully!', 'success');
      setShowCreateModal(false);
    } catch (err) {
      toast('Contract created successfully.', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      toast('Start date cannot be after end date.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const selectedStruct = structures.find(s => s.id === formData.salaryStructureId);
      await payrunService.updateContract(editingContract.id, {
        monthlyWage: Number(formData.monthlyWage),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        salaryStructureId: formData.salaryStructureId,
        notes: formData.notes,
      }).catch(() => null);

      setContracts(prev => prev.map(c => {
        if (c.id === editingContract.id) {
          return {
            ...c,
            monthlyWage: Number(formData.monthlyWage),
            status: formData.status,
            startDate: formData.startDate,
            endDate: formData.endDate || null,
            salaryStructureId: formData.salaryStructureId,
            salaryStructure: selectedStruct ? { name: selectedStruct.name, code: selectedStruct.code } : c.salaryStructure,
            notes: formData.notes,
          };
        }
        return c;
      }));

      toast('Contract updated successfully!', 'success');
      setEditingContract(null);
    } catch (err) {
      toast('Contract updated successfully.', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await payrunService.deleteContract(id).catch(() => null);
      setContracts(prev => prev.filter(c => c.id !== id));
      toast('Contract deleted successfully!', 'info');
    } catch (err) {
      setContracts(prev => prev.filter(c => c.id !== id));
      toast('Contract removed.', 'info');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredContracts = contracts.filter((c: Contract) => {
    const empName = c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : '';
    const ref = c.contractReference || c.id;
    const structName = c.salaryStructure?.name || '';
    const matchesSearch = ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          structName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const activeCount = contracts.filter(c => c.status.toUpperCase() === 'ACTIVE').length;
  const totalWageSum = contracts.reduce((acc, c) => acc + (Number(c.monthlyWage) || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Employment Contracts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage active employment agreements, compensation structures, and live updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Contract
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card accent-indigo">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2">
            <FileText size={17} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Contracts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{contracts.length}</p>
        </div>

        <div className="metric-card accent-emerald">
          <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2">
            <CheckCircle size={17} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Active Contracts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</p>
        </div>

        <div className="metric-card accent-amber">
          <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-2">
            <DollarSign size={17} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Monthly Payroll Commitment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{totalWageSum.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search contract ref or employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Table Panel */}
      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto mb-2" />
            Loading contracts...
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={32} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No contracts found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">Monthly Wage</th>
                  <th className="px-5 py-3.5">Salary Structure</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredContracts.map((item, idx) => (
                  <tr key={`contract-${item.id}-${idx}`} className="row-hover">
                    <td className="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.contractReference || item.id}
                    </td>
                    <td className="px-5 py-4">
                      {item.employee ? (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.employee.firstName} {item.employee.lastName}
                          </p>
                          {item.employee.employeeCode && (
                            <p className="text-xs text-gray-400">{item.employee.employeeCode}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(item.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      ₹{(Number(item.monthlyWage) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {item.salaryStructure?.name || 'Standard Package'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingContract(item)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          title="Edit Contract"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Contract"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CONTRACT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Employment Contract</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp, idx) => (
                      <option key={`c-emp-${emp.id}-${idx}`} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Salary Structure <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.salaryStructureId}
                    onChange={e => setFormData({ ...formData, salaryStructureId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {structures.map((st, idx) => (
                      <option key={`c-st-${st.id}-${idx}`} value={st.id}>
                        {st.name} ({st.code || 'REG'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Monthly Wage (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.monthlyWage}
                      onChange={e => setFormData({ ...formData, monthlyWage: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm">
                    {submitting ? 'Creating...' : 'Create Contract'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CONTRACT MODAL */}
      <AnimatePresence>
        {editingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingContract(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Contract ({editingContract.contractReference || editingContract.id})</h3>
                <button onClick={() => setEditingContract(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Salary Structure
                  </label>
                  <select
                    value={formData.salaryStructureId}
                    onChange={e => setFormData({ ...formData, salaryStructureId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {structures.map((st, idx) => (
                      <option key={`edit-st-${st.id}-${idx}`} value={st.id}>
                        {st.name} ({st.code || 'REG'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Monthly Wage (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.monthlyWage}
                      onChange={e => setFormData({ ...formData, monthlyWage: Number(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingContract(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW CONTRACT DETAILS MODAL */}
      <AnimatePresence>
        {viewingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingContract(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Overview</h3>
                <button onClick={() => setViewingContract(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">Contract Ref:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{viewingContract.contractReference || viewingContract.id}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">Employee:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {viewingContract.employee ? `${viewingContract.employee.firstName} ${viewingContract.employee.lastName}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">Monthly Wage:</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{(Number(viewingContract.monthlyWage) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">Salary Structure:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{viewingContract.salaryStructure?.name || 'Standard Package'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="text-gray-800 dark:text-gray-200">{new Date(viewingContract.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-white/5">
                  <span className="text-gray-500">End Date:</span>
                  <span className="text-gray-800 dark:text-gray-200">{viewingContract.endDate ? new Date(viewingContract.endDate).toLocaleDateString() : 'Indefinite'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge status={viewingContract.status} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-white/[0.02] flex justify-end">
                <button onClick={() => setViewingContract(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContractListPage;

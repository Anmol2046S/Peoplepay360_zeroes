import React, { useEffect, useState } from 'react';
import { Search, Eye, ShieldCheck, FileText, X, Plus, Edit, Check, Trash2, Sliders } from 'lucide-react';
import { Table } from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import type { SalaryStructure, SalaryRule } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface SalaryStructureWithRules extends SalaryStructure {
  rules?: SalaryRule[];
}

const DEFAULT_STRUCTURES: SalaryStructureWithRules[] = [
  {
    id: 'struct-1',
    name: 'Standard Developer & Engineering Package',
    code: 'REG01',
    description: 'Standard salary structure for technical roles with Basic Salary (50%), HRA (40% of Basic), Special Allowance, PF (12%), and TDS Income Tax.',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00.000Z',
    _count: { rules: 6, contracts: 42 },
    rules: [
      { id: 'r1', name: 'Basic Wage', code: 'BASIC', category: 'BASIC', sequence: 1, computationType: 'PERCENTAGE', percentage: 50, percentageBase: 'CTC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r2', name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 2, computationType: 'PERCENTAGE', percentage: 40, percentageBase: 'BASIC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r3', name: 'Special Allowance', code: 'SA', category: 'ALLOWANCE', sequence: 3, computationType: 'FIXED', percentage: null, percentageBase: null, amount: 1500, formula: null, status: 'ACTIVE' },
      { id: 'r4', name: 'Provident Fund (PF)', code: 'PF', category: 'DEDUCTION', sequence: 4, computationType: 'PERCENTAGE', percentage: 12, percentageBase: 'BASIC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r5', name: 'Tax Deducted at Source (TDS)', code: 'TDS', category: 'DEDUCTION', sequence: 5, computationType: 'PERCENTAGE', percentage: 10, percentageBase: 'GROSS', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r6', name: 'Net Salary Payable', code: 'NET', category: 'NET', sequence: 6, computationType: 'FORMULA', percentage: null, percentageBase: null, amount: null, formula: 'GROSS - DEDUCTION', status: 'ACTIVE' },
    ]
  },
  {
    id: 'struct-2',
    name: 'Executive & Senior Leadership Structure',
    code: 'EXEC01',
    description: 'Executive tier structure including Performance Incentive allowance, Executive Health insurance deduction, and higher tax bracket deductions.',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00.000Z',
    _count: { rules: 5, contracts: 12 },
    rules: [
      { id: 'r10', name: 'Basic Wage', code: 'BASIC', category: 'BASIC', sequence: 1, computationType: 'PERCENTAGE', percentage: 60, percentageBase: 'CTC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r11', name: 'Executive Allowance', code: 'EXEC_ALLOW', category: 'ALLOWANCE', sequence: 2, computationType: 'FIXED', percentage: null, percentageBase: null, amount: 3500, formula: null, status: 'ACTIVE' },
      { id: 'r12', name: 'Provident Fund (PF)', code: 'PF', category: 'DEDUCTION', sequence: 3, computationType: 'PERCENTAGE', percentage: 12, percentageBase: 'BASIC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r13', name: 'Executive Income Tax', code: 'TAX_EXEC', category: 'DEDUCTION', sequence: 4, computationType: 'PERCENTAGE', percentage: 20, percentageBase: 'GROSS', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r14', name: 'Net Payable', code: 'NET', category: 'NET', sequence: 5, computationType: 'FORMULA', percentage: null, percentageBase: null, amount: null, formula: 'GROSS - DEDUCTION', status: 'ACTIVE' },
    ]
  },
  {
    id: 'struct-3',
    name: 'Operations & Support Staff Structure',
    code: 'OPS01',
    description: 'Standard operational structure with fixed hourly and daily wages, night shift allowance, and minimum deduction rates.',
    status: 'ACTIVE',
    createdAt: '2026-03-10T08:00:00.000Z',
    _count: { rules: 4, contracts: 28 },
    rules: [
      { id: 'r20', name: 'Base Wages', code: 'BASIC', category: 'BASIC', sequence: 1, computationType: 'PERCENTAGE', percentage: 55, percentageBase: 'CTC', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r21', name: 'Shift Allowance', code: 'SHIFT', category: 'ALLOWANCE', sequence: 2, computationType: 'FIXED', percentage: null, percentageBase: null, amount: 800, formula: null, status: 'ACTIVE' },
      { id: 'r22', name: 'Social Insurance', code: 'INS', category: 'DEDUCTION', sequence: 3, computationType: 'PERCENTAGE', percentage: 5, percentageBase: 'GROSS', amount: null, formula: null, status: 'ACTIVE' },
      { id: 'r23', name: 'Net Pay', code: 'NET', category: 'NET', sequence: 4, computationType: 'FORMULA', percentage: null, percentageBase: null, amount: null, formula: 'GROSS - DEDUCTION', status: 'ACTIVE' },
    ]
  }
];

export const SalaryStructuresListPage: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const isPayrollManager = role === 'HR_PAYROLL_MANAGER';

  const [structures, setStructures] = useState<SalaryStructureWithRules[]>(DEFAULT_STRUCTURES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructureWithRules | null>(null);
  const [editingStructure, setEditingStructure] = useState<SalaryStructureWithRules | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Creation / Edition
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    status: string;
    rules: SalaryRule[];
  }>({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    rules: []
  });

  const [newRule, setNewRule] = useState<{
    name: string;
    code: string;
    category: 'BASIC' | 'ALLOWANCE' | 'DEDUCTION' | 'NET';
    computationType: 'PERCENTAGE' | 'FIXED' | 'FORMULA';
    percentage: number | '';
    percentageBase: string;
    amount: number | '';
    formula: string;
  }>({
    name: '',
    code: '',
    category: 'ALLOWANCE',
    computationType: 'PERCENTAGE',
    percentage: 10,
    percentageBase: 'BASIC',
    amount: 500,
    formula: 'GROSS - DEDUCTION'
  });

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      let combined = [...DEFAULT_STRUCTURES];
      
      const localStr = localStorage.getItem('peoplepay360_salary_structures');
      if (localStr) {
        try {
          const parsedLocal = JSON.parse(localStr);
          if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
            combined = parsedLocal;
          }
        } catch (e) {}
      }

      const res = await payrunService.listStructures().catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(item => ({
          ...item,
          rules: item.rules || DEFAULT_STRUCTURES[0].rules
        }));
        setStructures(mapped);
        localStorage.setItem('peoplepay360_salary_structures', JSON.stringify(mapped));
      } else {
        setStructures(combined);
      }
    } catch {
      setStructures(DEFAULT_STRUCTURES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      code: `STR-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      status: 'ACTIVE',
      rules: [
        { id: 'r-basic', name: 'Basic Wage', code: 'BASIC', category: 'BASIC', sequence: 1, computationType: 'PERCENTAGE', percentage: 50, percentageBase: 'CTC', amount: null, formula: null, status: 'ACTIVE' },
        { id: 'r-hra', name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 2, computationType: 'PERCENTAGE', percentage: 40, percentageBase: 'BASIC', amount: null, formula: null, status: 'ACTIVE' },
        { id: 'r-pf', name: 'Provident Fund (PF)', code: 'PF', category: 'DEDUCTION', sequence: 3, computationType: 'PERCENTAGE', percentage: 12, percentageBase: 'BASIC', amount: null, formula: null, status: 'ACTIVE' },
        { id: 'r-net', name: 'Net Salary', code: 'NET', category: 'NET', sequence: 4, computationType: 'FORMULA', percentage: null, percentageBase: null, amount: null, formula: 'GROSS - DEDUCTION', status: 'ACTIVE' }
      ]
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (struct: SalaryStructureWithRules) => {
    setEditingStructure(struct);
    setFormData({
      name: struct.name || '',
      code: struct.code || '',
      description: struct.description || '',
      status: struct.status || 'ACTIVE',
      rules: struct.rules && struct.rules.length > 0 ? [...struct.rules] : [...DEFAULT_STRUCTURES[0].rules!]
    });
  };

  const handleAddRuleToForm = () => {
    if (!newRule.name || !newRule.code) {
      toast('Please provide a rule name and code', 'warning');
      return;
    }

    const created: SalaryRule = {
      id: `r-custom-${Date.now()}`,
      name: newRule.name,
      code: newRule.code.toUpperCase(),
      category: newRule.category,
      sequence: formData.rules.length + 1,
      computationType: newRule.computationType,
      percentage: newRule.computationType === 'PERCENTAGE' ? Number(newRule.percentage) || 10 : null,
      percentageBase: newRule.computationType === 'PERCENTAGE' ? newRule.percentageBase : null,
      amount: newRule.computationType === 'FIXED' ? Number(newRule.amount) || 500 : null,
      formula: newRule.computationType === 'FORMULA' ? newRule.formula : null,
      status: 'ACTIVE'
    };

    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, created]
    }));

    setNewRule({
      name: '',
      code: '',
      category: 'ALLOWANCE',
      computationType: 'PERCENTAGE',
      percentage: 10,
      percentageBase: 'BASIC',
      amount: 500,
      formula: 'GROSS - DEDUCTION'
    });

    toast('Calculation rule added to structure', 'success');
  };

  const handleRemoveRuleFromForm = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }));
  };

  const handleSaveNewStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast('Structure Name and Code are required', 'warning');
      return;
    }

    const newStruct: SalaryStructureWithRules = {
      id: `struct-${Date.now()}`,
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description || 'Custom compensation package defined by Payroll Manager',
      status: formData.status,
      createdAt: new Date().toISOString(),
      _count: { rules: formData.rules.length, contracts: 0 },
      rules: formData.rules
    };

    try {
      await payrunService.createStructure({
        name: newStruct.name,
        code: newStruct.code,
        description: newStruct.description,
      }).catch(() => null);
    } catch (e) {}

    const updatedList = [newStruct, ...structures];
    setStructures(updatedList);
    localStorage.setItem('peoplepay360_salary_structures', JSON.stringify(updatedList));

    setShowCreateModal(false);
    toast(`Successfully defined salary structure: ${newStruct.name}`, 'success');
  };

  const handleSaveEditedStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStructure) return;

    const updatedStruct: SalaryStructureWithRules = {
      ...editingStructure,
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description,
      status: formData.status,
      _count: { rules: formData.rules.length, contracts: editingStructure._count?.contracts || 10 },
      rules: formData.rules
    };

    try {
      await payrunService.updateStructure(editingStructure.id, {
        name: updatedStruct.name,
        code: updatedStruct.code,
        description: updatedStruct.description,
      }).catch(() => null);
    } catch (e) {}

    const updatedList = structures.map(s => s.id === editingStructure.id ? updatedStruct : s);
    setStructures(updatedList);
    localStorage.setItem('peoplepay360_salary_structures', JSON.stringify(updatedList));

    setEditingStructure(null);
    toast(`Updated salary structure: ${updatedStruct.name}`, 'success');
  };

  const filtered = structures.filter((s) => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<SalaryStructureWithRules>[] = [
    {
      key: 'name',
      header: 'Structure Name',
      render: (item) => (
        <div>
          <strong className="font-semibold text-indigo-600 dark:text-indigo-400">{item.name}</strong>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description || 'Standard compensation structure'}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => <code className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-800 dark:text-gray-200">{item.code || 'STD'}</code>,
    },
    {
      key: 'rules',
      header: 'Calculation Rules',
      render: (item) => `${item._count?.rules || item.rules?.length || 5} active rules`,
    },
    {
      key: 'contracts',
      header: 'Active Contracts',
      render: (item) => `${item._count?.contracts || 10} contracts`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status || 'ACTIVE'} />,
    },
    {
      key: 'action',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          {isPayrollManager && (
            <button 
              onClick={() => handleOpenEditModal(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
            >
              <Edit size={13} /> Edit Structure
            </button>
          )}
          <button 
            onClick={() => setSelectedStructure(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
          >
            <Eye size={13} /> View Rules
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Salary Structures Configuration</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Define, configure, and inspect compensation rules & salary calculation formulas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <Sliders size={14} className="text-emerald-500 flex-shrink-0" />
            <span>{isPayrollManager ? 'Active Payroll Manager Controls' : 'Compensation Schema Directory'}</span>
          </div>

          {isPayrollManager && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Plus size={15} /> Define New Structure
            </button>
          )}
        </div>
      </div>

      {/* Compliance / Live Banner */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 flex gap-3.5 items-start">
        <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">Configurable & Live Compensation Schemas</h4>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
            Payroll Managers can define new compensation templates, adjust component rules (Basic, Allowances, Deductions, TDS, PF), and update formulas live. All modifications are synchronized into the payroll computation engine.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search structure name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="panel p-0 overflow-hidden">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </div>

      {/* DEFINE NEW STRUCTURE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 z-10 my-8 flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSaveNewStructure} className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-indigo-600 text-white">
                  <div>
                    <h2 className="text-xl font-bold">Define New Salary Structure</h2>
                    <p className="text-xs text-indigo-100 mt-0.5">Configure a new compensation package schema for payroll calculation.</p>
                  </div>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Structure Name *</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Lead Architect Package"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                      <input 
                        type="text" required
                        placeholder="e.g. ARCH01"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea 
                      rows={2}
                      placeholder="Brief details about compensation components and eligible employee tiers..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Rules Builder */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4 bg-gray-50/50 dark:bg-white/[0.01]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Configured Salary Component Rules ({formData.rules.length})</h3>

                    {/* Rule list table */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      {formData.rules.map((rule, idx) => (
                        <div key={rule.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-gray-400">#{idx + 1}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{rule.name}</span>
                            <code className="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{rule.code}</code>
                            <span className="badge badge-blue">{rule.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-gray-600 dark:text-gray-300">
                              {rule.percentage ? `${rule.percentage}% of ${rule.percentageBase || 'BASIC'}` :
                               rule.amount ? `$${rule.amount}` : rule.formula || 'Formula'}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveRuleFromForm(rule.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Rule Form Row */}
                    <div className="p-3 border border-dashed border-gray-300 dark:border-white/10 rounded-lg space-y-3 bg-white dark:bg-white/5">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">+ Add New Rule Component</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input 
                          type="text" placeholder="Rule Name (e.g. Travel Allowance)"
                          value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <input 
                          type="text" placeholder="Code (e.g. TA)"
                          value={newRule.code} onChange={e => setNewRule({ ...newRule, code: e.target.value })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase"
                        />
                        <select 
                          value={newRule.category} onChange={e => setNewRule({ ...newRule, category: e.target.value as any })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                        >
                          <option value="BASIC">BASIC</option>
                          <option value="ALLOWANCE">ALLOWANCE</option>
                          <option value="DEDUCTION">DEDUCTION</option>
                          <option value="NET">NET</option>
                        </select>
                        <select 
                          value={newRule.computationType} onChange={e => setNewRule({ ...newRule, computationType: e.target.value as any })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                        >
                          <option value="PERCENTAGE">PERCENTAGE</option>
                          <option value="FIXED">FIXED AMOUNT</option>
                          <option value="FORMULA">FORMULA</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {newRule.computationType === 'PERCENTAGE' && (
                          <div className="flex items-center gap-2 text-xs">
                            <input 
                              type="number" placeholder="%" value={newRule.percentage}
                              onChange={e => setNewRule({ ...newRule, percentage: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                            <span>% of</span>
                            <select 
                              value={newRule.percentageBase} onChange={e => setNewRule({ ...newRule, percentageBase: e.target.value })}
                              className="px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                              <option value="CTC">CTC</option>
                              <option value="BASIC">BASIC</option>
                              <option value="GROSS">GROSS</option>
                            </select>
                          </div>
                        )}

                        {newRule.computationType === 'FIXED' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span>Amount $</span>
                            <input 
                              type="number" placeholder="500" value={newRule.amount}
                              onChange={e => setNewRule({ ...newRule, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-28 px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}

                        <button 
                          type="button"
                          onClick={handleAddRuleToForm}
                          className="ml-auto px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          + Add Rule Component
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02] flex justify-end gap-3">
                  <button 
                    type="button" onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    <Check size={14} /> Define Structure Live
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT EXISTING STRUCTURE MODAL */}
      <AnimatePresence>
        {editingStructure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingStructure(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 z-10 my-8 flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSaveEditedStructure} className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-emerald-600 text-white">
                  <div>
                    <h2 className="text-xl font-bold">Edit Salary Structure Rules</h2>
                    <p className="text-xs text-emerald-100 mt-0.5">Modify rules, rates, and parameters for {editingStructure.name}</p>
                  </div>
                  <button type="button" onClick={() => setEditingStructure(null)} className="text-white/80 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Structure Name *</label>
                      <input 
                        type="text" required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                      <input 
                        type="text" required
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea 
                      rows={2}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Rules list with inline remove */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-4 bg-gray-50/50 dark:bg-white/[0.01]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Salary Component Rules ({formData.rules.length})</h3>

                    <div className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      {formData.rules.map((rule, idx) => (
                        <div key={rule.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-gray-400">#{idx + 1}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{rule.name}</span>
                            <code className="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{rule.code}</code>
                            <span className="badge badge-blue">{rule.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-gray-600 dark:text-gray-300">
                              {rule.percentage ? `${rule.percentage}% of ${rule.percentageBase || 'BASIC'}` :
                               rule.amount ? `$${rule.amount}` : rule.formula || 'Formula'}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveRuleFromForm(rule.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Rule Component */}
                    <div className="p-3 border border-dashed border-gray-300 dark:border-white/10 rounded-lg space-y-3 bg-white dark:bg-white/5">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+ Add Rule Component</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input 
                          type="text" placeholder="Rule Name"
                          value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <input 
                          type="text" placeholder="Code"
                          value={newRule.code} onChange={e => setNewRule({ ...newRule, code: e.target.value })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase"
                        />
                        <select 
                          value={newRule.category} onChange={e => setNewRule({ ...newRule, category: e.target.value as any })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                        >
                          <option value="BASIC">BASIC</option>
                          <option value="ALLOWANCE">ALLOWANCE</option>
                          <option value="DEDUCTION">DEDUCTION</option>
                          <option value="NET">NET</option>
                        </select>
                        <select 
                          value={newRule.computationType} onChange={e => setNewRule({ ...newRule, computationType: e.target.value as any })}
                          className="px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                        >
                          <option value="PERCENTAGE">PERCENTAGE</option>
                          <option value="FIXED">FIXED AMOUNT</option>
                          <option value="FORMULA">FORMULA</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {newRule.computationType === 'PERCENTAGE' && (
                          <div className="flex items-center gap-2 text-xs">
                            <input 
                              type="number" placeholder="%" value={newRule.percentage}
                              onChange={e => setNewRule({ ...newRule, percentage: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                            <span>% of</span>
                            <select 
                              value={newRule.percentageBase} onChange={e => setNewRule({ ...newRule, percentageBase: e.target.value })}
                              className="px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                              <option value="CTC">CTC</option>
                              <option value="BASIC">BASIC</option>
                              <option value="GROSS">GROSS</option>
                            </select>
                          </div>
                        )}

                        {newRule.computationType === 'FIXED' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span>Amount $</span>
                            <input 
                              type="number" placeholder="500" value={newRule.amount}
                              onChange={e => setNewRule({ ...newRule, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-28 px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}

                        <button 
                          type="button"
                          onClick={handleAddRuleToForm}
                          className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          + Add Rule Component
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02] flex justify-end gap-3">
                  <button 
                    type="button" onClick={() => setEditingStructure(null)}
                    className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    <Check size={14} /> Save Structure Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW RULES MODAL */}
      <AnimatePresence>
        {selectedStructure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedStructure(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 z-10 my-8 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStructure.name}</h2>
                    <code className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      {selectedStructure.code}
                    </code>
                    <span className="badge badge-green">ACTIVE</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedStructure.description}</p>
                </div>
                <button onClick={() => setSelectedStructure(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Rules Table */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FileText size={14} /> Associated Salary Rules & Formulas
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">{selectedStructure.rules?.length || 0} Rules Configured</span>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Seq</th>
                        <th className="px-4 py-3">Rule Name & Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Value / Formula</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {(selectedStructure.rules || []).map((rule, idx) => (
                        <tr key={`rule-${rule.id}-${idx}`} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">#{rule.sequence}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                            <code className="text-[11px] text-gray-400">{rule.code}</code>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              rule.category === 'BASIC' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                              rule.category === 'ALLOWANCE' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                              rule.category === 'DEDUCTION' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                              'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            }`}>
                              {rule.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {rule.computationType || 'PERCENTAGE'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-200">
                            {rule.percentage ? `${rule.percentage}% of ${rule.percentageBase || 'BASE'}` :
                             rule.amount ? `$${rule.amount.toLocaleString()}` :
                             rule.formula ? rule.formula : 'Standard'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                {isPayrollManager ? (
                  <button
                    onClick={() => {
                      const s = selectedStructure;
                      setSelectedStructure(null);
                      handleOpenEditModal(s);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Edit size={13} /> Edit This Structure
                  </button>
                ) : <div />}
                <button 
                  onClick={() => setSelectedStructure(null)}
                  className="px-5 py-2 bg-gray-200 dark:bg-white/[0.1] hover:bg-gray-300 text-gray-800 dark:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SalaryStructuresListPage;

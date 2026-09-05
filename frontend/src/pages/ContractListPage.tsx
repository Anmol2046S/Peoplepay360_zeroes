import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Table } from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import type { Contract } from '../types';

export const ContractListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listContracts();
      if (res.success) setContracts(res.data);
    } catch {
      setContracts([
        {
          id: 'c1',
          contractReference: 'CON/2026/0042',
          employeeId: 'emp1',
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
          startDate: '2026-01-01',
          monthlyWage: 85000,
          status: 'ACTIVE',
          salaryStructure: { name: 'Standard Package', code: 'REG01' },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = contracts.filter(
    (c: Contract) =>
      (c.contractReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.employee && `${c.employee.firstName} ${c.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<Contract>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => <strong className="font-semibold text-indigo-600 dark:text-indigo-400">{item.contractReference || item.id}</strong>,
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (item) =>
        item.employee ? (
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{item.employee.firstName} {item.employee.lastName}</div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (item) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      key: 'monthlyWage',
      header: 'Monthly Wage',
      render: (item) => <strong className="font-bold text-gray-900 dark:text-white">₹{(item.monthlyWage || 0).toLocaleString('en-IN')}</strong>,
    },
    {
      key: 'structure',
      header: 'Salary Structure',
      render: (item) => item.salaryStructure?.name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Employment Contracts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track active employment agreements, compensation structures, and status</p>
        </div>
      </div>

      <div className="flex gap-3">
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
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};
export default ContractListPage;

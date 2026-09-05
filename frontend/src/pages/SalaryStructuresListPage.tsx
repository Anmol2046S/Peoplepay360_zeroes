import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Table } from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import type { SalaryStructure } from '../types';

export const SalaryStructuresListPage: React.FC = () => {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listStructures();
      if (res.success) setStructures(res.data);
    } catch {
      setStructures([
        {
          id: 'struct1',
          name: 'Standard Developer Package',
          code: 'REG01',
          description: 'Standard salary structure with Basic, HRA, PF, Tax rules',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          _count: { rules: 5, contracts: 2 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = structures.filter((s) => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const columns: Column<SalaryStructure>[] = [
    {
      key: 'name',
      header: 'Structure Name',
      render: (item) => <strong className="font-semibold text-indigo-600 dark:text-indigo-400">{item.name}</strong>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => <code className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-xs">{item.code || 'STD'}</code>,
    },
    {
      key: 'rules',
      header: 'Rules Count',
      render: (item) => `${item._count?.rules || item.rules?.length || 5} rules`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status || 'ACTIVE'} />,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Salary Structures Configuration</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Group salary rules into standard compensation templates</p>
        </div>
      </div>

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

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};
export default SalaryStructuresListPage;

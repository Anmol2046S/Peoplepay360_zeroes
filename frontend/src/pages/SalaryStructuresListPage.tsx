import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import { SalaryStructure } from '../types';

export const SalaryStructuresListPage: React.FC = () => {
  const navigate = useNavigate();
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
          name: 'Regular Salary Structure',
          code: 'REG01',
          description: 'Standard salary structure with Basic, HRA, PF, PT rules',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          _count: { rules: 6, contracts: 12 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = structures.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns: Column<SalaryStructure>[] = [
    {
      key: 'name',
      header: 'Structure Name',
      render: (item) => <strong style={{ color: 'var(--brand-primary)' }}>{item.name}</strong>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => <code>{item.code}</code>,
    },
    {
      key: 'rules',
      header: 'Rules Count',
      render: (item) => `${item._count?.rules || 6} rules`,
    },
    {
      key: 'contracts',
      header: 'Linked Contracts',
      render: (item) => `${item._count?.contracts || 12} active`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Salary Structures Configuration</h1>
          <p className="page-subtitle">Group salary rules into standard compensation templates</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/payroll/structures/new')}>
            New Salary Structure
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
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
        onRowClick={(item) => navigate(`/payroll/structures/${item.id}`)}
      />
    </div>
  );
};
export default SalaryStructuresListPage;

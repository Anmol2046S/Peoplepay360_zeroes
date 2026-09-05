import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import { SalaryRule } from '../types';

export const SalaryRulesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<SalaryRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listRules();
      if (res.success) setRules(res.data);
    } catch {
      setRules([
        {
          id: 'r1',
          name: 'Basic Salary',
          code: 'BASIC',
          category: 'BASIC',
          sequence: 1,
          computationMethod: 'PERCENTAGE',
          percentage: 50,
          percentageBase: 'WAGE',
          status: 'ACTIVE',
          salaryStructureId: 'struct1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'r2',
          name: 'House Rent Allowance',
          code: 'HRA',
          category: 'ALLOWANCE',
          sequence: 10,
          computationMethod: 'PERCENTAGE',
          percentage: 50,
          percentageBase: 'BASIC',
          status: 'ACTIVE',
          salaryStructureId: 'struct1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'r3',
          name: 'Provident Fund',
          code: 'PF',
          category: 'DEDUCTION',
          sequence: 30,
          computationMethod: 'PERCENTAGE',
          percentage: 12,
          percentageBase: 'BASIC',
          status: 'ACTIVE',
          salaryStructureId: 'struct1',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = rules.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns: Column<SalaryRule>[] = [
    {
      key: 'sequence',
      header: 'Seq',
      render: (item) => <strong style={{ color: 'var(--text-muted)' }}>#{item.sequence}</strong>,
      width: '60px',
    },
    {
      key: 'name',
      header: 'Rule Name',
      render: (item) => <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => <code>{item.code}</code>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <StatusBadge status={item.category} />,
    },
    {
      key: 'method',
      header: 'Computation',
      render: (item) => (
        <span>
          {item.computationMethod}{' '}
          {item.computationMethod === 'PERCENTAGE'
            ? `(${item.percentage}% of ${item.percentageBase})`
            : item.computationMethod === 'FIXED'
            ? `(₹${item.amount})`
            : ''}
        </span>
      ),
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
          <h1 className="page-title">Salary Calculation Rules</h1>
          <p className="page-subtitle">Configure formula, percentage, and fixed salary computation rules</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/payroll/rules/new')}>
            New Salary Rule
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search rule name or code..."
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
        onRowClick={(item) => navigate(`/payroll/rules/${item.id}`)}
      />
    </div>
  );
};
export default SalaryRulesListPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import { Contract } from '../types';

export const ContractListPage: React.FC = () => {
  const navigate = useNavigate();
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
          status: 'RUNNING',
          salaryStructure: { name: 'Regular Salary', code: 'REG01' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'c2',
          contractReference: 'CON/2026/0043',
          employeeId: 'emp2',
          employee: { firstName: 'Neha', lastName: 'Sharma', employeeCode: 'EMP002' },
          startDate: '2026-02-01',
          monthlyWage: 65000,
          status: 'RUNNING',
          salaryStructure: { name: 'Regular Salary', code: 'REG01' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = contracts.filter(
    (c) =>
      c.contractReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.employee && `${c.employee.firstName} ${c.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<Contract>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => <strong style={{ color: 'var(--brand-primary)' }}>{item.contractReference}</strong>,
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (item) =>
        item.employee ? (
          <div>
            <div style={{ fontWeight: 600 }}>{item.employee.firstName} {item.employee.lastName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.employee.employeeCode}</div>
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
      render: (item) => <strong>₹{item.monthlyWage.toLocaleString('en-IN')}</strong>,
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
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Employment Contracts</h1>
          <p className="page-subtitle">Track active employment agreements, compensation structures, and status</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/hr/contracts/new')}>
            New Contract
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
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
        onRowClick={(item) => navigate(`/hr/contracts/${item.id}`)}
      />
    </div>
  );
};
export default ContractListPage;

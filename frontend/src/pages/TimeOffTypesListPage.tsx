import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { timeOffService } from '../services/timeOff.service';
import { TimeOffType } from '../types';

export const TimeOffTypesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const res = await timeOffService.listTypes();
      if (res.success) setTypes(res.data);
    } catch {
      setTypes([
        { id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: 't2', name: 'Sick Leave', unit: 'DAYS', requiresAllocation: true, approvalType: 'OFFICER', displayColor: '#ef4444', status: 'ACTIVE', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = types.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns: Column<TimeOffType>[] = [
    {
      key: 'name',
      header: 'Leave Type',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.displayColor }} />
          <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
    },
    {
      key: 'requiresAllocation',
      header: 'Requires Allocation',
      render: (item) => (item.requiresAllocation ? 'Yes' : 'No'),
    },
    {
      key: 'approvalType',
      header: 'Approval Type',
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
          <h1 className="page-title">Leave & Time Off Types Configuration</h1>
          <p className="page-subtitle">Configure leave units, allocation requirements, and approval workflows</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/time-off/types/new')}>
            New Leave Type
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search leave type..."
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
        onRowClick={(item) => navigate(`/time-off/types/${item.id}`)}
      />
    </div>
  );
};
export default TimeOffTypesListPage;

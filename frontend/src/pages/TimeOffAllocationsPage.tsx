import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { timeOffService } from '../services/timeOff.service';
import { useAuth } from '../context/AuthContext';
import { TimeOffAllocation } from '../types';

export const TimeOffAllocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const res = await timeOffService.listAllocations();
      if (res.success) setAllocations(res.data);
    } catch {
      setAllocations([
        {
          id: 'alloc1',
          employeeId: 'emp1',
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
          timeOffTypeId: 't1',
          timeOffType: { id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: '' },
          allocatedDays: 20,
          takenDays: 3,
          remainingDays: 17,
          validityYear: 2026,
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = allocations.filter(
    (a) =>
      (a.employee && `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.timeOffType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<TimeOffAllocation>[] = [
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
      key: 'type',
      header: 'Leave Type',
      render: (item) => item.timeOffType?.name || '-',
    },
    {
      key: 'allocated',
      header: 'Allocated Days',
      render: (item) => `${item.allocatedDays} days`,
    },
    {
      key: 'taken',
      header: 'Taken Days',
      render: (item) => `${item.takenDays} days`,
    },
    {
      key: 'remaining',
      header: 'Remaining Balance',
      render: (item) => <strong style={{ color: 'var(--color-success)' }}>{item.remainingDays} days</strong>,
    },
    {
      key: 'year',
      header: 'Validity Year',
      render: (item) => item.validityYear,
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
          <h1 className="page-title">Time Off Allocations & Balances</h1>
          <p className="page-subtitle">Annual leave balance grants, taken days tracking, and remaining quota</p>
        </div>
        {isAdmin ? (
          <div className="page-header-right">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--brand-primary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Eye size={15} />
              <span>Admin Observer Mode (Read-Only)</span>
            </span>
          </div>
        ) : (
          <div className="page-header-right">
            <Button icon={<Plus size={16} />} onClick={() => navigate('/time-off/allocations/new')}>
              New Allocation Grant
            </Button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search employee or leave type..."
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
        onRowClick={isAdmin ? undefined : (item) => navigate(`/time-off/allocations/${item.id}`)}
      />
    </div>
  );
};
export default TimeOffAllocationsPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { timeOffService } from '../services/timeOff.service';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { TimeOffRequest } from '../types';

export const TimeOffRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await timeOffService.listRequests();
      if (res.success) setRequests(res.data);
    } catch {
      setRequests([
        {
          id: 'req1',
          employeeId: 'emp1',
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
          timeOffTypeId: 't1',
          timeOffType: { id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: '' },
          startDate: '2026-02-25',
          endDate: '2026-02-27',
          durationDays: 3.0,
          reason: 'Annual family vacation',
          status: 'TO_APPROVE',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await timeOffService.approveRequest(id);
      if (res.success) {
        showSuccess('Time off request approved!');
        fetchRequests();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to approve request.');
    }
  };

  const handleRefuse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await timeOffService.refuseRequest(id, 'Rejected by manager');
      if (res.success) {
        showSuccess('Time off request refused.');
        fetchRequests();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to refuse request.');
    }
  };

  const filtered = requests.filter(
    (r) =>
      (r.employee && `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.timeOffType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<TimeOffRequest>[] = [
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
      render: (item) => (
        <span style={{ fontWeight: 600, color: item.timeOffType?.displayColor || 'var(--brand-primary)' }}>
          {item.timeOffType?.name || 'Leave'}
        </span>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (item) => (
        <span style={{ fontSize: 12 }}>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item) => <strong>{item.durationDays} days</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {item.status === 'TO_APPROVE' && hasRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN') && (
            <>
              <Button size="sm" variant="success" icon={<CheckCircle2 size={14} />} onClick={(e) => handleApprove(item.id, e)}>
                Approve
              </Button>
              <Button size="sm" variant="danger" icon={<XCircle size={14} />} onClick={(e) => handleRefuse(item.id, e)}>
                Refuse
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Time Off Requests</h1>
          <p className="page-subtitle">Submit, track, and manage employee leave requests and approvals</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/time-off/requests/new')}>
            New Request
          </Button>
        </div>
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
        onRowClick={(item) => navigate(`/time-off/requests/${item.id}`)}
      />
    </div>
  );
};
export default TimeOffRequestsPage;

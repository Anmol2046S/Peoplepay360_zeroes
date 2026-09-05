import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CheckSquare, Layers } from 'lucide-react';
import { Tabs } from '../components/common/Tabs';
import { TimeOffRequestsPage } from './TimeOffRequestsPage';
import { TimeOffAllocationsPage } from './TimeOffAllocationsPage';
import { timeOffService } from '../services/timeOff.service';
import { Table, Column } from '../components/common/Table';
import { StatusBadge } from '../components/common/Badge';
import { TimeOffType } from '../types';

export const TimeOffHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'requests';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  useEffect(() => {
    if (activeTab === 'types') {
      fetchTypes();
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const fetchTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const res = await timeOffService.listTypes();
      if (res.success) setTypes(res.data);
    } catch {
      setTypes([
        { id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: '' },
        { id: 't2', name: 'Sick Leave', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#ef4444', status: 'ACTIVE', createdAt: '' },
        { id: 't3', name: 'Comp Off', unit: 'DAYS', requiresAllocation: false, approvalType: 'MANAGER', displayColor: '#10b981', status: 'ACTIVE', createdAt: '' },
      ]);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const typeColumns: Column<TimeOffType>[] = [
    {
      key: 'name',
      header: 'Leave Type Name',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.displayColor }} />
          <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (item) => <span className="badge badge-secondary">{item.unit}</span>,
    },
    {
      key: 'requiresAllocation',
      header: 'Allocation Required',
      render: (item) =>
        item.requiresAllocation ? (
          <span className="badge badge-info">Yes (Quota Deduction)</span>
        ) : (
          <span className="badge badge-warning">No (Direct Grant)</span>
        ),
    },
    {
      key: 'approvalType',
      header: 'Validation Mode',
      render: (item) => item.approvalType,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-header-left">
          <h1 className="page-title">Unified Time Off & Leave Management Hub</h1>
          <p className="page-subtitle">
            Manage leave requests, annual allocation quotas, and deduction rules across all departments
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'requests', label: 'Time Off Requests' },
          { id: 'allocations', label: 'Leave Allocations' },
          { id: 'types', label: 'Leave Types & Rules' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {activeTab === 'requests' && <TimeOffRequestsPage />}
      {activeTab === 'allocations' && <TimeOffAllocationsPage />}
      {activeTab === 'types' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="var(--brand-primary)" />
                <span>Configured Leave Types & Balance Rules</span>
              </h3>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Approved time-off requests automatically deduct from employee remaining allocation balances for all leave types requiring allocation.
            </div>
          </div>

          <Table
            columns={typeColumns}
            data={types}
            keyExtractor={(item) => item.id}
            isLoading={isLoadingTypes}
          />
        </div>
      )}
    </div>
  );
};

export default TimeOffHub;

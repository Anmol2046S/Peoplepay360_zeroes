import React from 'react';
import { Table, Column } from '../common/Table';
import { StatusBadge } from '../common/Badge';
import { Attendance } from '../../types';

interface AttendanceTableProps {
  attendances: Attendance[];
  isLoading?: boolean;
  onRowClick?: (attendance: Attendance) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendances,
  isLoading = false,
  onRowClick,
}) => {
  const columns: Column<Attendance>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : item.employeeId}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {item.employee?.employeeCode}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (item) => new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (item) =>
        item.checkOut
          ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '-',
    },
    {
      key: 'workedHours',
      header: 'Worked Hours',
      render: (item) => `${item.workedHours.toFixed(1)} hrs`,
    },
    {
      key: 'overtimeHours',
      header: 'Overtime',
      render: (item) => (item.overtimeHours > 0 ? `${item.overtimeHours.toFixed(1)} hrs` : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <Table
      columns={columns}
      data={attendances}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyText="No attendance records found."
      onRowClick={onRowClick}
    />
  );
};

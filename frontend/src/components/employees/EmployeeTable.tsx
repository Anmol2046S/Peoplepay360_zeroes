import React from 'react';
import { Table, Column } from '../common/Table';
import { StatusBadge } from '../common/Badge';
import { Employee } from '../../types';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onRowClick?: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading = false,
  onRowClick,
}) => {
  const columns: Column<Employee>[] = [
    {
      key: 'employeeCode',
      header: 'Code',
      render: (item) => <strong style={{ color: 'var(--brand-primary)' }}>{item.employeeCode}</strong>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div style={{ fontWeight: 600 }}>
          {item.firstName} {item.lastName}
        </div>
      ),
    },
    {
      key: 'jobPosition',
      header: 'Position',
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => item.department?.name || '-',
    },
    {
      key: 'workEmail',
      header: 'Work Email',
    },
    {
      key: 'workLocation',
      header: 'Location',
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
      data={employees}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyText="No employees found."
      onRowClick={onRowClick}
    />
  );
};

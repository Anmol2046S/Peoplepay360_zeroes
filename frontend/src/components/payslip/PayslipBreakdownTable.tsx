import React from 'react';
import { Table, Column } from '../common/Table';
import { StatusBadge } from '../common/Badge';
import { PayslipLine } from '../../types';

interface PayslipBreakdownTableProps {
  lines: PayslipLine[];
}

export const PayslipBreakdownTable: React.FC<PayslipBreakdownTableProps> = ({ lines }) => {
  const sortedLines = [...lines].sort((a, b) => a.sequence - b.sequence);

  const columns: Column<PayslipLine>[] = [
    {
      key: 'sequence',
      header: 'Seq',
      render: (item) => <span style={{ color: 'var(--text-muted)' }}>#{item.sequence}</span>,
      width: '60px',
    },
    {
      key: 'name',
      header: 'Rule Name',
      render: (item) => <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>,
    },
    {
      key: 'code',
      header: 'Rule Code',
      render: (item) => <code style={{ color: 'var(--brand-primary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{item.code}</code>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <StatusBadge status={item.category} />,
    },
    {
      key: 'amount',
      header: 'Computed Amount',
      render: (item) => (
        <span style={{ fontWeight: 700, color: item.category === 'DEDUCTION' ? 'var(--color-error)' : 'var(--text-primary)' }}>
          {item.category === 'DEDUCTION' ? '-' : ''}₹{item.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return <Table columns={columns} data={sortedLines} keyExtractor={(item) => item.id || item.code} />;
};

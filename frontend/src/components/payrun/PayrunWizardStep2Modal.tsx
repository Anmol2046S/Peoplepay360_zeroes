import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Table, Column } from '../common/Table';
import { EligibleEmployee } from '../../types';

interface PayrunWizardStep2Props {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  eligibleEmployees: EligibleEmployee[];
  isLoading?: boolean;
  onCreatePayrun: (selectedEmployeeIds: string[]) => Promise<void>;
}

export const PayrunWizardStep2Modal: React.FC<PayrunWizardStep2Props> = ({
  isOpen,
  onClose,
  onBack,
  eligibleEmployees,
  isLoading = false,
  onCreatePayrun,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    eligibleEmployees.map((e) => e.id)
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleEmployees.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreate = async () => {
    await onCreatePayrun(selectedIds);
  };

  const columns: Column<EligibleEmployee>[] = [
    {
      key: 'select',
      header: 'Select',
      render: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => toggleSelect(item.id)}
        />
      ),
      width: '50px',
    },
    {
      key: 'code',
      header: 'Code',
      render: (item) => item.employeeCode,
    },
    {
      key: 'name',
      header: 'Employee Name',
      render: (item) => `${item.firstName} ${item.lastName}`,
    },
    {
      key: 'position',
      header: 'Position',
      render: (item) => item.jobPosition,
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => item.department,
    },
    {
      key: 'wage',
      header: 'Monthly Wage',
      render: (item) => `₹${item.monthlyWage.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Payrun - Step 2: Select Employees"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back to Step 1
          </Button>
          <Button
            onClick={handleCreate}
            isLoading={isLoading}
            disabled={selectedIds.length === 0}
          >
            Create Payrun ({selectedIds.length} Employees)
          </Button>
        </>
      }
    >
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Select active employees to include in this payroll batch:
        </p>
        <button
          type="button"
          onClick={toggleSelectAll}
          style={{ fontSize: 12, color: 'var(--brand-primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          {selectedIds.length === eligibleEmployees.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <Table
        columns={columns}
        data={eligibleEmployees}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyText="No eligible employees with RUNNING contracts found for this period."
      />
    </Modal>
  );
};

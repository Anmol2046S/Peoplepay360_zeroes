import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SalaryStructure } from '../../types';

interface PayrunWizardStep1Props {
  isOpen: boolean;
  onClose: () => void;
  structures: SalaryStructure[];
  onContinue: (scope: { structureId: string; name: string; startDate: string; endDate: string }) => void;
}

export const PayrunWizardStep1Modal: React.FC<PayrunWizardStep1Props> = ({
  isOpen,
  onClose,
  structures,
  onContinue,
}) => {
  const [structureId, setStructureId] = useState(structures[0]?.id || '');
  const [name, setName] = useState('February 2026 Payrun');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-28');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ structureId, name, startDate, endDate });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Payrun - Step 1: Define Scope & Period"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Continue to Select Employees</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label required">Payrun Name / Batch Title</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Salary Structure</label>
          <select
            className="form-select"
            value={structureId}
            onChange={(e) => setStructureId(e.target.value)}
            required
          >
            <option value="">Select Structure</option>
            {structures.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label required">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label required">End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

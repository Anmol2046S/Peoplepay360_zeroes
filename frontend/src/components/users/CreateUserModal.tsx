import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SystemRole, Employee } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onCreate: (payload: { name: string; email: string; password: string; role: SystemRole; employeeId?: string }) => Promise<void>;
  isLoading?: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  employees,
  onCreate,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<SystemRole>('EMPLOYEE');
  const [employeeId, setEmployeeId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      name,
      email,
      password,
      role,
      employeeId: employeeId || undefined,
    });
    setName('');
    setEmail('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New User Account"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create User Account
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label required">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Aarav Mehta"
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Work Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="aarav@oxp.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label required">System Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value as SystemRole)}
            required
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="HR_MANAGER">HR_MANAGER</option>
            <option value="HR_PAYROLL_USER">HR_PAYROLL_USER</option>
            <option value="HR_PAYROLL_MANAGER">HR_PAYROLL_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Link to Employee Record</label>
          <select
            className="form-select"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">None (Standalone Account)</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
};

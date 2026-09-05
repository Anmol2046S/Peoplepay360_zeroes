import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { SystemRole, Employee } from '../../types';

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
          <input
            type="text"
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Aarav Mehta"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Work Email *</label>
          <input
            type="email"
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="aarav@oxp.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password *</label>
          <input
            type="password"
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">System Role *</label>
          <select
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={role}
            onChange={(e) => setRole(e.target.value as SystemRole)}
            required
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="HR_MANAGER">HR_MANAGER</option>
            <option value="HR_PAYROLL_USER">HR_PAYROLL_USER</option>
            <option value="HR_PAYROLL_MANAGER">HR_PAYROLL_MANAGER</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Link to Employee Record</label>
          <select
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">None (Standalone Account)</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode || emp.id})
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
};

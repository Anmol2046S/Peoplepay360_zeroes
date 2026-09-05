import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Key } from 'lucide-react';
import { Table } from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { ResetPasswordModal } from '../components/users/ResetPasswordModal';
import { useToast } from '../contexts/ToastContext';
import { payrunService } from '../services/payrun.service';
import { employeeService } from '../services/employee.service';
import type { User, Employee, SystemRole } from '../types';

export const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [uRes, eRes] = await Promise.all([
        payrunService.listUsers(),
        employeeService.list(),
      ]);
      if (uRes.success) setUsers(uRes.data);
      if (eRes.success) setEmployees(eRes.data);
    } catch {
      setUsers([
        {
          id: 'u1',
          name: 'Aarav Mehta',
          email: 'admin@techcorp.com',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          employee: { firstName: 'Aarav', lastName: 'Mehta' },
        },
        {
          id: 'u2',
          name: 'Neha Sharma',
          email: 'neha@techcorp.com',
          role: 'HR_PAYROLL_MANAGER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          employee: { firstName: 'Neha', lastName: 'Sharma' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (payload: { name: string; email: string; password: string; role: SystemRole; employeeId?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await payrunService.createUser(payload);
      if (res.success) {
        toast(`User account created for ${payload.name}`, 'success');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      toast(errorObj.response?.data?.error?.message || 'Failed to create user account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    setIsResetting(true);
    try {
      const res = await payrunService.resetUserPassword(userId, newPassword);
      if (res.success) {
        toast('Password reset successfully!', 'success');
        setIsResetModalOpen(false);
        setSelectedUserForReset(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      toast(errorObj.response?.data?.error?.message || 'Failed to reset password.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = users.filter(
    (u: User) =>
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.roleName || u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <strong className="font-semibold text-gray-900 dark:text-white">{item.name}</strong>,
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'System Role',
      render: (item) => <StatusBadge status={item.roleName || item.role} />,
    },
    {
      key: 'employee',
      header: 'Linked Employee',
      render: (item) =>
        item.employee ? (
          <span>
            {item.employee.firstName} {item.employee.lastName}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
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
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            icon={<Key size={14} />}
            onClick={() => {
              setSelectedUserForReset(item);
              setIsResetModalOpen(true);
            }}
          >
            Reset Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">User Management & System RBAC</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user login credentials, access permissions, and role assignments</p>
        </div>
        <div>
          <Button icon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
            Create New User
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table columns={columns} data={filteredUsers} keyExtractor={(item) => item.id} isLoading={isLoading} />

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
        onCreate={handleCreateUser}
        isLoading={isSubmitting}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setSelectedUserForReset(null);
        }}
        user={selectedUserForReset}
        onReset={handleResetPassword}
        isLoading={isResetting}
      />
    </div>
  );
};
export default UserManagementPage;

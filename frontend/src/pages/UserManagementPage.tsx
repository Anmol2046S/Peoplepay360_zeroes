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

const ADMIN_PERMISSION_CATALOG = [
  'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'CONTRACT_CREATE', 'CONTRACT_READ',
  'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE', 'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
  'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE', 'REPORT_VIEW', 'STRUCTURE_READ', 'STRUCTURE_WRITE',
  'USER_MANAGE', 'ROLE_MANAGE',
];

export const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; permissions: string[] }>>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [savingRole, setSavingRole] = useState(false);
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
      const roleRes = await payrunService.listRoles().catch(() => null);
      if (uRes.success) setUsers(uRes.data);
      if (eRes.success) setEmployees(eRes.data);
      if (roleRes?.success) setRoles(roleRes.data);
      if (roleRes?.success && roleRes.data.length > 0) setSelectedRoleId((current) => current || roleRes.data[0].id);
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

  const handleRoleChange = async (user: User, role: string) => {
    try {
      const res = await payrunService.updateUser(user.id, { role: role as SystemRole });
      if (res.success) {
        toast(`Role updated for ${user.name}`, 'success');
        fetchData();
      }
    } catch {
      toast('Unable to update user role.', 'error');
    }
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const updateRolePermission = async (permission: string, enabled: boolean) => {
    if (!selectedRole) return;
    setSavingRole(true);
    try {
      const permissions = enabled
        ? [...new Set([...selectedRole.permissions, permission])]
        : selectedRole.permissions.filter((item) => item !== permission);
      const response = await payrunService.updateRole(selectedRole.id, { permissions });
      if (response.success) {
        setRoles((current) => current.map((role) => role.id === selectedRole.id ? { ...role, permissions } : role));
        toast(`Permissions updated for ${selectedRole.name}`, 'success');
      }
    } catch {
      toast('Unable to update role permissions.', 'error');
    } finally {
      setSavingRole(false);
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
      render: (item) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={item.roleName || item.role} />
          <select
            value={item.roleName || item.role}
            onChange={(event) => handleRoleChange(item, event.target.value)}
            aria-label={`Change role for ${item.name}`}
            className="rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-background)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
          >
            {(roles.length ? roles : [{ id: 'super-admin', name: 'SUPER_ADMIN', permissions: [] }, { id: 'hr-manager', name: 'HR_MANAGER', permissions: [] }, { id: 'hr-payroll-manager', name: 'HR_PAYROLL_MANAGER', permissions: [] }, { id: 'hr-payroll-user', name: 'HR_PAYROLL_USER', permissions: [] }, { id: 'employee', name: 'EMPLOYEE', permissions: [] }]).map((role) => (
              <option key={role.id} value={role.name}>{role.name === 'SUPER_ADMIN' ? 'ADMIN' : role.name}</option>
            ))}
          </select>
        </div>
      ),
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

      <Table columns={columns} data={filteredUsers} keyExtractor={(item, idx) => `user-${item.id}-${idx}`} isLoading={isLoading} />

      <section className="panel p-5 space-y-4" aria-labelledby="role-permissions-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="role-permissions-heading" className="text-base font-bold text-[var(--color-text-primary)]">Role permissions</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Administrators can grant or revoke module capabilities for any role.</p>
          </div>
          <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-background)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name === 'SUPER_ADMIN' ? 'ADMIN / SUPER_ADMIN' : role.name}</option>)}
          </select>
        </div>
        {selectedRole && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ADMIN_PERMISSION_CATALOG.map((permission) => {
              const checked = selectedRole.permissions.includes(permission);
              return (
                <label key={permission} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-xs text-[var(--color-text-primary)]">
                  <input type="checkbox" checked={checked} disabled={savingRole} onChange={(event) => updateRolePermission(permission, event.target.checked)} />
                  <span>{permission}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

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

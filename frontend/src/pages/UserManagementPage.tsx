import React, { useEffect, useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { useNotification } from '../context/NotificationContext';
import { payrunService } from '../services/payrun.service';
import { employeeService } from '../services/employee.service';
import { User, Employee, SystemRole } from '../types';

export const UserManagementPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Fallback mock data if server offline
      setUsers([
        {
          id: 'u1',
          name: 'Aarav Mehta',
          email: 'aarav@oxp.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
        },
        {
          id: 'u2',
          name: 'Neha Sharma',
          email: 'neha@oxp.com',
          role: 'HR_PAYROLL_MANAGER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          employee: { firstName: 'Neha', lastName: 'Sharma', employeeCode: 'EMP002' },
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
        showSuccess(`User account created for ${payload.name}`);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>,
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'System Role',
      render: (item) => <StatusBadge status={item.role} />,
    },
    {
      key: 'employee',
      header: 'Linked Employee',
      render: (item) =>
        item.employee ? (
          <span>
            {item.employee.firstName} {item.employee.lastName} ({item.employee.employeeCode})
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>-</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">User Management & System RBAC</h1>
          <p className="page-subtitle">Manage user login credentials, access permissions, and role assignments</p>
        </div>
        <div className="page-header-right">
          <Button icon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
            Create New User
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
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
    </div>
  );
};
export default UserManagementPage;

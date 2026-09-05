import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { Button } from '../components/common/Button';
import { EmployeeCard } from '../components/employees/EmployeeCard';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { employeeService } from '../services/employee.service';
import { Employee } from '../types';

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await employeeService.list();
      if (res.success) setEmployees(res.data);
    } catch {
      // Fallback mock data
      setEmployees([
        {
          id: 'emp1',
          employeeCode: 'EMP001',
          firstName: 'Aarav',
          lastName: 'Mehta',
          workEmail: 'aarav@oxp.com',
          workPhone: '+91 98765 43210',
          jobPosition: 'Payroll Specialist',
          status: 'ACTIVE',
          workLocation: 'Mumbai',
          departmentId: 'd1',
          department: { id: 'd1', name: 'Finance', code: 'FIN' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          smartCounts: { contracts: 2, attendance: 14, timeOff: 3, allocations: 1 },
        },
        {
          id: 'emp2',
          employeeCode: 'EMP002',
          firstName: 'Neha',
          lastName: 'Sharma',
          workEmail: 'neha@oxp.com',
          workPhone: '+91 98765 43211',
          jobPosition: 'HR Officer',
          status: 'ACTIVE',
          workLocation: 'Mumbai',
          departmentId: 'd2',
          department: { id: 'd2', name: 'Human Resources', code: 'HR' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          smartCounts: { contracts: 1, attendance: 18, timeOff: 2, allocations: 1 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.jobPosition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Employee Master Directory</h1>
          <p className="page-subtitle">View and manage organization headcount, contracts, and profiles</p>
        </div>
        <div className="page-header-right">
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'white', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', padding: 2 }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--border-radius-sm)',
                border: 'none',
                background: viewMode === 'kanban' ? 'var(--brand-primary)' : 'transparent',
                color: viewMode === 'kanban' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <LayoutGrid size={15} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--border-radius-sm)',
                border: 'none',
                background: viewMode === 'list' ? 'var(--brand-primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <List size={15} />
              <span>List</span>
            </button>
          </div>

          <Button icon={<Plus size={16} />} onClick={() => navigate('/hr/employees/new')}>
            New Employee
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name, code, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="kanban-grid">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onClick={() => navigate(`/hr/employees/${emp.id}`)} />
          ))}
        </div>
      ) : (
        <EmployeeTable employees={filtered} onRowClick={(emp) => navigate(`/hr/employees/${emp.id}`)} />
      )}
    </div>
  );
};
export default EmployeeListPage;

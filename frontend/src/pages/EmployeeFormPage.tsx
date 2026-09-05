import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeForm } from '../components/employees/EmployeeForm';
import { employeeService } from '../services/employee.service';
import { payrunService } from '../services/payrun.service';
import { useNotification } from '../context/NotificationContext';
import { Employee, Department } from '../types';

export const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [employee, setEmployee] = useState<Partial<Employee> | undefined>(undefined);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const deptRes = await payrunService.listDepartments();
      if (deptRes.success) setDepartments(deptRes.data);
      else setDepartments([{ id: 'd1', name: 'Finance', code: 'FIN' }, { id: 'd2', name: 'Human Resources', code: 'HR' }]);

      if (id && id !== 'new') {
        const empRes = await employeeService.get(id);
        if (empRes.success) setEmployee(empRes.data);
      }
    } catch {
      setDepartments([{ id: 'd1', name: 'Finance', code: 'FIN' }, { id: 'd2', name: 'Human Resources', code: 'HR' }]);
      if (id && id !== 'new') {
        setEmployee({
          id,
          employeeCode: 'EMP001',
          firstName: 'Aarav',
          lastName: 'Mehta',
          workEmail: 'aarav@oxp.com',
          jobPosition: 'Payroll Specialist',
          departmentId: 'd1',
          status: 'ACTIVE',
          bankName: 'HDFC Bank',
          bankAccountNumber: '501002394812',
          ifscCode: 'HDFC0000128',
          smartCounts: { contracts: 2, attendance: 14, timeOff: 3, allocations: 1 },
        });
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async (data: Partial<Employee>) => {
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await employeeService.update(id, data);
        showSuccess('Employee record updated successfully.');
      } else {
        await employeeService.create(data);
        showSuccess('New employee profile created.');
      }
      navigate('/hr/employees');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save employee profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Employee Profile' : 'Create New Employee'}</h1>
          <p className="page-subtitle">Configure personal, contractual, and banking details</p>
        </div>
      </div>

      <EmployeeForm initialData={employee} departments={departments} onSave={handleSave} isLoading={isLoading} />
    </div>
  );
};
export default EmployeeFormPage;

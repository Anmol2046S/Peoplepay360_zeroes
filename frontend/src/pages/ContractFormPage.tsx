import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { payrunService } from '../services/payrun.service';
import { employeeService } from '../services/employee.service';
import { Contract, Employee, SalaryStructure, WorkingSchedule } from '../types';

export const ContractFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Contract>>({
    contractReference: `CON/2026/00${Math.floor(10 + Math.random() * 90)}`,
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    monthlyWage: 75000,
    status: 'RUNNING',
    salaryStructureId: '',
    workingScheduleId: '',
    notes: '',
  });

  useEffect(() => {
    fetchRefData();
  }, [id]);

  const fetchRefData = async () => {
    try {
      const [eRes, sRes, schRes] = await Promise.all([
        employeeService.list(),
        payrunService.listStructures(),
        payrunService.listSchedules(),
      ]);

      if (eRes.success) setEmployees(eRes.data);
      if (sRes.success) setStructures(sRes.data);
      if (schRes.success) setSchedules(schRes.data);

      if (id && id !== 'new') {
        const cRes = await payrunService.getContract(id);
        if (cRes.success) setFormData(cRes.data);
      }
    } catch {
      setEmployees([
        { id: 'emp1', firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' } as any,
      ]);
      setStructures([{ id: 'struct1', name: 'Regular Salary', code: 'REG01' } as any]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await payrunService.updateContract(id, formData);
        showSuccess('Contract updated successfully.');
      } else {
        await payrunService.createContract(formData);
        showSuccess('New contract created successfully.');
      }
      navigate('/hr/contracts');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save contract.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button
            type="button"
            onClick={() => navigate('/hr/contracts')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Contracts</span>
          </button>
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Contract' : 'Create Employment Contract'}</h1>
          <p className="page-subtitle">Configure reference, base wage, and associated salary structure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Contract Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contractReference}
                  onChange={(e) => setFormData({ ...formData, contractReference: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Employee</label>
                <select
                  className="form-select"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Contract Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Monthly Wage (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthlyWage}
                  onChange={(e) => setFormData({ ...formData, monthlyWage: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Salary Structure</label>
                <select
                  className="form-select"
                  value={formData.salaryStructureId || ''}
                  onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })}
                >
                  <option value="">Select Salary Structure</option>
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Working Schedule</label>
                <select
                  className="form-select"
                  value={formData.workingScheduleId || ''}
                  onChange={(e) => setFormData({ ...formData, workingScheduleId: e.target.value })}
                >
                  <option value="">Select Working Schedule</option>
                  {schedules.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.hoursPerWeek} hrs/wk)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Contract
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ContractFormPage;

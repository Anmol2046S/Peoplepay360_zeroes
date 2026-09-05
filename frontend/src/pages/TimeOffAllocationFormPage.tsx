import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { timeOffService } from '../services/timeOff.service';
import { employeeService } from '../services/employee.service';
import { TimeOffAllocation, TimeOffType, Employee } from '../types';

export const TimeOffAllocationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isAdmin = user?.role === 'ADMIN';

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<TimeOffAllocation>>({
    employeeId: '',
    timeOffTypeId: '',
    allocatedDays: 20,
    validityYear: 2026,
    description: '',
    status: 'APPROVED',
  });

  useEffect(() => {
    if (isAdmin && id === 'new') {
      showError('Admin accounts have read-only access to leave allocations.');
      navigate('/time-off/allocations');
      return;
    }
    fetchRefData();
  }, [id, isAdmin]);

  const fetchRefData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        timeOffService.listTypes(),
        employeeService.list(),
      ]);
      if (tRes.success) setTypes(tRes.data);
      if (eRes.success) setEmployees(eRes.data);

      if (id && id !== 'new') {
        const allocRes = await timeOffService.getAllocation(id);
        if (allocRes.success) setFormData(allocRes.data);
      }
    } catch {
      setTypes([{ id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return;

    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await timeOffService.updateAllocation(id, formData);
        showSuccess('Leave allocation updated.');
      } else {
        await timeOffService.createAllocation(formData);
        showSuccess('New leave allocation granted.');
      }
      navigate('/time-off/allocations');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save allocation.');
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
            onClick={() => navigate('/time-off/allocations')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Allocations</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{id && id !== 'new' ? 'Leave Allocation Details' : 'Grant Leave Allocation'}</h1>
            {formData.status && <StatusBadge status={formData.status} />}
          </div>
          <p className="page-subtitle">Inspect annual leave quota details and remaining balances</p>
        </div>
        {isAdmin && (
          <div className="page-header-right">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--brand-primary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Eye size={15} />
              <span>Admin Observer Mode (Read-Only)</span>
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label required">Employee</label>
                <select
                  className="form-select"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  disabled={isAdmin}
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
                <label className="form-label required">Leave Type</label>
                <select
                  className="form-select"
                  value={formData.timeOffTypeId}
                  onChange={(e) => setFormData({ ...formData, timeOffTypeId: e.target.value })}
                  disabled={isAdmin}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label required">Allocated Days Quota</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.allocatedDays}
                  onChange={(e) => setFormData({ ...formData, allocatedDays: parseFloat(e.target.value) })}
                  disabled={isAdmin}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Validity Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.validityYear}
                  onChange={(e) => setFormData({ ...formData, validityYear: parseInt(e.target.value) })}
                  disabled={isAdmin}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Note</label>
              <textarea
                className="form-textarea"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Annual PTO Quota for 2026..."
                disabled={isAdmin}
              />
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            {isAdmin ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} />
                <span>Admin Observer Mode (Read-Only Inspection)</span>
              </span>
            ) : (
              <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
                Grant Allocation
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
export default TimeOffAllocationFormPage;

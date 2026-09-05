import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { timeOffService } from '../services/timeOff.service';
import { employeeService } from '../services/employee.service';
import { TimeOffRequest, TimeOffType, Employee } from '../types';

export const TimeOffRequestFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isAdmin = user?.role === 'ADMIN';

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<TimeOffRequest>>({
    employeeId: '',
    timeOffTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    durationDays: 1,
    reason: '',
    status: 'TO_APPROVE',
  });

  useEffect(() => {
    if (isAdmin && id === 'new') {
      showError('Admin accounts have read-only access to time off requests.');
      navigate('/time-off/requests');
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
        const reqRes = await timeOffService.getRequest(id);
        if (reqRes.success) setFormData(reqRes.data);
      }
    } catch {
      setTypes([
        { id: 't1', name: 'Paid Time Off', unit: 'DAYS', requiresAllocation: true, approvalType: 'MANAGER', displayColor: '#3b82f6', status: 'ACTIVE', createdAt: '' },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return;

    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        // Details inspection only
      } else {
        await timeOffService.createRequest(formData);
        showSuccess('Time off request submitted for approval.');
      }
      navigate('/time-off/requests');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to submit time off request.');
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
            onClick={() => navigate('/time-off/requests')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Requests</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{id && id !== 'new' ? 'Time Off Request Details' : 'Submit Time Off Request'}</h1>
            {formData.status && <StatusBadge status={formData.status} />}
          </div>
          <p className="page-subtitle">Inspect leave type, dates, employee details, and approval status</p>
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

            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isAdmin}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isAdmin}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Duration (Days)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseFloat(e.target.value) })}
                  disabled={isAdmin}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Notes</label>
              <textarea
                className="form-textarea"
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Details regarding leave request..."
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
                Submit Request
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
export default TimeOffRequestFormPage;

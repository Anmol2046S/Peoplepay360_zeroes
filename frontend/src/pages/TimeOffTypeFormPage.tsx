import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { timeOffService } from '../services/timeOff.service';
import { TimeOffType } from '../types';

export const TimeOffTypeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<TimeOffType>>({
    name: 'Paid Time Off',
    unit: 'DAYS',
    requiresAllocation: true,
    approvalType: 'MANAGER',
    displayColor: '#3b82f6',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchType();
    }
  }, [id]);

  const fetchType = async () => {
    try {
      const res = await timeOffService.getType(id!);
      if (res.success) setFormData(res.data);
    } catch {
      // keep default
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await timeOffService.updateType(id, formData);
        showSuccess('Leave type updated.');
      } else {
        await timeOffService.createType(formData);
        showSuccess('New leave type created.');
      }
      navigate('/time-off/types');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save leave type.');
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
            onClick={() => navigate('/time-off/types')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Leave Types</span>
          </button>
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Leave Type' : 'Configure Leave Type'}</h1>
          <p className="page-subtitle">Define leave calculation unit, color badge, and approval routing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label required">Leave Type Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Display Badge Color</label>
                <input
                  type="color"
                  className="form-input"
                  style={{ height: 42, padding: 4 }}
                  value={formData.displayColor}
                  onChange={(e) => setFormData({ ...formData, displayColor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Calculation Unit</label>
                <select
                  className="form-select"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                >
                  <option value="DAYS">DAYS</option>
                  <option value="HOURS">HOURS</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Approval Routing</label>
                <select
                  className="form-select"
                  value={formData.approvalType}
                  onChange={(e) => setFormData({ ...formData, approvalType: e.target.value as any })}
                >
                  <option value="MANAGER">MANAGER</option>
                  <option value="OFFICER">OFFICER</option>
                  <option value="NO_VALIDATION">NO_VALIDATION</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Requires Allocation</label>
                <select
                  className="form-select"
                  value={formData.requiresAllocation ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, requiresAllocation: e.target.value === 'true' })}
                >
                  <option value="true">Yes (Restricted by balance)</option>
                  <option value="false">No (Open request)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Leave Type
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default TimeOffTypeFormPage;

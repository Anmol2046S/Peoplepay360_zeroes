import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { payrunService } from '../services/payrun.service';
import { WorkingSchedule, ScheduleDay } from '../types';

export const WorkingScheduleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkingSchedule>>({
    name: 'Standard 40 Hours/Week',
    company: 'My Company',
    daysPerWeek: 5,
    hoursPerWeek: 40.0,
    timezone: 'Asia/Kolkata',
    status: 'ACTIVE',
    days: [
      { id: '1', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { id: '2', dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { id: '3', dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { id: '4', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      { id: '5', dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    ],
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchSchedule();
    }
  }, [id]);

  const fetchSchedule = async () => {
    try {
      const res = await payrunService.getSchedule(id!);
      if (res.success) setFormData(res.data);
    } catch {
      // Keep default
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await payrunService.updateSchedule(id, formData);
        showSuccess('Working schedule updated successfully.');
      } else {
        await payrunService.createSchedule(formData);
        showSuccess('New working schedule created.');
      }
      navigate('/hr/schedules');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save working schedule.');
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
            onClick={() => navigate('/hr/schedules')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Schedules</span>
          </button>
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Working Schedule' : 'Create Working Schedule'}</h1>
          <p className="page-subtitle">Configure weekly pattern, daily shift timings, and lunch break hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Schedule Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Hours Per Week</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Timezone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daily Working Hours Pattern</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Break Hours</th>
                  <th>Work Hours</th>
                </tr>
              </thead>
              <tbody>
                {formData.days?.map((d: ScheduleDay) => (
                  <tr key={d.dayOfWeek}>
                    <td><strong>{d.dayOfWeek}</strong></td>
                    <td>{d.startTime}</td>
                    <td>{d.endTime}</td>
                    <td>{d.breakHours} hr</td>
                    <td><strong>{d.workHours} hrs</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Schedule
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default WorkingScheduleFormPage;

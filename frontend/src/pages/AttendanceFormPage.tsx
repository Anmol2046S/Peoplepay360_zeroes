import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { attendanceService } from '../services/attendance.service';
import { Attendance } from '../types';

export const AttendanceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [attendance, setAttendance] = useState<Partial<Attendance>>({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '18:00',
    workedHours: 8.0,
    overtimeHours: 0.0,
    status: 'PRESENT',
    notes: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchAttendance();
    }
  }, [id]);

  const fetchAttendance = async () => {
    try {
      const res = await attendanceService.get(id!);
      if (res.success) setAttendance(res.data);
    } catch {
      // keep default
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await attendanceService.update(id, attendance);
        showSuccess('Attendance record updated.');
      }
      navigate('/hr/attendance');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to update attendance.');
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
            onClick={() => navigate('/hr/attendance')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Attendance</span>
          </button>
          <h1 className="page-title">Attendance Administrative Edit</h1>
          <p className="page-subtitle">Manual administrative punch adjustment and worked hours correction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={attendance.date ? attendance.date.split('T')[0] : ''}
                  onChange={(e) => setAttendance({ ...attendance, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Worked Hours</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={attendance.workedHours}
                  onChange={(e) => setAttendance({ ...attendance, workedHours: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Attendance Status</label>
                <select
                  className="form-select"
                  value={attendance.status}
                  onChange={(e) => setAttendance({ ...attendance, status: e.target.value as any })}
                  required
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="OVERTIME">OVERTIME</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Administrative Notes / Reason</label>
              <textarea
                className="form-textarea"
                value={attendance.notes || ''}
                onChange={(e) => setAttendance({ ...attendance, notes: e.target.value })}
                placeholder="Reason for manual adjustment..."
              />
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Correction
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default AttendanceFormPage;

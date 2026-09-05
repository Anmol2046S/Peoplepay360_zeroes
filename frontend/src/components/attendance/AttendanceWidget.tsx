import React, { useEffect, useState } from 'react';
import { Clock, Play, Square, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { attendanceService } from '../../services/attendance.service';
import { Attendance } from '../../types';

interface AttendanceWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeSession, setActiveSession] = useState<Attendance | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('0h 0m 0s');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchSessionStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession && activeSession.checkIn && !activeSession.checkOut) {
      interval = setInterval(() => {
        const checkInTime = new Date(activeSession.checkIn).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - checkInTime);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setElapsedTime(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
    } else {
      setElapsedTime('0h 0m 0s');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const fetchSessionStatus = async () => {
    try {
      const res = await attendanceService.getActiveSession();
      if (res.success && res.data) {
        setActiveSession(res.data);
      } else {
        setActiveSession(null);
      }
    } catch {
      setActiveSession(null);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const res = await attendanceService.checkIn();
      if (res.success) {
        setActiveSession(res.data);
        showSuccess('Successfully checked in! Have a great work day.');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to check in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const res = await attendanceService.checkOut();
      if (res.success) {
        setActiveSession(null);
        showSuccess(`Checked out! Worked ${res.data.workedHours} hours today.`);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to check out.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isCheckedIn = !!(activeSession && !activeSession.checkOut);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 180,
        width: 320,
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color="var(--brand-primary)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Attendance Punch</span>
        </div>
        <button onClick={onClose} type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Employee'}</strong>
        </p>

        {isCheckedIn ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '12px 0 16px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>Currently Checked In</span>
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              {elapsedTime}
            </div>

            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="btn btn-danger btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              type="button"
            >
              <Square size={16} fill="white" />
              <span>{isLoading ? 'Checking Out...' : 'Check Out'}</span>
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '12px 0 16px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-error)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Currently Checked Out</span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Click below to record your arrival time for today.
            </p>

            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="btn btn-success btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              type="button"
            >
              <Play size={16} fill="white" />
              <span>{isLoading ? 'Checking In...' : 'Check In'}</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Punches logged in IST (UTC+05:30)</span>
        <CheckCircle2 size={13} color="var(--color-success)" />
      </div>
    </div>
  );
};

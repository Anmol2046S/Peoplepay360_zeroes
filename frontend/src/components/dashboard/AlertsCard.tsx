import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { DashboardAlert } from '../../types';

interface AlertsCardProps {
  alerts: DashboardAlert[];
  isLoading?: boolean;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ alerts, isLoading = false }) => {
  return (
    <Card title="Payroll Operational Alerts" subtitle="Warnings requiring attention before final payrun validation">
      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="loading-spinner" />
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ShieldAlert size={18} />
          <span>All payroll validations clear! No warnings detected.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map((alert) => {
            let icon = <AlertCircle size={18} color="#ef4444" />;
            let bg = 'var(--color-error-bg)';
            let color = '#991b1b';

            if (alert.severity === 'WARNING') {
              icon = <AlertTriangle size={18} color="#f59e0b" />;
              bg = 'var(--color-warning-bg)';
              color = '#92400e';
            } else if (alert.severity === 'INFO') {
              icon = <Info size={18} color="#3b82f6" />;
              bg = 'var(--color-info-bg)';
              color = '#1e40af';
            }

            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: bg,
                  color: color,
                }}
              >
                <div style={{ marginTop: 2 }}>{icon}</div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{alert.message}</div>
                  {alert.employeeCode && (
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                      Employee: {alert.employeeName} ({alert.employeeCode})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

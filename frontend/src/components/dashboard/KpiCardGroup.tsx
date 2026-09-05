import React from 'react';
import { DollarSign, FileText, Calendar, Activity } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface KpiCardGroupProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

export const KpiCardGroup: React.FC<KpiCardGroupProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card" style={{ height: 120, justifyContent: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>
    );
  }

  const netSalary = metrics?.totalNetSalary ? `₹${metrics.totalNetSalary.toLocaleString('en-IN')}` : '₹0';
  const payslips = metrics?.totalPayslips || 0;
  const timeOff = metrics?.totalTimeOffDays || 0;
  const health = metrics?.attendanceHealthPercent ? `${metrics.attendanceHealthPercent}%` : '100%';

  return (
    <div className="kpi-grid">
      <div className="kpi-card" style={{ '--kpi-color': 'var(--brand-primary)', '--kpi-icon-bg': 'var(--color-info-bg)' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="kpi-label">TOTAL NET SALARY</span>
          <div className="kpi-icon"><DollarSign size={22} color="var(--brand-primary)" /></div>
        </div>
        <div className="kpi-value">{netSalary}</div>
        <div className="kpi-change up">↑ 4.2% vs last month</div>
      </div>

      <div className="kpi-card" style={{ '--kpi-color': '#10b981', '--kpi-icon-bg': 'var(--color-success-bg)' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="kpi-label">TOTAL PAYSLIPS</span>
          <div className="kpi-icon"><FileText size={22} color="#10b981" /></div>
        </div>
        <div className="kpi-value">{payslips}</div>
        <div className="kpi-change up">100% computed</div>
      </div>

      <div className="kpi-card" style={{ '--kpi-color': '#f59e0b', '--kpi-icon-bg': 'var(--color-warning-bg)' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="kpi-label">TIME OFF CONSUMED</span>
          <div className="kpi-icon"><Calendar size={22} color="#f59e0b" /></div>
        </div>
        <div className="kpi-value">{timeOff} Days</div>
        <div className="kpi-change down">Within limits</div>
      </div>

      <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6', '--kpi-icon-bg': '#ede9fe' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="kpi-label">ATTENDANCE HEALTH</span>
          <div className="kpi-icon"><Activity size={22} color="#8b5cf6" /></div>
        </div>
        <div className="kpi-value">{health}</div>
        <div className="kpi-change up">Optimal punch compliance</div>
      </div>
    </div>
  );
};

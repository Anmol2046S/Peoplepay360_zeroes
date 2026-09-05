import React from 'react';
import { Calendar, Filter } from 'lucide-react';

interface FilterBarProps {
  period: string;
  departmentId: string;
  departments: { id: string; name: string }[];
  onPeriodChange: (period: string) => void;
  onDepartmentChange: (deptId: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  period,
  departmentId,
  departments,
  onPeriodChange,
  onDepartmentChange,
}) => {
  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
        <Calendar size={16} color="var(--text-muted)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Pay Period:</span>
        <select
          className="form-select"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          style={{ border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)' }}
        >
          <option value="Feb 2026">February 2026</option>
          <option value="Jan 2026">January 2026</option>
          <option value="Dec 2025">December 2025</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
        <Filter size={16} color="var(--text-muted)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Department:</span>
        <select
          className="form-select"
          value={departmentId}
          onChange={(e) => onDepartmentChange(e.target.value)}
          style={{ border: 'none', padding: 0, fontSize: 13, fontWeight: 600 }}
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

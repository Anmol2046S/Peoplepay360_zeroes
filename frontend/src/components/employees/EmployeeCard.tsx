import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Employee } from '../../types';
import { StatusBadge } from '../common/Badge';

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="emp-card" onClick={onClick}>
      <div className="emp-avatar">{initials}</div>
      <div>
        <div className="emp-name">
          {employee.firstName} {employee.lastName}
        </div>
        <div className="emp-position">{employee.jobPosition}</div>
        <div className="emp-dept">{employee.department?.name || 'General'}</div>
      </div>

      <StatusBadge status={employee.status} />

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4, width: '100%', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <Mail size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.workEmail}</span>
        </div>
        {employee.workPhone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={12} />
            <span>{employee.workPhone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

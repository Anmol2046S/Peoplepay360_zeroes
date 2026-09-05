import React, { useEffect, useState } from 'react';
import { Search, Calendar, UserCheck, Clock, Building } from 'lucide-react';
import { employeeService } from '../../services/employee.service';
import { payrunService } from '../../services/payrun.service';
import { Employee, WorkingSchedule } from '../../types';

export const ScheduleRoleView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, schedRes] = await Promise.all([
        employeeService.list(),
        payrunService.listSchedules(),
      ]);
      if (empRes.success) setEmployees(empRes.data);
      if (schedRes.success) setSchedules(schedRes.data);
    } catch (err) {
      console.error('Failed to load schedule matrix data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const departments = Array.from(
    new Set(employees.map((e) => e.department?.name).filter(Boolean))
  ) as string[];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department?.name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getScheduleForEmployee = (emp: Employee): { name?: string; hoursPerWeek?: number } | null => {
    if (emp.workingScheduleId) {
      return schedules.find((s) => s.id === emp.workingScheduleId) || emp.workingSchedule || null;
    }
    return emp.workingSchedule || schedules[0] || null;
  };

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div>
      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ minWidth: 260 }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name, role, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Matrix Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--brand-primary)" />
            <span>Role & Person Schedule Matrix</span>
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filteredEmployees.length} assigned profiles
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee / Role</th>
                <th>Department</th>
                <th>Assigned Schedule</th>
                <th>Weekly Hrs</th>
                {daysOfWeek.map((day) => (
                  <th key={day} style={{ textAlign: 'center', minWidth: 80 }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Loading Schedule Matrix...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No matching employee schedule profiles found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const sched = getScheduleForEmployee(emp);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span>{emp.employeeCode}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{emp.jobPosition}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: 11 }}>
                          {emp.department?.name || 'General'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} color="var(--brand-primary)" />
                          <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
                            {sched?.name || 'Standard 40 Hours'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                          {sched?.hoursPerWeek || 40} hrs
                        </strong>
                      </td>
                      {daysOfWeek.map((day, idx) => {
                        const isWeekend = idx >= 5;
                        return (
                          <td key={day} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            {isWeekend ? (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: 'var(--text-muted)',
                                  backgroundColor: 'var(--bg-secondary)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                }}
                              >
                                OFF
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: 'var(--color-success)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                }}
                              >
                                9-18
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

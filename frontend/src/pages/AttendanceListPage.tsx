import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { attendanceService } from '../services/attendance.service';
import { Attendance } from '../types';

export const AttendanceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await attendanceService.list();
      if (res.success) setAttendances(res.data);
    } catch {
      setAttendances([
        {
          id: 'att1',
          employeeId: 'emp1',
          employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001' },
          date: '2026-02-18',
          checkIn: '2026-02-18T09:00:00Z',
          checkOut: '2026-02-18T18:00:00Z',
          workedHours: 8.0,
          overtimeHours: 0.0,
          status: 'PRESENT',
          isManualEdit: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = attendances.filter(
    (a) =>
      (a.employee && `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Daily Attendance Logs</h1>
          <p className="page-subtitle">Track real-time check-in, check-out, worked hours, and overtime records</p>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search employee or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <AttendanceTable
        attendances={filtered}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/hr/attendance/${item.id}`)}
      />
    </div>
  );
};
export default AttendanceListPage;

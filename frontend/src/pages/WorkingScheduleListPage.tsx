import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { payrunService } from '../services/payrun.service';
import { WorkingSchedule } from '../types';

export const WorkingScheduleListPage: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listSchedules();
      if (res.success) setSchedules(res.data);
    } catch {
      setSchedules([
        {
          id: 'sched1',
          name: 'Standard 40 Hours/Week',
          company: 'My Company',
          daysPerWeek: 5,
          hoursPerWeek: 40.0,
          timezone: 'Asia/Kolkata',
          status: 'ACTIVE',
          days: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = schedules.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<WorkingSchedule>[] = [
    {
      key: 'name',
      header: 'Schedule Name',
      render: (item) => <strong style={{ color: 'var(--brand-primary)' }}>{item.name}</strong>,
    },
    {
      key: 'company',
      header: 'Company',
    },
    {
      key: 'daysPerWeek',
      header: 'Days / Week',
      render: (item) => `${item.daysPerWeek} days`,
    },
    {
      key: 'hoursPerWeek',
      header: 'Hours / Week',
      render: (item) => <strong>{item.hoursPerWeek} hrs</strong>,
    },
    {
      key: 'timezone',
      header: 'Timezone',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Working Schedules & Work Patterns</h1>
          <p className="page-subtitle">Configure weekly working hours, start/end times, and shift breaks</p>
        </div>
        <div className="page-header-right">
          <Button icon={<Plus size={16} />} onClick={() => navigate('/hr/schedules/new')}>
            New Schedule
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search schedule name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/hr/schedules/${item.id}`)}
      />
    </div>
  );
};
export default WorkingScheduleListPage;

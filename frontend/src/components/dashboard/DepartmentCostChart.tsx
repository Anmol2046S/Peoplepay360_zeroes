import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../common/Card';
import { DepartmentCost } from '../../types';

interface DepartmentCostChartProps {
  data: DepartmentCost[];
  isLoading?: boolean;
}

export const DepartmentCostChart: React.FC<DepartmentCostChartProps> = ({
  data,
  isLoading = false,
}) => {
  const formattedData = data.map((item) => ({
    department: item.department,
    cost: item.totalCost,
    formattedCost: `₹${(item.totalCost / 1000).toFixed(0)}k`,
    headcount: item.headcount,
  }));

  return (
    <Card title="Department Salary Costs" subtitle="Total monthly expenditure per department">
      {isLoading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      ) : formattedData.length === 0 ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No department cost data available
        </div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${(Number(val) || 0).toLocaleString('en-IN')}`, 'Total Salary Cost']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff' }}
              />
              <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

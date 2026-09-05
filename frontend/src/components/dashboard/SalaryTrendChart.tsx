import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../common/Card';
import { SalaryTrendPoint } from '../../types';

interface SalaryTrendChartProps {
  data: SalaryTrendPoint[];
  isLoading?: boolean;
}

export const SalaryTrendChart: React.FC<SalaryTrendChartProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <Card title="Monthly Salary Distribution Trend" subtitle="Net salary payout trajectory over recent pay periods">
      {isLoading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No trend data available
        </div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [`₹${(Number(val) || 0).toLocaleString('en-IN')}`, 'Net Salary']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff' }}
              />
              <Area type="monotone" dataKey="totalNet" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

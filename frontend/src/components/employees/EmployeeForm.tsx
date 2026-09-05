import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Calendar, CheckSquare, Save, ArrowLeft } from 'lucide-react';
import { SmartButton } from '../common/SmartButton';
import { Tabs } from '../common/Tabs';
import { Button } from '../common/Button';
import { Employee, Department } from '../../types';

interface EmployeeFormProps {
  initialData?: Partial<Employee>;
  departments: Department[];
  onSave: (data: Partial<Employee>) => Promise<void>;
  isLoading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData = {},
  departments,
  onSave,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('work');

  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeCode: initialData.employeeCode || `EMP${Math.floor(100 + Math.random() * 900)}`,
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    workEmail: initialData.workEmail || '',
    workPhone: initialData.workPhone || '',
    jobPosition: initialData.jobPosition || '',
    departmentId: initialData.departmentId || (departments[0]?.id || ''),
    workLocation: initialData.workLocation || 'Mumbai',
    status: initialData.status || 'ACTIVE',
    bankName: initialData.bankName || '',
    bankAccountNumber: initialData.bankAccountNumber || '',
    ifscCode: initialData.ifscCode || '',
  });

  const smartCounts = initialData.smartCounts || {
    contracts: 1,
    attendance: 14,
    timeOff: 3,
    allocations: 1,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate('/hr/employees')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Employees</span>
        </button>

        {/* Smart Buttons Group (Only show for existing employee) */}
        {initialData?.id && initialData.id !== 'new' && (
          <div className="smart-buttons">
            <SmartButton
              icon={<FileText size={15} />}
              label="Contracts"
              count={smartCounts.contracts}
              onClick={() => navigate(`/hr/contracts?employeeId=${initialData.id || ''}`)}
            />
            <SmartButton
              icon={<Clock size={15} />}
              label="Attendance"
              count={smartCounts.attendance}
              onClick={() => navigate(`/hr/attendance?employeeId=${initialData.id || ''}`)}
            />
            <SmartButton
              icon={<Calendar size={15} />}
              label="Time Off"
              count={smartCounts.timeOff}
              onClick={() => navigate(`/time-off/requests?employeeId=${initialData.id || ''}`)}
            />
            <SmartButton
              icon={<CheckSquare size={15} />}
              label="Allocations"
              count={smartCounts.allocations}
              onClick={() => navigate(`/time-off/allocations?employeeId=${initialData.id || ''}`)}
            />
          </div>
        )}
      </div>

      {/* Main Header Form Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label required">Employee Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Job Position</label>
              <input
                type="text"
                className="form-input"
                value={formData.jobPosition}
                onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                placeholder="e.g. Payroll Specialist"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Department</label>
              <select
                className="form-select"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Area */}
      <Tabs
        tabs={[
          { id: 'work', label: 'Work Information' },
          { id: 'bank', label: 'Bank & Payroll Data' },
          { id: 'settings', label: 'HR Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="card">
        <div className="card-body">
          {activeTab === 'work' && (
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label required">Work Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Work Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.workPhone || ''}
                  onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Work Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="HDFC Bank"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="501002394812"
                />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.ifscCode || ''}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="HDFC0000128"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
          <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
            Save Employee
          </Button>
        </div>
      </div>
    </form>
  );
};

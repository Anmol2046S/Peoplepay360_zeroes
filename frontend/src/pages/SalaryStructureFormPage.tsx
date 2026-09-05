import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { payrunService } from '../services/payrun.service';
import { SalaryStructure, SalaryRule } from '../types';

export const SalaryStructureFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<SalaryStructure>>({
    name: 'Regular Salary Structure',
    code: 'REG01',
    description: 'Standard corporate salary structure',
    status: 'ACTIVE',
  });
  const [rules, setRules] = useState<SalaryRule[]>([]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchStructure();
    }
  }, [id]);

  const fetchStructure = async () => {
    try {
      const res = await payrunService.getStructure(id!);
      if (res.success) {
        setFormData(res.data);
        if (res.data.rules) setRules(res.data.rules);
      }
    } catch {
      // keep default
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await payrunService.updateStructure(id, formData);
        showSuccess('Salary structure updated.');
      } else {
        await payrunService.createStructure(formData);
        showSuccess('New salary structure created.');
      }
      navigate('/payroll/structures');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save structure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button
            type="button"
            onClick={() => navigate('/payroll/structures')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Structures</span>
          </button>
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Salary Structure' : 'Create Salary Structure'}</h1>
          <p className="page-subtitle">Configure structure code, description, and attached calculation rules</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Structure Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Structure Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Structure
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default SalaryStructureFormPage;

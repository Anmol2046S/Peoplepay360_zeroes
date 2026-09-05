import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNotification } from '../context/NotificationContext';
import { payrunService } from '../services/payrun.service';
import { SalaryRule, SalaryStructure, SalaryRuleCategory, ComputationMethod } from '../types';

export const SalaryRuleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<SalaryRule>>({
    name: 'House Rent Allowance',
    code: 'HRA',
    category: 'ALLOWANCE',
    sequence: 10,
    computationMethod: 'PERCENTAGE',
    amount: 0,
    percentage: 50,
    percentageBase: 'BASIC',
    formula: '',
    status: 'ACTIVE',
    salaryStructureId: '',
  });

  useEffect(() => {
    fetchRefData();
  }, [id]);

  const fetchRefData = async () => {
    try {
      const sRes = await payrunService.listStructures();
      if (sRes.success) setStructures(sRes.data);

      if (id && id !== 'new') {
        const rRes = await payrunService.getRule(id);
        if (rRes.success) setFormData(rRes.data);
      }
    } catch {
      setStructures([{ id: 'struct1', name: 'Regular Salary Structure', code: 'REG01', status: 'ACTIVE', createdAt: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id && id !== 'new') {
        await payrunService.updateRule(id, formData);
        showSuccess('Salary rule updated.');
      } else {
        await payrunService.createRule(formData);
        showSuccess('New salary rule created.');
      }
      navigate('/payroll/rules');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Failed to save salary rule.');
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
            onClick={() => navigate('/payroll/rules')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Salary Rules</span>
          </button>
          <h1 className="page-title">{id && id !== 'new' ? 'Edit Salary Rule' : 'Create Salary Rule'}</h1>
          <p className="page-subtitle">Configure rule category, execution sequence order, and computation formula</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Rule Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Rule Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Salary Structure</label>
                <select
                  className="form-select"
                  value={formData.salaryStructureId || ''}
                  onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })}
                  required
                >
                  <option value="">Select Structure</option>
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label required">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SalaryRuleCategory })}
                  required
                >
                  <option value="BASIC">BASIC</option>
                  <option value="ALLOWANCE">ALLOWANCE</option>
                  <option value="GROSS">GROSS</option>
                  <option value="DEDUCTION">DEDUCTION</option>
                  <option value="NET">NET</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Sequence Order (Execution Order)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Computation Method</label>
                <select
                  className="form-select"
                  value={formData.computationMethod}
                  onChange={(e) => setFormData({ ...formData, computationMethod: e.target.value as ComputationMethod })}
                  required
                >
                  <option value="FIXED">FIXED AMOUNT</option>
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="FORMULA">DYNAMIC FORMULA</option>
                </select>
              </div>
            </div>

            {formData.computationMethod === 'FIXED' && (
              <div className="form-group">
                <label className="form-label required">Fixed Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount || 0}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
            )}

            {formData.computationMethod === 'PERCENTAGE' && (
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label required">Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.percentage || 0}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Percentage Base</label>
                  <select
                    className="form-select"
                    value={formData.percentageBase || 'WAGE'}
                    onChange={(e) => setFormData({ ...formData, percentageBase: e.target.value })}
                    required
                  >
                    <option value="WAGE">Contract Wage (WAGE)</option>
                    <option value="BASIC">Basic Salary (BASIC)</option>
                    <option value="GROSS">Gross Salary (GROSS)</option>
                  </select>
                </div>
              </div>
            )}

            {formData.computationMethod === 'FORMULA' && (
              <div className="form-group">
                <label className="form-label required">Formula Expression</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.formula || ''}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  placeholder="e.g. BASIC * 0.12 or WAGE / 22 * workedDays"
                  required
                />
              </div>
            )}
          </div>

          <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
            <Button type="submit" isLoading={isLoading} icon={<Save size={16} />}>
              Save Rule
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default SalaryRuleFormPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, CheckCircle, DollarSign, Send, FileText } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { PayrunStatusBadge } from '../components/payrun/PayrunStatusBadge';
import { PayslipPdfModal } from '../components/payslip/PayslipPdfModal';
import { payrunService } from '../services/payrun.service';
import { useNotification } from '../context/NotificationContext';
import { Payrun, Payslip } from '../types';

export const PayrunProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  const [payrun, setPayrun] = useState<(Payrun & { payslips: Payslip[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    if (id) fetchPayrunData();
  }, [id]);

  const fetchPayrunData = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.getPayrun(id!);
      if (res.success) setPayrun(res.data);
    } catch {
      setPayrun({
        id: id!,
        name: 'February 2026 Payrun',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        status: 'DRAFT',
        totalGross: 150000,
        totalNet: 132000,
        warningsCount: 1,
        salaryStructureId: 'struct1',
        createdAt: new Date().toISOString(),
        payslips: [
          {
            id: 'ps1',
            payslipNumber: 'SLIP/2026/02/001',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            workedDays: 22,
            basicWage: 42500,
            grossWage: 85000,
            netWage: 74800,
            status: 'DRAFT',
            sentEmail: false,
            employeeId: 'emp1',
            employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001', workEmail: 'aarav@oxp.com' },
            contractId: 'c1',
            payrunId: id!,
            createdAt: new Date().toISOString(),
            lines: [
              { id: 'l1', code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 42500, sequence: 1 },
              { id: 'l2', code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 21250, sequence: 10 },
              { id: 'l3', code: 'GROSS', name: 'Gross Salary', category: 'GROSS', amount: 85000, sequence: 20 },
              { id: 'l4', code: 'PF', name: 'Provident Fund', category: 'DEDUCTION', amount: 5100, sequence: 30 },
              { id: 'l5', code: 'PT', name: 'Professional Tax', category: 'DEDUCTION', amount: 200, sequence: 40 },
              { id: 'l6', code: 'NET', name: 'Net Salary Payable', category: 'NET', amount: 74800, sequence: 50 },
            ],
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompute = async () => {
    setActionLoading(true);
    try {
      const res = await payrunService.computePayrun(id!);
      if (res.success) {
        showSuccess('Payrun batch computed successfully!');
        fetchPayrunData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Computation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const res = await payrunService.validatePayrun(id!);
      if (res.success) {
        showSuccess('Payrun validated! Ready for marking paid.');
        fetchPayrunData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Validation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setActionLoading(true);
    try {
      const res = await payrunService.markPaid(id!);
      if (res.success) {
        showSuccess('Payrun status marked as PAID!');
        fetchPayrunData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    setActionLoading(true);
    try {
      const res = await payrunService.sendPayslips(id!);
      if (res.success) {
        showSuccess(`Bulk payslip email dispatched to employees!`);
        fetchPayrunData();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Email dispatch failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Payslip>[] = [
    {
      key: 'payslipNumber',
      header: 'Payslip Ref',
      render: (item) => <strong style={{ color: 'var(--brand-primary)' }}>{item.payslipNumber}</strong>,
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (item) =>
        item.employee ? (
          <div>
            <div style={{ fontWeight: 600 }}>{item.employee.firstName} {item.employee.lastName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.employee.employeeCode}</div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'basic',
      header: 'Basic Wage',
      render: (item) => `₹${item.basicWage.toLocaleString('en-IN')}`,
    },
    {
      key: 'gross',
      header: 'Gross Wage',
      render: (item) => `₹${item.grossWage.toLocaleString('en-IN')}`,
    },
    {
      key: 'net',
      header: 'Net Payable',
      render: (item) => <strong>₹{item.netWage.toLocaleString('en-IN')}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <PayrunStatusBadge status={item.status} />,
    },
    {
      key: 'pdf',
      header: 'Preview PDF',
      render: (item) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<FileText size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayslip(item);
          }}
        >
          View PDF
        </Button>
      ),
    },
  ];

  if (isLoading || !payrun) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button
            type="button"
            onClick={() => navigate('/payroll/payruns')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Payrun Batches</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{payrun.name}</h1>
            <PayrunStatusBadge status={payrun.status} />
          </div>
          <p className="page-subtitle">
            Period: {new Date(payrun.startDate).toLocaleDateString()} - {new Date(payrun.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Controls Toolbar (s23.png) */}
        <div className="page-header-right">
          <Button
            icon={<Calculator size={16} />}
            onClick={handleCompute}
            isLoading={actionLoading}
            disabled={payrun.status === 'PAID'}
          >
            COMPUTE
          </Button>

          <Button
            variant="warning"
            icon={<CheckCircle size={16} />}
            onClick={handleValidate}
            isLoading={actionLoading}
            disabled={payrun.status === 'DRAFT' || payrun.status === 'PAID'}
          >
            VALIDATE
          </Button>

          <Button
            variant="success"
            icon={<DollarSign size={16} />}
            onClick={handleMarkPaid}
            isLoading={actionLoading}
            disabled={payrun.status !== 'VALIDATED'}
          >
            MARK PAID
          </Button>

          <Button
            variant="secondary"
            icon={<Send size={16} />}
            onClick={handleSendPayslips}
            isLoading={actionLoading}
            disabled={payrun.status !== 'PAID'}
          >
            SEND PAYSLIPS
          </Button>
        </div>
      </div>

      {/* Payslips Table Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Generated Payslips ({payrun.payslips.length})</h3>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary)' }}>
            Batch Net Total: ₹{payrun.totalNet.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <Table
            columns={columns}
            data={payrun.payslips}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => navigate(`/payroll/payslips/${item.id}`)}
          />
        </div>
      </div>

      {/* Payslip PDF Modal */}
      <PayslipPdfModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payslip={selectedPayslip}
      />
    </div>
  );
};
export default PayrunProcessingPage;

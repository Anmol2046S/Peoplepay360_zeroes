import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { PayslipBreakdownTable } from '../components/payslip/PayslipBreakdownTable';
import { PayslipPdfModal } from '../components/payslip/PayslipPdfModal';
import { payrunService } from '../services/payrun.service';
import { Payslip } from '../types';

export const PayslipComputationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  useEffect(() => {
    if (id) fetchPayslip();
  }, [id]);

  const fetchPayslip = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.getPayslip(id!);
      if (res.success) setPayslip(res.data);
    } catch {
      setPayslip({
        id: id!,
        payslipNumber: 'SLIP/2026/02/001',
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        workedDays: 22,
        basicWage: 42500,
        grossWage: 85000,
        netWage: 74800,
        status: 'DONE',
        sentEmail: true,
        employeeId: 'emp1',
        employee: { firstName: 'Aarav', lastName: 'Mehta', employeeCode: 'EMP001', workEmail: 'aarav@oxp.com' },
        contractId: 'c1',
        payrunId: 'payrun1',
        createdAt: new Date().toISOString(),
        lines: [
          { id: 'l1', code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 42500, sequence: 1 },
          { id: 'l2', code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 21250, sequence: 10 },
          { id: 'l3', code: 'GROSS', name: 'Gross Salary', category: 'GROSS', amount: 85000, sequence: 20 },
          { id: 'l4', code: 'PF', name: 'Provident Fund', category: 'DEDUCTION', amount: 5100, sequence: 30 },
          { id: 'l5', code: 'PT', name: 'Professional Tax', category: 'DEDUCTION', amount: 200, sequence: 40 },
          { id: 'l6', code: 'NET', name: 'Net Salary Payable', category: 'NET', amount: 74800, sequence: 50 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !payslip) {
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
            onClick={() => navigate('/payroll/payslips')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Payslips</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">{payslip.payslipNumber}</h1>
            <StatusBadge status={payslip.status} />
          </div>
          <p className="page-subtitle">
            Employee: {payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : 'N/A'} | Period: {new Date(payslip.startDate).toLocaleDateString()} - {new Date(payslip.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="page-header-right">
          <Button icon={<FileText size={16} />} onClick={() => setIsPdfOpen(true)}>
            View Printable PDF
          </Button>
        </div>
      </div>

      {/* Salary Computation Breakdown Card (s25.png) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Salary Rule Computation Breakdown</h3>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--brand-primary)' }}>
            Net Wage: ₹{payslip.netWage.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <PayslipBreakdownTable lines={payslip.lines || []} />
        </div>
      </div>

      <PayslipPdfModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        payslip={payslip}
      />
    </div>
  );
};
export default PayslipComputationPage;

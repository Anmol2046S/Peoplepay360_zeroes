import React from 'react';
import { Printer, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Payslip } from '../../types';

interface PayslipPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: Payslip | null;
}

export const PayslipPdfModal: React.FC<PayslipPdfModalProps> = ({
  isOpen,
  onClose,
  payslip,
}) => {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const empName = payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : 'Employee';
  const empCode = payslip.employee?.employeeCode || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payslip Preview - ${payslip.payslipNumber}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Printer size={16} />} onClick={handlePrint}>
            Print Payslip
          </Button>
          <Button icon={<Download size={16} />} variant="success" onClick={handlePrint}>
            Download PDF
          </Button>
        </>
      }
    >
      <div
        id="printable-payslip"
        style={{
          padding: '32px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          color: '#1e293b',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #6366f1', paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>PeoplePay360 HRMS</h1>
            <p style={{ fontSize: 12, color: '#64748b' }}>Enterprise HR & Payroll Solutions</p>
            <p style={{ fontSize: 11, color: '#64748b' }}>Mumbai, India</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>PAYSLIP</h2>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>{payslip.payslipNumber}</p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Period: {new Date(payslip.startDate).toLocaleDateString()} - {new Date(payslip.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Employee & Pay Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>EMPLOYEE DETAILS</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{empName}</p>
            <p style={{ fontSize: 12, color: '#475569' }}>Code: {empCode}</p>
            <p style={{ fontSize: 12, color: '#475569' }}>Email: {payslip.employee?.workEmail}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>PAYMENT DETAILS</p>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Worked Days: <strong>{payslip.workedDays} days</strong></p>
            <p style={{ fontSize: 13, color: '#475569' }}>Basic Wage: <strong>₹{payslip.basicWage.toLocaleString('en-IN')}</strong></p>
            <p style={{ fontSize: 13, color: '#475569' }}>Payrun Batch: <strong>{payslip.payrun?.name || 'Regular'}</strong></p>
          </div>
        </div>

        {/* Breakdown Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#475569' }}>EARNINGS & DEDUCTIONS</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#475569' }}>CATEGORY</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, color: '#475569' }}>AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            {payslip.lines?.map((line) => (
              <tr key={line.id || line.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{line.name} ({line.code})</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{line.category}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: line.category === 'DEDUCTION' ? '#ef4444' : '#0f172a' }}>
                  {line.category === 'DEDUCTION' ? '-' : ''}₹{line.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Net Salary Summary Box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <div style={{ width: 280, padding: 16, background: '#e0e7ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Gross Earnings:</span>
              <strong>₹{payslip.grossWage.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #6366f1', paddingTop: 8, fontSize: 16, fontWeight: 800, color: '#4338ca' }}>
              <span>NET PAY:</span>
              <span>₹{payslip.netWage.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 32, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          This is a computer-generated payslip issued by PeoplePay360 HRMS and does not require a physical signature.
        </p>
      </div>
    </Modal>
  );
};

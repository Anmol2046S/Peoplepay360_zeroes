import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { PayslipPdfModal } from '../components/payslip/PayslipPdfModal';
import { payrunService } from '../services/payrun.service';
import { Payslip } from '../types';

export const PayslipsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const res = await payrunService.listPayslips();
      if (res.success) setPayslips(res.data);
    } catch {
      setPayslips([
        {
          id: 'ps1',
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
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = payslips.filter(
    (p) =>
      p.payslipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.employee && `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      key: 'period',
      header: 'Period',
      render: (item) => `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`,
    },
    {
      key: 'netWage',
      header: 'Net Salary',
      render: (item) => <strong>₹{item.netWage.toLocaleString('en-IN')}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'pdf',
      header: 'Document',
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
          PDF Preview
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Payslip Directory & PDF Generation</h1>
          <p className="page-subtitle">View salary breakdown statements, download PDFs, and monitor email delivery</p>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search payslip ref or employee..."
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
        onRowClick={(item) => navigate(`/payroll/payslips/${item.id}`)}
      />

      <PayslipPdfModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payslip={selectedPayslip}
      />
    </div>
  );
};
export default PayslipsListPage;

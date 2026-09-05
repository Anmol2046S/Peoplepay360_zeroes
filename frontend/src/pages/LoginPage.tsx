import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Shield, UserCheck, DollarSign, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [email, setEmail] = useState('admin@oxp.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { label: 'Admin', email: 'admin@oxp.com', pass: 'AdminPassword123!', icon: <Shield size={14} />, role: 'ADMIN' },
    { label: 'Payroll Manager', email: 'aarav@oxp.com', pass: 'Password123!', icon: <DollarSign size={14} />, role: 'HR_PAYROLL_MANAGER' },
    { label: 'HR Manager', email: 'sara@oxp.com', pass: 'Password123!', icon: <Users size={14} />, role: 'HR_MANAGER' },
    { label: 'Payroll User', email: 'neha@oxp.com', pass: 'Password123!', icon: <UserCheck size={14} />, role: 'HR_PAYROLL_USER' },
    { label: 'Employee', email: 'john@oxp.com', pass: 'Password123!', icon: <User size={14} />, role: 'EMPLOYEE' },
  ];

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      showSuccess('Authentication successful! Welcome to PeoplePay360.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      showError(errorObj.response?.data?.error?.message || 'Invalid email or password credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--sidebar-bg)',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.18), transparent 70%)',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 460,
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--sidebar-border)',
          backgroundColor: 'white',
          borderRadius: 'var(--border-radius-xl)',
        }}
      >
        <div style={{ padding: '36px 32px 20px 32px', textAlign: 'center' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 'var(--border-radius-md)',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              color: 'white',
              fontWeight: 800,
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            }}
          >
            P360
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            PeoplePay360
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Enterprise HRMS & Payroll Operations Platform
          </p>
        </div>

        <div style={{ padding: '0 32px 36px 32px' }}>
          {/* Quick Demo Role Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
              Select Demo Credentials
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc.email, acc.pass)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: email === acc.email ? 'var(--sidebar-active-bg)' : 'var(--bg-primary)',
                    color: email === acc.email ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: email === acc.email ? 700 : 500,
                    fontSize: 11.5,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {acc.icon}
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label required">Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@oxp.com"
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              icon={<ArrowRight size={18} />}
              style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
            >
              Sign In to Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;

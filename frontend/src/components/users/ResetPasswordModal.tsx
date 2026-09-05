import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { User } from '../../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onReset: (userId: string, newPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onReset,
  isLoading = false,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    await onReset(user.id, newPassword);
    setNewPassword('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset User Password" size="sm">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email} ({user.role})</div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label required">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter new strong password"
              required
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 4 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<Key size={16} />}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

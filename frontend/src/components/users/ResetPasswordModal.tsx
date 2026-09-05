import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { User } from '../../types';

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
          <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email} ({user.roleName || user.role})</div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3.5 py-2 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter new strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
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

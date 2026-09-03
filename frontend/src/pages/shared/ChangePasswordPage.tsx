import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Header } from '../../components/common/Header';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError('New password must be between 8 and 16 characters long');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('New password must contain at least one special character');
      return;
    }

    setSubmitting(true);

    try {
      await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });

      setSuccess('Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate(-1), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ width: '40px', height: '40px' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Update Password</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Ensure your account is using a strong password
              </p>
            </div>
          </div>

          {error && (
            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="helper-text">
                8-16 characters, 1 uppercase letter, 1 special character.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

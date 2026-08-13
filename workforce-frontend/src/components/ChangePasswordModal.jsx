import { useState } from 'react';
import api from '../utils/api';
import { saveAuth, getToken } from '../utils/auth';

function ChangePasswordModal({ user, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', { new_password: newPassword });
      const updatedUser = { ...user, must_change_password: false };
      saveAuth(getToken(), updatedUser);
      onSuccess(updatedUser);
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '380px', maxWidth: '90vw' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Set a New Password</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>
          You're using a default password. Please set a new one to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13.5px', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13.5px', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          {error && <p className="error-text" style={{ marginBottom: '12px' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
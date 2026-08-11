import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, saveAuth, getToken } from '../utils/auth';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

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

    try {
      await api.post('/auth/change-password', { new_password: newPassword });

      // Update stored user info so must_change_password reflects the change
      const updatedUser = { ...user, must_change_password: false };
      saveAuth(getToken(), updatedUser);

      // Redirect to the right dashboard based on role
      if (user.role === 'HR') navigate('/hr-dashboard');
      else if (user.role === 'ITADMIN') navigate('/it-dashboard');
      else navigate('/employee-dashboard');

    } catch (err) {
      console.error(err);
      setError('Failed to update password');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '320px' }}>
        <h2>Set a New Password</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
          You're using a default password. Please set a new one to continue.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';

const links = [
  { label: 'Dashboard', path: '/employee-dashboard' },
  { label: 'My Profile', path: '/employee/profile' },
  { label: 'Salary & Pay', path: '/employee/salary' },
  { label: 'My Assets', path: '/employee/assets' },
  { label: 'My Tickets', path: '/employee/tickets' },
  { label: 'Leave', path: '/employee/leave' },
];

function MyProfile() {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [formData, setFormData] = useState({
    phone: '', date_of_birth: '', address: '', gender: '',
    emergency_contact_name: '', emergency_contact_phone: '', blood_group: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees/me');
      setProfile(res.data);
      setFormData({
        phone: res.data.phone || '',
        date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.slice(0, 10) : '',
        address: res.data.address || '',
        gender: res.data.gender || '',
        emergency_contact_name: res.data.emergency_contact_name || '',
        emergency_contact_phone: res.data.emergency_contact_phone || '',
        blood_group: res.data.blood_group || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await api.put('/employees/me', formData);
      setFormSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const fieldLabel = { fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' };

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee/profile" />

      <div className="main-content">
        <PageHeader title="My Profile">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {profile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>

              {/* Work Details panel */}
              <div className="panel">
                <h3>{profile.full_name}</h3>
                <p style={{ color: '#64748b', marginBottom: '10px' }}>{profile.designation}</p>
                <span className={`badge ${profile.status === 'active' ? 'available' : 'retired'}`}>{profile.status}</span>

                <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>Work Details</h4>
                <table>
                  <tbody>
                    <tr><td><strong>Employee ID</strong></td><td>{profile.employee_id}</td></tr>
                    <tr><td><strong>Email</strong></td><td>{profile.email}</td></tr>
                    <tr><td><strong>Department</strong></td><td>{profile.department_name}</td></tr>
                    <tr><td><strong>Join Date</strong></td><td>{profile.join_date?.slice(0, 10)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Personal Details panel */}
              <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0 }}>Personal Details</h3>
                  {!editMode && (
                    <button className="btn-primary" onClick={() => setEditMode(true)} style={{ padding: '7px 14px', fontSize: '12.5px' }}>
                      Edit
                    </button>
                  )}
                </div>

                {!editMode ? (
                  <table>
                    <tbody>
                      <tr><td><strong>Phone</strong></td><td>{profile.phone || '-'}</td></tr>
                      <tr><td><strong>Date of Birth</strong></td><td>{profile.date_of_birth?.slice(0, 10) || '-'}</td></tr>
                      <tr><td><strong>Gender</strong></td><td>{profile.gender || '-'}</td></tr>
                      <tr><td><strong>Blood Group</strong></td><td>{profile.blood_group || '-'}</td></tr>
                      <tr><td><strong>Address</strong></td><td>{profile.address || '-'}</td></tr>
                      <tr><td><strong>Emergency Contact</strong></td><td>{profile.emergency_contact_name || '-'} {profile.emergency_contact_phone ? `(${profile.emergency_contact_phone})` : ''}</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <form onSubmit={handleSubmit} className="form-grid">
                    <div>
                      <label style={fieldLabel}>Phone</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Date of Birth</label>
                      <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={fieldLabel}>Blood Group</label>
                      <input name="blood_group" placeholder="e.g. O+" value={formData.blood_group} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={fieldLabel}>Address</label>
                      <input name="address" value={formData.address} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Emergency Contact Name</label>
                      <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>Emergency Contact Phone</label>
                      <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                      <button type="submit" className="btn-primary">Save Changes</button>
                      <button type="button" onClick={() => setEditMode(false)} style={{ padding: '10px 16px', cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px' }}>Cancel</button>
                    </div>
                  </form>
                )}
                {formError && <p className="error-text">{formError}</p>}
                {formSuccess && <p className="success-text">{formSuccess}</p>}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
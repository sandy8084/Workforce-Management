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

function Leave() {
  const user = getUser();
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [formData, setFormData] = useState({
    leave_type: 'Casual',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      const [balanceRes, leavesRes] = await Promise.all([
        api.get('/leaves/me/balance'),
        api.get('/leaves/me'),
      ]);
      setBalance(balanceRes.data);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const response = await api.post('/leaves', formData);
      setFormSuccess(response.data.message);
      setFormData({ leave_type: 'Casual', from_date: '', to_date: '', reason: '' });
      fetchData();
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const fieldLabel = { fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' };

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee/leave" />

      <div className="main-content">
        <PageHeader title="Leave">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Apply for Leave'}
            </button>
          </div>

        {loading ? <p>Loading...</p> : (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="label">Casual Leave</div>
                <div className="value">{balance?.casual_total - balance?.casual_used} / {balance?.casual_total}</div>
              </div>
              <div className="stat-card">
                <div className="label">Sick Leave</div>
                <div className="value">{balance?.sick_total - balance?.sick_used} / {balance?.sick_total}</div>
              </div>
              <div className="stat-card">
                <div className="label">Emergency Leave</div>
                <div className="value" style={{ fontSize: '18px' }}>Unlimited</div>
              </div>
            </div>

           {showForm && (
              <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '460px', maxWidth: '90vw' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                    <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
                  </div>
                  <form onSubmit={handleSubmit} className="form-grid">
                    <div>
                      <label style={fieldLabel}>Leave Type</label>
                      <select name="leave_type" value={formData.leave_type} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="Casual">Casual</option>
                        <option value="Sick">Sick</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label style={fieldLabel}>From</label>
                      <input name="from_date" type="date" value={formData.from_date} onChange={handleChange} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={fieldLabel}>To</label>
                      <input name="to_date" type="date" value={formData.to_date} onChange={handleChange} required style={{ width: '100%' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={fieldLabel}>Reason</label>
                      <input name="reason" value={formData.reason} onChange={handleChange} required style={{ width: '100%' }} placeholder="Reason for leave" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'end' }}>Submit Request</button>
                  </form>
                  {formError && <p className="error-text">{formError}</p>}
                  {formSuccess && <p className="success-text">{formSuccess}</p>}
                </div>
              </div>
           )}

            <div className="panel">
              <h3>Leave History</h3>
              <table>
                <thead>
                  <tr><th>Leave No</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.leave_no}>
                      <td>{l.leave_no}</td>
                      <td>{l.leave_type}</td>
                      <td>{l.from_date?.slice(0, 10)}</td>
                      <td>{l.to_date?.slice(0, 10)}</td>
                      <td>{l.reason}</td>
                      <td><span className={`badge ${l.status === 'Approved' ? 'available' : l.status === 'Rejected' ? 'retired' : 'assigned'}`}>{l.status}</span></td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No leave requests yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
}

export default Leave;
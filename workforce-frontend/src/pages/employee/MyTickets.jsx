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

function MyTickets() {
  const user = getUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [myAssets, setMyAssets] = useState([]);
  const [formData, setFormData] = useState({
    category: 'HR',
    ticket_type: 'Management',
    subject: '',
    priority: 'Medium',
    asset_tag: '',
  });

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    api.get('/assets/me').then((res) => setMyAssets(res.data)).catch(console.error);
  }, []);

  // Hide old Leave-type tickets — Leave now has its own dedicated page
  const displayedTickets = tickets.filter((t) => t.ticket_type !== 'Leave');

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({
      ...formData,
      category,
      ticket_type: category === 'HR' ? 'Management' : 'Hardware',
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const payload = {
        category: formData.category,
        ticket_type: formData.ticket_type,
        priority: formData.priority,
        subject: formData.subject,
        asset_tag: formData.category === 'IT' && formData.ticket_type !== 'Access' ? formData.asset_tag : null,
      };

      const response = await api.post('/tickets', payload);
      setFormSuccess(response.data.message);
      setFormData({ category: 'HR', ticket_type: 'Management', subject: '', priority: 'Medium', asset_tag: '' });
      fetchTickets();
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to raise ticket');
    }
  };

  const fieldLabel = { fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' };

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee/tickets" />

      <div className="main-content">
        <PageHeader title="Tickets">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Ticket'}
            </button>
          </div>

          {showForm && (
            <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '460px', maxWidth: '90vw' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Raise a Ticket</h3>
                  <button onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">
                  <div>
                    <label style={fieldLabel}>Category</label>
                    <select name="category" value={formData.category} onChange={handleCategoryChange} style={{ width: '100%' }}>
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  <div>
                    <label style={fieldLabel}>Type</label>
                    <select name="ticket_type" value={formData.ticket_type} onChange={handleChange} style={{ width: '100%' }}>
                      {formData.category === 'HR' ? (
                        <option value="Management">Management</option>
                      ) : (
                        <>
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                          <option value="Access">Access</option>
                        </>
                      )}
                    </select>
                  </div>
                  {formData.category === 'IT' && formData.ticket_type !== 'Access' && (
                    <div>
                      <label style={fieldLabel}>Related Asset (optional)</label>
                      <select name="asset_tag" value={formData.asset_tag} onChange={handleChange} style={{ width: '100%' }}>
                        <option value="">None / Not sure</option>
                        {myAssets.map((a) => (
                          <option key={a.asset_tag} value={a.asset_tag}>{a.asset_tag} — {a.model || a.category}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={fieldLabel}>Description</label>
                    <input name="subject" value={formData.subject} onChange={handleChange} required style={{ width: '100%' }} placeholder="Describe the issue" />
                  </div>

                  <div>
                    <label style={fieldLabel}>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'end' }}>Submit</button>
                </form>
                {formError && <p className="error-text">{formError}</p>}
                {formSuccess && <p className="success-text">{formSuccess}</p>}
              </div>
            </div>
          )}

          <div className="panel">
            {loading ? <p>Loading...</p> : (
              <table>
                <thead>
                  <tr><th>Ticket No</th><th>Category</th><th>Type</th><th>Subject</th><th>Priority</th><th>Status</th><th>Reply</th></tr>
                </thead>
                <tbody>
                  {displayedTickets.map((t) => (
                    <tr key={t.ticket_no}>
                      <td>{t.ticket_no}</td>
                      <td>{t.category}</td>
                      <td>{t.ticket_type}</td>
                      <td>{t.subject}</td>
                      <td>{t.priority}</td>
                      <td><span className={`badge ${t.status === 'Open' ? 'assigned' : t.status === 'Resolved' || t.status === 'Closed' ? 'available' : 'maintenance'}`}>{t.status}</span></td>
                      <td>{t.hr_reply || '-'}</td>
                    </tr>
                  ))}
                  {displayedTickets.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No tickets yet</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTickets;
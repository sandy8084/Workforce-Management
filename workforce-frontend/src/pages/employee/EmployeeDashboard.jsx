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

function EmployeeDashboard() {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [salary, setSalary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [profileRes, salaryRes, assetsRes, ticketsRes] = await Promise.all([
          api.get('/employees/me'),
          api.get('/salaries/me').catch(() => ({ data: null })),
          api.get('/assets/me'),
          api.get('/tickets'),
        ]);
        setProfile(profileRes.data);
        setSalary(salaryRes.data);
        setAssets(assetsRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const openTickets = tickets.filter((t) => t.status === 'Open').length;

  const tenureYears = profile?.join_date
    ? Math.floor((new Date() - new Date(profile.join_date)) / (1000 * 60 * 60 * 24 * 365))
    : '-';

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee-dashboard" />

      <div className="main-content">
        <PageHeader title="Dashboard">
          <NotificationBell />
        </PageHeader>
        <div className="page-body">

        {loading ? <p>Loading...</p> : (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="label">Assigned Assets</div>
                <div className="value">{assets.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Open Tickets</div>
                <div className="value">{openTickets}</div>
              </div>
              <div className="stat-card">
                <div className="label">Net Salary</div>
                <div className="value">${salary?.net_salary || '-'}</div>
              </div>
              <div className="stat-card">
                <div className="label">Tenure</div>
                <div className="value">{tenureYears}yr</div>
              </div>
            </div>

            <div className="panel">
              <h3>Quick Info</h3>
              <table>
                <tbody>
                  <tr><td><strong>Department</strong></td><td>{profile?.department_name}</td></tr>
                  <tr><td><strong>Designation</strong></td><td>{profile?.designation}</td></tr>
                  <tr><td><strong>Employee ID</strong></td><td>{profile?.employee_id}</td></tr>
                  <tr><td><strong>Status</strong></td><td>{profile?.status}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="panel">
              <h3>Recent Tickets</h3>
              <table>
                <thead>
                  <tr><th>Ticket No</th><th>Subject</th><th>Priority</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 5).map((t) => (
                    <tr key={t.ticket_no}>
                      <td>{t.ticket_no}</td>
                      <td>{t.subject}</td>
                      <td>{t.priority}</td>
                      <td><span className={`badge ${t.status === 'Open' ? 'assigned' : t.status === 'Resolved' || t.status === 'Closed' ? 'available' : 'maintenance'}`}>{t.status}</span></td>
                    </tr>
                  ))}
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

export default EmployeeDashboard;
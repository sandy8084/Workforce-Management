import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import { CheckCircle2, Building2, IdCard, Clock, Package, CalendarDays, Ticket, Wallet } from 'lucide-react';

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
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [salary, setSalary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [profileRes, salaryRes, assetsRes, ticketsRes, balanceRes] = await Promise.all([
          api.get('/employees/me'),
          api.get('/salaries/me').catch(() => ({ data: null })),
          api.get('/assets/me'),
          api.get('/tickets'),
          api.get('/leaves/me/balance').catch(() => ({ data: null })),
        ]);
        setProfile(profileRes.data);
        setSalary(salaryRes.data);
        setAssets(assetsRes.data);
        setTickets(ticketsRes.data.filter((t) => t.ticket_type !== 'Leave'));
        setBalance(balanceRes.data);
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

  const personalFields = ['phone', 'date_of_birth', 'gender', 'blood_group', 'address', 'emergency_contact_name', 'emergency_contact_phone'];
  const filledCount = profile ? personalFields.filter((f) => profile[f]).length : 0;
  const profilePct = Math.round((filledCount / personalFields.length) * 100);

  const casualLeft = balance ? balance.casual_total - balance.casual_used : 0;
  const sickLeft = balance ? balance.sick_total - balance.sick_used : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
              {/* Welcome banner */}
              <div style={{
                background: 'linear-gradient(135deg, #0f766e, #0b2b26)',
                borderRadius: '16px',
                padding: '28px 30px',
                color: 'white',
                marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
                  {greeting()}, {profile?.full_name?.split(' ')[0]} 👋
                </h2>
                <p style={{ fontSize: '13.5px', color: '#bcdcd3', marginBottom: '20px' }}>
                  Here's what's happening with your workspace today.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '7px 14px', borderRadius: '20px', fontSize: '12.5px' }}>
                    <CheckCircle2 size={13} /> {profile?.designation}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '7px 14px', borderRadius: '20px', fontSize: '12.5px' }}>
                    <Building2 size={13} /> {profile?.department_name}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '7px 14px', borderRadius: '20px', fontSize: '12.5px' }}>
                    <IdCard size={13} /> {profile?.employee_id}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '7px 14px', borderRadius: '20px', fontSize: '12.5px' }}>
                    <Clock size={13} /> {tenureYears} yr with the company
                  </span>
                </div>
              </div>

              {/* Stat cards */}
              <div className="stat-cards">
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Assigned Assets</div>
                      <div className="value">{String(assets.length).padStart(2, '0')}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d9f7e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={17} color="#0f766e" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/employee/assets')} style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                    View assets →
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Leave Remaining</div>
                      <div className="value">{casualLeft + sickLeft}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarDays size={17} color="#b45309" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/employee/leave')} style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                    Apply for leave →
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Open Tickets</div>
                      <div className="value">{String(openTickets).padStart(2, '0')}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={17} color="#dc2626" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/employee/tickets')} style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                    Track tickets →
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Net Salary</div>
                      <div className="value">{salary?.net_salary?.toLocaleString() || '-'}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={17} color="#059669" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/employee/salary')} style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600, marginTop: '10px', cursor: 'pointer' }}>
                    View breakdown →
                  </div>
                </div>
              </div>

              {/* Two-column widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ marginBottom: 0 }}>Profile completion</h3>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f766e' }}>{profilePct}%</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>{filledCount} of {personalFields.length} details on file</p>
                  <div style={{ height: '8px', background: '#eaf5f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${profilePct}%`, height: '100%', background: '#0f766e', borderRadius: '5px' }} />
                  </div>
                </div>

                <div className="panel">
                  <h3>Leave balance</h3>
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', marginBottom: '6px' }}>
                      <span>Casual</span><span style={{ fontWeight: 600 }}>{casualLeft} of {balance?.casual_total} left</span>
                    </div>
                    <div style={{ height: '6px', background: '#eaf5f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${balance ? (casualLeft / balance.casual_total) * 100 : 0}%`, height: '100%', background: '#0f766e' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', marginBottom: '6px' }}>
                      <span>Sick</span><span style={{ fontWeight: 600 }}>{sickLeft} of {balance?.sick_total} left</span>
                    </div>
                    <div style={{ height: '6px', background: '#eaf5f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${balance ? (sickLeft / balance.sick_total) * 100 : 0}%`, height: '100%', background: '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent tickets */}
              <div className="panel" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ marginBottom: 0 }}>Recent tickets</h3>
                  <span onClick={() => navigate('/employee/tickets')} style={{ fontSize: '12.5px', color: '#0f766e', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
                </div>
                <table style={{ marginTop: '14px' }}>
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
                    {tickets.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No tickets yet</td></tr>
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

export default EmployeeDashboard;
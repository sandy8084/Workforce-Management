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

function SalaryPay() {
  const user = getUser();
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          api.get('/salaries/me'),
          api.get('/salaries/me/history'),
        ]);
        setCurrent(currentRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee/salary" />

      <div className="main-content">
        <PageHeader title="Salary & Pay">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {loading ? <p>Loading...</p> : !current ? (
            <p style={{ color: '#94a3b8' }}>No salary record found yet. Contact HR.</p>
          ) : (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="label">Basic Salary</div>
                  <div className="value">${Number(current.basic_salary || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">HRA</div>
                  <div className="value">${Number(current.hra || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Net Salary</div>
                  <div className="value">${Number(current.net_salary).toLocaleString()}</div>
                </div>
              </div>

              <div className="panel">
                <h3>Salary History</h3>
                <table>
                  <thead>
                    <tr><th>Effective Date</th><th>Basic</th><th>HRA</th><th>Net Salary</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.effective_date?.slice(0, 10)}</td>
                        <td>${Number(h.basic_salary || 0).toLocaleString()}</td>
                        <td>${Number(h.hra || 0).toLocaleString()}</td>
                        <td><strong>${Number(h.net_salary).toLocaleString()}</strong></td>
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

export default SalaryPay;
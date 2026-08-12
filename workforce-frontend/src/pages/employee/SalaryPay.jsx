import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import { TrendingUp, History } from 'lucide-react';

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

  const basic = Number(current?.basic_salary || 0);
  const hra = Number(current?.hra || 0);
  const net = Number(current?.net_salary || 0);
  const basicPct = net > 0 ? (basic / net) * 100 : 0;
  const hraPct = net > 0 ? (hra / net) * 100 : 0;

  const progressBar = (pct, color) => (
    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
    </div>
  );

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
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ marginBottom: '2px' }}>Pay over time</h3>
                      <p style={{ fontSize: '12.5px', color: '#94a3b8' }}>Net salary at each revision</p>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600,
                      padding: '5px 12px', borderRadius: '20px',
                    }}>
                      <History size={13} /> {history.length} revision{history.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {history.length <= 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                      }}>
                        <TrendingUp size={26} color="#2563eb" />
                      </div>
                      <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Only one revision on record</p>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>A trend appears here after your next salary revision.</p>
                    </div>
                  ) : (
                    <table style={{ marginTop: '16px' }}>
                      <thead>
                        <tr><th>Date</th><th>Net Salary</th></tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id}>
                            <td>{h.effective_date?.slice(0, 10)}</td>
                            <td>${Number(h.net_salary).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="panel">
                  <h3>Pay composition</h3>

                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Basic</span><span style={{ fontWeight: 600 }}>${basic.toLocaleString()}</span>
                    </div>
                    {progressBar(basicPct, '#2563eb')}
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>HRA</span><span style={{ fontWeight: 600 }}>${hra.toLocaleString()}</span>
                    </div>
                    {progressBar(hraPct, '#8b5cf6')}
                  </div>

                  <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #eef0f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Net payable</span>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>${net.toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                      Effective from {current.effective_date?.slice(0, 10)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ marginTop: '20px' }}>
                <h3>Salary history</h3>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>Every revision recorded by HR</p>
                <table>
                  <thead>
                    <tr><th>Effective Date</th><th>Basic</th><th>HRA</th><th>Net Salary</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={h.id}>
                        <td>{h.effective_date?.slice(0, 10)}</td>
                        <td>${Number(h.basic_salary || 0).toLocaleString()}</td>
                        <td>${Number(h.hra || 0).toLocaleString()}</td>
                        <td><strong>${Number(h.net_salary).toLocaleString()}</strong></td>
                        <td>
                          {idx === 0 ? (
                            <span className="badge available">Current</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12.5px' }}>First record</span>
                          )}
                        </td>
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
import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';

const links = [
  { label: 'Dashboard', path: '/hr-dashboard' },
  { label: 'Employees', path: '/hr/employees' },
  { label: 'Departments', path: '/hr/departments' },
  { label: 'Payroll', path: '/hr/payroll' },
  { label: 'Leave Management', path: '/hr/leave' },
  { label: 'My Profile', path: '/hr/my-profile' },
  { label: 'My Salary', path: '/hr/my-salary' },
];

function LeaveManagement() {
  const user = getUser();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (leave_no, status) => {
    try {
      await api.put(`/leaves/${leave_no}/respond`, { status });
      fetchLeaves();
    } catch (err) {
      alert('Failed to update leave request');
    }
  };

  const pending = leaves.filter((l) => l.status === 'Pending');
  const decided = leaves.filter((l) => l.status !== 'Pending');

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/hr/leave" />

      <div className="main-content">
        <PageHeader title="Leave Management">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {loading ? <p>Loading...</p> : (
            <>
              <div className="panel">
                <h3>Pending Requests</h3>
                <table>
                  <thead>
                    <tr><th>Leave No</th><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {pending.map((l) => (
                      <tr key={l.leave_no}>
                        <td>{l.leave_no}</td>
                        <td>{l.full_name}</td>
                        <td>{l.leave_type}</td>
                        <td>{l.from_date?.slice(0, 10)}</td>
                        <td>{l.to_date?.slice(0, 10)}</td>
                        <td>{l.reason}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleDecision(l.leave_no, 'Approved')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>Approve</button>
                            <button onClick={() => handleDecision(l.leave_no, 'Rejected')} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pending.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No pending requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <h3>Past Requests</h3>
                <table>
                  <thead>
                    <tr><th>Leave No</th><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {decided.map((l) => (
                      <tr key={l.leave_no}>
                        <td>{l.leave_no}</td>
                        <td>{l.full_name}</td>
                        <td>{l.leave_type}</td>
                        <td>{l.from_date?.slice(0, 10)}</td>
                        <td>{l.to_date?.slice(0, 10)}</td>
                        <td><span className={`badge ${l.status === 'Approved' ? 'available' : 'retired'}`}>{l.status}</span></td>
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

export default LeaveManagement;
import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
const links = [
  { label: 'Dashboard', path: '/it-dashboard' },
  { label: 'Asset Inventory', path: '/it/assets' },
  { label: 'Assignments', path: '/it/assignments' },
  { label: 'IT Tickets', path: '/it/tickets' },
  { label: 'My Profile', path: '/it/my-profile' },
  { label: 'My Salary', path: '/it/my-salary' },
  { label: 'My Leave', path: '/it/my-leave' },
];

function Assignments() {
  const user = getUser();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assets/assignments/all')
      .then((res) => setAssignments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/it/assignments" />

      <div className="main-content">
        <PageHeader title="Assignments">
          <NotificationBell />
        </PageHeader>
        <div className="page-body">

        <div className="panel">
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr><th>Asset Tag</th><th>Category</th><th>Employee</th><th>Assigned Date</th><th>Returned Date</th></tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.asset_tag}</td>
                    <td>{a.category}</td>
                    <td>{a.employee_name} ({a.employee_id})</td>
                    <td>{a.assigned_date?.slice(0, 10)}</td>
                    <td>{a.returned_date ? a.returned_date.slice(0, 10) : <span className="badge assigned">Active</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default Assignments;
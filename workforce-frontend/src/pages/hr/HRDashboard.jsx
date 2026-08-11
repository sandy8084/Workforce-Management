import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Building2, CalendarClock } from 'lucide-react';

const links = [
  { label: 'Dashboard', path: '/hr-dashboard' },
  { label: 'Employees', path: '/hr/employees' },
  { label: 'Departments', path: '/hr/departments' },
  { label: 'Payroll', path: '/hr/payroll' },
  { label: 'Leave Management', path: '/hr/leave' },
];

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];

function HRDashboard() {
  const user = getUser();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, deptRes, leaveRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments'),
          api.get('/leaves'),
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
        setLeaves(leaveRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = employees.filter((e) => e.status === 'active').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;

  const departmentData = departments.map((dept) => ({
    name: dept.department_name,
    value: employees.filter((e) => e.department_name === dept.department_name).length,
  })).filter((d) => d.value > 0);

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/hr-dashboard" />

      <div className="main-content">
        <PageHeader title="Dashboard">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {loading ? <p>Loading...</p> : (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Total Employees</div>
                      <div className="value">{employees.length}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="#3b82f6" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Active Employees</div>
                      <div className="value">{active}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={18} color="#16a34a" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Departments</div>
                      <div className="value">{departments.length}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} color="#8b5cf6" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Pending Leave Requests</div>
                      <div className="value">{pendingLeaves}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarClock size={18} color="#f59e0b" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <h3>Headcount by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;
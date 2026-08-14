import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Building2, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const links = [
  { label: 'Dashboard', path: '/hr-dashboard' },
  { label: 'Employees', path: '/hr/employees' },
  { label: 'Departments', path: '/hr/departments' },
  { label: 'Payroll', path: '/hr/payroll' },
  { label: 'Leave Management', path: '/hr/leave' },
  { label: 'My Profile', path: '/hr/my-profile' },
  { label: 'My Salary', path: '/hr/my-salary' },
];

const COLORS = ['#2AA79B', '#23897f', '#FFC800', '#0B2A38', '#5C7F93', '#FFD700'];

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
  const navigate = useNavigate();
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
              {/* Welcome banner */}
              <div style={{
                background: 'linear-gradient(140deg, #2AA79B 0%, #1f7a70 55%, #0B2A38 100%)',
                borderRadius: '18px',
                padding: '30px 32px',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 24px 55px rgba(42,167,155,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <h2 style={{ fontSize: '26px', color: 'white', fontWeight: 700, marginBottom: '8px' }}>
                  Welcome, {user?.full_name?.split(' ')[0] || user?.employee_id} 👋
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', marginBottom: 0, maxWidth: '640px' }}>
                  Manage your HR operations. You have {pendingLeaves} pending leave request{pendingLeaves !== 1 ? 's' : ''} to review today.
                </p>
              </div>

              <div className="stat-cards">
                {/* Total Employees - Teal */}
                <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(42,167,155,0.08) 100%)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #2AA79B 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(42,167,155,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(42,167,155,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', top: '0px', right: '0px', width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(42,167,155,0.15), transparent)', borderRadius: '0 0 0 30px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div className="label">Total Employees</div>
                      <div className="value" style={{ background: 'linear-gradient(135deg, #2AA79B, #23897f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '28px', fontWeight: 900 }}>{employees.length}</div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(42,167,155,0.25), rgba(35,137,127,0.15))', boxShadow: '0 8px 20px rgba(42,167,155,0.2)', border: '1px solid rgba(42,167,155,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} color="#2AA79B" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/hr/employees')} style={{ fontSize: '12px', color: '#2AA79B', fontWeight: 600, marginTop: '16px', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
                    View Total employees →
                  </div>
                </div>

                {/* Active Employees - Green */}
                <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(5,150,105,0.08) 100%)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #059669 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '-40px', left: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(5,150,105,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', bottom: '-40px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(5,150,105,0.15), transparent)', borderRadius: '0 30px 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div className="label">Active Employees</div>
                      <div className="value" style={{ background: 'linear-gradient(135deg, #059669, #047857)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '28px', fontWeight: 900 }}>{active}</div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(5,150,105,0.25), rgba(4,120,87,0.15))', boxShadow: '0 8px 20px rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={20} color="#059669" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/hr/employees')} style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '16px', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
                    View Active employees →
                  </div>
                </div>

                {/* Departments - Purple */}
                <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(139,92,246,0.08) 100%)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #8b5cf6 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', bottom: '-40px', left: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), transparent)', borderRadius: '30px 0 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div className="label">Departments</div>
                      <div className="value" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '28px', fontWeight: 900 }}>{departments.length}</div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.15))', boxShadow: '0 8px 20px rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} color="#8b5cf6" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/hr/departments')} style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600, marginTop: '16px', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
                    View Departments →
                  </div>
                </div>

                {/* Leave Requests - Orange */}
                <div className="stat-card" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(255,200,0,0.08) 100%)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #FFC800 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '-40px', left: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(255,200,0,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', bottom: '-40px', right: '-30px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(255,200,0,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(25px)' }} />
                  <div style={{ position: 'absolute', top: '0px', left: '0px', width: '60px', height: '60px', background: 'linear-gradient(135deg, rgba(255,200,0,0.15), transparent)', borderRadius: '0 30px 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div className="label">Leave Requests</div>
                      <div className="value" style={{ background: 'linear-gradient(135deg, #FFC800, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '28px', fontWeight: 900 }}>
                        {pendingLeaves}
                      </div>
                    </div>
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,200,0,0.25), rgba(255,215,0,0.15))', boxShadow: '0 8px 20px rgba(255,200,0,0.2)', border: '1px solid rgba(255,200,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarClock size={20} color="#FFC800" />
                    </div>
                  </div>
                  <div onClick={() => navigate('/hr/leave')} style={{ fontSize: '12px', color: '#FFC800', fontWeight: 600, marginTop: '16px', cursor: 'pointer', position: 'relative', zIndex: 1 }}>
                    View leave requests →
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
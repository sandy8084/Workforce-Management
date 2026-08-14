import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Package,
  UserCheck,
  CheckCircle2,
  Ticket,
  AlertTriangle,
  Wrench,
  Building2,
  IdCard,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const links = [
  { label: 'Dashboard', path: '/it-dashboard' },
  { label: 'Asset Inventory', path: '/it/assets' },
  { label: 'Assignments', path: '/it/assignments' },
  { label: 'IT Tickets', path: '/it/tickets' },
  { label: 'My Profile', path: '/it/my-profile' },
  { label: 'My Salary', path: '/it/my-salary' },
  { label: 'My Leave', path: '/it/my-leave' },
];

const categories = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Headset',
  'Keyboard',
  'Mouse',
  'Webcam',
];

const STATUS_COLORS = {
  Assigned: '#2AA79B',
  Available: '#059669',
  Maintenance: '#FFC800',
  Retired: '#94a3b8',
};

const LOW_STOCK_THRESHOLD = 2;

function ITDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assetsRes, ticketsRes, profileRes] = await Promise.all([
          api.get('/assets'),
          api.get('/tickets'),
          api.get('/employees/me'),
        ]);

        setAssets(assetsRes.data);
        setTickets(ticketsRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const assigned = assets.filter(
    (a) => a.status === 'Assigned'
  ).length;

  const available = assets.filter(
    (a) => a.status === 'Available'
  ).length;

  const openTickets = tickets.filter(
    (t) => t.status === 'Open'
  ).length;

  const statusData = [
    { name: 'Assigned', value: assigned },
    { name: 'Available', value: available },
    {
      name: 'Maintenance',
      value: assets.filter(
        (a) => a.status === 'Maintenance'
      ).length,
    },
    {
      name: 'Retired',
      value: assets.filter(
        (a) => a.status === 'Retired'
      ).length,
    },
  ].filter((d) => d.value > 0);

  const categoryData = categories
    .map((cat) => ({
      name: cat,
      count: assets.filter(
        (a) => a.category === cat
      ).length,
    }))
    .filter((c) => c.count > 0);

  const lowStockCategories = categories
    .map((cat) => ({
      name: cat,
      available: assets.filter(
        (a) =>
          a.category === cat &&
          a.status === 'Available'
      ).length,
    }))
    .filter(
      (c) =>
        c.available <= LOW_STOCK_THRESHOLD &&
        c.available > 0
    );

  const maintenanceAssets = assets.filter(
    (a) => a.status === 'Maintenance'
  );

  const hasAttentionItems =
    lowStockCategories.length > 0 ||
    maintenanceAssets.length > 0;

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const tenureYears = profile?.join_date
    ? Math.floor(
        (new Date() - new Date(profile.join_date)) /
          (1000 * 60 * 60 * 24 * 365)
      )
    : '-';

  return (
    <div className="app-container">
      <Sidebar
        role={user?.role}
        userName={user?.employee_id}
        links={links}
        activeLink="/it-dashboard"
      />

      <div className="main-content">
        <PageHeader title="Dashboard">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* =====================================================
                  Welcome Banner
              ====================================================== */}
              <div
                style={{
                  background:
                    'linear-gradient(140deg, #2AA79B 0%, #1f7a70 55%, #0B2A38 100%)',
                  borderRadius: '18px',
                  padding: '30px 32px',
                  color: 'white',
                  marginBottom: '24px',
                  boxShadow:
                    '0 24px 55px rgba(42,167,155,0.3)',
                  border:
                    '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h2
                  style={{
                    fontSize: '26px',
                    color: 'white',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  {greeting()},{' '}
                  {profile?.full_name?.split(' ')[0] ||
                    user?.employee_id}{' '}
                  👋
                </h2>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.78)',
                    marginBottom: '24px',
                    maxWidth: '640px',
                  }}
                >
                  Manage your IT operations and keep your
                  organization's technology running smoothly
                  today.
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Designation */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        'rgba(255,255,255,0.14)',
                      padding: '9px 16px',
                      borderRadius: '22px',
                      fontSize: '13px',
                      color: 'white',
                      border:
                        '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {profile?.designation || 'IT Support'}
                  </span>

                  {/* Department */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        'rgba(255,255,255,0.14)',
                      padding: '9px 16px',
                      borderRadius: '22px',
                      fontSize: '13px',
                      color: 'white',
                      border:
                        '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Building2 size={14} />
                    {profile?.department_name ||
                      'IT Department'}
                  </span>

                  {/* Employee ID */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        'rgba(255,255,255,0.14)',
                      padding: '9px 16px',
                      borderRadius: '22px',
                      fontSize: '13px',
                      color: 'white',
                      border:
                        '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <IdCard size={14} />
                    {profile?.employee_id ||
                      user?.employee_id}
                  </span>

                  {/* Tenure */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        'rgba(255,255,255,0.14)',
                      padding: '9px 16px',
                      borderRadius: '22px',
                      fontSize: '13px',
                      color: 'white',
                      border:
                        '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <Clock size={14} />
                    {tenureYears} yr with the company
                  </span>
                </div>
              </div>

              {/* =====================================================
                  Stat Cards
                  SAME DECORATION STYLE AS EMPLOYEE DASHBOARD
              ====================================================== */}
              <div className="stat-cards">

                {/* =================================================
                    TOTAL ASSETS - TEAL
                ================================================== */}
                <div
                  className="stat-card"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(235,245,242,0.6) 100%)',
                  }}
                >
                  {/* Top accent bar - SAME AS EMPLOYEE */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background:
                        'linear-gradient(90deg, #2AA79B 0%, transparent 100%)',
                    }}
                  />

                  {/* Decorative blob top-right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-40px',
                      right: '-30px',
                      width: '140px',
                      height: '140px',
                      background:
                        'radial-gradient(circle, rgba(42,167,155,0.25) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(25px)',
                    }}
                  />

                  {/* Decorative blob bottom-left */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-50px',
                      left: '-40px',
                      width: '160px',
                      height: '160px',
                      background:
                        'radial-gradient(circle, rgba(255,200,0,0.15) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* Corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '0px',
                      width: '60px',
                      height: '60px',
                      background:
                        'linear-gradient(135deg, rgba(42,167,155,0.15), transparent)',
                      borderBottomLeftRadius: '60px',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <div className="label">
                        Total Assets
                      </div>

                      <div
                        className="value"
                        style={{
                          background:
                            'linear-gradient(135deg, #0f766e 0%, #2AA79B 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor:
                            'transparent',
                          backgroundClip: 'text',
                          fontSize: '28px',
                          fontWeight: 900,
                        }}
                      >
                        {assets.length}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg, rgba(42,167,155,0.25), rgba(15,118,110,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          '0 8px 20px rgba(42,167,155,0.2)',
                        border:
                          '1px solid rgba(42,167,155,0.3)',
                      }}
                    >
                      <Package
                        size={20}
                        color="#0f766e"
                      />
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      navigate('/it/assets')
                    }
                    style={{
                      fontSize: '12px',
                      color: '#0f766e',
                      fontWeight: 600,
                      marginTop: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    View inventory →
                  </div>
                </div>

                {/* =================================================
                    ASSIGNED - PURPLE
                ================================================== */}
                <div
                  className="stat-card"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(245,240,255,0.6) 100%)',
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background:
                        'linear-gradient(90deg, #8b5cf6 0%, transparent 100%)',
                    }}
                  />

                  {/* Decorative blob top-left */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '-30px',
                      width: '140px',
                      height: '140px',
                      background:
                        'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(25px)',
                    }}
                  />

                  {/* Decorative blob bottom-right */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-50px',
                      right: '-40px',
                      width: '160px',
                      height: '160px',
                      background:
                        'radial-gradient(circle, rgba(42,167,155,0.15) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* Corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      width: '60px',
                      height: '60px',
                      background:
                        'linear-gradient(135deg, rgba(139,92,246,0.15), transparent)',
                      borderBottomRightRadius: '60px',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <div className="label">
                        Assigned
                      </div>

                      <div
                        className="value"
                        style={{
                          background:
                            'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor:
                            'transparent',
                          backgroundClip: 'text',
                          fontSize: '28px',
                          fontWeight: 900,
                        }}
                      >
                        {assigned}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          '0 8px 20px rgba(139,92,246,0.2)',
                        border:
                          '1px solid rgba(139,92,246,0.3)',
                      }}
                    >
                      <UserCheck
                        size={20}
                        color="#7c3aed"
                      />
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      navigate('/it/assignments')
                    }
                    style={{
                      fontSize: '12px',
                      color: '#7c3aed',
                      fontWeight: 600,
                      marginTop: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    View assignments →
                  </div>
                </div>

                {/* =================================================
                    AVAILABLE - GREEN
                ================================================== */}
                <div
                  className="stat-card"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(236,254,245,0.6) 100%)',
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background:
                        'linear-gradient(90deg, #059669 0%, transparent 100%)',
                    }}
                  />

                  {/* Decorative blob top-left */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '-30px',
                      width: '140px',
                      height: '140px',
                      background:
                        'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(25px)',
                    }}
                  />

                  {/* Decorative blob bottom-right */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-50px',
                      right: '-40px',
                      width: '160px',
                      height: '160px',
                      background:
                        'radial-gradient(circle, rgba(255,200,0,0.15) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* Corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      width: '60px',
                      height: '60px',
                      background:
                        'linear-gradient(135deg, rgba(16,185,129,0.15), transparent)',
                      borderBottomRightRadius: '60px',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <div className="label">
                        Available
                      </div>

                      <div
                        className="value"
                        style={{
                          background:
                            'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor:
                            'transparent',
                          backgroundClip: 'text',
                          fontSize: '28px',
                          fontWeight: 900,
                        }}
                      >
                        {available}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          '0 8px 20px rgba(16,185,129,0.2)',
                        border:
                          '1px solid rgba(16,185,129,0.3)',
                      }}
                    >
                      <CheckCircle2
                        size={20}
                        color="#059669"
                      />
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      navigate('/it/assets')
                    }
                    style={{
                      fontSize: '12px',
                      color: '#059669',
                      fontWeight: 600,
                      marginTop: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Browse stock →
                  </div>
                </div>

                {/* =================================================
                    OPEN IT TICKETS - RED
                ================================================== */}
                <div
                  className="stat-card"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(245,249,250,0.95) 0%, rgba(254,242,242,0.6) 100%)',
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background:
                        'linear-gradient(90deg, #dc2626 0%, transparent 100%)',
                    }}
                  />

                  {/* Decorative blob top-right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-40px',
                      right: '-30px',
                      width: '140px',
                      height: '140px',
                      background:
                        'radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(25px)',
                    }}
                  />

                  {/* Decorative blob bottom-left */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-50px',
                      left: '-40px',
                      width: '160px',
                      height: '160px',
                      background:
                        'radial-gradient(circle, rgba(42,167,155,0.15) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* Corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '0px',
                      width: '60px',
                      height: '60px',
                      background:
                        'linear-gradient(135deg, rgba(220,38,38,0.15), transparent)',
                      borderBottomLeftRadius: '60px',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <div className="label">
                        Open IT Tickets
                      </div>

                      <div
                        className="value"
                        style={{
                          background:
                            'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor:
                            'transparent',
                          backgroundClip: 'text',
                          fontSize: '28px',
                          fontWeight: 900,
                        }}
                      >
                        {openTickets}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(239,68,68,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          '0 8px 20px rgba(220,38,38,0.2)',
                        border:
                          '1px solid rgba(220,38,38,0.3)',
                      }}
                    >
                      <Ticket
                        size={20}
                        color="#dc2626"
                      />
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      navigate('/it/tickets')
                    }
                    style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      fontWeight: 600,
                      marginTop: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    View tickets →
                  </div>
                </div>
              </div>

              {/* =====================================================
                  Charts + Needs Attention
              ====================================================== */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: hasAttentionItems
                    ? '1fr 300px'
                    : '1fr',
                  gap: '20px',
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                  }}
                >
                  <div className="panel">
                    <h3>Asset Status Distribution</h3>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {statusData.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  STATUS_COLORS[
                                    entry.name
                                  ]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="panel">
                    <h3>Assets by Category</h3>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <BarChart data={categoryData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#EEF1F6"
                        />

                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          fill="#19A5A0"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {hasAttentionItems && (
                  <div className="panel">
                    <h3>Needs Attention</h3>

                    {lowStockCategories.length > 0 && (
                      <div
                        style={{
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#7C8AA0',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                          }}
                        >
                          Low Stock
                        </div>

                        {lowStockCategories.map((c) => (
                          <div
                            key={c.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 0',
                              fontSize: '13px',
                            }}
                          >
                            <AlertTriangle
                              size={14}
                              color="#D9A800"
                            />

                            <span
                              style={{
                                color: '#0C2350',
                              }}
                            >
                              {c.name}
                            </span>

                            <span
                              style={{
                                marginLeft: 'auto',
                                color: '#7C8AA0',
                                fontSize: '12px',
                              }}
                            >
                              {c.available} left
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {maintenanceAssets.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#7C8AA0',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                          }}
                        >
                          In Maintenance
                        </div>

                        {maintenanceAssets.map((a) => (
                          <div
                            key={a.asset_tag}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 0',
                              fontSize: '13px',
                            }}
                          >
                            <Wrench
                              size={14}
                              color="#0C2350"
                            />

                            <span
                              style={{
                                color: '#0C2350',
                              }}
                            >
                              {a.asset_tag}
                            </span>

                            <span
                              style={{
                                marginLeft: 'auto',
                                color: '#7C8AA0',
                                fontSize: '12px',
                              }}
                            >
                              {a.model || a.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ITDashboard;
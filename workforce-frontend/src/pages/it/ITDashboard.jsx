import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Package, UserCheck, CheckCircle2, Ticket, AlertTriangle, Wrench } from 'lucide-react';

const links = [
  { label: 'Dashboard', path: '/it-dashboard' },
  { label: 'Asset Inventory', path: '/it/assets' },
  { label: 'Assignments', path: '/it/assignments' },
  { label: 'IT Tickets', path: '/it/tickets' },
  { label: 'My Profile', path: '/it/my-profile' },
  { label: 'My Salary', path: '/it/my-salary' },
  { label: 'My Leave', path: '/it/my-leave' },
];

const categories = ['Laptop', 'Desktop', 'Monitor', 'Headset', 'Keyboard', 'Mouse', 'Webcam'];
const STATUS_COLORS = { Assigned: '#3b82f6', Available: '#10b981', Maintenance: '#f59e0b', Retired: '#94a3b8' };
const LOW_STOCK_THRESHOLD = 2;

function ITDashboard() {
  const user = getUser();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assetsRes, ticketsRes] = await Promise.all([
          api.get('/assets'),
          api.get('/tickets'),
        ]);
        setAssets(assetsRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const assigned = assets.filter((a) => a.status === 'Assigned').length;
  const available = assets.filter((a) => a.status === 'Available').length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;

  const statusData = [
    { name: 'Assigned', value: assigned },
    { name: 'Available', value: available },
    { name: 'Maintenance', value: assets.filter((a) => a.status === 'Maintenance').length },
    { name: 'Retired', value: assets.filter((a) => a.status === 'Retired').length },
  ].filter((d) => d.value > 0);

  const categoryData = categories.map((cat) => ({
    name: cat,
    count: assets.filter((a) => a.category === cat).length,
  })).filter((c) => c.count > 0);

  const lowStockCategories = categories
    .map((cat) => ({ name: cat, available: assets.filter((a) => a.category === cat && a.status === 'Available').length }))
    .filter((c) => c.available <= LOW_STOCK_THRESHOLD && c.available > 0);

  const maintenanceAssets = assets.filter((a) => a.status === 'Maintenance');

  const hasAttentionItems = lowStockCategories.length > 0 || maintenanceAssets.length > 0;

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/it-dashboard" />

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
                      <div className="label">Total Assets</div>
                      <div className="value">{assets.length}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={18} color="#3b82f6" />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Assigned</div>
                      <div className="value">{assigned}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={18} color="#6366f1" />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Available</div>
                      <div className="value">{available}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} color="#16a34a" />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="label">Open IT Tickets</div>
                      <div className="value">{openTickets}</div>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={18} color="#f59e0b" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: hasAttentionItems ? '1fr 300px' : '1fr', gap: '20px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div className="panel">
                    <h3>Asset Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="panel">
                    <h3>Assets by Category</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {hasAttentionItems && (
                  <div className="panel">
                    <h3>Needs Attention</h3>

                    {lowStockCategories.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Low Stock</div>
                        {lowStockCategories.map((c) => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                            <AlertTriangle size={14} color="#f59e0b" />
                            <span style={{ color: '#334155' }}>{c.name}</span>
                            <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '12px' }}>{c.available} left</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {maintenanceAssets.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>In Maintenance</div>
                        {maintenanceAssets.map((a) => (
                          <div key={a.asset_tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                            <Wrench size={14} color="#64748b" />
                            <span style={{ color: '#334155' }}>{a.asset_tag}</span>
                            <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '12px' }}>{a.model || a.category}</span>
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
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

const categoryIcons = {
  Laptop: '💻', Desktop: '🖥️', Monitor: '🖥️', Headset: '🎧', Keyboard: '⌨️', Mouse: '🖱️', Webcam: '📷',
};

function MyAssets() {
  const user = getUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assets/me').then((res) => setAssets(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/employee/assets" />

      <div className="main-content">
        <PageHeader title="My Assets">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {loading ? <p>Loading...</p> : assets.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No assets assigned to you yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {assets.map((asset) => (
                <div className="panel" key={asset.asset_tag}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{categoryIcons[asset.category] || '📦'}</div>
                  <h3>{asset.category}</h3>
                  <span className={`badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
                  <table style={{ marginTop: '15px' }}>
                    <tbody>
                      <tr><td><strong>Asset Tag</strong></td><td>{asset.asset_tag}</td></tr>
                      <tr><td><strong>Model</strong></td><td>{asset.model || '-'}</td></tr>
                      <tr><td><strong>Serial No.</strong></td><td>{asset.serial_number || '-'}</td></tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAssets;
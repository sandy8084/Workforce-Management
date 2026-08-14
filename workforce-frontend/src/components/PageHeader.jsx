import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { UserRound } from 'lucide-react';

function PageHeader({ title, children }) {
  const user = getUser();
  const navigate = useNavigate();
  const displayName = user?.full_name || user?.employee_id || '?';
  const initial = displayName.charAt(0).toUpperCase();

  const getProfilePath = () => {
    if (user?.role === 'HR') return '/hr/my-profile';
    if (user?.role === 'ITADMIN') return '/it/my-profile';
    return '/employee/profile';
  };

  const renderAvatarContent = () => {
    if (user?.gender === 'Male' || user?.gender === 'Female') {
      return <UserRound size={17} color="white" fill="white" strokeWidth={1} />;
    }
    return initial;
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="top-header">
      <div className="page-title-block">
        <div className="breadcrumb">Workspace / <span>{title}</span></div>
        <div className="page-title">{title}</div>
      </div>
      <div className="top-header-right">
        <div style={{ textAlign: 'right', marginRight: '4px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0B2A38' }}>{dateStr}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{timeStr}</div>
        </div>
        {children}
        <div
          className="header-avatar"
          onClick={() => navigate(getProfilePath())}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {renderAvatarContent()}
        </div>
        <div className="header-user-info">
          <div className="name">{displayName}</div>
          <div className="id">{user?.employee_id}</div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
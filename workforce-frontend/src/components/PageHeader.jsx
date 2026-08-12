import { getUser } from '../utils/auth';
import { Search } from 'lucide-react';

function PageHeader({ title, children }) {
  const user = getUser();
  const displayName = user?.full_name || user?.employee_id || '?';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="top-header">
      <div className="page-title">{title}</div>
      <div className="top-header-right">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '9px', padding: '8px 12px', width: '260px',
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            placeholder="Search Workforce..."
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', flex: 1, color: '#334155' }}
          />
          <span style={{
            fontSize: '10.5px', color: '#94a3b8', background: 'white',
            border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 7px', fontWeight: 600,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Ctrl K
          </span>
        </div>
        {children}
        <div className="header-avatar">{initial}</div>
        <div className="header-user-info">
          <div className="name">{displayName}</div>
          <div className="id">{user?.employee_id}</div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
import { getUser } from '../utils/auth';

function PageHeader({ title, children }) {
  const user = getUser();
  const initial = user?.employee_id ? user.employee_id.charAt(0).toUpperCase() : '?';

  return (
    <div className="top-header">
      <div className="page-title">{title}</div>
      <div className="top-header-right">
        {children}
        <div className="header-avatar">{initial}</div>
        <div className="header-user-info">
          <div className="name">{user?.employee_id}</div>
          <div className="id">{user?.role}</div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
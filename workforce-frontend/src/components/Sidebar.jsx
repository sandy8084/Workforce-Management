import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import {
  LayoutDashboard, Users, Building2, Ticket, CalendarDays, Wallet,
  Package, ClipboardList, UserCircle, LogOut,
} from 'lucide-react';

const iconMap = {
  'Dashboard': LayoutDashboard,
  'Employees': Users,
  'Departments': Building2,
  'HR Tickets': Ticket,
  'Payroll': Wallet,
  'Leave Management': CalendarDays,
  'Asset Inventory': Package,
  'Assignments': ClipboardList,
  'IT Tickets': Ticket,
  'My Profile': UserCircle,
  'Salary & Pay': Wallet,
  'My Salary': Wallet,
  'My Assets': Package,
  'My Tickets': Ticket,
  'Leave': CalendarDays,
  'My Leave': CalendarDays,
};

function Sidebar({ role, links, activeLink }) {
  const navigate = useNavigate();
  const user = getUser();
  const displayName = user?.full_name || user?.employee_id || '?';
  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel = role === 'HR' ? 'Human Resources' : role === 'ITADMIN' ? 'IT Administrator' : 'Employee';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-icon">W</div>
        <div>
          <h3>WORKFORCE</h3>
          <span>Management System</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initial}</div>
        <div>
          <div className="name">{displayName}</div>
          <div className="role">{roleLabel}</div>
        </div>
      </div>

      {links.map((link) => {
        const Icon = iconMap[link.label] || LayoutDashboard;
        return (
          <div
            key={link.path}
            className={`sidebar-link ${activeLink === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <Icon size={17} />
            {link.label}
          </div>
        );
      })}

      <div className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} />
        Logout
      </div>
    </div>
  );
}

export default Sidebar;
import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';
import {
  LayoutDashboard, Users, Building2, Ticket, CalendarDays, Wallet,
  Package, ClipboardList, UserCircle, LogOut, ChevronLeft, ChevronRight,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { CircleUserRound } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(false);
  const displayName = user?.full_name || user?.employee_id || '?';
  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel = role === 'HR' ? 'Human Resources' : role === 'ITADMIN' ? 'IT Administrator' : 'Employee';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderAvatarContent = () => {
    if (user?.gender === 'Male' || user?.gender === 'Female') {
      return <UserRound size={20} color="white" fill="white" strokeWidth={1} />;
    }
    return initial;
  };

  return (
    <div className="sidebar" style={{ width: collapsed ? '76px' : '216px', position: 'relative', transition: 'width 0.15s ease' }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: '20px', right: '-13px', width: '26px', height: '26px',
          borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)', zIndex: 60,
        }}
      >
        {collapsed ? <ChevronRight size={14} color="#0284c7" /> : <ChevronLeft size={14} color="#0284c7" />}
      </div>

      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div className="sidebar-header-icon">W</div>
        {!collapsed && (
          <div>
            <h3>WORKFORCE</h3>
            <span>Management System</span>
          </div>
        )}
      </div>

      <div className="sidebar-user" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div className="sidebar-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderAvatarContent()}
        </div>
        {!collapsed && (
          <div>
            <div className="name">{displayName}</div>
            <div className="role">{roleLabel}</div>
          </div>
        )}
      </div>

      {links.map((link) => {
        const Icon = iconMap[link.label] || LayoutDashboard;
        return (
          <div
            key={link.path}
            className={`sidebar-link ${activeLink === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
            title={collapsed ? link.label : ''}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Icon size={17} />
            {!collapsed && link.label}
          </div>
        );
      })}

      <div className="sidebar-logout" onClick={handleLogout} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }} title={collapsed ? 'Logout' : ''}>
        <LogOut size={16} />
        {!collapsed && 'Logout'}
      </div>
    </div>
  );
}

export default Sidebar;
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';


function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTargetPath = (notif) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ticketNo = notif.ticket_no || '';

    if (ticketNo.startsWith('LV-')) {
      if (user.role === 'HR') return '/hr/leave';
      if (user.role === 'ITADMIN') return '/it/my-leave';
      return '/employee/leave';
    }
    if (ticketNo.startsWith('TKT-')) {
      if (user.role === 'ITADMIN') return '/it/tickets';
      return '/employee/tickets';
    }
    return null;
  };

  const handleNotificationClick = (n) => {
    handleMarkRead(n.id);
    const path = getTargetPath(n);
    if (path) {
      navigate(path);
      setOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer',
          fontSize: '20px',
          position: 'relative',
          padding: '8px',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#dc2626',
              color: 'white',
              fontSize: '10px',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
            {notifications.length > 0 && (
              <span onClick={handleClearAll} style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}>
                Clear all
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: n.is_read ? 'white' : '#eff6ff',
                  fontSize: '13px',
                  color: '#334155',
                }}
              >
                {n.message}
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
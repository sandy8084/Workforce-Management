import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
const links = [
  { label: 'Dashboard', path: '/it-dashboard' },
  { label: 'Asset Inventory', path: '/it/assets' },
  { label: 'Assignments', path: '/it/assignments' },
  { label: 'IT Tickets', path: '/it/tickets' },
  { label: 'My Profile', path: '/it/my-profile' },
  { label: 'My Salary', path: '/it/my-salary' },
  { label: 'My Leave', path: '/it/my-leave' },
];

function ITTickets() {
  const user = getUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const hardwareTickets = tickets.filter((t) => t.ticket_type === 'Hardware');
  const softwareTickets = tickets.filter((t) => t.ticket_type === 'Software');
  const accessTickets = tickets.filter((t) => t.ticket_type === 'Access');

  const handleReplyChange = (ticket_no, value) => {
    setReplyDrafts({ ...replyDrafts, [ticket_no]: value });
  };

  const handleReplySubmit = async (ticket_no) => {
    const reply = replyDrafts[ticket_no];
    if (!reply) return;
    try {
      await api.put(`/tickets/${ticket_no}/respond`, { status: 'Resolved', hr_reply: reply });
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply');
    }
  };
  const handleSendToMaintenance = async (ticket) => {
    if (!ticket.asset_tag) return;
    if (!window.confirm(`Mark asset ${ticket.asset_tag} as Maintenance and close this ticket?`)) return;
    try {
      await api.put(`/assets/${ticket.asset_tag}`, {
        category: ticket.asset_category,
        status: 'Maintenance',
        assigned_to: null,
      });
      await api.put(`/tickets/${ticket.ticket_no}/respond`, {
        status: 'Resolved',
        hr_reply: `Asset ${ticket.asset_tag} sent for maintenance.`,
      });
      fetchTickets();
    } catch (err) {
      alert('Failed to update asset/ticket status');
    }
  };
  const renderPanel = (title, list, showAssetActions) => (
    <div className="panel">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>Ticket No</th><th>Employee</th>
            {showAssetActions && <th>Asset</th>}
            <th>Subject</th><th>Priority</th><th>Status</th><th>Reply</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.ticket_no}>
              <td>{t.ticket_no}</td>
              <td>{t.raised_by_name}</td>
              {showAssetActions && (
                <td>
                  {t.asset_tag ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.asset_tag}</div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{t.asset_model || t.asset_category}</div>
                      {t.status !== 'Resolved' && (
                        <button onClick={() => handleSendToMaintenance(t)} style={{ marginTop: '4px', padding: '4px 8px', fontSize: '11px', border: '1px solid #e2e8f0', borderRadius: '5px', background: 'white', cursor: 'pointer' }}>
                          Send to Maintenance
                        </button>
                      )}
                    </div>
                  ) : '-'}
                </td>
              )}
              <td>{t.subject}</td>
              <td>{t.priority}</td>
              <td><span className={`badge ${t.status === 'Resolved' ? 'available' : 'assigned'}`}>{t.status}</span></td>
              <td>
                {t.status === 'Resolved' ? (
                  t.hr_reply
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      placeholder="Type a reply..."
                      value={replyDrafts[t.ticket_no] || ''}
                      onChange={(e) => handleReplyChange(t.ticket_no, e.target.value)}
                      style={{ padding: '6px', flex: 1 }}
                    />
                    <button onClick={() => handleReplySubmit(t.ticket_no)} className="btn-primary" style={{ padding: '6px 12px' }}>Send</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={showAssetActions ? 7 : 6} style={{ textAlign: 'center', color: '#94a3b8' }}>No tickets</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/it/tickets" />

      <div className="main-content">
        <PageHeader title="IT Tickets">
          <NotificationBell />
        </PageHeader>
        <div className="page-body">

        {loading ? <p>Loading...</p> : (
          <>
            {renderPanel('Hardware Issues', hardwareTickets, true)}
            {renderPanel('Software Issues', softwareTickets, true)}
            {renderPanel('Access Requests', accessTickets, false)}
          </>
        )}
      </div>
    </div>
  </div>
  );
}

export default ITTickets;
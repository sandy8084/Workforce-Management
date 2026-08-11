import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import { Trash2, Pencil } from 'lucide-react';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const links = [
  { label: 'Dashboard', path: '/hr-dashboard' },
  { label: 'Employees', path: '/hr/employees' },
  { label: 'Departments', path: '/hr/departments' },
  { label: 'Payroll', path: '/hr/payroll' },
  { label: 'Leave Management', path: '/hr/leave' },
];

function Departments() {
  const user = getUser();
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptName, setDeptName] = useState('');
  const [formError, setFormError] = useState('');
  const [renamingDept, setRenamingDept] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const countFor = (deptName) => employees.filter((e) => e.department_name === deptName).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/departments', { department_name: deptName });
      showToast('Department added successfully!');
      setDeptName('');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add department');
    }
  };

  const confirmDeleteDept = async () => {
    try {
      await api.delete(`/departments/${confirmDelete}`);
      showToast('Department deleted');
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete department', 'error');
      setConfirmDelete(null);
    }
  };

  const startRename = (name) => {
    setRenamingDept(name);
    setRenameValue(name);
  };

  const submitRename = async (oldName) => {
    if (!renameValue || renameValue === oldName) {
      setRenamingDept(null);
      return;
    }
    try {
      await api.put(`/departments/${oldName}`, { new_name: renameValue });
      setRenamingDept(null);
      showToast('Department renamed successfully');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to rename department', 'error');
    }
  };

  const largestDept = departments.reduce((max, d) => {
    const count = countFor(d.department_name);
    return count > (max.count || 0) ? { name: d.department_name, count } : max;
  }, {});

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/hr/departments" />

      <div className="main-content">
        <PageHeader title="Departments">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {!loading && (
            <div className="stat-cards">
              <div className="stat-card">
                <div className="label">Total Departments</div>
                <div className="value">{departments.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Total Employees</div>
                <div className="value">{employees.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Largest Department</div>
                <div className="value" style={{ fontSize: '18px' }}>{largestDept.name || '-'} {largestDept.count ? `(${largestDept.count})` : ''}</div>
              </div>
            </div>
          )}

          <div className="panel">
            <h3>Add Department</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <input placeholder="Department Name (e.g. Marketing)" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
              <button type="submit" className="btn-primary">Add Department</button>
            </form>
            {formError && <p className="error-text">{formError}</p>}
          </div>

          <div className="panel">
            {loading ? <Spinner /> : departments.length === 0 ? (
              <div className="empty-state">No departments yet.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Department Name</th><th>Employees</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.department_name}>
                      <td>
                        {renamingDept === d.department_name ? (
                          <input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => submitRename(d.department_name)}
                            onKeyDown={(e) => e.key === 'Enter' && submitRename(d.department_name)}
                            autoFocus
                            style={{ padding: '6px 8px' }}
                          />
                        ) : (
                          d.department_name
                        )}
                      </td>
                      <td><span className="badge assigned">{countFor(d.department_name)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => startRename(d.department_name)} title="Rename" style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pencil size={15} color="#475569" />
                          </button>
                          <button onClick={() => setConfirmDelete(d.department_name)} title="Delete" style={{ padding: '6px', border: 'none', borderRadius: '6px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={15} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Department"
        message={`Delete department "${confirmDelete}"? This cannot be undone.`}
        danger
        onConfirm={confirmDeleteDept}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

export default Departments;
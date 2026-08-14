import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import Sidebar from '../../components/Sidebar';
import PageHeader from '../../components/PageHeader';
import NotificationBell from '../../components/NotificationBell';

const links = [
  { label: 'Dashboard', path: '/hr-dashboard' },
  { label: 'Employees', path: '/hr/employees' },
  { label: 'Departments', path: '/hr/departments' },
  { label: 'Payroll', path: '/hr/payroll' },
  { label: 'Leave Management', path: '/hr/leave' },
  { label: 'My Profile', path: '/hr/my-profile' },
  { label: 'My Salary', path: '/hr/my-salary' },
];

const emptyForm = { employee_id: '', basic_salary: '', hra: '', effective_date: '' };

function Payroll() {
  const user = getUser();
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [salRes, empRes] = await Promise.all([
        api.get('/salaries/all/current'),
        api.get('/employees'),
      ]);
      setSalaries(salRes.data);
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddForm = () => {
    setEditingRowId(null);
    setFormData(emptyForm);
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setEditingRowId(s.id);
    setFormData({
      employee_id: s.employee_id,
      basic_salary: s.basic_salary,
      hra: s.hra,
      effective_date: s.effective_date ? s.effective_date.slice(0, 10) : '',
    });
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      if (editingRowId) {
        await api.put(`/salaries/${editingRowId}`, formData);
        setFormSuccess('Salary entry updated!');
      } else {
        await api.post('/salaries', formData);
        setFormSuccess('Salary entry added!');
      }
      setFormData(emptyForm);
      setShowForm(false);
      setEditingRowId(null);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save salary entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary entry?')) return;
    try {
      await api.delete(`/salaries/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete salary entry');
    }
  };

  const viewHistory = async (employee_id) => {
    try {
      const res = await api.get(`/salaries/${employee_id}`);
      setSelectedHistory({ employee_id, history: res.data });
    } catch (err) {
      alert('Failed to load salary history');
    }
  };

  const fieldLabel = { fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' };

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/hr/payroll" />

      <div className="main-content">
        <PageHeader title="Payroll Overview">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
            <button className="btn-primary" onClick={showForm && !editingRowId ? () => setShowForm(false) : openAddForm}>
              {showForm && !editingRowId ? 'Cancel' : '+ Add Salary Entry'}
            </button>
          </div>

          {showForm && (
            <div className="panel">
              <h3>{editingRowId ? 'Edit Salary Entry' : 'Add Salary Entry'}</h3>
              <form onSubmit={handleSubmit} className="form-grid">
                <div>
                  <label style={fieldLabel}>Employee</label>
                  <select name="employee_id" value={formData.employee_id} onChange={handleChange} required disabled={!!editingRowId} style={{ width: '100%' }}>
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={fieldLabel}>Basic Salary</label>
                  <input name="basic_salary" type="number" value={formData.basic_salary} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={fieldLabel}>HRA</label>
                  <input name="hra" type="number" value={formData.hra} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={fieldLabel}>Effective Date</label>
                  <input name="effective_date" type="date" value={formData.effective_date} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'end' }}>
                  {editingRowId ? 'Save Changes' : 'Add Entry'}
                </button>
              </form>
              {formError && <p className="error-text">{formError}</p>}
              {formSuccess && <p className="success-text">{formSuccess}</p>}
            </div>
          )}

          <div className="panel">
            {loading ? <p>Loading...</p> : (
              <table>
                <thead>
                  <tr><th>Employee</th><th>Department</th><th>Basic</th><th>HRA</th><th>Net Salary</th><th>Effective Since</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {salaries.map((s) => (
                    <tr key={s.employee_id} onClick={() => viewHistory(s.employee_id)} style={{ cursor: 'pointer' }}>
                      <td>{s.full_name}</td>
                      <td>{s.department_name}</td>
                      <td>${Number(s.basic_salary).toLocaleString()}</td>
                      <td>${Number(s.hra).toLocaleString()}</td>
                      <td><strong>${Number(s.net_salary).toLocaleString()}</strong></td>
                      <td>{s.effective_date?.slice(0, 10)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEditForm(s)} title="Edit" style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pencil size={15} color="#475569" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} title="Delete" style={{ padding: '6px', border: 'none', borderRadius: '6px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {selectedHistory && (
        <div
          onClick={() => setSelectedHistory(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '460px', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Salary History — {selectedHistory.employee_id}</h3>
              <button onClick={() => setSelectedHistory(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
            </div>
            <table>
              <thead>
                <tr><th>Date</th><th>Basic</th><th>HRA</th><th>Net</th></tr>
              </thead>
              <tbody>
                {selectedHistory.history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.effective_date?.slice(0, 10)}</td>
                    <td>${Number(h.basic_salary || 0).toLocaleString()}</td>
                    <td>${Number(h.hra || 0).toLocaleString()}</td>
                    <td><strong>${Number(h.net_salary).toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;
import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import { Pencil, UserX, UserCheck } from 'lucide-react';
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

const emptyForm = {
  full_name: '', email: '', role: 'EMPLOYEE', department_name: '', designation: '', phone: '', join_date: '', status: 'active', exit_date: '',
};

const avatarColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'];

const getAvatarColor = (id) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
};

function Employees() {
  const user = getUser();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [confirmToggle, setConfirmToggle] = useState(null); // holds employee object being toggled

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (emp) => {
    setEditingId(emp.employee_id);
    setFormData({
      full_name: emp.full_name,
      email: emp.email,
      role: emp.role,
      department_name: emp.department_name,
      designation: emp.designation,
      phone: emp.phone || '',
      join_date: emp.join_date ? emp.join_date.slice(0, 10) : '',
      status: emp.status,
      exit_date: emp.exit_date ? emp.exit_date.slice(0, 10) : '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData);
        showToast('Employee updated successfully!');
      } else {
        const response = await api.post('/employees', formData);
        showToast(response.data.message);
      }
      setFormData(emptyForm);
      setShowForm(false);
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const confirmToggleStatus = async () => {
    const emp = confirmToggle;
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/employees/${emp.employee_id}`, {
        full_name: emp.full_name,
        department_name: emp.department_name,
        designation: emp.designation,
        phone: emp.phone,
        status: newStatus,
        exit_date: newStatus === 'inactive' ? new Date().toISOString().slice(0, 10) : null,
      });
      showToast(newStatus === 'inactive' ? `${emp.full_name} deactivated` : `${emp.full_name} reactivated`);
      setConfirmToggle(null);
      fetchEmployees();
    } catch (err) {
      showToast('Failed to update status', 'error');
      setConfirmToggle(null);
    }
  };

  const viewEmployee = async (employee_id) => {
    try {
      const res = await api.get(`/employees/${employee_id}`);
      setSelectedEmployee(res.data);
    } catch (err) {
      showToast('Failed to load employee details', 'error');
    }
  };

  const fieldLabel = { fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '4px' };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.department_name === filterDept;
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/hr/employees" />

      <div className="main-content">
        <PageHeader title="Employees">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
              <input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px' }}
              />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px' }}
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d.department_name} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px' }}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {showForm && !editingId ? (
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            ) : (
              <button className="btn-primary" onClick={openAddForm}>+ Add Employee</button>
            )}
          </div>

          {showForm && (
            <div
              onClick={() => setShowForm(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250 }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 'min(760px, calc(100% - 38px))',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: 'white',
                  borderRadius: '24px',
                  padding: '28px 32px',
                  boxShadow: '0 32px 80px rgba(15, 23, 42, 0.18)',
                  border: '1px solid rgba(15, 118, 110, 0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', marginBottom: '22px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f2a24' }}>
                      {editingId ? `Edit Employee — ${editingId}` : 'Add New Employee'}
                    </h3>
                    <p style={{ margin: '8px 0 0', color: '#52616d', fontSize: '14px' }}>
                      {editingId ? 'Update the employee record and save your changes.' : 'Add a new employee to the workforce system.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      border: 'none',
                      background: 'rgba(15, 23, 42, 0.06)',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#475569',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="form-grid" style={{ gap: '18px', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))' }}>
                  <div>
                    <label style={fieldLabel}>Full Name</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!!editingId} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} disabled={!!editingId} style={{ width: '100%' }}>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="HR">HR</option>
                      <option value="ITADMIN">IT Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>Department</label>
                    <select name="department_name" value={formData.department_name} onChange={handleChange} required style={{ width: '100%' }}>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.department_name} value={dept.department_name}>{dept.department_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>Designation</label>
                    <input name="designation" value={formData.designation} onChange={handleChange} required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                  {!editingId && (
                    <div>
                      <label style={fieldLabel}>Join Date</label>
                      <input name="join_date" type="date" value={formData.join_date} onChange={handleChange} required style={{ width: '100%' }} />
                    </div>
                  )}
                  {editingId && (
                    <>
                      <div>
                        <label style={fieldLabel}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%' }}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      {formData.status === 'inactive' && (
                        <div>
                          <label style={fieldLabel}>Exit Date</label>
                          <input name="exit_date" type="date" value={formData.exit_date} onChange={handleChange} style={{ width: '100%' }} />
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ minWidth: '120px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ minWidth: '150px' }}>
                      {editingId ? 'Save Changes' : 'Add Employee'}
                    </button>
                  </div>
                </form>
                {formError && <p className="error-text" style={{ marginTop: '18px' }}>{formError}</p>}
              </div>
            </div>
          )}

          <div className="panel">
            {loading ? <Spinner /> : filteredEmployees.length === 0 ? (
              <div className="empty-state">No employees found.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Employee</th><th>Department</th><th>Designation</th><th>Email</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id} onClick={() => viewEmployee(emp.employee_id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: getAvatarColor(emp.employee_id),
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {getInitials(emp.full_name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.full_name}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department_name}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.email}</td>
                      <td><span className={`badge ${emp.status === 'active' ? 'available' : 'retired'}`}>{emp.status}</span></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEditForm(emp)} title="Edit" style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pencil size={15} color="#475569" />
                          </button>
                          {emp.status === 'active' ? (
                            <button onClick={() => setConfirmToggle(emp)} title="Deactivate" style={{ padding: '6px', border: 'none', borderRadius: '6px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <UserX size={15} color="#dc2626" />
                            </button>
                          ) : (
                            <button onClick={() => setConfirmToggle(emp)} title="Reactivate" style={{ padding: '6px', border: 'none', borderRadius: '6px', background: '#dcfce7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <UserCheck size={15} color="#166534" />
                            </button>
                          )}
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

      {selectedEmployee && (
        <div
          onClick={() => setSelectedEmployee(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '480px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{selectedEmployee.full_name}</h3>
              <button onClick={() => setSelectedEmployee(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>×</button>
            </div>
            <span className={`badge ${selectedEmployee.status === 'active' ? 'available' : 'retired'}`}>{selectedEmployee.status}</span>

            <h4 style={{ marginTop: '18px', marginBottom: '8px', color: '#0f172a', fontSize: '14px' }}>Work Details</h4>
            <table>
              <tbody>
                <tr><td><strong>Employee ID</strong></td><td>{selectedEmployee.employee_id}</td></tr>
                <tr><td><strong>Email</strong></td><td>{selectedEmployee.email}</td></tr>
                <tr><td><strong>Department</strong></td><td>{selectedEmployee.department_name}</td></tr>
                <tr><td><strong>Designation</strong></td><td>{selectedEmployee.designation}</td></tr>
                <tr><td><strong>Join Date</strong></td><td>{selectedEmployee.join_date?.slice(0, 10)}</td></tr>
                {selectedEmployee.exit_date && (
                  <tr><td><strong>Exit Date</strong></td><td>{selectedEmployee.exit_date?.slice(0, 10)}</td></tr>
                )}
              </tbody>
            </table>

            <h4 style={{ marginTop: '18px', marginBottom: '8px', color: '#0f172a', fontSize: '14px' }}>Personal Details</h4>
            <table>
              <tbody>
                <tr><td><strong>Phone</strong></td><td>{selectedEmployee.phone || '-'}</td></tr>
                <tr><td><strong>Date of Birth</strong></td><td>{selectedEmployee.date_of_birth?.slice(0, 10) || '-'}</td></tr>
                <tr><td><strong>Gender</strong></td><td>{selectedEmployee.gender || '-'}</td></tr>
                <tr><td><strong>Blood Group</strong></td><td>{selectedEmployee.blood_group || '-'}</td></tr>
                <tr><td><strong>Address</strong></td><td>{selectedEmployee.address || '-'}</td></tr>
                <tr><td><strong>Emergency Contact</strong></td><td>{selectedEmployee.emergency_contact_name || '-'} {selectedEmployee.emergency_contact_phone ? `(${selectedEmployee.emergency_contact_phone})` : ''}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmToggle}
        title={confirmToggle?.status === 'active' ? 'Deactivate Employee' : 'Reactivate Employee'}
        message={
          confirmToggle?.status === 'active'
            ? `Deactivate ${confirmToggle?.full_name}? They will lose login access, but all records stay intact.`
            : `Reactivate ${confirmToggle?.full_name}? They will regain login access.`
        }
        danger={confirmToggle?.status === 'active'}
        onConfirm={confirmToggleStatus}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}

export default Employees;
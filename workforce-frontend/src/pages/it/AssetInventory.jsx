import { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import { Trash2 } from 'lucide-react';
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

const categories = ['Laptop', 'Desktop', 'Monitor', 'Headset', 'Keyboard', 'Mouse', 'Webcam'];

const categoryIcons = {
  Laptop: '💻', Desktop: '🖥️', Monitor: '🖥️', Headset: '🎧', Keyboard: '⌨️', Mouse: '🖱️', Webcam: '📷',
};

function AssetInventory() {
  const user = getUser();
  const [assets, setAssets] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'stock'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningTag, setAssigningTag] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    category: 'Laptop', model: '', serial_number: '', status: 'Available', assigned_to: '',
  });

  const fetchData = async () => {
    try {
      const [assetsRes, stockRes] = await Promise.all([
        api.get('/assets'),
        api.get('/assets/stock/summary'),
      ]);
      setAssets(assetsRes.data);
      setStock(stockRes.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const response = await api.post('/assets', formData);
      setFormSuccess(response.data.message);
      setFormData({ category: 'Laptop', model: '', serial_number: '', status: 'Available', assigned_to: '' });
      fetchData();
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add asset');
    }
  };

  const handleDelete = async (tag) => {
    if (!window.confirm(`Delete asset ${tag}?`)) return;
    try {
      await api.delete(`/assets/${tag}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const handleAssign = async (tag) => {
    if (!assignTo) return;
    try {
      const asset = assets.find((a) => a.asset_tag === tag);
      await api.put(`/assets/${tag}`, { category: asset.category, status: 'Assigned', assigned_to: assignTo });
      setAssigningTag(null);
      setAssignTo('');
      fetchData();
    } catch (err) {
      alert('Failed to assign asset');
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesSearch =
      a.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && a.status !== 'Assigned';
  });
  const handleRetrieve = async (asset) => {
    if (!window.confirm(`Retrieve ${asset.asset_tag} from ${asset.assigned_to_name}?`)) return;
    try {
      await api.put(`/assets/${asset.asset_tag}`, { category: asset.category, status: 'Available', assigned_to: null });
      fetchData();
    } catch (err) {
      alert('Failed to retrieve asset');
    }
  };
  const categoryAssets = selectedCategory ? assets.filter((a) => a.category === selectedCategory) : [];

  return (
    <div className="app-container">
      <Sidebar role={user?.role} userName={user?.employee_id} links={links} activeLink="/it/assets" />

      <div className="main-content">
        <PageHeader title="Asset Inventory">
          <NotificationBell />
        </PageHeader>

        <div className="page-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #f1f5f9' }}>
            <div
              onClick={() => { setActiveTab('inventory'); setSelectedCategory(null); }}
              style={{
                padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px',
                color: activeTab === 'inventory' ? '#3b82f6' : '#94a3b8',
                borderBottom: activeTab === 'inventory' ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              Inventory
            </div>
            <div
              onClick={() => setActiveTab('stock')}
              style={{
                padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px',
                color: activeTab === 'stock' ? '#3b82f6' : '#94a3b8',
                borderBottom: activeTab === 'stock' ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              Stock
            </div>
          </div>

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <>
              {!selectedCategory ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                  {stock.map((s) => (
                    <div
                      key={s.category}
                      className="panel"
                      onClick={() => setSelectedCategory(s.category)}
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{categoryIcons[s.category]}</div>
                      <h3 style={{ marginBottom: '4px' }}>{s.category}</h3>
                      <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{s.total}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {s.available} available · {s.assigned} assigned
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3>{categoryIcons[selectedCategory]} {selectedCategory} ({categoryAssets.length})</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={categoryStatusFilter}
                        onChange={(e) => setCategoryStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                      </select>
                      <button onClick={() => setSelectedCategory(null)} style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '12.5px' }}>← Back</button>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr><th>Asset Tag</th><th>Model</th><th>Serial No.</th><th>Status</th><th>Assigned To</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {categoryAssets
                        .filter((a) => categoryStatusFilter === 'All' || a.status === categoryStatusFilter)
                        .map((a) => (
                          <tr key={a.asset_tag}>
                            <td>{a.asset_tag}</td>
                            <td>{a.model || '-'}</td>
                            <td>{a.serial_number || '-'}</td>
                            <td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                            <td>{a.assigned_to_name ? `${a.assigned_to_name} (${a.assigned_to})` : '-'}</td>
                            <td>
                              {a.status === 'Assigned' && (
                                <button onClick={() => handleRetrieve(a)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                  Retrieve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* STOCK TAB */}
          {activeTab === 'stock' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
                  <input
                    placeholder="Search tag, model, serial no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px' }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : '+ Add Asset'}
                </button>
              </div>

              {showForm && (
                <div className="panel">
                  <h3>Add New Asset</h3>
                  <form onSubmit={handleSubmit} className="form-grid">
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input name="model" placeholder="Model (e.g. Dell XPS 15 9520)" value={formData.model} onChange={handleChange} required />
                    <input name="serial_number" placeholder="Serial Number" value={formData.serial_number} onChange={handleChange} required />
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option>Available</option><option>Assigned</option><option>Maintenance</option><option>Retired</option>
                    </select>
                    <input name="assigned_to" placeholder="Employee ID (optional)" value={formData.assigned_to} onChange={handleChange} />
                    <button type="submit" className="btn-primary">Add Asset</button>
                  </form>
                  {formError && <p className="error-text">{formError}</p>}
                  {formSuccess && <p className="success-text">{formSuccess}</p>}
                </div>
              )}

              <div className="panel">
                {loading ? <p>Loading...</p> : (
                  <table>
                    <thead>
                      <tr><th>Asset Tag</th><th>Category</th><th>Model</th><th>Serial No.</th><th>Status</th><th>Assigned To</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((a) => (
                        <tr key={a.asset_tag}>
                          <td>{a.asset_tag}</td>
                          <td>{a.category}</td>
                          <td>{a.model || '-'}</td>
                          <td>{a.serial_number || '-'}</td>
                          <td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                          <td>{a.assigned_to_name || '-'}</td>
                          <td>
                            {assigningTag === a.asset_tag ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                  placeholder="Employee ID"
                                  value={assignTo}
                                  onChange={(e) => setAssignTo(e.target.value)}
                                  style={{ padding: '6px', width: '100px', fontSize: '12.5px' }}
                                />
                                <button onClick={() => handleAssign(a.asset_tag)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>Go</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {a.status !== 'Assigned' && (
                                  <button onClick={() => { setAssigningTag(a.asset_tag); setAssignTo(''); }} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                                    Assign
                                  </button>
                                )}
                                <button onClick={() => handleDelete(a.asset_tag)} title="Delete" style={{ padding: '6px', border: 'none', borderRadius: '6px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Trash2 size={15} color="#dc2626" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssetInventory;
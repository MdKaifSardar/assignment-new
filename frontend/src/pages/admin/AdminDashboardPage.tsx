import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { User, Store, DashboardStats } from '../../types';
import { Header } from '../../components/common/Header';
import { StarRating } from '../../components/common/StarRating';
import { Users, Store as StoreIcon, Star, Plus, ArrowUpDown, X } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting for Users
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filters & Sorting for Stores
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [storeOwners, setStoreOwners] = useState<{ id: string; name: string; email: string }[]>([]);

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER'>('NORMAL_USER');
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Add Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreOwnerId, setNewStoreOwnerId] = useState('');
  const [addStoreError, setAddStoreError] = useState<string | null>(null);
  const [submittingStore, setSubmittingStore] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilterName) params.append('name', userFilterName);
      if (userFilterEmail) params.append('email', userFilterEmail);
      if (userFilterAddress) params.append('address', userFilterAddress);
      if (userFilterRole) params.append('role', userFilterRole);
      params.append('sortBy', userSortBy);
      params.append('sortOrder', userSortOrder);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (storeFilterName) params.append('name', storeFilterName);
      if (storeFilterEmail) params.append('email', storeFilterEmail);
      if (storeFilterAddress) params.append('address', storeFilterAddress);
      params.append('sortBy', storeSortBy);
      params.append('sortOrder', storeSortOrder);

      const res = await api.get(`/admin/stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/admin/store-owners');
      setStoreOwners(res.data.storeOwners);
    } catch (err) {
      console.error('Failed to fetch store owners', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchStores(), fetchStoreOwners()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (!loading) fetchUsers();
  }, [userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder]);

  useEffect(() => {
    if (!loading) fetchStores();
  }, [storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder]);

  const handleUserSort = (field: string) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const handleStoreSort = (field: string) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    if (newUserName.length < 20 || newUserName.length > 60) {
      setAddUserError(`Name must be between 20 and 60 characters (currently: ${newUserName.length})`);
      return;
    }
    if (newUserAddress.length > 400) {
      setAddUserError('Address cannot exceed 400 characters');
      return;
    }

    setSubmittingUser(true);
    try {
      await api.post('/admin/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        address: newUserAddress,
        role: newUserRole,
      });

      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserAddress('');
      fetchUsers();
      fetchStats();
      fetchStoreOwners();
    } catch (err: any) {
      setAddUserError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreError(null);

    if (newStoreName.length < 20 || newStoreName.length > 60) {
      setAddStoreError(`Store Name must be between 20 and 60 characters (currently: ${newStoreName.length})`);
      return;
    }
    if (newStoreAddress.length > 400) {
      setAddStoreError('Address cannot exceed 400 characters');
      return;
    }

    setSubmittingStore(true);
    try {
      await api.post('/admin/stores', {
        name: newStoreName,
        email: newStoreEmail,
        address: newStoreAddress,
        ownerId: newStoreOwnerId || null,
      });

      setShowAddStoreModal(false);
      setNewStoreName('');
      setNewStoreEmail('');
      setNewStoreAddress('');
      setNewStoreOwnerId('');
      fetchStores();
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      setAddStoreError(err.response?.data?.error || 'Failed to create store');
    } finally {
      setSubmittingStore(false);
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700 }}>System Admin Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Manage platform users, stores, and monitor operational statistics
          </p>
        </div>

        {/* Dashboard Metrics Cards */}
        <div className="grid-3">
          <div className="metric-card">
            <div className="metric-icon">
              <Users size={26} />
            </div>
            <div className="metric-data">
              <h3>Total Users</h3>
              <div className="value">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <StoreIcon size={26} />
            </div>
            <div className="metric-data">
              <h3>Total Stores</h3>
              <div className="value">{stats.totalStores}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Star size={26} />
            </div>
            <div className="metric-data">
              <h3>Submitted Ratings</h3>
              <div className="value">{stats.totalRatings}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Add Actions */}
        <div className="controls-header">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>Users ({users.length})</span>
            </button>

            <button
              className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('stores')}
            >
              <StoreIcon size={18} />
              <span>Stores ({stores.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddUserModal(true)}>
              <Plus size={18} />
              <span>Add User</span>
            </button>

            <button className="btn btn-primary" onClick={() => setShowAddStoreModal(true)}>
              <Plus size={18} />
              <span>Add Store</span>
            </button>
          </div>
        </div>

        {/* TAB 1: USERS LIST */}
        {activeTab === 'users' && (
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 600 }}>System Users Directory</h2>

            {/* Filters Header */}
            <div className="search-filters" style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Name..."
                value={userFilterName}
                onChange={(e) => setUserFilterName(e.target.value)}
              />
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Email..."
                value={userFilterEmail}
                onChange={(e) => setUserFilterEmail(e.target.value)}
              />
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Address..."
                value={userFilterAddress}
                onChange={(e) => setUserFilterAddress(e.target.value)}
              />
              <select
                className="form-select filter-input"
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Admin</option>
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            {/* Sortable Users Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleUserSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Name</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('email')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Email</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('address')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Address</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('role')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Role</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th>Store Owner Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                        No users match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ maxWidth: '300px' }}>{u.address}</td>
                        <td>
                          <span className={`user-badge ${u.role.toLowerCase()}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === 'STORE_OWNER' ? (
                            typeof u.rating === 'number' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <StarRating rating={u.rating} size={15} />
                                <span style={{ fontWeight: 600 }}>{u.rating}</span>
                              </div>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No store owned</span>
                            )
                          ) : (
                            <span style={{ color: '#64748b' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STORES LIST */}
        {activeTab === 'stores' && (
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 600 }}>Registered Stores Directory</h2>

            {/* Filters Header */}
            <div className="search-filters" style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Store Name..."
                value={storeFilterName}
                onChange={(e) => setStoreFilterName(e.target.value)}
              />
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Email..."
                value={storeFilterEmail}
                onChange={(e) => setStoreFilterEmail(e.target.value)}
              />
              <input
                type="text"
                className="form-input filter-input"
                placeholder="Filter by Address..."
                value={storeFilterAddress}
                onChange={(e) => setStoreFilterAddress(e.target.value)}
              />
            </div>

            {/* Sortable Stores Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleStoreSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Store Name</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort('email')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Email</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort('address')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Address</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort('rating')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Overall Rating</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th>Assigned Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                        No stores match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.address}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={s.rating} size={15} />
                            <span style={{ fontWeight: 600 }}>{s.rating}</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({s.ratingCount || 0})</span>
                          </div>
                        </td>
                        <td>
                          {s.owner ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{s.owner.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.owner.email}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD USER */}
        {showAddUserModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3 className="modal-title">Add New User</h3>
                <button className="btn-close" onClick={() => setShowAddUserModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {addUserError && (
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '0.75rem', marginBottom: '1rem' }}>
                  {addUserError}
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">Full Name</label>
                    <span style={{ fontSize: '0.78rem', color: newUserName.length < 20 ? '#f59e0b' : '#10b981' }}>
                      {newUserName.length}/60 chars (min 20)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Johnathan Alexander Montgomery"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@domain.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Selection</label>
                  <select
                    className="form-select"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                  >
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Full residential or business address..."
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    maxLength={400}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="e.g. UserPass123!"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                  <p className="helper-text">8-16 chars, 1 uppercase letter, 1 special character.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddUserModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingUser}>
                    {submittingUser ? 'Saving...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD STORE */}
        {showAddStoreModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3 className="modal-title">Add New Store</h3>
                <button className="btn-close" onClick={() => setShowAddStoreModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {addStoreError && (
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '0.75rem', marginBottom: '1rem' }}>
                  {addStoreError}
                </div>
              )}

              <form onSubmit={handleCreateStore}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="form-label">Store Name</label>
                    <span style={{ fontSize: '0.78rem', color: newStoreName.length < 20 ? '#f59e0b' : '#10b981' }}>
                      {newStoreName.length}/60 chars (min 20)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apex Digital Electronics Store"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contact@store.com"
                    value={newStoreEmail}
                    onChange={(e) => setNewStoreEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Store Owner (Optional)</label>
                  <select
                    className="form-select"
                    value={newStoreOwnerId}
                    onChange={(e) => setNewStoreOwnerId(e.target.value)}
                  >
                    <option value="">-- Select Store Owner --</option>
                    {storeOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Full store physical address..."
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    maxLength={400}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddStoreModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingStore}>
                    {submittingStore ? 'Saving...' : 'Register Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

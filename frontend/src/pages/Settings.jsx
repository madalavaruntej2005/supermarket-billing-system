import React, { useState, useEffect } from 'react';
import { User, Lock, Users, Plus, Check, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'users'

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cashier management (Admin only)
  const [usersList, setUsersList] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'cashier',
  });

  useEffect(() => {
    if (activeTab === 'users' && user?.is_admin) {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const data = await authService.getUsers();
      setUsersList(data.results || data);
    } catch (err) {
      toast.error('Failed to load user list');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await authService.updateProfile(profileData);
      updateCurrentUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || 'Failed to change password';
      toast.error(msg);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await authService.createUser(newUser);
      toast.success('Staff user created successfully!');
      setIsAddUserOpen(false);
      setNewUser({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'cashier',
      });
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.username?.[0] || 'Failed to create user';
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-100">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1E293B' }}>
          System Settings & Staff
        </h2>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
          Personalize account preferences, change security credentials, and manage cashier access.
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          <User size={15} className="me-1" />
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`btn btn-sm ${activeTab === 'password' ? 'btn-primary' : 'btn-light'}`}
          style={{ borderRadius: 8, fontWeight: 600 }}
        >
          <Lock size={15} className="me-1" />
          Change Password
        </button>
        {user?.is_admin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-light'}`}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            <Users size={15} className="me-1" />
            Cashier & Staff Management
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="row">
          <div className="col-12 col-md-7">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <h5 className="fw-bold mb-3" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                Profile Information
              </h5>
              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <div className="col-12 pt-2">
                    <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 8, fontWeight: 600 }}>
                      Update Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <h5 className="fw-bold mb-3" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                Update Password
              </h5>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Current Password *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>New Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary px-4" style={{ borderRadius: 8, fontWeight: 600 }}>
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cashier & Staff Tab (Admin Only) */}
      {activeTab === 'users' && user?.is_admin && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', color: '#1E293B' }}>
                Store Staff & Cashier Accounts
              </h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Create and manage access credentials for POS operators</span>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              <Plus size={16} />
              <span>Add Staff User</span>
            </button>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold text-primary">{u.username}</td>
                      <td>{u.full_name}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-primary' : 'bg-success'}`} style={{ textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.email || '—'}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.is_active ? 'bg-success bg-opacity-20 text-success' : 'bg-danger bg-opacity-20 text-danger'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddUserOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold">Create Staff / Cashier Account</h5>
                <button type="button" className="btn-close" onClick={() => setIsAddUserOpen(false)}></button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Username *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="cashier2"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Role *</label>
                      <select
                        className="form-select"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        style={{ borderRadius: 8 }}
                      >
                        <option value="cashier">Cashier</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Password (min 6 chars) *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="form-control"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91..."
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        style={{ borderRadius: 8 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setIsAddUserOpen(false)}
                    style={{ borderRadius: 8 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Check, Trash2, Search, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ candidates: 0, examiners: 0, exams: 0, submissions: 0 });
  const [pendingExaminers, setPendingExaminers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch all dashboard stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch pending examiners
  const fetchPendingExaminers = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/admin/pending-examiners');
      if (response.ok) {
        const data = await response.json();
        setPendingExaminers(data);
      }
    } catch (err) {
      console.error('Error fetching pending examiners:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:8084/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out admin user from list
        setAllUsers(data.filter(u => u.role !== 'ADMIN'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingExaminers();
    fetchAllUsers();
  }, []);

  const handleApprove = async (id) => {
    setError('');
    setMessage('');
    try {
      const response = await fetch(`http://localhost:8084/api/admin/approve-examiner/${id}`, {
        method: 'POST'
      });
      if (response.ok) {
        setMessage('Examiner approved successfully!');
        fetchPendingExaminers();
        fetchAllUsers();
        fetchStats();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Approval failed.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their records.')) {
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await fetch(`http://localhost:8084/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMessage('User account deleted successfully!');
        fetchAllUsers();
        fetchPendingExaminers();
        fetchStats();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Deletion failed.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(u =>
    u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between align-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={28} style={{ color: 'var(--primary)' }} /> Admin Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Manage examiners, approve requests, and monitor exams.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            Users Directory
          </button>
        </div>
      </div>

      {message && (
        <div className="badge badge-success w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {error && (
        <div className="badge badge-danger w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <div>
          {/* Stats Dashboard Grid */}
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                <Users size={22} />
              </div>
              <div className="stat-info">
                <h3>Total Candidates</h3>
                <p>{loadingStats ? '...' : stats.candidates}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <UserCheck size={22} />
              </div>
              <div className="stat-info">
                <h3>Approved Examiners</h3>
                <p>{loadingStats ? '...' : stats.examiners}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                <FileText size={22} />
              </div>
              <div className="stat-info">
                <h3>Total Exams</h3>
                <p>{loadingStats ? '...' : stats.exams}</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                <Check size={22} />
              </div>
              <div className="stat-info">
                <h3>Attended Submissions</h3>
                <p>{loadingStats ? '...' : stats.submissions}</p>
              </div>
            </div>
          </div>

          {/* Pending Approval Table */}
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', color: '#fff' }}>
              Pending Examiner Approvals
            </h2>

            {loadingApprovals ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading requests...</p>
            ) : pendingExaminers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No pending registrations. All examiners are currently approved.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingExaminers.map((examiner) => (
                      <tr key={examiner.id}>
                        <td style={{ fontWeight: '600' }}>{examiner.fullname}</td>
                        <td>{examiner.username}</td>
                        <td>
                          <span className="badge badge-primary">{examiner.companyName}</span>
                        </td>
                        <td>{examiner.email}</td>
                        <td>{examiner.mobile}</td>
                        <td>
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleApprove(examiner.id)}
                          >
                            <Check size={14} /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="flex justify-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>Registered Users Directory</h2>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, username, email..."
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {loadingUsers ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading directory...</p>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No users found matching query.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Company Name / Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: '600' }}>{user.fullname}</td>
                      <td>{user.username}</td>
                      <td>
                        <span className={`badge ${user.role === 'EXAMINER' ? 'badge-primary' : 'badge-success'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>
                        {user.role === 'EXAMINER' ? (
                          <span style={{ color: 'var(--text-primary)' }}>{user.companyName}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

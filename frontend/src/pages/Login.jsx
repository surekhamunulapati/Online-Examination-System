import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Shield, Users, UserCheck } from 'lucide-react';

export default function Login({ setUserState }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8084/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed!');
      }

      // Success
      localStorage.setItem('user', JSON.stringify(data));
      setUserState(data);

      // Route based on role
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.role === 'EXAMINER') {
        navigate('/examiner');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to access your portal</p>
        </div>

        {error && (
          <div className="badge badge-danger w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Don't have an account?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/register-candidate" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Users size={14} /> Candidate Register
            </Link>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <Link to="/register-examiner" style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <UserCheck size={14} /> Examiner Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

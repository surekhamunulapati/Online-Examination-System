import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, ArrowLeft, Info } from 'lucide-react';

export default function RegisterExaminer() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8084/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          username,
          password,
          email,
          mobile,
          companyName,
          role: 'EXAMINER'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed!');
      }

      setSuccess('Registration submitted! An Administrator must approve your account before you can sign in.');
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="mb-4">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Examiner Sign Up</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Register as an examiner to schedule exams and evaluate candidates</p>
        </div>

        <div className="badge badge-primary w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', lineHeight: '1.4' }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>Examiner registrations are placed in a pending queue and must be approved by an Admin.</span>
        </div>

        {error && (
          <div className="badge badge-danger w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="badge badge-success w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Professor Smith"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name / Institution</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Google, Harvard, etc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Choose a username"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="smith@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="10-digit number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-full mt-4" disabled={loading}>
            <UserCheck size={18} />
            {loading ? 'Submitting Request...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

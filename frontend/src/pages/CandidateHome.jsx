import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Bell, CheckCircle, Sparkles, Building, BookmarkCheck } from 'lucide-react';

export default function CandidateHome() {
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchAvailableExams = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/candidate/available-exams?candidateId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (err) {
      console.error('Failed to fetch available exams', err);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/candidate/notifications?candidateId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (!user.id || user.role !== 'CANDIDATE') {
      navigate('/login');
      return;
    }
    fetchAvailableExams();
    fetchNotifications();
  }, []);

  const handleApply = async (examId) => {
    setError('');
    setMessage('');
    try {
      const response = await fetch(`http://localhost:8084/api/candidate/exams/${examId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: user.id })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Registered for exam successfully! Check your "My Exams" tab.');
        fetchAvailableExams();
        fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to apply.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8084/api/candidate/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex justify-between align-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={28} style={{ color: 'var(--primary)' }} /> Candidate Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Welcome, <span style={{ color: '#fff', fontWeight: '600' }}>{user.fullname}</span>
          </p>
        </div>
        
        <Link to="/candidate/my-exams" className="btn btn-secondary">
          <BookmarkCheck size={18} /> My Registered Exams & History
        </Link>
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

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main: Available Exams */}
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} style={{ color: 'var(--primary)' }} /> Available Company Exams
          </h2>

          {loadingExams ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading available exams...</p>
          ) : exams.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No new exams are currently available for registration. Check back later!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
              {exams.map((exam) => (
                <div key={exam.id} className="card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: '1', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span className="badge badge-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                        {exam.examiner.companyName}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                      {exam.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {exam.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} style={{ color: 'var(--primary)' }} />
                        <span>Start: {formatDate(exam.startTime)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} style={{ color: 'var(--danger)' }} />
                        <span>End: {formatDate(exam.endTime)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} style={{ color: 'var(--success)' }} />
                        <span>{exam.durationMinutes} mins | {exam.totalMarks} Marks</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApply(exam.id)}
                    style={{ flexShrink: 0 }}
                  >
                    Register & Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: In-app Notifications */}
        <div className="card" style={{ padding: '1.2rem' }}>
          <div className="flex justify-between align-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bell size={18} style={{ color: 'var(--warning)' }} /> Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                {unreadCount} new
              </span>
            )}
          </div>

          {loadingNotifs ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading alerts...</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
              No notifications yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: notif.isRead ? 'rgba(255, 255, 255, 0.01)' : 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid',
                    borderColor: notif.isRead ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.15)',
                    fontSize: '0.85rem',
                    position: 'relative'
                  }}
                >
                  <h4 style={{ fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                    {notif.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.3', marginBottom: '0.4rem' }}>
                    {notif.message}
                  </p>
                  
                  <div className="flex justify-between align-center" style={{ marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>

                    {!notif.isRead && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        <CheckCircle size={10} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

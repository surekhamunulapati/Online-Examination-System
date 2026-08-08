import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Clipboard, Award, AlertCircle, ArrowLeft, Play } from 'lucide-react';

export default function MyExams() {
  const [activeTab, setActiveTab] = useState('registered');
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchMyExams = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/candidate/my-exams?candidateId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyRegistrations(data);
      }
    } catch (err) {
      console.error('Failed to fetch my exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.id || user.role !== 'CANDIDATE') {
      navigate('/login');
      return;
    }
    fetchMyExams();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getExamTimingStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: 'FUTURE', message: `Starts: ${formatDate(startTime)}`, enabled: false };
    } else if (now >= start && now <= end) {
      return { status: 'ACTIVE', message: 'Active Now', enabled: true };
    } else {
      return { status: 'EXPIRED', message: 'Expired / Missed', enabled: false };
    }
  };

  // Filter registrations by tab
  const registeredExams = myRegistrations.filter(r => !r.attended);
  const historyExams = myRegistrations.filter(r => r.attended);

  return (
    <div>
      <div className="mb-4">
        <Link to="/candidate" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>My Exams</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track scheduled assessments and view performance metrics.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button
          className={`btn ${activeTab === 'registered' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('registered')}
        >
          Scheduled Assessments ({registeredExams.length})
        </button>
        <button
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('history')}
        >
          Exam History & Results ({historyExams.length})
        </button>
      </div>

      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>Loading examinations...</p>
        </div>
      ) : activeTab === 'registered' ? (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clipboard size={20} style={{ color: 'var(--primary)' }} /> Upcoming & Active Exams
          </h2>

          {registeredExams.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              You don't have any exams scheduled. Go back to <Link to="/candidate" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Dashboard</Link> to apply!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {registeredExams.map((reg) => {
                const exam = reg.exam;
                const timing = getExamTimingStatus(exam.startTime, exam.endTime);

                return (
                  <div key={reg.id} className="card" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex justify-between align-center mb-4">
                      <span className="badge badge-primary">{exam.examiner.companyName}</span>
                      <span className={`badge ${
                        timing.status === 'ACTIVE' ? 'badge-success' :
                        timing.status === 'FUTURE' ? 'badge-pending' : 'badge-danger'
                      }`}>
                        {timing.message}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                      {exam.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                      {exam.description || 'No description provided.'}
                    </p>

                    <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div>Duration: <span style={{ color: '#fff', fontWeight: '600' }}>{exam.durationMinutes} minutes</span></div>
                      <div>Total Marks: <span style={{ color: '#fff', fontWeight: '600' }}>{exam.totalMarks} Marks</span></div>
                      <div>Start window: <span style={{ color: '#fff' }}>{formatDate(exam.startTime)}</span></div>
                      <div>End window: <span style={{ color: '#fff' }}>{formatDate(exam.endTime)}</span></div>
                    </div>

                    {timing.status === 'ACTIVE' ? (
                      <button
                        className="btn btn-success w-full"
                        onClick={() => navigate(`/candidate/take-exam/${exam.id}`)}
                      >
                        <Play size={16} /> Enter Exam Hall
                      </button>
                    ) : timing.status === 'FUTURE' ? (
                      <div className="badge badge-pending w-full text-center" style={{ display: 'block', padding: '0.8rem' }}>
                        Waiting window to open
                      </div>
                    ) : (
                      <div className="badge badge-danger w-full text-center" style={{ display: 'block', padding: '0.8rem' }}>
                        Missed Assessment (Ended)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--success)' }} /> Evaluated Submissions
          </h2>

          {historyExams.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No completed exam history found.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Company Name</th>
                    <th>Date Attended</th>
                    <th>Score Obtained</th>
                    <th>Passing Score %</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyExams.map((reg) => {
                    const exam = reg.exam;
                    const percentage = Math.round((reg.score / exam.totalMarks) * 100);

                    return (
                      <tr key={reg.id}>
                        <td style={{ fontWeight: '600' }}>{exam.title}</td>
                        <td>
                          <span className="badge badge-primary">{exam.examiner.companyName}</span>
                        </td>
                        <td>{formatDate(reg.registeredAt)}</td>
                        <td style={{ fontWeight: '700' }}>{reg.score} / {exam.totalMarks}</td>
                        <td>
                          <span className={`badge ${percentage >= 60 ? 'badge-success' : 'badge-danger'}`}>
                            {percentage}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            reg.status === 'SHORTLISTED' ? 'badge-success' :
                            reg.status === 'NOT_SHORTLISTED' ? 'badge-danger' : 'badge-primary'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

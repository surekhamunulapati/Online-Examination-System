import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Award, Calendar, Clock, ClipboardList, Send, FileText } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
export default function ExaminerDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Read current examiner details
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchExams = async () => {
    try {
      const response = await fetch(
        `http://localhost:8084/api/examiner/exams?examinerId=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (err) {
      console.error('Failed to load exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.id || user.role !== 'EXAMINER') {
      navigate('/login');
      return;
    }
    fetchExams();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ClipboardList size={28} style={{ color: 'var(--primary)' }} /> Examiner Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Welcome, <span style={{ color: '#fff', fontWeight: '600' }}>{user.fullname}</span> ({user.companyName})
          </p>
        </div>
        
        <Link to="/examiner/create-exam" className="btn btn-primary">
          <Plus size={18} /> Create Exam
        </Link>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} style={{ color: 'var(--primary)' }} /> Scheduled Exams
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading exams...</p>
        ) : exams.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              You haven't created any exams yet. Start by scheduling your first exam!
            </div>
            <Link to="/examiner/create-exam" className="btn btn-primary">
              Create Your First Exam
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {exams.map((exam) => (
              <div key={exam.id} className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  {exam.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem', minHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {exam.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: 'var(--primary)' }} />
                    <span>Start: {formatDate(exam.startTime)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: 'var(--danger)' }} />
                    <span>End: {formatDate(exam.endTime)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} style={{ color: 'var(--success)' }} />
                    <span>Duration: {exam.durationMinutes} minutes | Marks: {exam.totalMarks}</span>
                  </div>
                </div>

                <div className="flex justify-between align-center">
                  <button 
                    className="btn btn-secondary w-full"
                    onClick={() => navigate(`/examiner/exams/${exam.id}/responses`)}
                  >
                    <Award size={16} /> View Submissions & Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

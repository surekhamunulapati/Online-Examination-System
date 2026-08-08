import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, ArrowLeft, Mail, Check, X, Filter } from 'lucide-react';

export default function ExamResponses() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const fetchExamDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/examiner/exams`);
      if (response.ok) {
        const data = await response.json();
        const found = data.find(e => e.id.toString() === examId);
        setExam(found);
      }
    } catch (err) {
      console.error('Failed to fetch exam details', err);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await fetch(`http://localhost:8084/api/examiner/exams/${examId}/responses`);
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      }
    } catch (err) {
      console.error('Failed to fetch responses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamDetails();
    fetchResponses();
  }, [examId]);

  const handleStatusUpdate = async (registrationId, newStatus) => {
    setActionError('');
    setActionMessage('');
    try {
      const response = await fetch(`http://localhost:8084/api/examiner/responses/${registrationId}/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setActionMessage(`Candidate status updated to ${newStatus}!`);
        fetchResponses();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status.');
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleSendResultEmail = async (registrationId) => {
    setActionError('');
    setActionMessage('');
    setSendingEmailId(registrationId);
    try {
      const response = await fetch(`http://localhost:8084/api/examiner/responses/${registrationId}/send-result`, {
        method: 'POST'
      });
      if (response.ok) {
        setActionMessage('Result email sent to candidate successfully!');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send result email.');
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSendingEmailId(null);
    }
  };

  // Filter logic
  const filteredResponses = responses.filter(r => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ATTENDED') return r.attended;
    if (statusFilter === 'REGISTERED') return !r.attended;
    return r.status === statusFilter;
  });

  return (
    <div>
      <div className="mb-4">
        <Link to="/examiner" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Examiner Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
          {exam ? exam.title : 'Exam responses'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review candidate registrations, marks scored, and process candidate shortlists.
        </p>
      </div>

      {actionMessage && (
        <div className="badge badge-success w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="badge badge-danger w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
          {actionError}
        </div>
      )}

      <div className="card">
        <div className="flex justify-between align-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>Candidates Performance Sheet</h2>

          {/* Filter dropdown */}
          <div className="flex align-center gap-1">
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ padding: '0.4rem 1.5rem 0.4rem 0.8rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Candidates</option>
              <option value="REGISTERED">Pending Attendance (Registered)</option>
              <option value="ATTENDED">Attended (Unprocessed)</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="NOT_SHORTLISTED">Not Shortlisted</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading candidate data...</p>
        ) : filteredResponses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No candidates matching criteria.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Evaluate / Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((reg) => {
                  const maxMarks = exam ? exam.totalMarks : 100;
                  const percentage = reg.attended ? Math.round((reg.score / maxMarks) * 100) : null;
                  
                  return (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: '600' }}>{reg.candidate.fullname}</td>
                      <td>{reg.candidate.username}</td>
                      <td>{reg.candidate.email}</td>
                      <td>{reg.candidate.mobile}</td>
                      <td>
                        {reg.attended ? (
                          <span style={{ fontWeight: '700', color: '#fff' }}>{reg.score} / {maxMarks}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        {reg.attended ? (
                          <span className={`badge ${percentage >= 60 ? 'badge-success' : 'badge-danger'}`}>
                            {percentage}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          reg.status === 'SHORTLISTED' ? 'badge-success' :
                          reg.status === 'NOT_SHORTLISTED' ? 'badge-danger' :
                          reg.status === 'ATTENDED' ? 'badge-primary' : 'badge-pending'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        {reg.attended ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-success"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Shortlist Candidate"
                              onClick={() => handleStatusUpdate(reg.id, 'SHORTLISTED')}
                              disabled={reg.status === 'SHORTLISTED'}
                            >
                              <Check size={14} /> Shortlist
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Reject Candidate"
                              onClick={() => handleStatusUpdate(reg.id, 'NOT_SHORTLISTED')}
                              disabled={reg.status === 'NOT_SHORTLISTED'}
                            >
                              <X size={14} /> Reject
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Email Candidate Results"
                              onClick={() => handleSendResultEmail(reg.id)}
                              disabled={sendingEmailId === reg.id}
                            >
                              <Mail size={14} /> {sendingEmailId === reg.id ? 'Sending...' : 'Send Mail'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Awaiting Test</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

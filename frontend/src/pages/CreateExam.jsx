import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, ArrowLeft, Save, PlusCircle, Check } from 'lucide-react';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 5 }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setError('An exam must have at least one question.');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      setError('End Time must be after Start Time.');
      setLoading(false);
      return;
    }

    // Auto-calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + parseInt(q.marks || 0), 0);

    try {
      const response = await fetch('http://localhost:8084/api/examiner/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime,
          endTime,
          durationMinutes: parseInt(durationMinutes),
          totalMarks,
          examinerId: user.id,
          questions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create exam');
      }

      navigate('/examiner');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/examiner" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>Create New Exam</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure timings and compile multiple choice questions.</p>
      </div>

      {error && (
        <div className="badge badge-danger w-full" style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'block', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Questions Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Questions List ({questions.length})
            </h2>

            {questions.map((q, idx) => (
              <div key={idx} className="card" style={{ background: 'rgba(255, 255, 255, 0.01)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignCenter: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-primary" style={{ padding: '0.3rem 0.8rem' }}>Question #{idx + 1}</span>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => handleRemoveQuestion(idx)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Enter question text here..."
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Option A</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option A text"
                      value={q.optionA}
                      onChange={(e) => handleQuestionChange(idx, 'optionA', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Option B</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option B text"
                      value={q.optionB}
                      onChange={(e) => handleQuestionChange(idx, 'optionB', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Option C</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option C text"
                      value={q.optionC}
                      onChange={(e) => handleQuestionChange(idx, 'optionC', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Option D</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option D text"
                      value={q.optionD}
                      onChange={(e) => handleQuestionChange(idx, 'optionD', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Correct Option</label>
                    <select
                      className="form-control"
                      value={q.correctOption}
                      onChange={(e) => handleQuestionChange(idx, 'correctOption', e.target.value)}
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(idx, 'marks', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary w-full"
              style={{ borderStyle: 'dashed', padding: '1rem' }}
              onClick={handleAddQuestion}
            >
              <PlusCircle size={18} /> Add Another Question
            </button>
          </div>

          {/* Right Column: Settings & Meta */}
          <div className="card" style={{ sticky: 'top', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: '#fff' }}>
              Exam Configuration
            </h2>

            <div className="form-group">
              <label className="form-label">Exam Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Java Basics Evaluation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Instructions</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add exam details, rules, syllabus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                className="form-control"
                min="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div className="flex justify-between mb-4">
                <span style={{ color: 'var(--text-secondary)' }}>Total Questions:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>{questions.length}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span style={{ color: 'var(--text-secondary)' }}>Total Marks:</span>
                <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                  {questions.reduce((sum, q) => sum + parseInt(q.marks || 0), 0)}
                </span>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                <Save size={18} />
                {loading ? 'Scheduling...' : 'Save & Publish Exam'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

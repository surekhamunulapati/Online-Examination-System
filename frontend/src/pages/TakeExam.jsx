import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send, AlertOctagon } from 'lucide-react';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: option }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const timerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Fetch Exam Details & Questions
  const loadExamData = async () => {
    try {
      // 1. Get Exam metadata to check active timings
      const examRes = await fetch(`http://localhost:8084/api/candidate/available-exams?candidateId=${user.id}`);
      let currentExam = null;
      if (examRes.ok) {
        const examsList = await examRes.json();
        currentExam = examsList.find(e => e.id.toString() === examId);
      }
      
      // If not in available list, check if already registered
      if (!currentExam) {
        const myExamsRes = await fetch(`http://localhost:8084/api/candidate/my-exams?candidateId=${user.id}`);
        if (myExamsRes.ok) {
          const myExamsList = await myExamsRes.json();
          const registrationObj = myExamsList.find(r => r.exam.id.toString() === examId);
          if (registrationObj) {
            currentExam = registrationObj.exam;
            if (registrationObj.attended) {
              throw new Error("You have already attended this exam!");
            }
          }
        }
      }

      if (!currentExam) {
        throw new Error("Exam not found or you are not registered.");
      }

      setExam(currentExam);

      // Check current window active
      const now = new Date();
      const start = new Date(currentExam.startTime);
      const end = new Date(currentExam.endTime);

      if (now < start) {
        throw new Error(`This exam starts on ${start.toLocaleString()}`);
      }
      if (now > end) {
        throw new Error("This exam session has already ended.");
      }

      // Calculate initial timer value (seconds)
      const durationSeconds = currentExam.durationMinutes * 60;
      const windowSecondsLeft = Math.floor((end.getTime() - now.getTime()) / 1000);
      const initialTimer = Math.min(durationSeconds, windowSecondsLeft);
      
      if (initialTimer <= 0) {
        throw new Error("This exam window has closed.");
      }

      setTimeLeft(initialTimer);

      // 2. Fetch Anti-Cheat Questions
      const questionsRes = await fetch(`http://localhost:8084/api/candidate/exams/${examId}/questions`);
      if (questionsRes.ok) {
        const questionsList = await questionsRes.json();
        setQuestions(questionsList);
      } else {
        throw new Error("Failed to load exam questions.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.id || user.role !== 'CANDIDATE') {
      navigate('/login');
      return;
    }
    loadExamData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  // Handle Countdown Timer
  useEffect(() => {
    if (loading || error || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, error, timeLeft]);

  // Anti-Cheat: Visibility Change Hook
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const next = prev + 1;
          if (next >= 3) {
            alert("Security infraction limit reached (Tab Switched 3 times). Auto-submitting assessment!");
            handleAutoSubmit();
          } else {
            alert(`WARNING: You have switched tabs or minimized the window. Infraction count: ${next}/3. Reaching 3 infractions will trigger automatic exam submission!`);
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [questions, answers]);

  const handleSelectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  const handleAutoSubmit = async () => {
    await submitAnswers(true);
  };

  const handleSubmitClick = () => {
    setShowConfirm(true);
  };

  const submitAnswers = async (forced = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8084/api/candidate/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user.id,
          answers: answers
        })
      });

      if (response.ok) {
        alert(forced ? "Exam auto-submitted due to timing or window violation." : "Exam submitted successfully! Results will be released shortly.");
        navigate('/candidate/my-exams');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Submission failed.');
      }
    } catch (err) {
      alert("Submission error: " + err.message);
      setLoading(false);
    }
  };

  // Timer format (MM:SS)
  const formatTimer = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card text-center" style={{ maxWidth: '480px', padding: '2rem' }}>
          <AlertOctagon size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/candidate/my-exams" className="btn btn-primary w-full">
            Return to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card text-center" style={{ marginTop: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Preparing exam environment...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr', gap: '2rem', minHeight: '80vh' }}>
      
      {/* Sidebar navigation & stats */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', padding: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: '700', fontSize: '1.2rem' }}>
              <Clock size={20} />
              <span>{formatTimer()}</span>
            </div>
            <span className="badge badge-primary">Active</span>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Question Navigator</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '2rem' }}>
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = idx === currentIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                    background: isActive ? 'var(--primary)' : isAnswered ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.02)',
                    color: isActive || isAnswered ? '#fff' : 'var(--text-secondary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Warning Stats */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: '700' }}>Anti-Cheat Active</p>
              <p style={{ marginTop: '0.1rem', color: 'var(--text-secondary)' }}>Tab violations: {violations} / 3</p>
            </div>
          </div>
          
          <button 
            className="btn btn-success w-full mt-4"
            onClick={handleSubmitClick}
          >
            <Send size={16} /> Submit Exam
          </button>
        </div>
      </div>

      {/* Main Panel: Question Container */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
        
        {/* Question details */}
        <div>
          <div className="flex justify-between mb-4">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              QUESTION {currentIdx + 1} OF {questions.length}
            </span>
            <span className="badge badge-primary">
              {currentQuestion.marks} Marks
            </span>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '2rem', lineHeight: '1.4' }}>
            {currentQuestion.questionText}
          </h2>

          {/* Answer Option Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'A', text: currentQuestion.optionA },
              { label: 'B', text: currentQuestion.optionB },
              { label: 'C', text: currentQuestion.optionC },
              { label: 'D', text: currentQuestion.optionD }
            ].map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.label;

              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.label)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1.2rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'
                  }}>
                    {opt.label}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft size={16} /> Previous Question
          </button>

          {currentIdx === questions.length - 1 ? (
            <button
              className="btn btn-success"
              onClick={handleSubmitClick}
            >
              <Send size={16} /> Submit Assessment
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next Question <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card text-center" style={{ maxWidth: '400px', padding: '2rem' }}>
            <AlertOctagon size={48} style={{ color: 'var(--warning)', marginInline: 'auto', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '0.8rem' }}>
              Submit Exam?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to finish the exam? You have answered {Object.keys(answers).length} out of {questions.length} questions. You cannot undo this action.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                className="btn btn-secondary w-full"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success w-full"
                onClick={() => submitAnswers(false)}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

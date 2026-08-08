import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, GraduationCap, User, Compass, HelpCircle, Shield, Award } from 'lucide-react';

export default function Navbar({ user, setUserState }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserState(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navbar">
      <Link to="/" className="nav-brand">
        <GraduationCap size={26} style={{ strokeWidth: 2.5 }} />
        <span>SmartExam</span>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <>
                <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                  Admin Console
                </Link>
              </>
            )}

            {user.role === 'EXAMINER' && (
              <>
                <Link to="/examiner" className={`nav-item ${isActive('/examiner') ? 'active' : ''}`}>
                  Exams Dashboard
                </Link>
                <Link to="/examiner/create-exam" className={`nav-item ${isActive('/examiner/create-exam') ? 'active' : ''}`}>
                  Create Exam
                </Link>
              </>
            )}

            {user.role === 'CANDIDATE' && (
              <>
                <Link to="/candidate" className={`nav-item ${isActive('/candidate') ? 'active' : ''}`}>
                  Exams Board
                </Link>
                <Link to="/candidate/my-exams" className={`nav-item ${isActive('/candidate/my-exams') ? 'active' : ''}`}>
                  My Registrations
                </Link>
              </>
            )}

            <div className="nav-user">
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                  {user.fullname}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user.role} {user.companyName ? `(${user.companyName})` : ''}
                </span>
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-item ${isActive('/login') ? 'active' : ''}`}>
              Sign In
            </Link>
            <Link to="/register-candidate" className={`nav-item ${isActive('/register-candidate') ? 'active' : ''}`}>
              Candidate Portal
            </Link>
            <Link to="/register-examiner" className={`nav-item ${isActive('/register-examiner') ? 'active' : ''}`}>
              Examiner Portal
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

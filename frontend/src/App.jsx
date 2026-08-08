import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import RegisterCandidate from './pages/RegisterCandidate';
import RegisterExaminer from './pages/RegisterExaminer';
import AdminDashboard from './pages/AdminDashboard';
import ExaminerDashboard from './pages/ExaminerDashboard';
import CreateExam from './pages/CreateExam';
import ExamResponses from './pages/ExamResponses';
import CandidateHome from './pages/CandidateHome';
import MyExams from './pages/MyExams';
import TakeExam from './pages/TakeExam';

// Protected Route Component to enforce role restrictions
function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective default dashboard based on their role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'EXAMINER') return <Navigate to="/examiner" replace />;
    return <Navigate to="/candidate" replace />;
  }

  return children;
}

// Redirect home path to user's dashboard if logged in
function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'EXAMINER') return <Navigate to="/examiner" replace />;
  return <Navigate to="/candidate" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUserState={setUser} />
        <main className="content-wrapper">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login setUserState={setUser} />} />
            <Route path="/register-candidate" element={<RegisterCandidate />} />
            <Route path="/register-examiner" element={<RegisterExaminer />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Examiner Protected Routes */}
            <Route
              path="/examiner"
              element={
                <ProtectedRoute allowedRoles={['EXAMINER']}>
                  <ExaminerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/examiner/create-exam"
              element={
                <ProtectedRoute allowedRoles={['EXAMINER']}>
                  <CreateExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/examiner/exams/:examId/responses"
              element={
                <ProtectedRoute allowedRoles={['EXAMINER']}>
                  <ExamResponses />
                </ProtectedRoute>
              }
            />

            {/* Candidate Protected Routes */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <CandidateHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/my-exams"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <MyExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/take-exam/:examId"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <TakeExam />
                </ProtectedRoute>
              }
            />

            {/* Fallbacks */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

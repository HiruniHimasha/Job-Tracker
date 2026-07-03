// App.jsx — Updated with /suggestions route added
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import DashboardPage       from './pages/DashboardPage';
import ResumeAnalyzerPage  from './pages/ResumeAnalyzerPage';
import InterviewsPage      from './pages/InterviewsPage';
import JobSuggestionsPage  from './pages/JobSuggestionsPage';   // ← NEW

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full
                        animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"    element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/interviews"  element={<PrivateRoute><InterviewsPage /></PrivateRoute>} />
          <Route path="/resume"      element={<PrivateRoute><ResumeAnalyzerPage /></PrivateRoute>} />
          <Route path="/suggestions" element={<PrivateRoute><JobSuggestionsPage /></PrivateRoute>} />  {/* ← NEW */}
          <Route path="*"            element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

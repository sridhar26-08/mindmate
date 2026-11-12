import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import StudentAuth from './pages/StudentAuth';
import AdminAuth from './pages/AdminAuth';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Support from './pages/Support';
import BurnoutPredictor from './pages/BurnoutPredictor';
import AdminDashboard from './pages/AdminDashboard';
import Mindfulness from './pages/Mindfulness';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function Private({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/student/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== 'admin') {
    return (
      <div className="card max-w-lg mx-auto my-12 text-center p-8 space-y-4 shadow-xl border-amber-200 dark:border-amber-900">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Faculty / Admin Clearance Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your account is registered as a Student. Access to population-level analytics, counselor rosters, and institutional triage is restricted to verified university staff and counselors.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link to="/" className="btn text-xs px-4 py-2.5 w-full sm:w-auto">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Student Dashboard</span>
          </Link>
          <Link to="/admin/login" className="btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto">
            Sign in as Admin
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Student Auth Routes */}
            <Route path="/login" element={<StudentAuth />} />
            <Route path="/register" element={<StudentAuth initialRegister={true} />} />
            <Route path="/student/login" element={<StudentAuth />} />
            <Route path="/student/register" element={<StudentAuth initialRegister={true} />} />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route path="/admin/register" element={<AdminAuth initialRegister={true} />} />

            {/* Student Sanctuary Routes */}
            <Route
              path="/"
              element={
                <Private>
                  <Dashboard />
                </Private>
              }
            />
            <Route
              path="/check-in"
              element={
                <Private>
                  <CheckIn />
                </Private>
              }
            />
            <Route
              path="/mindfulness"
              element={
                <Private>
                  <Mindfulness />
                </Private>
              }
            />
            <Route
              path="/burnout"
              element={
                <Private>
                  <BurnoutPredictor />
                </Private>
              }
            />
            <Route
              path="/support"
              element={
                <Private>
                  <Support />
                </Private>
              }
            />

            {/* Protected Admin Console */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

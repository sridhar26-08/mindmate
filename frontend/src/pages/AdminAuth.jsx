import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity
} from 'lucide-react';

export default function AdminAuth({ initialRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    adminSecret: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await login('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'admin',
          adminSecret: form.adminSecret
        });
      } else {
        await login('/auth/login', {
          email: form.email,
          password: form.password,
          requestedPortal: 'admin'
        });
      }
      nav('/admin');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Institutional authorization failed. Please check credentials or passkey.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        
        {/* Left Side: Institutional Oversight Portal Banner (2 cols) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md text-xs font-semibold tracking-wide border border-indigo-500/30 text-indigo-300 mb-6">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Institutional Oversight Portal</span>
            </div>

            <div className="flex items-center gap-2.5 text-2xl font-black mb-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-white">Admin & Staff</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Authorized administrative dashboard for campus counselors, mental health officers, and university wellness administrators.
            </p>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Activity className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Campus Aggregated Analytics:</strong> View anonymous population-level stress trends & burnout indicators.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Appointments Management:</strong> Review student appointment requests and update consultation statuses.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Emergency & Resource Directory:</strong> Maintain certified hotlines and counselor rosters.</span>
              </div>
            </div>
          </div>

          {/* Quick link to Student Portal */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 mb-2">Are you a student looking for support or check-ins?</p>
            <Link
              to="/student/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition underline underline-offset-4"
            >
              <span>Go to Student Wellness Sanctuary</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Form (3 cols) */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                  {isRegister ? 'Staff & Counselor Registration' : 'Administrative Sign In'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRegister
                    ? 'Register with authorized university administrative credentials'
                    : 'Access confidential institutional wellness analytics and triage'}
                </p>
              </div>
              <span className="badge bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-indigo-300 border border-slate-700">
                🛡️ Staff / Admin
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Staff / Counselor Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Eleanor Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional / Staff Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="counselor@university.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Institutional Passkey <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-indigo-500 font-mono">Demo: mindmate-admin-secret</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter Admin Secret Passkey"
                      value={form.adminSecret}
                      onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
                      className="pl-9 font-mono text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Required to verify university administrative authority and prevent unauthorized access.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-lg text-sm font-bold"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Authority…</span>
                  </span>
                ) : isRegister ? (
                  'Register Institutional Staff Account'
                ) : (
                  'Sign In to Admin Dashboard'
                )}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegister ? 'Already registered as staff/admin?' : 'Need to register as counselor or faculty?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ml-1 underline underline-offset-2"
                >
                  {isRegister ? 'Staff Sign In' : 'Register Staff Account'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}


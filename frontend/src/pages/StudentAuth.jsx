import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Sparkles, Shield, GraduationCap, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function StudentAuth({ initialRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    course: '',
    year: ''
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
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'student',
          profile: {
            college: form.college || undefined,
            course: form.course || undefined,
            year: form.year ? parseInt(form.year, 10) : undefined
          }
        };
        await login('/auth/register', payload);
      } else {
        await login('/auth/login', {
          email: form.email,
          password: form.password,
          requestedPortal: 'student'
        });
      }
      nav('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to complete sign in. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        
        {/* Left Side: Welcoming Student Sanctuary Banner (2 cols) */}
        <div className="md:col-span-2 bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20 mb-6">
              <GraduationCap className="h-4 w-4" />
              <span>Student Wellness Sanctuary</span>
            </div>

            <div className="flex items-center gap-2.5 text-2xl font-black mb-3">
              <div className="h-9 w-9 rounded-xl bg-white text-brand-600 flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 fill-brand-600" />
              </div>
              <span>MindMate AI</span>
            </div>

            <p className="text-brand-100 text-sm leading-relaxed mb-6">
              A private, judgment-free space to understand your feelings, relieve academic stress, and thrive at university.
            </p>

            <div className="space-y-3.5 text-xs text-brand-50">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-brand-200 shrink-0 mt-0.5" />
                <span><strong>100% Confidential:</strong> Your journals & daily check-ins stay strictly private.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-brand-200 shrink-0 mt-0.5" />
                <span><strong>24/7 AI Wellness Companion:</strong> Instant coping strategies for exams and burnout.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-brand-200 shrink-0 mt-0.5" />
                <span><strong>Campus Support:</strong> Connect with university counselors at your own pace.</span>
              </div>
            </div>
          </div>

          {/* Quick link to Admin Portal */}
          <div className="mt-8 pt-6 border-t border-white/15">
            <p className="text-[11px] text-brand-200 mb-2">Faculty, Counselor, or Institutional Admin?</p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-100 transition underline underline-offset-4"
            >
              <span>Access Admin & Counselor Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Form (3 cols) */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                  {isRegister ? 'Create Student Account' : 'Welcome Back, Student'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRegister
                    ? 'Start tracking your wellness and personal academic peace of mind'
                    : 'Sign in to access your mood log, insights, and AI companion'}
                </p>
              </div>
              <span className="badge bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                🎓 Student
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student / University Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
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
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Course / Major <span className="text-slate-400 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Study <span className="text-slate-400 text-[10px]">(Optional)</span>
                    </label>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year (Freshman)</option>
                      <option value="2">2nd Year (Sophomore)</option>
                      <option value="3">3rd Year (Junior)</option>
                      <option value="4">4th Year (Senior)</option>
                      <option value="5">Postgraduate / PhD</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn w-full py-3 mt-2 shadow-lg shadow-brand-500/20 text-sm font-bold"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing…</span>
                  </span>
                ) : isRegister ? (
                  'Create Student Account'
                ) : (
                  'Sign In to Student Sanctuary'
                )}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegister ? 'Already registered as a student?' : "Don't have a student account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 ml-1 underline underline-offset-2"
                >
                  {isRegister ? 'Sign In here' : 'Register for free'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}


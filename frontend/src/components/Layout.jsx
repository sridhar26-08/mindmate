import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Sun, 
  Moon, 
  Flame, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  LayoutDashboard,
  LogOut,
  Wind,
  User as UserIcon,
  AlertTriangle,
  X,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [showSosModal, setShowSosModal] = useState(false);

  const toggleTheme = () => document.documentElement.classList.toggle('dark');

  // Dynamic Navigation depending on Role
  const baseLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Check-in', path: '/check-in', icon: CheckCircle2 },
    { name: 'Mindful Break', path: '/mindfulness', icon: Wind },
    { name: 'Burnout Predictor', path: '/burnout', icon: Flame },
    { name: 'Counseling & Support', path: '/support', icon: PhoneCall }
  ];

  if (user?.role === 'admin') {
    baseLinks.push({
      name: 'Admin Console',
      path: '/admin',
      icon: ShieldCheck,
      adminOnly: true
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          
          {/* Logo */}
          <Link
            to={user?.role === 'admin' ? '/admin' : '/'}
            className="flex items-center gap-2.5 font-black text-lg tracking-tight text-brand-600 dark:text-brand-400 group"
          >
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition">
              <Heart className="h-4.5 w-4.5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-slate-900 dark:text-slate-50 font-black">
                MindMate<span className="text-brand-600 dark:text-brand-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-normal">
                {user?.role === 'admin' ? 'Institutional Console' : 'Student Mental Wellness'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
              {baseLinks.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? item.adminOnly
                          ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                    {item.adminOnly && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 uppercase">
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1-Click Crisis SOS Button */}
            <button
              onClick={() => setShowSosModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold hover:bg-rose-100 transition shadow-sm"
              title="Immediate Crisis Lifeline (24/7)"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>SOS: 988</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="h-4 w-4 hidden dark:block" />
            </button>

            {/* User Session or Logins */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[140px]">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-slate-900 text-white dark:bg-indigo-600'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {user.role === 'admin' ? '🛡️ Admin / Staff' : '🎓 Student'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    nav('/student/login');
                  }}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/student/login"
                  className="btn text-xs py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="hidden sm:inline-flex btn-secondary text-xs py-1.5 px-3 font-semibold"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        {user && (
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-900 text-xs scrollbar-none bg-white dark:bg-slate-950">
            {baseLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-semibold transition ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-950/60 py-6 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300">MindMate AI</span>
            <span>• Student Mental Wellness & Institutional Crisis Escalation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/student/login" className="hover:text-brand-600">Student Portal</Link>
            <Link to="/admin/login" className="hover:text-brand-600">Admin / Faculty Portal</Link>
            <span className="text-rose-500 font-bold">24/7 Lifeline: Dial 988</span>
          </div>
        </div>
      </footer>

      {/* Crisis SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="card max-w-md w-full shadow-2xl space-y-4 border-rose-300 dark:border-rose-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  Immediate 24/7 Crisis Helplines
                </h3>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you or someone you know is struggling or in crisis, help is available. You are never alone. These services are free, confidential, and available 24/7:
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:988"
                className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Suicide & Crisis Lifeline</h4>
                    <p className="text-[11px] text-slate-500">Call or text anytime</p>
                  </div>
                </div>
                <span className="text-sm font-black text-rose-600">988</span>
              </a>

              <a
                href="sms:741741?body=HOME"
                className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Crisis Text Line</h4>
                    <p className="text-[11px] text-slate-500">Text HOME to 741741</p>
                  </div>
                </div>
                <span className="text-sm font-black text-brand-600">741741</span>
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowSosModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';
import { 
  Activity, 
  Smile, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Calendar,
  CheckCircle2,
  Flame,
  PhoneCall,
  BarChart3,
  PieChart,
  Wind,
  Heart,
  Zap
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const colors = {
  Low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  Moderate: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  High: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
  Critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
};

const moodEmojis = {
  Happy: '😊',
  Neutral: '😐',
  Sad: '😔',
  Stressed: '😫',
  Anxious: '😟'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // '7d' or '30d'

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/moods/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err?.response?.data?.message || 'Could not load your wellness dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your wellness dashboard…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card text-center py-12 max-w-lg mx-auto space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unable to Load Dashboard</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={fetchDashboard} className="btn inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  const allLogs = data?.logs || [];
  const allAssessments = data?.assessments || [];
  const latest = data?.latest || (allAssessments.length ? allAssessments[allAssessments.length - 1] : null);

  // Filter based on weekly (7d) or 30d
  const filteredAssessments =
    timeRange === '7d' ? allAssessments.slice(-7) : allAssessments.slice(-30);

  // Feature 5: Weekly mood breakdown calculation
  const recentWeekLogs = allLogs.slice(-7);
  const moodCounts = { Happy: 0, Neutral: 0, Sad: 0, Stressed: 0, Anxious: 0 };
  recentWeekLogs.forEach((l) => {
    if (moodCounts[l.mood] !== undefined) moodCounts[l.mood]++;
  });

  const moodDoughnutData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        data: Object.values(moodCounts),
        backgroundColor: [
          '#10b981', // Happy: emerald
          '#64748b', // Neutral: slate
          '#3b82f6', // Sad: blue
          '#f97316', // Stressed: orange
          '#8b5cf6'  // Anxious: violet
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const labels = filteredAssessments.map((x) =>
    new Date(x.createdAt || x.loggedAt || Date.now()).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  );

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Stress Score (0-100)',
        data: filteredAssessments.map((x) => x.stressScore),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(156, 163, 175, 0.15)' }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Stress Score: ${ctx.parsed.y}/100`
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Personalized Welcome Banner */}
      <section className="card p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-brand-800 to-indigo-900 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-100 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-brand-200" />
              <span>Student Wellness Sanctuary</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300 font-bold">🔥 3-Day Active Streak</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              "You don't need to resolve every assignment or exam at once. Taking one steady, mindful breath right now is enough."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/check-in"
              className="btn px-4 py-2.5 text-xs font-bold bg-white text-brand-700 hover:bg-brand-50 shadow-lg shadow-black/10"
            >
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <span>Log Today's Check-In</span>
            </Link>

            <Link
              to="/mindfulness"
              className="btn px-4 py-2.5 text-xs font-bold bg-teal-500/90 hover:bg-teal-400 text-white shadow-lg shadow-black/10"
            >
              <Wind className="h-4 w-4" />
              <span>2-Min Calming Breath</span>
            </Link>

            <button
              onClick={fetchDashboard}
              disabled={loading}
              title="Refresh telemetry"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Critical Safety Escalation Notice */}
      {latest?.stressLevel === 'Critical' && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 dark:bg-red-950/70 dark:border-red-900 dark:text-red-100 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
            <div>
              <b className="font-semibold">Immediate Support Matters.</b> Your assessment indicated a critical stress level. Crisis counselors are ready to support you 24/7.
            </div>
            <Link to="/support" className="btn text-xs bg-red-600 hover:bg-red-700 py-1.5 px-3">
              Access Crisis Hotlines
            </Link>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Latest Stress Level</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2.5 py-1 text-sm font-semibold rounded-lg border ${colors[latest?.stressLevel] || 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                {latest?.stressLevel || 'No Data Yet'}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-brand-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Stress Score</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {latest?.stressScore ?? '—'}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Check-ins</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {allLogs.length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <Smile className="h-5 w-5" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Counseling Access</p>
            <Link
              to="/support"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Book 1-on-1 Session
            </Link>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Main Grid: Stress Trend Chart & Feature 5 Weekly Mood Breakdown */}
      <section className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
        {/* Trend Chart with 7d / 30d Toggle */}
        <div className="card flex flex-col justify-between min-h-[360px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Stress & Wellness Trend</h2>
            </div>
            {/* 7d vs 30d Toggle */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeRange === '7d'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeRange === '30d'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[240px]">
            {filteredAssessments.length > 0 ? (
              <div className="h-64 w-full">
                <Line data={lineData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Smile className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Check-in Data Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Complete your first quick mood check-in to see your personalized stress score and trend graph.
                </p>
                <Link to="/check-in" className="btn mt-4 text-xs">
                  Record Today’s Check-in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Feature 5: Weekly Mood Trend & Distribution Visualization */}
        <div className="card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Weekly Mood Visualization</h2>
            </div>
            <span className="text-xs text-slate-400">Past 7 days</span>
          </div>

          {recentWeekLogs.length > 0 ? (
            <div className="space-y-4">
              {/* Doughnut Chart */}
              <div className="h-44 flex items-center justify-center">
                <Doughnut
                  data={moodDoughnutData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '70%'
                  }}
                />
              </div>

              {/* Mood Pills Grid */}
              <div className="grid grid-cols-5 gap-1 text-center">
                {Object.entries(moodCounts).map(([m, cnt]) => (
                  <div key={m} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-lg block">{moodEmojis[m]}</span>
                    <span className="text-[10px] text-slate-500 font-medium block truncate">{m}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <Smile className="h-8 w-8 mb-2 opacity-50" />
              <span>No mood logs recorded in the past 7 days.</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Consistent check-ins improve prediction accuracy.
          </div>
        </div>
      </section>

      {/* Second Row: AI Insights & Personalized Recommendations */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* AI Insight Card */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">AI Wellness Insight</h2>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {latest?.insights?.[0] || 'Make your first daily check-in to receive AI-powered supportive insights.'}
          </p>
        </div>

        {/* Actionable Personalized Recommendations */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Personalized Recommendations</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {latest?.recommendations && latest.recommendations.length > 0 ? (
              latest.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <span className="text-brand-600 font-bold">•</span>
                  <span>Set aside 5 calm minutes away from screens today.</span>
                </li>
                <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <span className="text-brand-600 font-bold">•</span>
                  <span>Take a short walk between lecture blocks.</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </section>

      {/* AI Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}

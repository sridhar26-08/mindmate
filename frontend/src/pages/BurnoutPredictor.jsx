import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Moon, 
  BookOpen, 
  GraduationCap, 
  Smile, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BurnoutPredictor() {
  const [form, setForm] = useState({
    attendance_percentage: 82,
    study_hours: 6.5,
    assignment_workload: 6,
    sleep_duration: 6.5,
    recent_low_mood_days: 2
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pastAssessments, setPastAssessments] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/assessments');
      const burnoutHistory = (res.data || []).filter((x) => x.kind === 'burnout');
      setPastAssessments(burnoutHistory);
      if (burnoutHistory.length > 0 && !result) {
        // Show most recent as default
        const latest = burnoutHistory[0];
        setResult({
          risk: latest.burnoutRisk || 'Medium',
          score: latest.stressScore || 35,
          factors: latest.insights || [],
          recommendations: latest.recommendations || []
        });
      }
    } catch (err) {
      console.error('Failed to load past burnout assessments', err);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        attendance_percentage: parseFloat(form.attendance_percentage),
        study_hours: parseFloat(form.study_hours),
        assignment_workload: parseInt(form.assignment_workload, 10),
        sleep_duration: parseFloat(form.sleep_duration),
        recent_low_mood_days: parseInt(form.recent_low_mood_days, 10)
      };
      const res = await api.post('/assessments/burnout', payload);
      // The API returns the assessment document
      const doc = res.data;
      setResult({
        risk: doc.burnoutRisk || 'Low',
        score: doc.burnoutRisk === 'High' ? 65 : doc.burnoutRisk === 'Medium' ? 40 : 15,
        factors: doc.insights || [],
        recommendations: doc.recommendations || []
      });
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to calculate burnout prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-300';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 mb-2">
          <Flame className="h-3.5 w-3.5 text-rose-500" />
          Predictive Academic Health
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          AI Student Burnout Predictor
        </h1>
        <p className="mt-1.5 text-slate-500 text-sm max-w-2xl">
          Evaluate academic strain, sleep deficit, and emotional fatigue before burnout escalates. Our AI calculates your risk index and delivers tailored mitigation strategies.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr]">
        {/* Form Column */}
        <form onSubmit={handlePredict} className="card space-y-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Your Academic & Lifestyle Inputs
          </h2>

          {/* Attendance */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <GraduationCap className="h-4 w-4 text-slate-400" /> Attendance Percentage
              </span>
              <span className="font-bold text-brand-600">{form.attendance_percentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.attendance_percentage}
              onChange={(e) => setForm({ ...form, attendance_percentage: e.target.value })}
              className="accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0%</span>
              <span className="text-amber-500 font-medium">75% (Min. requirement)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Daily Study Hours */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400" /> Daily Self-Study Hours
              </span>
              <span className="font-bold text-brand-600">{form.study_hours} hrs/day</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={form.study_hours}
              onChange={(e) => setForm({ ...form, study_hours: e.target.value })}
              className="accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0 hrs</span>
              <span>Target: 3-5 hrs</span>
              <span>16 hrs</span>
            </div>
          </div>

          {/* Assignment Workload */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <BookOpen className="h-4 w-4 text-slate-400" /> Assignment & Deadline Pressure
              </span>
              <span className="font-bold text-brand-600">{form.assignment_workload} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={form.assignment_workload}
              onChange={(e) => setForm({ ...form, assignment_workload: e.target.value })}
              className="accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>1 (Light)</span>
              <span>5 (Moderate)</span>
              <span>10 (Overwhelming)</span>
            </div>
          </div>

          {/* Sleep Duration */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Moon className="h-4 w-4 text-slate-400" /> Average Sleep Duration
              </span>
              <span className="font-bold text-brand-600">{form.sleep_duration} hrs/night</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={form.sleep_duration}
              onChange={(e) => setForm({ ...form, sleep_duration: e.target.value })}
              className="accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>2 hrs (Severe debt)</span>
              <span className="text-emerald-600 font-medium">7-8 hrs (Optimal)</span>
              <span>12 hrs</span>
            </div>
          </div>

          {/* Low Mood Days */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium mb-1">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Smile className="h-4 w-4 text-slate-400" /> Low-Mood Days in Past 2 Weeks
              </span>
              <span className="font-bold text-brand-600">{form.recent_low_mood_days} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={form.recent_low_mood_days}
              onChange={(e) => setForm({ ...form, recent_low_mood_days: e.target.value })}
              className="accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0 days</span>
              <span>7 days</span>
              <span>14 days</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md"
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" /> Analyzing Academic Telemetry…
              </>
            ) : (
              <>
                <Flame className="h-4 w-4" /> Calculate Burnout Risk
              </>
            )}
          </button>
        </form>

        {/* Results Column */}
        <div className="space-y-6">
          {result ? (
            <div className="card space-y-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Predicted Risk Level</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                    Burnout Assessment Result
                  </h3>
                </div>
                <span className={`px-4 py-1.5 rounded-xl border text-sm font-bold uppercase tracking-wider ${getRiskColor(result.risk)}`}>
                  {result.risk} Risk
                </span>
              </div>

              {/* Identified Stress Factors */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Identified Contributing Factors
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {result.factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recovery Recommendations */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Personalized De-escalation Strategy
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Banner */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need personalized guidance?</span>
                <Link
                  to="/support"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-500"
                >
                  Book with Campus Counselor <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-slate-400 flex flex-col items-center justify-center">
              <Flame className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">Ready to Calculate</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Adjust your academic parameters on the left and click Calculate to view your AI burnout telemetry.
              </p>
            </div>
          )}

          {/* Past Assessments History */}
          {pastAssessments.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <History className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Past Burnout Assessments</h3>
              </div>
              <div className="space-y-2">
                {pastAssessments.slice(0, 4).map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(a.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{a.insights?.[0]}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getRiskColor(a.burnoutRisk || 'Low')}`}>
                      {a.burnoutRisk || 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

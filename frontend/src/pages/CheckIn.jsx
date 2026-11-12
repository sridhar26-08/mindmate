import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Wind, 
  MessageSquare, 
  Heart,
  Calendar,
  Activity,
  Smile,
  Meh,
  Frown,
  Zap
} from 'lucide-react';

const MOODS = [
  { name: 'Happy', emoji: '😊', desc: 'Feeling content, energized, or motivated', color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30' },
  { name: 'Neutral', emoji: '😐', desc: 'Feeling balanced or just going through the day', color: 'border-slate-400 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 ring-slate-400/30' },
  { name: 'Sad', emoji: '😔', desc: 'Feeling down, lonely, unmotivated, or blue', color: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-blue-500/30' },
  { name: 'Stressed', emoji: '😫', desc: 'Pressured by exams, deadlines, or workload', color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-amber-500/30' },
  { name: 'Anxious', emoji: '😟', desc: 'Worried, restless, overwhelmed, or nervous', color: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-rose-500/30' }
];

const FACTORS = [
  'Upcoming Exams',
  'Heavy Assignments',
  'Sleep Deprivation',
  'Loneliness / Homesick',
  'Peer Comparison',
  'Financial Concerns',
  'Health / Fatigue',
  'Social / Family Pressure'
];

export default function CheckIn() {
  const [mood, setMood] = useState('');
  const [journal, setJournal] = useState('');
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const nav = useNavigate();

  const toggleFactor = (f) => {
    setSelectedFactors((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!mood) return;
    setLoading(true);
    setError('');

    try {
      // Append factors and energy into journal context for AI analysis
      let fullJournal = journal.trim();
      const metadata = [];
      if (selectedFactors.length > 0) {
        metadata.push(`Contributing factors: ${selectedFactors.join(', ')}.`);
      }
      metadata.push(`Energy level: ${energyLevel}/10.`);
      if (metadata.length > 0) {
        fullJournal = fullJournal ? `${fullJournal}\n\n[Context: ${metadata.join(' ')}]` : `[Context: ${metadata.join(' ')}]`;
      }

      const res = await api.post('/moods', {
        mood,
        journal: fullJournal
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record check-in.');
    } finally {
      setLoading(false);
    }
  };

  // If check-in is complete, show rich assessment feedback
  if (result) {
    const assessment = result.assessment || {};
    const stressScore = assessment.stressScore ?? 30;
    const stressLevel = assessment.stressLevel || 'Moderate';

    const getScoreBadge = () => {
      if (stressLevel === 'Critical') return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      if (stressLevel === 'High') return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
      if (stressLevel === 'Moderate') return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card shadow-xl border-slate-200/80 dark:border-slate-800 text-center py-8 px-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Check-In Logged Successfully
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thank you for taking a mindful moment for yourself. Here is your AI wellness summary.
          </p>

          {/* Stress Score Gauge Card */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Assessed Stress Level
              </span>
              <span className={`badge border text-xs font-bold ${getScoreBadge()}`}>
                {stressLevel} ({stressScore}/100)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-700 ${
                  stressScore > 75
                    ? 'bg-rose-500'
                    : stressScore > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, stressScore))}%` }}
              />
            </div>

            {result.emergency && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>You are not alone.</strong> If you feel unsafe or in severe distress, please connect with a trusted person or call the 24/7 Lifeline at <strong>988</strong> right now.
                </div>
              </div>
            )}
          </div>

          {/* AI Tailored Recommendations */}
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div className="mt-5 text-left p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  MindMate AI Coping Steps
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {assessment.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3">
            <Link to="/mindfulness" className="btn-calm text-xs px-4 py-2.5">
              <Wind className="h-4 w-4" />
              <span>Try 2-Min Calming Breath</span>
            </Link>
            <button onClick={() => nav('/')} className="btn text-xs px-4 py-2.5">
              <span>View Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setMood('');
                setJournal('');
                setSelectedFactors([]);
              }}
              className="btn-secondary text-xs px-4 py-2.5"
            >
              Log Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 mb-2">
          <Heart className="h-3.5 w-3.5" />
          <span>Daily Wellness Check-In</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          How are you feeling today?
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Take 60 seconds to tune into yourself. There are no wrong answers and your response is confidential.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="card space-y-6">
        {/* Mood Selector Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            1. Select Your Primary Mood <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {MOODS.map((m) => {
              const selected = mood === m.name;
              return (
                <button
                  type="button"
                  key={m.name}
                  onClick={() => setMood(m.name)}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[92px] ${
                    selected
                      ? `${m.color} ring-2 shadow-sm font-bold scale-[1.02]`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-sm mb-1">{m.emoji}</span>
                  <span className="text-xs font-semibold">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>2. Current Energy Level</span>
            </label>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {energyLevel} / 10 {energyLevel <= 3 ? '(Exhausted)' : energyLevel <= 7 ? '(Moderate)' : '(Energized)'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        {/* Contributing Factors Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            3. What is influencing how you feel? <span className="text-slate-400 text-[10px] lowercase font-normal">(choose any)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FACTORS.map((f) => {
              const active = selectedFactors.includes(f);
              return (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFactor(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    active
                      ? 'bg-brand-600 text-white border-brand-600 font-semibold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Journal Reflection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            4. Private Journal Reflection <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            maxLength={3000}
            placeholder="Write freely about what happened today, thoughts racing through your mind, or what would help you feel lighter..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="text-xs leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Encrypted & private to your student account</span>
            <span>{journal.length} / 3000</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!mood || loading}
          className="btn w-full py-3 shadow-lg shadow-brand-500/25 font-bold"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Saving Check-In…</span>
            </span>
          ) : (
            'Complete Check-In & Get Insights'
          )}
        </button>
      </form>
    </div>
  );
}

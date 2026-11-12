import { useState, useEffect } from 'react';
import { 
  Wind, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Hand, 
  Volume2, 
  Flower2, 
  Coffee, 
  CheckCircle2, 
  Heart,
  Timer,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BREATH_PHASES = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', color: 'text-teal-600 dark:text-teal-400', ring: 'border-teal-500 shadow-teal-500/30' },
  { name: 'Hold', duration: 4, instruction: 'Hold gently... feel stillness and calm', color: 'text-indigo-600 dark:text-indigo-400', ring: 'border-indigo-500 shadow-indigo-500/30' },
  { name: 'Exhale', duration: 4, instruction: 'Exhale slowly and smoothly through your mouth...', color: 'text-purple-600 dark:text-purple-400', ring: 'border-purple-500 shadow-purple-500/30' },
  { name: 'Hold', duration: 4, instruction: 'Rest empty... release all lingering tension', color: 'text-blue-600 dark:text-blue-400', ring: 'border-blue-500 shadow-blue-500/30' }
];

const GROUNDING_STEPS = [
  { step: 1, count: 5, icon: Eye, title: '5 Things You Can See', prompt: 'Look around your desk or room. Notice 5 distinct objects, colors, or shadows.' },
  { step: 2, count: 4, icon: Hand, title: '4 Things You Can Touch', prompt: 'Notice 4 physical textures: your desk surface, clothes, keyboard, or feet on the floor.' },
  { step: 3, count: 3, icon: Volume2, title: '3 Things You Can Hear', prompt: 'Listen closely. The hum of a fan, birds outside, your breath, or distant footsteps.' },
  { step: 4, count: 2, icon: Flower2, title: '2 Things You Can Smell', prompt: 'Notice 2 scents: your coffee, paper, fresh air, or your favorite scent.' },
  { step: 5, count: 1, icon: Coffee, title: '1 Thing You Can Taste', prompt: 'Notice the lingering taste of mint, tea, water, or the feeling inside your mouth.' }
];

export default function Mindfulness() {
  // Breathing state
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState({});

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Next phase
            setPhaseIndex((p) => {
              const next = (p + 1) % BREATH_PHASES.length;
              if (next === 0) {
                setCompletedCycles((c) => c + 1);
              }
              return next;
            });
            return BREATH_PHASES[(phaseIndex + 1) % BREATH_PHASES.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phaseIndex]);

  const handleToggleBreathing = () => {
    setIsActive(!isActive);
  };

  const handleResetBreathing = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsLeft(4);
    setCompletedCycles(0);
  };

  const currentPhase = BREATH_PHASES[phaseIndex];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 mb-2">
          <Wind className="h-3.5 w-3.5" />
          <span>Interactive Mindful Sanctuary</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Mindful Breathing & Panic Relief
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Scientific micro-interventions to immediately de-escalate anxiety, soothe an overactive nervous system, and reset your academic focus.
        </p>
      </div>

      {/* Grid: Box Breathing Tool & Sensory Grounding */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Box Breathing Visualizer */}
        <div className="card border-teal-100 dark:border-teal-950 flex flex-col items-center justify-between min-h-[460px] text-center relative overflow-hidden bg-gradient-to-b from-white to-teal-50/30 dark:from-slate-900 dark:to-teal-950/20">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Box Breathing 4-4-4-4
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Cycles: <strong className="text-teal-600 dark:text-teal-400">{completedCycles}</strong>
            </span>
          </div>

          {/* Animated Circle Visualizer */}
          <div className="my-8 relative flex items-center justify-center">
            {/* Outer animated halo ring */}
            <div
              className={`w-56 h-56 rounded-full border-4 transition-all duration-1000 flex items-center justify-center shadow-xl ${
                currentPhase.ring
              } ${
                isActive && currentPhase.name === 'Inhale'
                  ? 'scale-125 bg-teal-500/10'
                  : isActive && currentPhase.name === 'Exhale'
                  ? 'scale-90 bg-purple-500/10'
                  : 'scale-105 bg-slate-100/50 dark:bg-slate-800/50'
              }`}
            >
              {/* Inner Circle with Phase and Timer */}
              <div className="text-center z-10 space-y-1">
                <span className={`text-2xl font-black tracking-tight ${currentPhase.color}`}>
                  {currentPhase.name}
                </span>
                <div className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                  {secondsLeft}s
                </div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {isActive ? 'Follow the rhythm' : 'Ready when you are'}
                </span>
              </div>
            </div>
          </div>

          {/* Guidance Subtitle */}
          <p className="text-xs text-slate-600 dark:text-slate-300 italic min-h-[32px] px-6">
            "{currentPhase.instruction}"
          </p>

          {/* Controls */}
          <div className="w-full pt-6 flex items-center justify-center gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleToggleBreathing}
              className={`btn px-6 py-2.5 text-sm font-bold flex items-center gap-2 ${
                isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start 4-Minute Reset</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetBreathing}
              className="btn-secondary px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300"
              title="Reset timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 5-4-3-2-1 Sensory Grounding Guide */}
        <div className="card flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  5-4-3-2-1 Grounding Method
                </span>
              </div>
              <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Panic & Anxiety Reducer
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              When anxious thoughts race ahead of exams or presentations, this grounding exercise pulls your mind back into the present moment.
            </p>

            {/* Stepper Progress */}
            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {GROUNDING_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setGroundingStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === groundingStep
                      ? 'bg-brand-600 dark:bg-brand-500 ring-2 ring-brand-500/30'
                      : idx < groundingStep
                      ? 'bg-teal-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Current Step Card */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              {(() => {
                const s = GROUNDING_STEPS[groundingStep];
                const Icon = s.icon;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center font-black text-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Step {s.step} of 5
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          {s.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {s.prompt}
                    </p>

                    <textarea
                      rows={2}
                      placeholder="Type your notes here or say them aloud in your mind..."
                      value={groundingInputs[s.step] || ''}
                      onChange={(e) =>
                        setGroundingInputs({ ...groundingInputs, [s.step]: e.target.value })
                      }
                      className="text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
              disabled={groundingStep === 0}
              className="btn-secondary text-xs px-3.5 py-2"
            >
              Previous Step
            </button>

            {groundingStep < GROUNDING_STEPS.length - 1 ? (
              <button
                onClick={() => setGroundingStep((prev) => prev + 1)}
                className="btn text-xs px-4 py-2"
              >
                <span>Next Step</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setGroundingStep(0);
                  setGroundingInputs({});
                }}
                className="btn-calm text-xs px-4 py-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Complete & Reset</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Quick Academic Wellbeing Tips */}
      <div className="card">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
          <span>Quick 60-Second Academic Micro-Resets</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>👀 The 20-20-20 Rule</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every 20 minutes looking at assignments, gaze at an object 20 feet away for 20 seconds to soothe optic nerve tension and headache fatigue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💧 Hydration & Posture Reset</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Drop your shoulders away from your ears, unclench your jaw, take three slow swallows of water, and straighten your lower spine.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💬 Talk to MindMate AI</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Need personalized advice right now? Open our 24/7 AI wellness companion on your dashboard for coping techniques tailored to your course load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


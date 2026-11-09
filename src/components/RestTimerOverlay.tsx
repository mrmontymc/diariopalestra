import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Timer, Play, Pause, X, Plus, Minus, Square, RotateCcw, FastForward } from 'lucide-react';

export const RestTimerOverlay: React.FC = () => {
  const { restTimer, pauseRestTimer, resumeRestTimer, addTimeRestTimer, stopRestTimer, startRestTimer } = useWorkout();
  const [isExpanded, setIsExpanded] = useState(false);

  if (restTimer.secondsRemaining <= 0 && !isExpanded) {
    return null;
  }

  const mins = Math.floor(restTimer.secondsRemaining / 60);
  const secs = restTimer.secondsRemaining % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const progressPercent = restTimer.totalSeconds > 0
    ? ((restTimer.totalSeconds - restTimer.secondsRemaining) / restTimer.totalSeconds) * 100
    : 0;

  return (
    <>
      {/* Floating mini bar when timer is active and not expanded */}
      {!isExpanded && restTimer.secondsRemaining > 0 && (
        <div className="fixed bottom-[60px] left-2.5 right-2.5 z-40 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            onClick={() => setIsExpanded(true)}
            className="bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center justify-between gap-1.5 cursor-pointer active:scale-99 transition-all hover:border-emerald-400"
            title="Tocca per ingrandire il timer di recupero"
          >
            {/* Left: Progress circle & time & label */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg className="w-9 h-9 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    className="stroke-zinc-800 fill-none"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    className="stroke-emerald-400 fill-none transition-all duration-300"
                    strokeWidth="3"
                    strokeDasharray={94}
                    strokeDashoffset={94 - (94 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <Timer className="w-3.5 h-3.5 text-emerald-400 absolute" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase truncate">
                  {restTimer.label || 'Recupero'}
                </div>
                <div className="text-base font-black font-mono tracking-tight text-emerald-300 leading-none">
                  {formattedTime}
                </div>
              </div>
            </div>

            {/* Right: Quick action buttons (-15s, +15s, Pause/Play, Interrompi) */}
            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              {/* -15s button */}
              <button
                type="button"
                onClick={() => addTimeRestTimer(-15)}
                className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-[11px] font-mono font-bold text-amber-300 border border-zinc-700/60 flex items-center gap-0.5 transition-colors"
                title="Riduci riposo di 15 secondi"
                aria-label="-15 secondi"
              >
                <Minus className="w-3 h-3 text-amber-400" />
                <span>15s</span>
              </button>

              {/* +15s button */}
              <button
                type="button"
                onClick={() => addTimeRestTimer(15)}
                className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl text-[11px] font-mono font-bold text-emerald-300 border border-zinc-700/60 flex items-center gap-0.5 transition-colors"
                title="Aumenta riposo di 15 secondi"
                aria-label="+15 secondi"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>15s</span>
              </button>

              {/* Pause / Resume */}
              {restTimer.isRunning ? (
                <button
                  type="button"
                  onClick={pauseRestTimer}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 border border-zinc-700/60 transition-colors"
                  title="Metti in pausa"
                  aria-label="Pausa"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRestTimer}
                  className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl border border-emerald-500/40 transition-colors"
                  title="Riprendi timer"
                  aria-label="Riprendi"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Interrompi button */}
              <button
                type="button"
                onClick={stopRestTimer}
                className="px-2 py-1.5 bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 border border-red-500/30 text-red-400 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Interrompi riposo"
                aria-label="Interrompi riposo"
              >
                <Square className="w-3 h-3 fill-current" />
                <span className="hidden xs:inline">Stop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 transition-colors"
              aria-label="Riduci finestra"
              title="Riduci a barra mini"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 uppercase tracking-wider">
              {restTimer.label || 'Recupero Super Serie'}
            </span>

            {/* Circular display */}
            <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-zinc-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-emerald-400 fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray={465}
                  strokeDashoffset={465 - (465 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  {formattedTime}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Target: {restTimer.totalSeconds}s
                </div>
              </div>
            </div>

            {/* Preset adjustment pills */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[60, 90, 105, 120].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => startRestTimer(s, restTimer.label)}
                  className={`py-1.5 px-1 text-xs font-bold rounded-xl border transition-all ${
                    restTimer.totalSeconds === s && restTimer.isRunning
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>

            {/* 15s Increase / Decrease Specific Controls */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => addTimeRestTimer(-15)}
                className="py-3 px-3 bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Minus className="w-4 h-4 text-amber-400" />
                <span>-15 Secondi</span>
              </button>

              <button
                type="button"
                onClick={() => addTimeRestTimer(15)}
                className="py-3 px-3 bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+15 Secondi</span>
              </button>
            </div>

            {/* Main Controls: Pause/Resume and Interrompi */}
            <div className="flex items-center gap-2">
              {restTimer.isRunning ? (
                <button
                  type="button"
                  onClick={pauseRestTimer}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausa</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRestTimer}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Riprendi</span>
                </button>
              )}

              {/* Interrompi button */}
              <button
                type="button"
                onClick={() => {
                  stopRestTimer();
                  setIsExpanded(false);
                }}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-current text-red-400" />
                <span>Interrompi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

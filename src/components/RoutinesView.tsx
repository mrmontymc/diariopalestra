import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutRoutine } from '../types/workout';
import { RoutineEditorModal } from './RoutineEditorModal';
import { WarmupModal } from './WarmupModal';
import {
  Play,
  Edit3,
  RotateCcw,
  Calendar,
  Sparkles,
  Flame,
  Coffee,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

interface RoutinesViewProps {
  onStartSession: () => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({ onStartSession }) => {
  const {
    routines,
    startWorkout,
    resetRoutinesToDefault,
    playedVolleyballFriday,
    setPlayedVolleyballFriday
  } = useWorkout();

  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [selectedWarmupDayKey, setSelectedWarmupDayKey] = useState<string | null>(null);
  const [showResetRoutinesConfirm, setShowResetRoutinesConfirm] = useState(false);

  const handleStartWorkout = (routineId: string) => {
    startWorkout(routineId);
    onStartSession();
  };

  return (
    <div className="space-y-4 pb-28 pt-3 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Title & Weekly Overview Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                Scheda di Allenamento
              </h1>
              <p className="text-[11px] text-zinc-400">
                4 sedute full body da 3 super serie (A/B alternate) + giorno braccia e cardio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetRoutinesConfirm(true)}
            className="p-2 text-zinc-500 hover:text-emerald-400 rounded-xl hover:bg-zinc-800 transition-colors"
            title="Ripristina valori originali PDF"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Volleyball Toggle Rule (from PDF Page 1) */}
        <div className="mt-3 p-3 bg-zinc-800/80 border border-zinc-700/70 rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Regola Pallavolo (Venerdì/Sabato)
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Se hai giocato a pallavolo venerdì: al sabato le gambe sono cotte. L'app apre col military e alleggerisce hip thrust e goblet squat (-20-25%).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={playedVolleyballFriday}
                onChange={e => setPlayedVolleyballFriday(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-3">
        {routines.map(routine => {
          const isRest = routine.isRestDay;

          return (
            <div
              key={routine.id}
              className={`border rounded-3xl p-4 transition-all shadow-lg ${
                isRest
                  ? 'bg-zinc-900/50 border-zinc-800/70'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Day badge & title */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                        isRest
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {routine.dayLabel}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {routine.orderCode}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white">
                    {routine.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {routine.subtitle}
                  </p>
                </div>

                {!isRest && (
                  <button
                    type="button"
                    onClick={() => setEditingRoutine(routine)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
                    title="Modifica scheda"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Routine exercises preview */}
              {!isRest ? (
                <>
                  <div className="space-y-1.5 my-3 bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/80">
                    {routine.superSets.map(pair => (
                      <div key={pair.id} className="text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-4 h-4 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
                            {pair.code}
                          </span>
                          <span className="text-zinc-200 font-medium truncate">
                            {pair.primary.label.split('(')[0]} + {pair.secondary.label.split('(')[0]}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0 ml-2">
                          {pair.targetRounds}×{pair.primary.targetReps.replace('4×', '').replace('3×', '')}
                        </span>
                      </div>
                    ))}

                    {/* Metcon preview */}
                    {routine.metcon && (
                      <div className="pt-1.5 mt-1.5 border-t border-zinc-800 flex items-center justify-between text-xs text-orange-400 font-medium">
                        <span className="flex items-center gap-1 truncate">
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          {routine.metcon.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">Cap 8-10'</span>
                      </div>
                    )}

                    {/* Cardio preview */}
                    {routine.cardio && (
                      <div className="pt-1.5 mt-1.5 border-t border-zinc-800 flex items-center justify-between text-xs text-cyan-400 font-medium">
                        <span>🚣 {routine.cardio.title}</span>
                        <span className="text-[10px] text-zinc-400">{routine.cardio.durationMin}'</span>
                      </div>
                    )}
                  </div>

                  {/* Riscaldamento Specifico Button (from PDF Page 2 - not stored in history) */}
                  <button
                    type="button"
                    onClick={() => setSelectedWarmupDayKey(routine.dayKey)}
                    className="w-full mb-2 py-2 px-3 bg-orange-500/10 hover:bg-orange-500/20 active:scale-98 border border-orange-500/25 rounded-2xl flex items-center justify-between text-xs font-semibold text-orange-300 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="font-bold text-white">
                        Vedi Riscaldamento Specifico (5' + 6-8')
                      </span>
                    </div>
                    <span className="text-[10px] text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-lg">
                      Guida PDF
                    </span>
                  </button>

                  {/* Start Workout Button */}
                  <button
                    type="button"
                    onClick={() => handleStartWorkout(routine.id)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Inizia Questa Seduta
                  </button>
                </>
              ) : (
                <div className="py-3 px-3 bg-zinc-950/40 rounded-2xl border border-zinc-800/60 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-zinc-400">
                    {routine.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Routine Editor Modal */}
      {editingRoutine && (
        <RoutineEditorModal
          routine={editingRoutine}
          isOpen={true}
          onClose={() => setEditingRoutine(null)}
        />
      )}

      {/* Warmup Modal (Extracted from PDF Page 2 - Ephemeral, not saved to history) */}
      {selectedWarmupDayKey && (
        <WarmupModal
          isOpen={true}
          onClose={() => setSelectedWarmupDayKey(null)}
          dayKey={selectedWarmupDayKey as any}
        />
      )}

      {/* In-app Reset Routines Confirmation Modal */}
      {showResetRoutinesConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Ripristina Schede Originali?
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Vuoi ripristinare tutte le schede di allenamento settimanali ai valori e agli esercizi originali descritti nel documento PDF?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetRoutinesConfirm(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl text-xs font-bold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  resetRoutinesToDefault();
                  setShowResetRoutinesConfirm(false);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl text-xs font-bold"
              >
                Sì, Ripristina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

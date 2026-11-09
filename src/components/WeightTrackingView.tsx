import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleGroup } from '../types/workout';
import { estimate1RM } from '../utils/progression';
import {
  Trophy,
  History,
  TrendingUp,
  Search,
  Dumbbell,
  Plus,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export const WeightTrackingView: React.FC = () => {
  const { variants, variantWeights, recordExerciseSetWeight, resetAllPRs } = useWorkout();
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);

  // Reset PRs modal & alert state
  const [showResetPRsModal, setShowResetPRsModal] = useState(false);
  const [resetSuccessBanner, setResetSuccessBanner] = useState(false);

  // Quick weight update modal state
  const [manualLogModal, setManualLogModal] = useState<{
    variantId: string;
    variantName: string;
    weight: number;
    reps: number;
  } | null>(null);

  const muscleFilters: { label: string; value: string }[] = [
    { label: 'Tutti', value: 'all' },
    { label: 'Core / Addome', value: 'core' },
    { label: 'Funzionali', value: 'funzionale' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Gambe', value: 'gambe' },
    { label: 'Petto', value: 'petto' },
    { label: 'Dorso', value: 'dorso' },
    { label: 'Glutei / Posteriore', value: 'glutei' },
    { label: 'Spalle', value: 'spalle' },
    { label: 'Braccia', value: 'braccia' }
  ];

  const filteredVariants = variants.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.parentPattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedMuscle === 'all') return true;
    if (selectedMuscle === 'funzionale') return v.category === 'funzionale' || v.parentPattern === 'thruster' || v.parentPattern === 'functional';
    if (selectedMuscle === 'cardio') return v.category === 'cardio' || v.equipment === 'air_bike' || v.equipment === 'skierg' || v.equipment === 'vogatore' || v.equipment === 'tapis_roulant';
    if (selectedMuscle === 'core') return v.muscleGroup === 'core' || v.parentPattern === 'core';
    if (selectedMuscle === 'glutei') return v.muscleGroup === 'glutei' || v.muscleGroup === 'catena_posteriore';
    return v.muscleGroup === selectedMuscle;
  });

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLogModal) return;
    recordExerciseSetWeight(manualLogModal.variantId, manualLogModal.weight, manualLogModal.reps);
    setManualLogModal(null);
  };

  const handleConfirmResetAllPRs = () => {
    resetAllPRs();
    setShowResetPRsModal(false);
    setResetSuccessBanner(true);
    setTimeout(() => {
      setResetSuccessBanner(false);
    }, 3500);
  };

  return (
    <div className="space-y-4 pb-28 pt-3 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                Tracker Carichi & PR
              </h1>
              <p className="text-[11px] text-zinc-400">
                Storico carichi, PR e progressioni per ogni singolo esercizio
              </p>
            </div>
          </div>

          {/* Reset All PRs button */}
          <button
            type="button"
            onClick={() => setShowResetPRsModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 border border-red-500/20 text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0"
            title="Azzera tutti i PR a zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Azzera PR</span>
          </button>
        </div>

        {/* Success notification banner after PR reset */}
        {resetSuccessBanner && (
          <div className="mt-3 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Tutti i PR e carichi sono stati azzerati a 0 kg con successo!</span>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca esercizio (es. Squat, Panca, Trazioni, Affondi)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/90 border border-zinc-700/70 rounded-2xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Horizontal muscle filters scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {muscleFilters.map(filter => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedMuscle(filter.value)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMuscle === filter.value
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise cards */}
      <div className="space-y-3">
        {filteredVariants.map(variant => {
          const stats = variantWeights[variant.id];
          const prWeight = stats?.maxWeightKg || 0;
          const lastWeight = stats?.lastUsedWeightKg || 0;
          const lastReps = stats?.lastUsedReps || 0;
          const estimated1RM = estimate1RM(lastWeight, lastReps);
          const isExpanded = expandedVariantId === variant.id;
          const hasHistory = stats && stats.history && stats.history.length > 0;

          return (
            <div
              key={variant.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        variant.category === 'fondamentale'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {variant.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-400 capitalize">
                      {variant.equipment}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-400 capitalize">
                      {variant.muscleGroup}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white">
                    {variant.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setManualLogModal({
                      variantId: variant.id,
                      variantName: variant.name,
                      weight: lastWeight || 20,
                      reps: lastReps || 5
                    })
                  }
                  className="p-2 text-zinc-400 hover:text-emerald-400 rounded-xl hover:bg-zinc-800"
                  title="Aggiorna carico"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progression rule summary */}
              <div className="mt-2 text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-2xl border border-zinc-800/80">
                <span className="font-semibold text-zinc-300">Regola: </span>
                {variant.progressionRule}
              </div>

              {/* Stats badges grid */}
              {(() => {
                const unitLabel = variant.defaultUnit === 'secondi' ? 's' :
                  variant.defaultUnit === 'calorie' ? 'cal' :
                  variant.defaultUnit === 'metri' ? 'm' :
                  variant.defaultUnit === 'kg_lato' ? 'kg/lato' : 'kg';

                return (
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-2">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400 uppercase">
                        <Trophy className="w-3 h-3" /> PR
                      </div>
                      <div className="text-sm font-black font-mono text-white mt-0.5">
                        {prWeight > 0 ? `${prWeight} ${unitLabel}` : '--'}
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-2">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        Ultimo Record
                      </div>
                      <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                        {lastWeight > 0 ? `${lastWeight} ${unitLabel}` : '--'}
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-2">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        {variant.defaultUnit === 'kg' || variant.defaultUnit === 'kg_lato' ? '1RM Stimato' : 'Target Rip'}
                      </div>
                      <div className="text-sm font-black font-mono text-zinc-300 mt-0.5">
                        {variant.defaultUnit === 'kg' || variant.defaultUnit === 'kg_lato'
                          ? (estimated1RM > 0 ? `${estimated1RM} kg` : '--')
                          : (lastReps > 0 ? `${lastReps} rip` : '--')}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Toggle History Details */}
              <button
                type="button"
                onClick={() => setExpandedVariantId(isExpanded ? null : variant.id)}
                className="w-full mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 hover:text-white"
              >
                <span>Storico sedute ({stats?.history?.length || 0})</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Expanded History list */}
              {isExpanded && (
                <div className="mt-3 space-y-2 pt-1">
                  {hasHistory ? (
                    stats.history.map((h, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-zinc-400">
                            {new Date(h.date).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-400">
                            Max: {h.maxWeight} kg
                          </span>
                          <span className="text-zinc-400 text-[11px]">
                            Vol: {h.volumeKg} kg
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 text-center py-2">
                      Nessun allenamento ancora registrato per questa variante.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Weight Update Modal */}
      {manualLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Aggiorna Carico & PR
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {manualLogModal.variantName}
            </p>

            <form onSubmit={handleSaveManualLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Carico sollevato (kg)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setManualLogModal(prev => (prev ? { ...prev, weight: Math.max(0, prev.weight - 2.5) } : null))
                    }
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={manualLogModal.weight}
                    onChange={e =>
                      setManualLogModal(prev => (prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null))
                    }
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-center text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setManualLogModal(prev => (prev ? { ...prev, weight: prev.weight + 2.5 } : null))
                    }
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Ripetizioni eseguite
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={manualLogModal.reps}
                  onChange={e =>
                    setManualLogModal(prev => (prev ? { ...prev, reps: parseInt(e.target.value) || 5 } : null))
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-center text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualLogModal(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold"
                >
                  Salva nel Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset All PRs In-App Confirmation Modal */}
      {showResetPRsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Azzera Tutti i Record (PR)?
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Questa operazione imposterà a <strong className="text-red-400">0 kg</strong> tutti i massimali (PR) e i carichi salvati per ogni esercizio nel database.
              </p>
              <div className="mt-3 p-2.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 text-left">
                <span className="text-zinc-200 font-semibold block mb-0.5">• I nuovi allenamenti</span>
                partiranno da zero (o dal solo bilanciere vuoto da 20 kg).
                <span className="text-zinc-200 font-semibold block mt-1">• Lo storico sedute</span>
                precedenti resta archiviato per consultazione.
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetPRsModal(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl text-xs font-bold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAllPRs}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-500/20"
              >
                Sì, Azzera PR a Zero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

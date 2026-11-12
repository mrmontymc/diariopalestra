import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import {
  GeneratedMetcon,
  generateRandomMetcon,
  toMetconConfig,
  toMetconResultLog
} from '../utils/metconGenerator';
import { MetconResultLog } from '../types/workout';
import {
  X,
  Flame,
  Dices,
  RefreshCw,
  Clock,
  Play,
  Check,
  Calendar,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';

interface MetconGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession?: () => void;
  onCustomize?: (metcon: MetconResultLog) => void;
}

export const MetconGeneratorModal: React.FC<MetconGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  onCustomize
}) => {
  const { routines, applyMetconToRoutine, startMetconWorkout } = useWorkout();

  // Generator filter settings
  const [durationFilter, setDurationFilter] = useState<number | 'random'>('random');
  const [functionalCountFilter, setFunctionalCountFilter] = useState<2 | 3 | 'random'>('random');
  const [typeFilter, setTypeFilter] = useState<'amrap' | 'for_time' | 'emom' | 'random'>('random');
  const [showFilters, setShowFilters] = useState(false);

  // Currently generated Metcon
  const [currentMetcon, setCurrentMetcon] = useState<GeneratedMetcon>(() => generateRandomMetcon());
  const [isRolling, setIsRolling] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    () => routines.find(r => !r.isRestDay)?.id || routines[0]?.id || ''
  );
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRollNew = () => {
    setIsRolling(true);
    setTimeout(() => {
      const generated = generateRandomMetcon({
        durationMin: durationFilter === 'random' ? undefined : durationFilter,
        functionalCount: functionalCountFilter === 'random' ? undefined : functionalCountFilter,
        preferredType: typeFilter
      });
      setCurrentMetcon(generated);
      setIsRolling(false);
      setAppliedSuccess(null);
    }, 120);
  };

  const handleApplyToRoutine = () => {
    if (!selectedRoutineId) return;
    const targetRoutine = routines.find(r => r.id === selectedRoutineId);
    if (!targetRoutine) return;

    const metconConfig = toMetconConfig(currentMetcon);
    applyMetconToRoutine(selectedRoutineId, metconConfig);

    setAppliedSuccess(`Assegnato a: ${targetRoutine.dayLabel} (${targetRoutine.title})`);
    setTimeout(() => setAppliedSuccess(null), 3500);
  };

  const handleStartImmediately = () => {
    const metconLog = toMetconResultLog(currentMetcon);
    startMetconWorkout(metconLog, `Metcon Generato • ${currentMetcon.title}`);
    onClose();
    if (onStartSession) {
      onStartSession();
    }
  };

  const handleOpenCustomize = () => {
    if (onCustomize) {
      const metconLog = toMetconResultLog(currentMetcon);
      onClose();
      onCustomize(metconLog);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                  Generatore Metcon
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black rounded bg-orange-500/15 text-orange-300 border border-orange-500/25">
                  9-15 MIN
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                Cardio & Funzionale
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 hover:bg-zinc-750 transition-colors shrink-0"
            title="Chiudi"
            aria-label="Chiudi finestra"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5 space-y-3">
          {/* Quick Roll / Generate Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRollNew}
              disabled={isRolling}
              className="flex-1 min-w-0 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-98 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all truncate"
            >
              <Dices className={`w-4 h-4 shrink-0 ${isRolling ? 'animate-spin' : ''}`} />
              <span className="truncate">Genera Nuovo Metcon</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold shrink-0 ${
                showFilters
                  ? 'bg-zinc-800 text-orange-300 border-orange-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Filtri & Opzioni di generazione"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[11px]">Filtri</span>
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Collapsible Filters / Options Section */}
          {showFilters && (
            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 space-y-2.5 animate-in fade-in duration-150">
              <div className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  Parametri di Generazione
                </span>
                <span className="text-[10px] text-zinc-400">1 Cardio + 2/3 Funz.</span>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                  Durata (range 9 - 15 minuti):
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'random', label: '🎲 Qualsiasi' },
                    { id: 9, label: "9'" },
                    { id: 10, label: "10'" },
                    { id: 12, label: "12'" },
                    { id: 14, label: "14'" },
                    { id: 15, label: "15'" }
                  ].map(opt => (
                    <button
                      key={String(opt.id)}
                      type="button"
                      onClick={() => setDurationFilter(opt.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border transition-all ${
                        durationFilter === opt.id
                          ? 'bg-orange-500 text-zinc-950 border-orange-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional count & type */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                    Esercizi Funzionali:
                  </label>
                  <div className="flex gap-1">
                    {[
                      { id: 'random', label: '🎲 2 o 3' },
                      { id: 2, label: '2 Ex' },
                      { id: 3, label: '3 Ex' }
                    ].map(opt => (
                      <button
                        key={String(opt.id)}
                        type="button"
                        onClick={() => setFunctionalCountFilter(opt.id as any)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all text-center ${
                          functionalCountFilter === opt.id
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                    Tipologia:
                  </label>
                  <div className="flex gap-1">
                    {[
                      { id: 'random', label: '🎲 Tutti' },
                      { id: 'amrap', label: 'AMRAP' },
                      { id: 'for_time', label: 'For Time' },
                      { id: 'emom', label: 'EMOM' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTypeFilter(opt.id as any)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all text-center truncate ${
                          typeFilter === opt.id
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN GENERATED METCON DISPLAY CARD */}
          <div className="bg-zinc-900 border border-orange-500/35 rounded-2xl p-3 sm:p-3.5 shadow-xl space-y-3 relative overflow-hidden">
            {/* Top Bar with Title and Type */}
            <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {currentMetcon.type === 'amrap' ? 'AMRAP' : currentMetcon.type === 'for_time' ? 'For Time' : 'EMOM'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    {currentMetcon.durationMin}' ({currentMetcon.timeCapSec}s cap)
                  </span>
                  {currentMetcon.targetRounds && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {currentMetcon.targetRounds} Giri
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white leading-tight">
                  {currentMetcon.title}
                </h3>
              </div>

              {/* Reroll Button in card header */}
              <button
                type="button"
                onClick={handleRollNew}
                disabled={isRolling}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-orange-400 rounded-xl border border-zinc-700 transition-all shrink-0"
                title="Rigenera Metcon"
                aria-label="Rigenera Metcon"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin text-orange-300' : ''}`} />
              </button>
            </div>

            {/* Sequence of Exercises - Perfectly Balanced Row Layout (No Horizontal Overflow) */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Sequenza Esercizi</span>
                <span className="text-orange-400 font-mono">
                  1 Cardio + {currentMetcon.functionalMovements.length} Funzionali
                </span>
              </div>

              {/* 1. CARDIO EXERCISE WITH CALORIE TARGET */}
              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-950/35 via-zinc-950 to-zinc-950 border border-orange-500/35 rounded-xl flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0 border border-orange-500/40">
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
                      {currentMetcon.cardioMovement.name}
                    </div>
                    {currentMetcon.cardioMovement.note && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight line-clamp-1">
                        {currentMetcon.cardioMovement.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black font-mono text-xs rounded-lg shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    {currentMetcon.cardioMovement.repsOrDist}
                  </span>
                </div>
              </div>

              {/* 2 & 3 (and 4) FUNCTIONAL EXERCISES */}
              {currentMetcon.functionalMovements.map((mov, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 font-black text-xs flex items-center justify-center shrink-0 border border-zinc-700/60">
                      {idx + 2}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
                        {mov.name}
                      </div>
                      {mov.note && (
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight line-clamp-1">
                          {mov.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs rounded-lg whitespace-nowrap">
                      {mov.repsOrDist}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategy / Instructions */}
            <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <span className="text-[10px] font-bold text-orange-400 block mb-0.5">
                💡 Strategia & Ritmo:
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {currentMetcon.instructions}
              </p>
            </div>
          </div>

          {/* Success Banner if Assigned */}
          {appliedSuccess && (
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0" />
              <span className="truncate">{appliedSuccess}</span>
            </div>
          )}

          {/* Assignment to a specific routine */}
          <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assegna questo Metcon alla scheda:</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedRoutineId}
                onChange={e => setSelectedRoutineId(e.target.value)}
                className="flex-1 min-w-0 w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-white truncate focus:outline-none focus:border-emerald-500"
              >
                {routines.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.dayLabel} • {r.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleApplyToRoutine}
                className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1 transition-all shrink-0 shadow-md"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions - Compact & Centered */}
        <div className="p-3 sm:p-3.5 border-t border-zinc-800/80 bg-zinc-900/90 flex items-center gap-2 shrink-0">
          {onCustomize && (
            <button
              type="button"
              onClick={handleOpenCustomize}
              className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="Personalizza parametri o movimenti"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              <span>Personalizza</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStartImmediately}
            className="flex-1 min-w-0 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-98 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all truncate"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">Avvia Metcon ({currentMetcon.durationMin}')</span>
          </button>
        </div>
      </div>
    </div>
  );
};

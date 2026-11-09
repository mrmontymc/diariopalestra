import React, { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { VariantSelectorModal } from './VariantSelectorModal';
import { MetconCustomizerModal } from './MetconCustomizerModal';
import { MetconSection } from './MetconSection';
import { WarmupModal } from './WarmupModal';
import { evaluateProgression } from '../utils/progression';
import { MetconResultLog } from '../types/workout';
import {
  Play,
  Pause,
  Check,
  Timer,
  ArrowRightLeft,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  Plus,
  Minus,
  Activity,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { playShortBeep, playTimerFinishBeep } from '../utils/audio';

export const ActiveWorkoutView: React.FC = () => {
  const {
    activeSession,
    updateActiveSession,
    finishWorkout,
    discardActiveWorkout,
    variants,
    startRestTimer,
    swapExerciseInRoutine,
    restTimer,
    getLastRecordedWeightForVariant,
    recordExerciseSetWeight
  } = useWorkout();

  // All Hooks MUST be at the top of the component unconditionally
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [directWeightModal, setDirectWeightModal] = useState<{
    exerciseIdx: number;
    setIdx: number;
    currentWeight: number;
    exerciseName: string;
  } | null>(null);
  const [directWeightInput, setDirectWeightInput] = useState<string>('');
  const [propagateToAllSets, setPropagateToAllSets] = useState<boolean>(true);

  const [selectedVariantModal, setSelectedVariantModal] = useState<{
    isOpen: boolean;
    exerciseIndex: number;
    currentVariantId: string;
    pattern: string;
  }>({
    isOpen: false,
    exerciseIndex: -1,
    currentVariantId: '',
    pattern: ''
  });

  const [showMetconModal, setShowMetconModal] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Active workout duration ticker
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation and round mode states
  const [activeTab, setActiveTab] = useState<string>('pair-0');
  const [pairActiveRound, setPairActiveRound] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<'focus' | 'matrix'>('focus');

  // Early return if no session
  if (!activeSession) return null;

  const workoutDurationSec = Math.max(0, Math.floor((now - activeSession.startTime) / 1000));
  const formatSecs = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentRestRunningSec = restTimer.isRunning
    ? Math.max(0, restTimer.totalSeconds - restTimer.secondsRemaining)
    : 0;
  const totalActualRestSec = (activeSession.totalActualRestSec || 0) + currentRestRunningSec;
  const restPeriodsCount = activeSession.restPeriods?.length || 0;

  // Group exercise logs into Pairs (usually 2 exercises per pair: Fondamentale + Metabolico)
  const pairLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const pairGroups: {
    pairIndex: number;
    pairCode: string;
    primaryLogIndex: number;
    secondaryLogIndex?: number;
    isSuperSet: boolean;
  }[] = [];

  for (let i = 0; i < activeSession.exerciseLogs.length; i += 2) {
    const pIdx = Math.floor(i / 2);
    pairGroups.push({
      pairIndex: pIdx + 1,
      pairCode: pairLetters[pIdx] || `${pIdx + 1}`,
      primaryLogIndex: i,
      secondaryLogIndex: i + 1 < activeSession.exerciseLogs.length ? i + 1 : undefined,
      isSuperSet: i + 1 < activeSession.exerciseLogs.length
    });
  }

  // Active pair data for selected tab
  const activePairIndex = activeTab.startsWith('pair-') ? parseInt(activeTab.replace('pair-', ''), 10) : 0;
  const currentPairGroup = pairGroups[activePairIndex] || pairGroups[0];

  const primaryLog = currentPairGroup ? activeSession.exerciseLogs[currentPairGroup.primaryLogIndex] : null;
  const secondaryLog = currentPairGroup && currentPairGroup.secondaryLogIndex !== undefined
    ? activeSession.exerciseLogs[currentPairGroup.secondaryLogIndex]
    : null;

  const pVariant = primaryLog ? variants.find(v => v.id === primaryLog.variantId) : null;
  const sVariant = secondaryLog ? variants.find(v => v.id === secondaryLog.variantId) : null;

  const pProgression = pVariant && primaryLog
    ? evaluateProgression(pVariant, primaryLog.sets, primaryLog.sets[0]?.actualWeight || 0)
    : null;
  const sProgression = sVariant && secondaryLog
    ? evaluateProgression(sVariant, secondaryLog.sets, secondaryLog.sets[0]?.actualWeight || 0)
    : null;

  const maxRounds = primaryLog ? Math.max(primaryLog.sets.length, secondaryLog?.sets.length || 0) : 0;
  const currentRoundIdx = Math.min(Math.max(0, maxRounds - 1), Math.max(0, pairActiveRound[activePairIndex] ?? 0));

  const primarySet = primaryLog?.sets[currentRoundIdx] || primaryLog?.sets[0];
  const secondarySet = secondaryLog ? (secondaryLog.sets[currentRoundIdx] || secondaryLog.sets[0]) : null;

  const isCurrentRoundCompleted = primarySet?.completed && (!secondarySet || secondarySet.completed);
  const allRoundsInPairCompleted = primaryLog?.sets.every(s => s.completed) &&
    (!secondaryLog || secondaryLog.sets.every(s => s.completed));

  // Set modifier helpers - PURE state updates with side effects kept OUTSIDE
  const handleWeightChange = (exerciseIdx: number, setIdx: number, delta: number) => {
    playShortBeep(600, 0.04);
    const targetLog = activeSession.exerciseLogs[exerciseIdx];
    if (!targetLog) return;
    const oldWeight = targetLog.sets[setIdx]?.actualWeight || 0;
    const newWeight = Math.max(0, Math.round((oldWeight + delta) * 10) / 10);
    const reps = targetLog.sets[setIdx]?.actualReps || 0;

    updateActiveSession(prev => {
      const logs = [...prev.exerciseLogs];
      const tLog = { ...logs[exerciseIdx] };
      const updatedSets = tLog.sets.map((s, idx) => {
        if (idx === setIdx) return { ...s, actualWeight: newWeight };
        if (setIdx === 0 && !s.completed && s.actualWeight === oldWeight) {
          return { ...s, actualWeight: newWeight };
        }
        return s;
      });
      tLog.sets = updatedSets;
      logs[exerciseIdx] = tLog;
      return { ...prev, exerciseLogs: logs };
    });

    recordExerciseSetWeight(targetLog.variantId, newWeight, reps);
  };

  const handleConfirmDirectWeight = (exerciseIdx: number, setIdx: number, newWeight: number, applyAll: boolean) => {
    const targetLog = activeSession.exerciseLogs[exerciseIdx];
    if (!targetLog) return;
    const reps = targetLog.sets[setIdx]?.actualReps || 0;

    updateActiveSession(prev => {
      const logs = [...prev.exerciseLogs];
      const tLog = { ...logs[exerciseIdx] };
      const sets = tLog.sets.map((s, idx) => {
        if (idx === setIdx || (applyAll && !s.completed)) {
          return { ...s, actualWeight: newWeight };
        }
        return s;
      });
      tLog.sets = sets;
      logs[exerciseIdx] = tLog;
      return { ...prev, exerciseLogs: logs };
    });

    recordExerciseSetWeight(targetLog.variantId, newWeight, reps);
  };

  const handleRepsChange = (exerciseIdx: number, setIdx: number, delta: number) => {
    playShortBeep(700, 0.04);
    updateActiveSession(prev => {
      const logs = [...prev.exerciseLogs];
      const tLog = { ...logs[exerciseIdx] };
      const sets = [...tLog.sets];
      const newReps = Math.max(0, sets[setIdx].actualReps + delta);
      sets[setIdx] = { ...sets[setIdx], actualReps: newReps };
      tLog.sets = sets;
      logs[exerciseIdx] = tLog;
      return { ...prev, exerciseLogs: logs };
    });
  };

  const toggleSetCompleted = (pairIdx: number, exerciseIdx: number, setIdx: number) => {
    const currentLogs = activeSession.exerciseLogs;
    const targetLog = currentLogs[exerciseIdx];
    if (!targetLog) return;
    const targetSet = targetLog.sets[setIdx];
    if (!targetSet) return;

    const isNowCompleted = !targetSet.completed;
    const weightToRecord = targetSet.actualWeight || 0;
    const repsToRecord = targetSet.actualReps || 0;

    const pg = pairGroups[pairIdx];
    let shouldTriggerRest = false;
    let restLabel = '';
    let nextRoundIdx = -1;

    if (isNowCompleted && pg) {
      const pLog = currentLogs[pg.primaryLogIndex];
      const sLog = pg.secondaryLogIndex !== undefined ? currentLogs[pg.secondaryLogIndex] : null;

      const pWillBeDone = exerciseIdx === pg.primaryLogIndex ? true : (pLog.sets[setIdx]?.completed ?? false);
      const sWillBeDone = pg.secondaryLogIndex === undefined ||
        (exerciseIdx === pg.secondaryLogIndex ? true : (sLog?.sets[setIdx]?.completed ?? false));

      if (pWillBeDone && sWillBeDone) {
        shouldTriggerRest = true;
        restLabel = `Recupero Coppia ${pg.pairCode} (Giro ${setIdx + 1})`;
        if (setIdx < 3) {
          nextRoundIdx = setIdx + 1;
        }
      }
    }

    updateActiveSession(prev => {
      const logs = [...prev.exerciseLogs];
      const tLog = { ...logs[exerciseIdx] };
      const sets = [...tLog.sets];
      sets[setIdx] = { ...sets[setIdx], completed: isNowCompleted };
      tLog.sets = sets;
      logs[exerciseIdx] = tLog;
      return { ...prev, exerciseLogs: logs };
    });

    if (isNowCompleted) {
      playShortBeep(880, 0.08);
      if (weightToRecord > 0) {
        recordExerciseSetWeight(targetLog.variantId, weightToRecord, repsToRecord);
      }
    }

    if (shouldTriggerRest) {
      playTimerFinishBeep();
      const restTime = setIdx === 3 ? 120 : 105;
      startRestTimer(restTime, restLabel);

      if (nextRoundIdx !== -1) {
        setPairActiveRound(curr => ({
          ...curr,
          [pairIdx]: nextRoundIdx
        }));
      }
    }
  };

  const handleSwapVariant = (newVariantId: string, applyToMaster = true) => {
    const { exerciseIndex } = selectedVariantModal;
    if (exerciseIndex < 0) return;

    const newVariant = variants.find(v => v.id === newVariantId);
    if (!newVariant) return;

    const defaultWeight = getLastRecordedWeightForVariant(newVariant.id, newVariant.name);

    updateActiveSession(prev => {
      const logs = [...prev.exerciseLogs];
      const oldLog = logs[exerciseIndex];
      const updatedSets = oldLog.sets.map(s => ({
        ...s,
        targetWeight: defaultWeight,
        actualWeight: defaultWeight
      }));

      logs[exerciseIndex] = {
        ...oldLog,
        variantId: newVariant.id,
        variantName: newVariant.name,
        isFondamentale: newVariant.category === 'fondamentale',
        sets: updatedSets
      };

      return { ...prev, exerciseLogs: logs };
    });

    if (applyToMaster) {
      const pairNum = Math.floor(exerciseIndex / 2);
      const isPrimary = exerciseIndex % 2 === 0;
      const pairCode = pairLetters[pairNum] || `${pairNum + 1}`;
      swapExerciseInRoutine(activeSession.routineId, `pair_${pairCode}`, isPrimary ? 'primary' : 'secondary', newVariant.id);
    }

    setSelectedVariantModal({ isOpen: false, exerciseIndex: -1, currentVariantId: '', pattern: '' });
  };

  const handleApplyCustomMetcon = (newMetcon: MetconResultLog) => {
    updateActiveSession(prev => ({
      ...prev,
      metconLog: newMetcon
    }));
  };

  const totalSets = activeSession.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
  const completedSets = activeSession.exerciseLogs.reduce(
    (acc, log) => acc + log.sets.filter(s => s.completed).length,
    0
  );
  const workoutProgressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 pt-2 px-2 sm:px-4 max-w-lg mx-auto w-full box-border">
      {/* Sticky Compact Header - Two-line layout to prevent title and button collision */}
      <header className="sticky top-1 z-20 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-2.5 mb-2.5 shadow-xl w-full">
        {/* Top Header Row: Status, Ticker, Warmup, Termina, Discard */}
        <div className="flex items-center justify-between gap-1.5 mb-1 w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 shrink-0">
              In Corso
            </span>
            <span className="text-zinc-500 text-[10px] shrink-0">•</span>
            <span className="text-xs font-mono font-bold text-zinc-200 shrink-0">
              {formatSecs(workoutDurationSec)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Warmup Button */}
            <button
              type="button"
              onClick={() => setShowWarmupModal(true)}
              className="px-2 py-1 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 rounded-lg text-[10px] font-bold text-orange-400 flex items-center gap-1 transition-colors shrink-0"
              title="Visualizza Riscaldamento Specifico (PDF)"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Warm-up</span>
            </button>

            {/* Quick Finish Button */}
            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black text-[10px] rounded-lg flex items-center gap-1 shadow-sm transition-all shrink-0"
              title="Termina e salva allenamento"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Termina</span>
            </button>

            {/* Discard Workout Button */}
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
              title="Abbandona allenamento"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Second Header Row: Routine title */}
        <div className="mb-1.5">
          <h1 className="text-xs sm:text-sm font-bold text-white truncate">
            {activeSession.routineTitle}
          </h1>
        </div>

        {/* Third Header Row: Real Rest & Progress Bar */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium mb-1">
          <span className="flex items-center gap-1 truncate">
            <Timer className="w-3 h-3 text-emerald-400 shrink-0" />
            Riposo: <strong className="text-emerald-400 font-mono">{formatSecs(totalActualRestSec)}</strong> ({restPeriodsCount}p)
          </span>
          <span className="font-bold text-zinc-200 shrink-0">
            {completedSets}/{totalSets} ({workoutProgressPercent}%)
          </span>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${workoutProgressPercent}%` }}
          />
        </div>

        {activeSession.fatigueAdjustmentsApplied && (
          <div className="mt-1.5 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">Adattamento Pallavolo attivo (-20-25%).</span>
          </div>
        )}
      </header>

      {/* Primary Section Segmented Bar (Mobile Tabs: Coppia A, B, C, Metcon, Cardio) */}
      <nav aria-label="Sezioni Allenamento" className="mb-2.5 w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full">
          {pairGroups.map((pg, idx) => {
            const pLog = activeSession.exerciseLogs[pg.primaryLogIndex];
            const sLog = pg.secondaryLogIndex !== undefined ? activeSession.exerciseLogs[pg.secondaryLogIndex] : null;

            const totalPairSets = (pLog?.sets.length || 0) + (sLog?.sets.length || 0);
            const donePairSets = (pLog?.sets.filter(s => s.completed).length || 0) +
                                 (sLog?.sets.filter(s => s.completed).length || 0);
            const isPairFinished = totalPairSets > 0 && donePairSets === totalPairSets;
            const isPairActive = activeTab === `pair-${idx}`;

            return (
              <button
                key={pg.pairIndex}
                type="button"
                onClick={() => setActiveTab(`pair-${idx}`)}
                className={`py-1.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center shrink-0 min-w-[70px] ${
                  isPairActive
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : isPairFinished
                    ? 'bg-zinc-900 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black">Coppia {pg.pairCode}</span>
                  {isPairFinished && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                </div>
                <span className={`text-[9px] font-mono font-medium ${isPairFinished ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {donePairSets}/{totalPairSets}
                </span>
              </button>
            );
          })}

          {/* Metcon tab */}
          <button
            type="button"
            onClick={() => setActiveTab('metcon')}
            className={`py-1.5 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center shrink-0 min-w-[70px] ${
              activeTab === 'metcon'
                ? 'bg-orange-500/20 border-orange-500 text-white shadow-md shadow-orange-500/10'
                : activeSession.metconLog?.roundsCompleted
                ? 'bg-zinc-900 border-orange-500/40 text-orange-400'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400 fill-current" />
              <span className="text-[11px] font-bold">Metcon</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">
              {activeSession.metconLog ? `${activeSession.metconLog.roundsCompleted || 0} giri` : 'Opzionale'}
            </span>
          </button>

          {/* Cardio tab */}
          <button
            type="button"
            onClick={() => setActiveTab('cardio')}
            className={`py-1.5 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center shrink-0 min-w-[65px] ${
              activeTab === 'cardio'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                : activeSession.cardioLog?.durationMin
                ? 'bg-zinc-900 border-cyan-500/40 text-cyan-400'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-bold">Cardio</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">
              {activeSession.cardioLog?.durationMin ? `${activeSession.cardioLog.durationMin}'` : 'Opz.'}
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content Area: Super Set Pair View */}
      {activeTab.startsWith('pair-') && currentPairGroup && primaryLog && (
        <div className="space-y-2.5 w-full">
          {/* Pair Banner & Mode Toggle */}
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-sm w-full">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
                  {currentPairGroup.pairCode}
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {currentPairGroup.isSuperSet ? 'Super Serie' : 'Esercizio Singolo'}
                </h2>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                {maxRounds} giri • 1° Fond. + 2° Metab.
              </p>
            </div>

            {/* View Mode Toggle: Focus (Zero-scroll) vs All Rounds */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('focus')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'focus'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Modalità Giro Singolo: zero scroll"
              >
                <Layers className="w-3 h-3" />
                <span>Focus</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'matrix'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualizza tutti i giri in tabella"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Tutti</span>
              </button>
            </div>
          </div>

          {/* MODE 1: ZERO-SCROLL ROUND-BY-ROUND FOCUS (Default) */}
          {viewMode === 'focus' && (
            <div className="space-y-2.5 animate-in fade-in duration-150 w-full">
              {/* Round Stepper Pills - Compact and guaranteed to fit */}
              <div className="grid grid-cols-4 gap-1 w-full">
                {Array.from({ length: maxRounds }).map((_, rIdx) => {
                  const pDone = primaryLog.sets[rIdx]?.completed ?? false;
                  const sDone = secondaryLog ? (secondaryLog.sets[rIdx]?.completed ?? false) : true;
                  const isRoundDone = pDone && sDone;
                  const isCurrent = rIdx === currentRoundIdx;

                  return (
                    <button
                      key={rIdx}
                      type="button"
                      onClick={() => setPairActiveRound(curr => ({ ...curr, [activePairIndex]: rIdx }))}
                      className={`py-1.5 px-0.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1 font-bold text-[11px] min-w-0 ${
                        isCurrent
                          ? 'bg-zinc-800 border-emerald-400 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                          : isRoundDone
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {isRoundDone ? (
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3] shrink-0" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      )}
                      <span className="truncate">Giro {rIdx + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE ROUND CONTAINER (Both exercises fit entirely in mobile view!) */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-3 sm:p-3.5 shadow-xl space-y-2.5 w-full box-border">
                {/* Header for Active Round */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider shrink-0">
                      Giro {currentRoundIdx + 1} di {maxRounds}
                    </span>
                    {isCurrentRoundCompleted && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Fatto
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => startRestTimer(105, `Recupero Coppia ${currentPairGroup.pairCode}`)}
                    className="text-[11px] font-bold text-zinc-300 hover:text-emerald-400 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700 flex items-center gap-1 shrink-0"
                  >
                    <Timer className="w-3 h-3 text-emerald-400" />
                    <span>Pausa</span>
                  </button>
                </div>

                {/* 1° Esercizio: Fondamentale */}
                {primarySet && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all w-full box-border ${
                      primarySet.completed
                        ? 'bg-emerald-950/20 border-emerald-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase shrink-0">
                          1° Fond. ({primarySet.targetReps || 5}r)
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                          {primaryLog.variantName}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVariantModal({
                            isOpen: true,
                            exerciseIndex: currentPairGroup.primaryLogIndex,
                            currentVariantId: primaryLog.variantId,
                            pattern: pVariant?.parentPattern || ''
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-zinc-800 flex items-center gap-0.5 text-[10px] shrink-0"
                        title="Varia esercizio / vedi varianti"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Varia</span>
                      </button>
                    </div>

                    {/* Progression hint if achieved */}
                    {pProgression && pProgression.type === 'increase' && (
                      <div className="mb-2 p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{pProgression.badgeText}: {pProgression.message}</span>
                      </div>
                    )}

                    {/* Controls Row: Weight, Reps, and Big Check Button - Completely Responsive */}
                    <div className="flex items-center justify-between gap-1 sm:gap-2 w-full max-w-full">
                      {/* Weight Controller */}
                      <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700/80 p-0.5 shadow-inner shrink-0">
                        <button
                          type="button"
                          onClick={() => handleWeightChange(currentPairGroup.primaryLogIndex, currentRoundIdx, -2.5)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Diminuisci peso"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDirectWeightModal({
                              exerciseIdx: currentPairGroup.primaryLogIndex,
                              setIdx: currentRoundIdx,
                              currentWeight: primarySet.actualWeight,
                              exerciseName: primaryLog.variantName
                            });
                            setDirectWeightInput(String(primarySet.actualWeight));
                            setPropagateToAllSets(true);
                          }}
                          className="text-center px-1 xs:px-1.5 py-0.5 hover:bg-zinc-800 rounded min-w-[44px] xs:min-w-[50px]"
                          title="Tocca per inserire peso esatto"
                        >
                          <span className="text-xs xs:text-sm font-black font-mono text-white">
                            {primarySet.actualWeight}
                          </span>
                          <span className="text-[9px] text-zinc-400 ml-0.5">kg</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWeightChange(currentPairGroup.primaryLogIndex, currentRoundIdx, +2.5)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Aumenta peso"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Reps Controller */}
                      <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700/80 p-0.5 shadow-inner shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRepsChange(currentPairGroup.primaryLogIndex, currentRoundIdx, -1)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Diminuisci ripetizioni"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="text-center px-1 min-w-[32px] xs:min-w-[36px]">
                          <span className="text-xs xs:text-sm font-black font-mono text-white">
                            {primarySet.actualReps}
                          </span>
                          <span className="text-[9px] text-zinc-400 ml-0.5">r</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRepsChange(currentPairGroup.primaryLogIndex, currentRoundIdx, +1)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Aumenta ripetizioni"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Complete Button */}
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(activePairIndex, currentPairGroup.primaryLogIndex, currentRoundIdx)}
                        className={`h-8 xs:h-9 px-2.5 xs:px-3 rounded-xl font-black text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                          primarySet.completed
                            ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                        }`}
                        aria-label={primarySet.completed ? 'Serie completata' : 'Completa serie'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="text-[11px]">{primarySet.completed ? 'Fatto' : 'Fatto?'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Connector Strip between 1° and 2° exercise */}
                {secondaryLog && secondarySet && (
                  <div className="flex items-center justify-center gap-2 py-0 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="h-px bg-zinc-800 flex-1" />
                    <span>Subito dopo • No recupero</span>
                    <span className="h-px bg-zinc-800 flex-1" />
                  </div>
                )}

                {/* 2° Esercizio: Metabolico */}
                {secondaryLog && secondarySet && currentPairGroup.secondaryLogIndex !== undefined && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all w-full box-border ${
                      secondarySet.completed
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase shrink-0">
                          2° Metab. ({secondarySet.targetReps || 10}r)
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                          {secondaryLog.variantName}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVariantModal({
                            isOpen: true,
                            exerciseIndex: currentPairGroup.secondaryLogIndex!,
                            currentVariantId: secondaryLog.variantId,
                            pattern: sVariant?.parentPattern || ''
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-800 flex items-center gap-0.5 text-[10px] shrink-0"
                        title="Varia esercizio / vedi varianti"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Varia</span>
                      </button>
                    </div>

                    {/* Progression hint */}
                    {sProgression && sProgression.type === 'increase' && (
                      <div className="mb-2 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{sProgression.badgeText}: {sProgression.message}</span>
                      </div>
                    )}

                    {/* Controls Row: Weight, Reps, and Big Check Button */}
                    <div className="flex items-center justify-between gap-1 sm:gap-2 w-full max-w-full">
                      {/* Weight Controller */}
                      <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700/80 p-0.5 shadow-inner shrink-0">
                        <button
                          type="button"
                          onClick={() => handleWeightChange(currentPairGroup.secondaryLogIndex!, currentRoundIdx, -2)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Diminuisci peso"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDirectWeightModal({
                              exerciseIdx: currentPairGroup.secondaryLogIndex!,
                              setIdx: currentRoundIdx,
                              currentWeight: secondarySet.actualWeight,
                              exerciseName: secondaryLog.variantName
                            });
                            setDirectWeightInput(String(secondarySet.actualWeight));
                            setPropagateToAllSets(true);
                          }}
                          className="text-center px-1 xs:px-1.5 py-0.5 hover:bg-zinc-800 rounded min-w-[44px] xs:min-w-[50px]"
                          title="Tocca per inserire peso esatto"
                        >
                          <span className="text-xs xs:text-sm font-black font-mono text-white">
                            {secondarySet.actualWeight}
                          </span>
                          <span className="text-[9px] text-zinc-400 ml-0.5">kg</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWeightChange(currentPairGroup.secondaryLogIndex!, currentRoundIdx, +2)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Aumenta peso"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Reps Controller */}
                      <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700/80 p-0.5 shadow-inner shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRepsChange(currentPairGroup.secondaryLogIndex!, currentRoundIdx, -1)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Diminuisci ripetizioni"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="text-center px-1 min-w-[32px] xs:min-w-[36px]">
                          <span className="text-xs xs:text-sm font-black font-mono text-white">
                            {secondarySet.actualReps}
                          </span>
                          <span className="text-[9px] text-zinc-400 ml-0.5">rip</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRepsChange(currentPairGroup.secondaryLogIndex!, currentRoundIdx, +1)}
                          className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center active:scale-90"
                          aria-label="Aumenta ripetizioni"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Complete Button */}
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(activePairIndex, currentPairGroup.secondaryLogIndex!, currentRoundIdx)}
                        className={`h-8 xs:h-9 px-2.5 xs:px-3 rounded-xl font-black text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                          secondarySet.completed
                            ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                        }`}
                        aria-label={secondarySet.completed ? 'Serie completata' : 'Completa serie'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="text-[11px]">{secondarySet.completed ? 'Fatto' : 'Fatto?'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Round Completion & Navigation Banner */}
                {isCurrentRoundCompleted && currentRoundIdx < maxRounds - 1 && (
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="text-xs min-w-0 flex-1">
                      <span className="font-bold text-emerald-300 block truncate">Giro {currentRoundIdx + 1} completato!</span>
                      <span className="text-zinc-400 text-[10px] block truncate">Recupera e passa al prossimo giro.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPairActiveRound(curr => ({ ...curr, [activePairIndex]: currentRoundIdx + 1 }))}
                      className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                    >
                      <span>Giro {currentRoundIdx + 2}</span>
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* All Rounds in Pair Completed Banner */}
                {allRoundsInPairCompleted && (
                  <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Coppia {currentPairGroup.pairCode} Completata!</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Tutti i {maxRounds} giri terminati.
                    </p>
                    {activePairIndex < pairGroups.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(`pair-${activePairIndex + 1}`)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <span>Passa alla Coppia {pairGroups[activePairIndex + 1].pairCode}</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    ) : activeSession.metconLog ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('metcon')}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-orange-500/20"
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Vai al Circuito Metcon Finisher</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFinishConfirm(true)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Termina Allenamento</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Ultra-Compact 4-Round Summary Strip */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 w-full">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Riepilogo Giri Coppia {currentPairGroup.pairCode}</span>
                  <span className="text-emerald-400 font-mono">
                    {primaryLog.sets.filter(s => s.completed).length}/{maxRounds} giri
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 w-full">
                  {Array.from({ length: maxRounds }).map((_, rIdx) => {
                    const pS = primaryLog.sets[rIdx];
                    const sS = secondaryLog?.sets[rIdx];
                    const bothDone = pS?.completed && (!sS || sS.completed);

                    return (
                      <div
                        key={rIdx}
                        onClick={() => setPairActiveRound(curr => ({ ...curr, [activePairIndex]: rIdx }))}
                        className={`p-1 rounded-xl border text-xs cursor-pointer transition-colors min-w-0 ${
                          rIdx === currentRoundIdx
                            ? 'bg-zinc-800 border-emerald-400/80 ring-1 ring-emerald-500/30'
                            : bothDone
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 mb-0.5">
                          <span>G{rIdx + 1}</span>
                          {bothDone && <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3] shrink-0" />}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-200 truncate leading-tight">
                          {pS ? `${pS.actualWeight}k` : '-'}
                        </div>
                        {sS && (
                          <div className="text-[10px] font-mono text-amber-300 truncate leading-tight">
                            {sS.actualWeight}k
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: MATRIX VIEW (Grouped by Round) */}
          {viewMode === 'matrix' && (
            <div className="space-y-2.5 animate-in fade-in duration-150 w-full">
              <div className="text-[11px] text-zinc-400 px-1">
                Ogni giro accoppia subito il 1° Fondamentale ed il 2° Metabolico:
              </div>

              {Array.from({ length: maxRounds }).map((_, rIdx) => {
                const pSet = primaryLog.sets[rIdx];
                const sSet = secondaryLog?.sets[rIdx];
                const roundDone = pSet?.completed && (!sSet || sSet.completed);

                return (
                  <div
                    key={rIdx}
                    className={`rounded-2xl border p-2.5 transition-all w-full ${
                      roundDone
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-zinc-900/90 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-zinc-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[9px] font-bold">
                          {rIdx + 1}
                        </span>
                        Giro {rIdx + 1} di {maxRounds}
                      </span>
                      {roundDone && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Completato
                        </span>
                      )}
                    </div>

                    {/* 1° Ex in Round */}
                    {pSet && (
                      <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-1.5 flex items-center justify-between gap-1 w-full max-w-full">
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] font-bold uppercase text-emerald-400">1° Fond.</div>
                          <div className="text-xs font-bold text-white truncate">{primaryLog.variantName}</div>
                        </div>

                        {/* Weight */}
                        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700/60 p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleWeightChange(currentPairGroup.primaryLogIndex, rIdx, -2.5)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-1 text-[11px] font-bold font-mono text-white min-w-[36px] text-center">
                            {pSet.actualWeight}k
                          </span>
                          <button
                            type="button"
                            onClick={() => handleWeightChange(currentPairGroup.primaryLogIndex, rIdx, +2.5)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Reps */}
                        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700/60 p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRepsChange(currentPairGroup.primaryLogIndex, rIdx, -1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-0.5 text-[11px] font-bold font-mono text-white min-w-[26px] text-center">
                            {pSet.actualReps}r
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRepsChange(currentPairGroup.primaryLogIndex, rIdx, +1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Check */}
                        <button
                          type="button"
                          onClick={() => toggleSetCompleted(activePairIndex, currentPairGroup.primaryLogIndex, rIdx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                            pSet.completed
                              ? 'bg-emerald-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    )}

                    {/* 2° Ex in Round */}
                    {sSet && currentPairGroup.secondaryLogIndex !== undefined && (
                      <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-1 w-full max-w-full">
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] font-bold uppercase text-amber-400">2° Metab.</div>
                          <div className="text-xs font-bold text-white truncate">{secondaryLog?.variantName}</div>
                        </div>

                        {/* Weight */}
                        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700/60 p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleWeightChange(currentPairGroup.secondaryLogIndex!, rIdx, -2)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-1 text-[11px] font-bold font-mono text-white min-w-[36px] text-center">
                            {sSet.actualWeight}k
                          </span>
                          <button
                            type="button"
                            onClick={() => handleWeightChange(currentPairGroup.secondaryLogIndex!, rIdx, +2)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Reps */}
                        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700/60 p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRepsChange(currentPairGroup.secondaryLogIndex!, rIdx, -1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-0.5 text-[11px] font-bold font-mono text-white min-w-[26px] text-center">
                            {sSet.actualReps}r
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRepsChange(currentPairGroup.secondaryLogIndex!, rIdx, +1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Check */}
                        <button
                          type="button"
                          onClick={() => toggleSetCompleted(activePairIndex, currentPairGroup.secondaryLogIndex!, rIdx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                            sSet.completed
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pair Navigation Footer */}
          <div className="flex items-center justify-between gap-2 pt-1 w-full">
            {activePairIndex > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab(`pair-${activePairIndex - 1}`)}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Coppia {pairGroups[activePairIndex - 1].pairCode}</span>
              </button>
            ) : <div />}

            {activePairIndex < pairGroups.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(`pair-${activePairIndex + 1}`)}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-bold text-white flex items-center gap-1 shrink-0"
              >
                <span>Coppia {pairGroups[activePairIndex + 1].pairCode}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : activeSession.metconLog ? (
              <button
                type="button"
                onClick={() => setActiveTab('metcon')}
                className="py-2 px-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-xl text-xs font-bold text-orange-300 flex items-center gap-1 shrink-0"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Metcon Finisher</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-md shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Termina</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* METCON SECTION TAB */}
      {activeTab === 'metcon' && (
        <div className="space-y-3 animate-in fade-in duration-150 w-full">
          {activeSession.metconLog ? (
            <MetconSection
              metconLog={activeSession.metconLog}
              onUpdate={updater =>
                updateActiveSession(prev => ({
                  ...prev,
                  metconLog: prev.metconLog ? updater(prev.metconLog) : undefined
                }))
              }
              onOpenCustomizer={() => setShowMetconModal(true)}
            />
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center space-y-3 w-full">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-base font-bold text-white">Nessun Metcon configurato</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Puoi aggiungere un circuito funzionale ad alta intensità (AMRAP, For Time o EMOM) per completare la seduta.
              </p>
              <button
                type="button"
                onClick={() => {
                  updateActiveSession(prev => ({
                    ...prev,
                    metconLog: {
                      title: "AMRAP 10' Funzionale",
                      type: 'amrap',
                      timeCapSec: 600,
                      roundsCompleted: 0,
                      partialReps: 0,
                      elapsedTimeSec: 0,
                      sensations: '',
                      movements: [
                        { name: 'Thruster con bilanciere', repsOrDist: '10 reps', weightKg: 30 },
                        { name: 'Air bike', repsOrDist: '12 cal', caloriesKcal: 12 },
                        { name: 'Plank', repsOrDist: '40 sec' }
                      ]
                    }
                  }));
                  setShowMetconModal(true);
                }}
                className="py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" />
                Crea o Configura Metcon
              </button>
            </div>
          )}

          {/* Quick jump to pairs */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab(`pair-${pairGroups.length - 1}`)}
              className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Torna alle Super Serie</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cardio')}
              className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cardio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CARDIO SECTION TAB */}
      {activeTab === 'cardio' && (
        <div className="space-y-3 animate-in fade-in duration-150 w-full">
          {activeSession.cardioLog ? (
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-3xl p-4 shadow-xl space-y-3 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Cardio Aerobico
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white capitalize truncate">
                      {activeSession.cardioLog.equipment === 'vogatore' ? 'Vogatore Concept2' :
                       activeSession.cardioLog.equipment === 'air_bike' ? 'Air bike Echo' :
                       activeSession.cardioLog.equipment === 'skierg' ? 'SkiErg Concept2' : 'Tapis roulant'}
                    </h3>
                  </div>
                </div>

                <select
                  value={activeSession.cardioLog.equipment}
                  onChange={e =>
                    updateActiveSession(prev => ({
                      ...prev,
                      cardioLog: prev.cardioLog
                        ? { ...prev.cardioLog, equipment: e.target.value as any }
                        : undefined
                    }))
                  }
                  className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-cyan-500 shrink-0"
                >
                  <option value="vogatore">🚣 Vogatore</option>
                  <option value="air_bike">🚴 Air bike</option>
                  <option value="skierg">⛷️ SkiErg</option>
                  <option value="tapis_roulant">🏃 Tapis</option>
                </select>
              </div>

              {/* 3 Cardio Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-2 text-center min-w-0">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5 truncate">
                    Tempo (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={activeSession.cardioLog.durationMin || ''}
                    onChange={e =>
                      updateActiveSession(prev => ({
                        ...prev,
                        cardioLog: prev.cardioLog
                          ? { ...prev.cardioLog, durationMin: parseInt(e.target.value) || 0 }
                          : undefined
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-1 text-center font-mono font-bold text-sm text-cyan-300"
                  />
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-2 text-center min-w-0">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5 truncate">
                    Calorie (kcal)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    placeholder="0"
                    value={activeSession.cardioLog.caloriesKcal || ''}
                    onChange={e =>
                      updateActiveSession(prev => ({
                        ...prev,
                        cardioLog: prev.cardioLog
                          ? { ...prev.cardioLog, caloriesKcal: parseInt(e.target.value) || 0 }
                          : undefined
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-1 text-center font-mono font-bold text-sm text-amber-300"
                  />
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-2 text-center min-w-0">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5 truncate">
                    Metri
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    placeholder="0"
                    value={activeSession.cardioLog.distanceMeters || ''}
                    onChange={e =>
                      updateActiveSession(prev => ({
                        ...prev,
                        cardioLog: prev.cardioLog
                          ? { ...prev.cardioLog, distanceMeters: parseInt(e.target.value) || 0 }
                          : undefined
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-1 text-center font-mono font-bold text-sm text-emerald-300"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Passo medio / sensazioni cardio..."
                  value={activeSession.cardioLog.sensations || ''}
                  onChange={e =>
                    updateActiveSession(prev => ({
                      ...prev,
                      cardioLog: prev.cardioLog ? { ...prev.cardioLog, sensations: e.target.value } : undefined
                    }))
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center space-y-3 w-full">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Nessuna sessione cardio impostata</h3>
              <button
                type="button"
                onClick={() =>
                  updateActiveSession(prev => ({
                    ...prev,
                    cardioLog: {
                      equipment: 'air_bike',
                      durationMin: 20,
                      caloriesKcal: 200,
                      distanceMeters: 5000,
                      sensations: ''
                    }
                  }))
                }
                className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Sessione Cardio
              </button>
            </div>
          )}
        </div>
      )}

      {/* General Workout Notes Card */}
      <div className="mt-3 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-2.5 w-full">
        <label className="block text-xs font-semibold text-zinc-400 mb-1">
          Note della seduta (opzionale)
        </label>
        <textarea
          rows={2}
          placeholder="Fatica, RPE generale, sensazioni muscolari..."
          value={activeSession.generalNotes || ''}
          onChange={e =>
            updateActiveSession(prev => ({
              ...prev,
              generalNotes: e.target.value
            }))
          }
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Session Finish & Timer Actions at the bottom of the page */}
      <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-2 mb-2 w-full">
        <button
          type="button"
          onClick={() => startRestTimer(90, 'Recupero')}
          className="w-full sm:w-auto py-2.5 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors"
        >
          <Timer className="w-4 h-4 text-emerald-400" />
          <span>Timer Recupero (+90s)</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFinishConfirm(true)}
          className="w-full sm:flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-black text-xs tracking-wide rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Termina & Salva Allenamento</span>
        </button>
      </div>

      {/* Variant Selector Modal */}
      <VariantSelectorModal
        isOpen={selectedVariantModal.isOpen}
        currentVariantId={selectedVariantModal.currentVariantId}
        pattern={selectedVariantModal.pattern}
        onClose={() => setSelectedVariantModal({ isOpen: false, exerciseIndex: -1, currentVariantId: '', pattern: '' })}
        onSelect={handleSwapVariant}
      />

      {/* Custom Metcon Creator Modal */}
      <MetconCustomizerModal
        isOpen={showMetconModal}
        currentMetcon={activeSession.metconLog}
        onClose={() => setShowMetconModal(false)}
        onApply={handleApplyCustomMetcon}
      />

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Ottimo lavoro!
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Completate {completedSets} serie su {totalSets} in {formatSecs(workoutDurationSec)}.
              <br />
              <span className="text-emerald-400 font-semibold">
                Riposo effettivo: {formatSecs(totalActualRestSec)}
              </span>.
              <br />
              Tutti i carichi, PR, parametri cardio e metcon verranno salvati nello storico e nelle statistiche.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Continua
              </button>
              <button
                type="button"
                onClick={() => {
                  finishWorkout();
                  setShowFinishConfirm(false);
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Conferma e Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2.5">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Abbandonare l'allenamento?
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              I dati registrati in questa sessione andranno persi. Sei sicuro?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  discardActiveWorkout();
                  setShowDiscardConfirm(false);
                }}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/20"
              >
                Abbandona
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Weight Input Modal */}
      {directWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Modifica Carico Giro {directWeightModal.setIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setDirectWeightModal(null)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5 truncate">
                {directWeightModal.exerciseName}
              </h3>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
              <label className="block text-[11px] text-zinc-400 mb-1">
                Inserisci carico esatto (kg)
              </label>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  autoFocus
                  value={directWeightInput}
                  onChange={e => setDirectWeightInput(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-2xl font-mono font-black text-center text-white w-36 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-base font-bold text-zinc-400">kg</span>
              </div>

              {/* Quick increment / decrement pills */}
              <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
                {[-10, -5, -2.5, +2.5, +5, +10].map(delta => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(directWeightInput) || 0;
                      const next = Math.max(0, Math.round((cur + delta) * 10) / 10);
                      setDirectWeightInput(String(next));
                    }}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono font-bold text-zinc-300 border border-zinc-700/60"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Propagate checkbox */}
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={propagateToAllSets}
                onChange={e => setPropagateToAllSets(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700 focus:ring-0"
              />
              <span>Applica anche a tutte le serie successive non completate</span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDirectWeightModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(directWeightInput);
                  if (!isNaN(val)) {
                    handleConfirmDirectWeight(
                      directWeightModal.exerciseIdx,
                      directWeightModal.setIdx,
                      val,
                      propagateToAllSets
                    );
                  }
                  setDirectWeightModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Conferma Carico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warmup Modal (Extracted from PDF Page 2 - Ephemeral, not saved to history) */}
      {showWarmupModal && (
        <WarmupModal
          isOpen={true}
          onClose={() => setShowWarmupModal(false)}
          dayKey={(activeSession.dayKey as any) || 'lun'}
          defaultTargetWeightKg={activeSession.exerciseLogs[0]?.sets[0]?.targetWeight || activeSession.exerciseLogs[0]?.sets[0]?.actualWeight || 80}
        />
      )}
    </div>
  );
};

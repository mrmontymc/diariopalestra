import React, { useState, useEffect, useRef } from 'react';
import { MetconResultLog, MetconMovementItem } from '../types/workout';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  Timer as TimerIcon,
  Plus,
  Minus,
  Check,
  FastForward,
  Clock,
  Volume2
} from 'lucide-react';
import { playShortBeep, playTimerFinishBeep, playCountdownWarningBeep } from '../utils/audio';

interface MetconSectionProps {
  metconLog: MetconResultLog;
  onUpdate: (updater: (prev: MetconResultLog) => MetconResultLog) => void;
  onOpenCustomizer: () => void;
}

export const MetconSection: React.FC<MetconSectionProps> = ({
  metconLog,
  onUpdate,
  onOpenCustomizer
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(() => metconLog.elapsedTimeSec || 0);

  const movements = metconLog.movements || [];
  const exerciseCount = Math.max(1, movements.length);
  const targetRounds = metconLog.targetRounds || 3;
  const timeCapSec = metconLog.timeCapSec || (metconLog.type === 'amrap' ? 480 : 600);
  const intervalSec = metconLog.emomIntervalSec || 60; // default 60s per EMOM

  // Total EMOM intervals is strictly a multiple of the number of selected exercises (N exercises * M rounds)
  const totalEmomIntervals = exerciseCount * targetRounds;
  const totalEmomDurationSec = totalEmomIntervals * intervalSec;

  // Sync elapsedSec ticker cleanly in local state
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSec(prev => {
          const next = prev + 1;

          // Sound cues depending on type
          if (metconLog.type === 'amrap') {
            const remaining = timeCapSec - next;
            if (remaining <= 3 && remaining >= 1) {
              playCountdownWarningBeep();
            } else if (remaining === 0) {
              playTimerFinishBeep();
            }
          } else if (metconLog.type === 'emom') {
            const secInInterval = next % intervalSec;
            const remainingInInterval = (intervalSec - secInInterval) % intervalSec;
            if (remainingInInterval <= 3 && remainingInInterval >= 1) {
              playCountdownWarningBeep();
            } else if (secInInterval === 0 && next > 0) {
              playShortBeep(1046, 0.15); // C6 start of new interval
            }
            if (next >= totalEmomDurationSec) {
              playTimerFinishBeep();
            }
          } else if (metconLog.type === 'rounds_cap' || metconLog.type === 'for_time') {
            if (timeCapSec && next >= timeCapSec) {
              playTimerFinishBeep();
            }
          }

          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, metconLog.type, timeCapSec, intervalSec, totalEmomDurationSec]);

  // Stop running cleanly when cap or total duration is reached
  useEffect(() => {
    if (!isRunning) return;
    if (metconLog.type === 'amrap' && timeCapSec && elapsedSec >= timeCapSec) {
      setIsRunning(false);
    } else if (metconLog.type === 'emom' && elapsedSec >= totalEmomDurationSec) {
      setIsRunning(false);
    } else if ((metconLog.type === 'rounds_cap' || metconLog.type === 'for_time') && timeCapSec && elapsedSec >= timeCapSec) {
      setIsRunning(false);
    }
  }, [elapsedSec, isRunning, metconLog.type, timeCapSec, totalEmomDurationSec]);

  // Sync elapsed seconds to metconLog when paused or changed
  const toggleTimer = () => {
    if (isRunning) {
      onUpdate(prev => ({
        ...prev,
        elapsedTimeSec: elapsedSec
      }));
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedSec(0);
    onUpdate(prev => ({
      ...prev,
      elapsedTimeSec: 0,
      roundsCompleted: 0,
      partialReps: 0,
      finishedBeforeCap: false
    }));
  };

  const formatMinSec = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // --- AMRAP Calculations ---
  const amrapRemainingSec = Math.max(0, timeCapSec - elapsedSec);

  // Quick set AMRAP Cap
  const setAmrapCapMinutes = (mins: number) => {
    onUpdate(prev => ({ ...prev, timeCapSec: mins * 60 }));
  };

  // --- EMOM Calculations ---
  const currentEmomInterval = Math.min(totalEmomIntervals, Math.floor(elapsedSec / intervalSec) + 1);
  const secondsLeftInCurrentInterval = intervalSec - (elapsedSec % intervalSec);
  const currentEmomExerciseIdx = (currentEmomInterval - 1) % exerciseCount;
  const currentEmomRound = Math.floor((currentEmomInterval - 1) / exerciseCount) + 1;
  const activeEmomMovement = movements[currentEmomExerciseIdx];
  const nextEmomMovement = movements[(currentEmomExerciseIdx + 1) % exerciseCount];
  const emomProgressPercent = ((intervalSec - secondsLeftInCurrentInterval) / intervalSec) * 100;
  const isEmomFinished = elapsedSec >= totalEmomDurationSec;

  // Skip to next interval in EMOM
  const handleSkipToNextEmomInterval = () => {
    playShortBeep(880, 0.1);
    const currentIntervalIdx = Math.floor(elapsedSec / intervalSec);
    const nextIntervalStartSec = (currentIntervalIdx + 1) * intervalSec;
    if (nextIntervalStartSec < totalEmomDurationSec) {
      setElapsedSec(nextIntervalStartSec);
    } else {
      setElapsedSec(totalEmomDurationSec);
      setIsRunning(false);
      playTimerFinishBeep();
    }
  };

  // Set EMOM interval fraction (e.g. 30s, 45s, 60s, 90s, 120s)
  const setEmomIntervalFraction = (secs: number) => {
    onUpdate(prev => ({ ...prev, emomIntervalSec: secs }));
  };

  // Adjust EMOM Target Rounds (M rounds x N exercises)
  const adjustEmomRounds = (delta: number) => {
    const newRounds = Math.max(1, targetRounds + delta);
    onUpdate(prev => ({ ...prev, targetRounds: newRounds }));
  };

  // --- For Time Calculations ---
  const isForTimeDone = metconLog.finishedBeforeCap || metconLog.roundsCompleted >= targetRounds;

  const handleForTimeRoundComplete = () => {
    playShortBeep(880, 0.1);
    const nextRounds = metconLog.roundsCompleted + 1;
    const isDone = nextRounds >= targetRounds;

    onUpdate(prev => ({
      ...prev,
      roundsCompleted: nextRounds,
      finishedBeforeCap: isDone,
      elapsedTimeSec: elapsedSec,
      sensations: isDone
        ? `Tutti i ${targetRounds} giri chiusi in ${formatMinSec(elapsedSec)}!`
        : prev.sensations
    }));

    if (isDone) {
      playTimerFinishBeep();
      setIsRunning(false);
    }
  };

  const adjustForTimeRounds = (delta: number) => {
    const newRounds = Math.max(1, targetRounds + delta);
    onUpdate(prev => ({ ...prev, targetRounds: newRounds }));
  };

  return (
    <div className="bg-gradient-to-b from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/40 rounded-3xl p-4 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-orange-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-500/30">
                {metconLog.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400">
                {metconLog.type === 'emom'
                  ? `${totalEmomIntervals} intervalli (${targetRounds} giri × ${exerciseCount} es.)`
                  : metconLog.timeCapSec
                  ? `Cap ${Math.round(metconLog.timeCapSec / 60)}'`
                  : ''}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-[180px] sm:max-w-xs">
              {metconLog.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-orange-300 flex items-center gap-1 border border-orange-500/30"
            title="Personalizza o crea metcon al momento"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifica</span>
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800"
            title="Azzera timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. AMRAP: TIMER COUNTDOWN + CONTAGIRI COMPLETO E PARZIALE */}
      {/* ======================================================== */}
      {metconLog.type === 'amrap' && (
        <div className="space-y-3">
          {/* Main Countdown Display */}
          <div className="bg-zinc-950/80 rounded-2xl p-3 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                Tempo Rimanente (Countdown)
              </span>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {formatMinSec(amrapRemainingSec)}
              </div>
              <span className="text-[10px] text-zinc-400">
                Trascorso: {formatMinSec(elapsedSec)} / {formatMinSec(timeCapSec)}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTimer}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                  : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 shadow-orange-500/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Pausa' : 'Avvia AMRAP'}
            </button>
          </div>

          {/* Quick Time Cap Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">Durata:</span>
            {[5, 8, 10, 12, 15, 20].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setAmrapCapMinutes(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  timeCapSec === m * 60
                    ? 'bg-orange-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
                }`}
              >
                {m}'
              </button>
            ))}
          </div>

          {/* AMRAP Contagiri Speciale */}
          <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Contagiri AMRAP</span>
              <span className="text-orange-400 text-xs font-mono font-black">
                {metconLog.roundsCompleted} Giri {metconLog.partialReps > 0 ? `+ ${metconLog.partialReps} reps` : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Big +1 Round button */}
              <button
                type="button"
                onClick={() => {
                  playShortBeep(880, 0.08);
                  onUpdate(prev => ({ ...prev, roundsCompleted: prev.roundsCompleted + 1 }));
                }}
                className="py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-98 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                +1 Giro Completo
              </button>

              {/* -1 Round button */}
              <button
                type="button"
                onClick={() => onUpdate(prev => ({ ...prev, roundsCompleted: Math.max(0, prev.roundsCompleted - 1) }))}
                className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 border border-zinc-700"
              >
                <Minus className="w-3.5 h-3.5" />
                Correggi Giro (-1)
              </button>
            </div>

            {/* Partial reps counter */}
            <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Ripetizioni parziali ultimo giro:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate(prev => ({ ...prev, partialReps: Math.max(0, prev.partialReps - 1) }))}
                  className="w-7 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="font-mono font-bold text-white min-w-[28px] text-center text-xs">
                  {metconLog.partialReps}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdate(prev => ({ ...prev, partialReps: prev.partialReps + 1 }))}
                  className="w-7 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FOR TIME / ROUNDS CAP: CRONOMETRO + CONTAGIRI PER FOR TIME */}
      {/* ======================================================== */}
      {(metconLog.type === 'for_time' || metconLog.type === 'rounds_cap') && (
        <div className="space-y-3">
          {/* Main Stopwatch Display */}
          <div className="bg-zinc-950/80 rounded-2xl p-3 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                Cronometro For Time
              </span>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {formatMinSec(elapsedSec)}
              </div>
              <span className="text-[10px] text-zinc-400">
                Time Cap: {formatMinSec(timeCapSec)}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTimer}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                  : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 shadow-orange-500/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Pausa' : 'Avvia Cronometro'}
            </button>
          </div>

          {/* For Time Contagiri Speciale */}
          <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Contagiri For Time
                </span>
                <span className="text-[10px] text-zinc-500">
                  (Target: {targetRounds} giri)
                </span>
              </div>

              {/* Adjust target rounds */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustForTimeRounds(-1)}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                  title="Diminuisci giri"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-orange-400 px-1">
                  {targetRounds} giri
                </span>
                <button
                  type="button"
                  onClick={() => adjustForTimeRounds(1)}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
                  title="Aumenta giri"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rounds dots preview */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-3">
              {Array.from({ length: targetRounds }, (_, i) => {
                const isPassed = i < metconLog.roundsCompleted;
                const isCurrent = i === metconLog.roundsCompleted;
                return (
                  <div
                    key={i}
                    className={`py-1 rounded-lg text-center font-mono text-[11px] font-bold border transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-black'
                        : isCurrent
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500 animate-pulse'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                    }`}
                  >
                    G{i + 1}
                  </div>
                );
              })}
            </div>

            {/* Round Action Button */}
            {!isForTimeDone ? (
              <button
                type="button"
                onClick={handleForTimeRoundComplete}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-98 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {metconLog.roundsCompleted + 1 === targetRounds
                  ? `🏁 Completa Ultimo Giro e Ferma Tempo`
                  : `Completa Giro ${metconLog.roundsCompleted + 1} di ${targetRounds}`}
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center space-y-1">
                <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Circuito Completato in {formatMinSec(elapsedSec)}!
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  {targetRounds} giri terminati con successo
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EMOM: CONTA IL MINUTO O FRAZIONI PER NUMERO DI GIRI MULTIPLO DEGLI ESERCIZI */}
      {/* ======================================================== */}
      {metconLog.type === 'emom' && (
        <div className="space-y-3">
          {/* EMOM Interval Fraction Selector */}
          <div className="flex items-center justify-between bg-zinc-950/70 p-2 rounded-2xl border border-zinc-800 flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
              Frazione EMOM:
            </span>
            <div className="flex items-center gap-1">
              {[
                { label: '30s', val: 30 },
                { label: '45s', val: 45 },
                { label: '1 Min (60s)', val: 60 },
                { label: '90s', val: 90 },
                { label: '2 Min', val: 120 }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setEmomIntervalFraction(opt.val)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    intervalSec === opt.val
                      ? 'bg-orange-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Adjust Target Rounds (Multipliers of Exercises) */}
          <div className="flex items-center justify-between bg-zinc-950/70 px-3 py-1.5 rounded-2xl border border-zinc-800">
            <div className="text-[11px] text-zinc-300">
              <span className="font-bold text-orange-400">{exerciseCount} Esercizi</span> × {targetRounds} Giri ={' '}
              <span className="font-bold text-white">{totalEmomIntervals} Intervalli Totali</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Giri:</span>
              <button
                type="button"
                onClick={() => adjustEmomRounds(-1)}
                className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                -
              </button>
              <span className="font-mono text-xs font-black text-white px-1">
                {targetRounds}
              </span>
              <button
                type="button"
                onClick={() => adjustEmomRounds(1)}
                className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Main EMOM Clock Display */}
          <div className="bg-zinc-950/90 rounded-2xl p-3.5 border border-orange-500/40 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                  Intervallo Corrente (EMOM {intervalSec}s)
                </span>
                <div className="text-2xl font-black font-mono text-white">
                  Intervallo {currentEmomInterval} di {totalEmomIntervals}
                </div>
                <span className="text-[10px] text-zinc-400">
                  Giro {currentEmomRound} di {targetRounds} • Es. {currentEmomExerciseIdx + 1} di {exerciseCount}
                </span>
              </div>

              {/* Second countdown of the current minute / fraction */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Fine Intervallo
                </span>
                <div className={`text-3xl font-black font-mono ${secondsLeftInCurrentInterval <= 5 ? 'text-red-400 animate-pulse' : 'text-orange-300'}`}>
                  {secondsLeftInCurrentInterval}s
                </div>
              </div>
            </div>

            {/* Progress bar of current interval fraction */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${emomProgressPercent}%` }}
              />
            </div>

            {/* Active exercise banner for this specific interval */}
            {activeEmomMovement && (
              <div className="p-3 bg-gradient-to-r from-orange-500/20 to-zinc-900 border border-orange-500/40 rounded-xl mb-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1 flex items-center justify-between">
                  <span>👉 ESERCIZIO ATTIVO (INTERVALLO {currentEmomInterval}/{totalEmomIntervals})</span>
                  <span className="font-mono text-white font-bold">{secondsLeftInCurrentInterval}s rimasti</span>
                </div>
                <div className="text-sm font-black text-white">
                  {activeEmomMovement.name}
                </div>
                <div className="text-xs text-orange-200 font-semibold font-mono mt-0.5">
                  {activeEmomMovement.repsOrDist}
                  {activeEmomMovement.weightKg ? ` • ${activeEmomMovement.weightKg} kg` : ''}
                  {activeEmomMovement.caloriesKcal ? ` • ${activeEmomMovement.caloriesKcal} cal` : ''}
                  {activeEmomMovement.distanceMeters ? ` • ${activeEmomMovement.distanceMeters} m` : ''}
                </div>
              </div>
            )}

            {/* Next incoming exercise preview */}
            {currentEmomInterval < totalEmomIntervals && nextEmomMovement && (
              <div className="text-[11px] text-zinc-400 px-1 py-1 bg-zinc-900/60 rounded-lg flex items-center justify-between mb-3 border border-zinc-800">
                <span className="text-zinc-500">Prossimo (Intervallo {currentEmomInterval + 1}):</span>
                <span className="font-semibold text-zinc-300 truncate max-w-[200px]">
                  {nextEmomMovement.name}
                </span>
              </div>
            )}

            {/* Finished state banner */}
            {isEmomFinished && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center mb-3">
                <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  EMOM Completato con successo! Tutti i {totalEmomIntervals} intervalli conclusi.
                </span>
              </div>
            )}

            {/* EMOM Controls: Play/Pause and FastForward */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleTimer}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                    : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 shadow-orange-500/20'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isRunning ? 'Pausa EMOM' : 'Avvia Timer EMOM'}
              </button>

              <button
                type="button"
                onClick={handleSkipToNextEmomInterval}
                disabled={isEmomFinished}
                className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-zinc-700"
                title="Salta subito al prossimo intervallo"
              >
                <FastForward className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Prossimo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FREE / TABATA TIMER */}
      {/* ======================================================== */}
      {(metconLog.type === 'free' || metconLog.type === 'tabata') && (
        <div className="space-y-3">
          <div className="bg-zinc-950/80 rounded-2xl p-3 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                Timer Circuito
              </span>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {formatMinSec(elapsedSec)}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTimer}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-orange-500 hover:bg-orange-400 text-zinc-950'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Pausa' : 'Avvia'}
            </button>
          </div>
        </div>
      )}

      {/* Movements list overview with loads */}
      <div className="mt-3 bg-zinc-950/80 rounded-2xl p-3 border border-zinc-800 space-y-1.5">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Sequenza Movimenti ({movements.length})</span>
          <span className="text-orange-400 font-mono text-[10px]">Rotazione {targetRounds} giri</span>
        </div>
        {movements.map((mov, mi) => (
          <div key={mi} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/60 last:border-b-0">
            <span className="text-zinc-200 font-medium truncate pr-2">
              {mi + 1}. {mov.name}
            </span>
            <span className="font-mono text-orange-300 text-[11px] shrink-0 font-semibold">
              {mov.repsOrDist}
              {mov.weightKg ? ` (${mov.weightKg} kg)` : ''}
              {mov.caloriesKcal ? ` (${mov.caloriesKcal} cal)` : ''}
              {mov.distanceMeters ? ` (${mov.distanceMeters} m)` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Sensations input */}
      <div className="mt-3">
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
          Sensazioni & Note Metcon (carichi usati, RPE, ritmo, transizioni)
        </label>
        <input
          type="text"
          placeholder="Es. 4 giri unbroken con 30kg sui thruster, fiato ok..."
          value={metconLog.sensations || ''}
          onChange={e => onUpdate(prev => ({ ...prev, sensations: e.target.value }))}
          className="w-full bg-zinc-800 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useHeartRate } from '../context/HeartRateContext';
import { HeartRateModal } from './HeartRateModal';
import { CardioSessionConfig } from '../types/workout';
import { calculateCardioCalories } from '../utils/calorieCalculator';
import {
  Play,
  Pause,
  CheckCircle2,
  Heart,
  Bluetooth,
  Flame,
  Activity,
  Timer,
  X,
  FastForward,
  Plus,
  Minus,
  Sparkles,
  Trophy,
  Zap,
  Battery,
  User
} from 'lucide-react';
import { playShortBeep, playTimerFinishBeep, playCountdownWarningBeep } from '../utils/audio';

export const ActiveCardioWorkoutView: React.FC = () => {
  const {
    activeSession,
    updateActiveSession,
    finishWorkout,
    discardActiveWorkout
  } = useWorkout();

  const {
    isConnected: isHrConnected,
    deviceName,
    currentBpm,
    avgBpm,
    maxBpm,
    batteryLevel,
    getSessionData
  } = useHeartRate();

  // Guard: if no active session
  if (!activeSession) return null;

  const config: CardioSessionConfig = activeSession.cardioSessionConfig || {
    activity: 'vogatore',
    activityLabel: 'Vogatore',
    mode: 'steady',
    targetDurationMin: 20
  };

  const isIntervals = config.mode === 'intervals';
  const intervalConfig = config.intervals || { rounds: 8, workSec: 20, restSec: 10 };

  // Timer starts AUTOMATICALLY when component mounts (isPaused = false)
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Compute initial elapsed seconds from activeSession.startTime
  const [elapsedSec, setElapsedSec] = useState<number>(() => {
    if (activeSession.startTime) {
      return Math.max(0, Math.floor((Date.now() - activeSession.startTime) / 1000));
    }
    return 0;
  });

  const [showHeartRateModal, setShowHeartRateModal] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);

  // Interval-specific state
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(intervalConfig.workSec);

  // Time spent in each of the 5 cardio zones
  const [zoneSeconds, setZoneSeconds] = useState<{
    z1: number;
    z2: number;
    z3: number;
    z4: number;
    z5: number;
  }>({ z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 });

  // Stable refs to prevent resetting the interval timer on each heart rate packet
  const currentBpmRef = useRef(currentBpm);
  currentBpmRef.current = currentBpm;

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const currentRoundRef = useRef(currentRound);
  currentRoundRef.current = currentRound;

  const intervalConfigRef = useRef(intervalConfig);
  intervalConfigRef.current = intervalConfig;

  // Main 1-second workout timer tick (runs continuously, independent of BLE updates)
  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      // 1. Advance elapsed workout time
      setElapsedSec(prev => prev + 1);

      // 2. Accumulate time in active cardio zone using ref
      const bpm = currentBpmRef.current;
      if (bpm && bpm > 30) {
        setZoneSeconds(prev => {
          if (bpm < 115) return { ...prev, z1: prev.z1 + 1 };
          if (bpm < 135) return { ...prev, z2: prev.z2 + 1 };
          if (bpm < 155) return { ...prev, z3: prev.z3 + 1 };
          if (bpm < 175) return { ...prev, z4: prev.z4 + 1 };
          return { ...prev, z5: prev.z5 + 1 };
        });
      }

      // 3. Interval mode countdown
      if (isIntervals) {
        setPhaseSecondsLeft(prevSec => {
          if (prevSec <= 4 && prevSec > 1) {
            playCountdownWarningBeep();
          }

          if (prevSec <= 1) {
            playTimerFinishBeep();
            const curPhase = phaseRef.current;
            const curRound = currentRoundRef.current;
            const cfg = intervalConfigRef.current;

            if (curPhase === 'work') {
              setPhase('rest');
              return cfg.restSec;
            } else {
              if (curRound >= cfg.rounds) {
                setIsPaused(true);
                return 0;
              }
              setCurrentRound(r => r + 1);
              setPhase('work');
              return cfg.workSec;
            }
          }

          return prevSec - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPaused, isIntervals]);

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format short zone duration
  const formatZoneSec = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}"`;
    return `${m}'${s.toString().padStart(2, '0')}"`;
  };

  // Skip interval manually
  const handleSkipPhase = () => {
    playShortBeep(784, 0.15);
    if (phase === 'work') {
      setPhase('rest');
      setPhaseSecondsLeft(intervalConfig.restSec);
    } else {
      if (currentRound >= intervalConfig.rounds) {
        setIsPaused(true);
      } else {
        setCurrentRound(r => r + 1);
        setPhase('work');
        setPhaseSecondsLeft(intervalConfig.workSec);
      }
    }
  };

  // Target duration calculation for steady state
  const targetTotalSec = (config.targetDurationMin || 20) * 60;
  const steadyProgressPercent = Math.min(100, Math.round((elapsedSec / targetTotalSec) * 100));

  // Scientific calories estimation using User Profile (gender, weight, height, age) and HR / MET
  const estimatedCalories = calculateCardioCalories(
    elapsedSec,
    currentBpm || avgBpm,
    config.activity,
    config.userProfile
  );

  // Current Cardio Zone Definition
  const getZone = (bpm: number | null) => {
    if (!bpm || bpm <= 0) {
      return {
        key: 'z0',
        label: 'In attesa segnale',
        short: 'FC Assente',
        range: '--',
        badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        text: 'text-zinc-400',
        border: 'border-zinc-800',
        bgGlow: 'from-zinc-900 to-zinc-950',
        percentMax: 0
      };
    }
    if (bpm < 115) {
      return {
        key: 'z1',
        label: 'Zona 1 • Recupero / Warm-up',
        short: 'Z1 • Recupero',
        range: '< 115 BPM',
        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        bgGlow: 'from-blue-950/40 to-zinc-950',
        percentMax: Math.round((bpm / 190) * 100)
      };
    }
    if (bpm < 135) {
      return {
        key: 'z2',
        label: 'Zona 2 • Fondo Aerobico (Fat Burn)',
        short: 'Z2 • Fondo Aerobico',
        range: '115 - 134 BPM',
        badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
        text: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bgGlow: 'from-cyan-950/40 to-zinc-950',
        percentMax: Math.round((bpm / 190) * 100)
      };
    }
    if (bpm < 155) {
      return {
        key: 'z3',
        label: 'Zona 3 • Aerobico Moderato / Tempo',
        short: 'Z3 • Tempo / Aerobico',
        range: '135 - 154 BPM',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        bgGlow: 'from-emerald-950/40 to-zinc-950',
        percentMax: Math.round((bpm / 190) * 100)
      };
    }
    if (bpm < 175) {
      return {
        key: 'z4',
        label: 'Zona 4 • Soglia Anaerobica',
        short: 'Z4 • Soglia',
        range: '155 - 174 BPM',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        bgGlow: 'from-amber-950/40 to-zinc-950',
        percentMax: Math.round((bpm / 190) * 100)
      };
    }
    return {
      key: 'z5',
      label: 'Zona 5 • Massimale / VO2 Max',
      short: 'Z5 • Massimale',
      range: '≥ 175 BPM',
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      text: 'text-red-400',
      border: 'border-red-500/40',
      bgGlow: 'from-red-950/40 to-zinc-950',
      percentMax: Math.min(100, Math.round((bpm / 190) * 100))
    };
  };

  const currentZone = getZone(currentBpm);

  // Terminate & Save
  const handleConfirmFinish = () => {
    const rawHrData = getSessionData();
    const hrData = rawHrData
      ? {
          ...rawHrData,
          zones: {
            zone1RecoverySec: zoneSeconds.z1 || rawHrData.zones?.zone1RecoverySec || 0,
            zone2AerobicSec: zoneSeconds.z2 || rawHrData.zones?.zone2AerobicSec || 0,
            zone3TempoSec: zoneSeconds.z3 || rawHrData.zones?.zone3TempoSec || 0,
            zone4ThresholdSec: zoneSeconds.z4 || rawHrData.zones?.zone4ThresholdSec || 0,
            zone5AnaerobicSec: zoneSeconds.z5 || rawHrData.zones?.zone5AnaerobicSec || 0
          }
        }
      : undefined;

    const minsFloat = elapsedSec / 60;
    const durationMinRounded = Math.max(1, Math.round(minsFloat));
    const cardioLogPayload = {
      equipment: config.activity,
      durationMin: durationMinRounded,
      caloriesKcal: estimatedCalories,
      sensations:
        config.mode === 'intervals'
          ? `Sessione ${config.activityLabel} ad intervalli (${currentRound}/${intervalConfig.rounds} giri, ${intervalConfig.workSec}"/${intervalConfig.restSec}").`
          : `Sessione ${config.activityLabel} a tempo completata.`,
      mode: config.mode,
      intervalsCompleted: isIntervals ? currentRound : undefined,
      totalIntervals: isIntervals ? intervalConfig.rounds : undefined
    };

    finishWorkout(hrData, {
      durationSec: elapsedSec,
      cardioLog: cardioLogPayload
    });
    setShowFinishConfirm(false);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 pb-32 text-zinc-100 max-w-md mx-auto">
      {/* 1. COMPACT HEADER BAR: Clean 2-Row Layout, Never Overflows */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-xl space-y-2.5">
        {/* Row 1: Activity Name + Mode & Control Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Activity Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Seduta Cardio
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-extrabold text-white truncate">
                  {config.activityLabel}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700 shrink-0">
                  {isIntervals ? 'Intervalli' : 'A Tempo'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls (Pause, Termina, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPaused(p => !p)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center border transition-all ${
                isPaused
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
              title={isPaused ? 'Riprendi' : 'Metti in pausa'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/25 transition-all shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Termina</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="p-1.5 text-zinc-400 hover:text-red-400 rounded-xl hover:bg-zinc-800 shrink-0 transition-colors"
              title="Annulla sessione"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Bluetooth Chest Strap Status Bar (Single line, perfectly centered) */}
        <div
          onClick={() => setShowHeartRateModal(true)}
          className={`px-3 py-2 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isHrConnected
              ? 'bg-zinc-950/80 border-rose-500/40 hover:border-rose-500/60'
              : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                isHrConnected
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Bluetooth className="w-3.5 h-3.5" />
            </div>
            <div className="text-left truncate">
              <span className="text-xs font-bold text-white block truncate">
                {isHrConnected ? (deviceName || 'Fascia Cardio') : 'Fascia Cardio non connessa'}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                {isHrConnected ? 'Tocca per dettagli o disconnessione' : 'Tocca per connettere via Bluetooth'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {isHrConnected ? (
              <>
                {batteryLevel !== null && (
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    {batteryLevel}%
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black border ${currentZone.badge}`}>
                  {currentBpm || '--'} BPM
                </span>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                Connetti
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. HERO CARD: WORKOUT TIMER & PROGRESS (ALWAYS AT THE TOP, RUNS AUTOMATICALLY) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
        {isIntervals ? (
          /* Interval Engine Display */
          <div className="space-y-3">
            {/* Phase Banner: SPRINT vs REST */}
            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                phase === 'work'
                  ? 'bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-orange-500/25 border-orange-500/60 text-orange-200 shadow-lg shadow-orange-500/15'
                  : 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 border-cyan-500/60 text-cyan-200 shadow-lg shadow-cyan-500/15'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5 font-black">
                  {phase === 'work' ? (
                    <Flame className="w-4 h-4 text-orange-400 fill-current animate-pulse" />
                  ) : (
                    <Timer className="w-4 h-4 text-cyan-400" />
                  )}
                  {phase === 'work' ? 'FASE SPRINT / LAVORO' : 'FASE RECUPERO'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-950/70 font-mono text-white text-[11px] font-bold border border-zinc-800">
                  Giro {currentRound} / {intervalConfig.rounds}
                </span>
              </div>

              {/* Huge countdown digits */}
              <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight my-1 text-white text-center">
                {formatTime(phaseSecondsLeft)}
              </div>

              {/* Next phase preview & fast-forward */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                <span className="text-zinc-300 text-[11px]">
                  {phase === 'work'
                    ? `Poi: Recupero (${intervalConfig.restSec}s)`
                    : currentRound < intervalConfig.rounds
                    ? `Poi: Giro ${currentRound + 1} (${intervalConfig.workSec}s)`
                    : 'Ultimo Recupero!'}
                </span>

                <button
                  type="button"
                  onClick={handleSkipPhase}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Salta Fase</span>
                  <FastForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Total elapsed time for intervals */}
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-zinc-500" />
                Tempo Totale Trascorso:
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {formatTime(elapsedSec)}
              </span>
            </div>
          </div>
        ) : (
          /* Steady State Clock Display */
          <div className="space-y-2.5 text-center">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                Tempo Trascorso
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Target: {config.targetDurationMin || 20} min
              </span>
            </div>

            {/* Huge primary elapsed clock */}
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white py-1">
              {formatTime(elapsedSec)}
            </div>

            {/* Target remaining */}
            <div className="text-xs text-zinc-400">
              Rimanente al target: <span className="font-mono font-bold text-zinc-200">{formatTime(Math.max(0, targetTotalSec - elapsedSec))}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${steadyProgressPercent}%` }}
              />
            </div>

            {/* Quick +/- 1 min buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setElapsedSec(s => Math.max(0, s - 60))}
                className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold flex items-center gap-1"
              >
                <Minus className="w-3 h-3" />
                <span>1 min</span>
              </button>
              <button
                type="button"
                onClick={() => setElapsedSec(s => s + 60)}
                className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>1 min</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. HEART RATE & 5 CARDIO ZONES HUD (PERFECTLY CENTERED & COMPACT) */}
      <div
        className={`bg-gradient-to-b ${currentZone.bgGlow} border-2 ${currentZone.border} rounded-3xl p-4 shadow-2xl relative transition-all duration-300`}
      >
        {/* Row: Title and Active Zone Pill */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <Heart
              className={`w-5 h-5 ${
                currentBpm && currentBpm > 0
                  ? 'text-rose-500 fill-rose-500 animate-pulse'
                  : 'text-zinc-600'
              }`}
            />
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-300">
              FC Live
            </span>
          </div>

          {/* Active Zone Pill (Never oversized or overflowing) */}
          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm transition-all truncate max-w-[190px] ${currentZone.badge}`}
          >
            {currentZone.short}
          </div>
        </div>

        {/* Huge Centered BPM Readout */}
        <div className="flex items-baseline justify-center gap-2 my-1 text-center">
          <span
            className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter ${currentZone.text} transition-colors drop-shadow-md`}
          >
            {currentBpm && currentBpm > 0 ? currentBpm : '--'}
          </span>
          <span className="text-base font-bold text-zinc-400 uppercase tracking-wider">
            BPM
          </span>
        </div>

        {/* Detailed Zone Description Centered */}
        <div className="text-center text-xs font-semibold text-zinc-300 mb-2.5 truncate">
          {currentZone.label} ({currentZone.range})
        </div>

        {/* 5-Zone Horizontal Segmented Bar with Timers */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
            <span>5 ZONE CARDIO</span>
            <span>TEMPO NELLE ZONE</span>
          </div>

          {/* Segmented bar */}
          <div className="grid grid-cols-5 gap-1.5 h-2.5">
            <div
              className={`rounded-full transition-all ${
                currentZone.key === 'z1' ? 'bg-blue-500 ring-2 ring-blue-400 animate-pulse' : 'bg-blue-500/25'
              }`}
              title="Zona 1: <115 BPM"
            />
            <div
              className={`rounded-full transition-all ${
                currentZone.key === 'z2' ? 'bg-cyan-500 ring-2 ring-cyan-400 animate-pulse' : 'bg-cyan-500/25'
              }`}
              title="Zona 2: 115-134 BPM"
            />
            <div
              className={`rounded-full transition-all ${
                currentZone.key === 'z3' ? 'bg-emerald-500 ring-2 ring-emerald-400 animate-pulse' : 'bg-emerald-500/25'
              }`}
              title="Zona 3: 135-154 BPM"
            />
            <div
              className={`rounded-full transition-all ${
                currentZone.key === 'z4' ? 'bg-amber-500 ring-2 ring-amber-400 animate-pulse' : 'bg-amber-500/25'
              }`}
              title="Zona 4: 155-174 BPM"
            />
            <div
              className={`rounded-full transition-all ${
                currentZone.key === 'z5' ? 'bg-red-500 ring-2 ring-red-400 animate-pulse' : 'bg-red-500/25'
              }`}
              title="Zona 5: >=175 BPM"
            />
          </div>

          {/* Zone time spent chips */}
          <div className="grid grid-cols-5 gap-1 text-center pt-0.5">
            <div className={`p-1 rounded-lg border ${currentZone.key === 'z1' ? 'border-blue-500/60 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
              <div className="text-[9px] font-bold text-blue-400">Z1</div>
              <div className="text-[10px] font-mono text-zinc-300">{formatZoneSec(zoneSeconds.z1)}</div>
            </div>
            <div className={`p-1 rounded-lg border ${currentZone.key === 'z2' ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
              <div className="text-[9px] font-bold text-cyan-400">Z2</div>
              <div className="text-[10px] font-mono text-zinc-300">{formatZoneSec(zoneSeconds.z2)}</div>
            </div>
            <div className={`p-1 rounded-lg border ${currentZone.key === 'z3' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
              <div className="text-[9px] font-bold text-emerald-400">Z3</div>
              <div className="text-[10px] font-mono text-zinc-300">{formatZoneSec(zoneSeconds.z3)}</div>
            </div>
            <div className={`p-1 rounded-lg border ${currentZone.key === 'z4' ? 'border-amber-500/60 bg-amber-500/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
              <div className="text-[9px] font-bold text-amber-400">Z4</div>
              <div className="text-[10px] font-mono text-zinc-300">{formatZoneSec(zoneSeconds.z4)}</div>
            </div>
            <div className={`p-1 rounded-lg border ${currentZone.key === 'z5' ? 'border-red-500/60 bg-red-500/10' : 'border-zinc-800 bg-zinc-950/60'}`}>
              <div className="text-[9px] font-bold text-red-400">Z5</div>
              <div className="text-[10px] font-mono text-zinc-300">{formatZoneSec(zoneSeconds.z5)}</div>
            </div>
          </div>
        </div>

        {/* 4. PERFORMANCE & CALORIC STRIP (Keytel calibrated with user profile) */}
        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-zinc-800/80 text-center">
          <div>
            <div className="text-[9px] text-zinc-400 uppercase font-semibold">FC Media</div>
            <div className="text-sm font-bold font-mono text-white">{avgBpm || '--'} bpm</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400 uppercase font-semibold">FC Max</div>
            <div className="text-sm font-bold font-mono text-rose-400">{maxBpm || '--'} bpm</div>
          </div>
          <div>
            <div className="text-[9px] text-zinc-400 uppercase font-semibold flex items-center justify-center gap-0.5">
              <span>Calorie</span>
              {config.userProfile && (
                <span className="text-[8px] text-zinc-500">({config.userProfile.weightKg}kg)</span>
              )}
            </div>
            <div className="text-sm font-bold font-mono text-amber-400 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>{estimatedCalories} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heart Rate Connection Modal */}
      <HeartRateModal
        isOpen={showHeartRateModal}
        onClose={() => setShowHeartRateModal(false)}
      />

      {/* Confirmation Finish Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Terminare la Seduta Cardio?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Hai completato {formatTime(elapsedSec)} su {config.activityLabel} ({estimatedCalories} kcal). I dati della frequenza cardiaca, calorie e zone verranno salvati nello storico.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
              >
                Continua
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Salva & Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <X className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Annullare questo allenamento?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                La sessione corrente verrà cancellata senza essere registrata nello storico.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
              >
                Indietro
              </button>
              <button
                type="button"
                onClick={() => {
                  discardActiveWorkout();
                  setShowDiscardConfirm(false);
                }}
                className="py-2.5 px-3 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-xl"
              >
                Elimina Sessione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

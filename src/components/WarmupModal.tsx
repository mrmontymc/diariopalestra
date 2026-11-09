import React, { useState, useEffect } from 'react';
import { WARMUP_PROTOCOLS, WarmupProtocol } from '../data/warmupData';
import {
  Flame,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Timer,
  Activity,
  Sparkles,
  ChevronRight,
  Info,
  ShieldCheck,
  Dumbbell
} from 'lucide-react';
import { playShortBeep, playTimerFinishBeep, playCountdownWarningBeep } from '../utils/audio';

interface WarmupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
  defaultTargetWeightKg?: number;
}

export const WarmupModal: React.FC<WarmupModalProps> = ({
  isOpen,
  onClose,
  dayKey,
  defaultTargetWeightKg = 80
}) => {
  const protocol: WarmupProtocol | undefined = WARMUP_PROTOCOLS[dayKey] || WARMUP_PROTOCOLS['lun'];

  // 2-minute cardio timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(120); // 2 minutes

  // Interactive checkmarks for warmup exercises (ephemeral, not saved to history)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const availableRamps = protocol.specificBlock.rampGuides || (protocol.specificBlock.rampGuide ? [protocol.specificBlock.rampGuide] : []);
  const [activeRampIdx, setActiveRampIdx] = useState(0);

  // Dynamic ramp weight input
  const currentRamp = availableRamps[activeRampIdx] || availableRamps[0];
  const [targetWeightInput, setTargetWeightInput] = useState<number>(defaultTargetWeightKg || currentRamp?.defaultKg || 80);

  useEffect(() => {
    if (defaultTargetWeightKg > 0) {
      setTargetWeightInput(defaultTargetWeightKg);
    } else if (currentRamp) {
      setTargetWeightInput(currentRamp.defaultKg);
    }
  }, [defaultTargetWeightKg, activeRampIdx]);

  // Reset checked items when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckedItems({});
      setTimerRunning(false);
      setTimerSecondsLeft(120);
      setActiveRampIdx(0);
    }
  }, [isOpen, dayKey]);

  // Cardio timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            playTimerFinishBeep();
            setTimerRunning(false);
            return 0;
          }
          if (prev <= 4 && prev >= 2) {
            playCountdownWarningBeep();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  if (!isOpen || !protocol) return null;

  const toggleCheck = (id: string) => {
    playShortBeep(750, 0.05);
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const rampSteps = currentRamp
    ? currentRamp.calculateRamp(targetWeightInput)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                  {protocol.durationLabel}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Non salvato nello storico
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Riscaldamento: {protocol.routineTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 hover:bg-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Info pill: Pure warmup disclaimer */}
          <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center gap-2 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Prepara muscoli, sistema nervoso e mobilità articolare. <strong className="text-zinc-200">Il riscaldamento non viene conteggiato nello storico dei carichi o nel tonnellaggio.</strong>
            </span>
          </div>

          {/* ======================================================== */}
          {/* SEZIONE 1: BASE COMUNE (5') */}
          {/* ======================================================== */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Base Comune (Tutte le Sedute - 5')
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Attivazione + Mobilità
              </span>
            </div>

            {/* Cardio portion with embedded 2' timer */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Cardio Facile (2 minuti)</span>
                </div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {formatTimer(timerSecondsLeft)}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">
                {protocol.commonBase.cardio}
              </p>

              {/* Timer controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    timerRunning
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  }`}
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{timerRunning ? 'Pausa 2 min' : 'Avvia Timer 2 Min'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSecondsLeft(120);
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Azzera 2 min"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobility circuit list */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                <span>{protocol.commonBase.mobilityCircuits}</span>
                <span className="text-[10px] text-zinc-500">Tocca per spuntare</span>
              </div>

              <div className="space-y-1.5">
                {protocol.commonBase.exercises.map((ex, idx) => {
                  const checkId = `common_${idx}`;
                  const isChecked = !!checkedItems[checkId];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(checkId)}
                      className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-400'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 bg-zinc-800'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`text-xs font-bold ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {ex.name}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold shrink-0">
                            {ex.repsOrTime}
                          </span>
                        </div>
                        {ex.notes && (
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SEZIONE 2: BLOCCO SPECIFICO DEL GIORNO (6-8') */}
          {/* ======================================================== */}
          <div className="bg-zinc-950/90 border border-orange-500/30 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {protocol.specificBlock.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-orange-300 font-semibold">
                6-8 Minuti
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 italic">
              {protocol.specificBlock.focus}
            </p>

            {/* Specific exercises list */}
            <div className="space-y-1.5">
              {protocol.specificBlock.exercises.map((ex, idx) => {
                const checkId = `specific_${idx}`;
                const isChecked = !!checkedItems[checkId];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(checkId)}
                    className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-400'
                        : ex.isRamp
                        ? 'bg-orange-950/20 border-orange-500/40'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 bg-zinc-800'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className={`text-xs font-bold ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {idx + 1}. {ex.name}
                        </span>
                        <span className="text-[11px] font-mono text-orange-400 font-semibold shrink-0">
                          {ex.repsOrTime}
                        </span>
                      </div>
                      {ex.notes && (
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                          {ex.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Ramp Calculator */}
            {currentRamp && (
              <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2.5">
                {/* Switcher pills if multiple ramps are available (e.g. Squat + Panca on Seduta A) */}
                {availableRamps.length > 1 && (
                  <div className="flex gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    {availableRamps.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveRampIdx(idx);
                          setTargetWeightInput(r.defaultKg);
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all ${
                          activeRampIdx === idx
                            ? 'bg-orange-500 text-zinc-950 shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r.targetExercise}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      Rampa: {currentRamp.targetExercise}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold">Carico target:</span>
                    <input
                      type="number"
                      step="2.5"
                      min="20"
                      max="300"
                      value={targetWeightInput}
                      onChange={e => setTargetWeightInput(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs font-bold text-emerald-400">kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                  {rampSteps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-800 text-center space-y-0.5"
                    >
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                        {step.step}
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-400 block">
                        {step.weightKg} kg
                      </span>
                      <span className="text-[10px] font-mono text-zinc-300 block">
                        {step.reps}
                      </span>
                      <span className="text-[9px] text-zinc-500 leading-tight block">
                        {step.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SEZIONE 3: REGOLE SPECIALI DAL PDF */}
          {/* ======================================================== */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Regole Importanti di Esecuzione (dal PDF)</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-zinc-400">
              {protocol.specialRules.map((rule, rIdx) => (
                <li key={rIdx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/95 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20"
          >
            Chiudi e Torna all'Allenamento
          </button>
        </div>
      </div>
    </div>
  );
};

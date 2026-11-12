import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useHeartRate } from '../context/HeartRateContext';
import { CardioMode, CardioSessionConfig, CardioIntervalConfig, CardioUserProfile } from '../types/workout';
import { getSavedUserProfile, saveUserProfile } from '../utils/calorieCalculator';
import { HeartRateModal } from './HeartRateModal';
import {
  X,
  Heart,
  Bluetooth,
  Play,
  Timer,
  Activity,
  Flame,
  Zap,
  Check,
  ChevronRight,
  Battery,
  Sliders,
  ExternalLink,
  Info,
  User,
  Scale
} from 'lucide-react';

interface CardioSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityOption {
  id: string;
  label: string;
  icon: string;
  tag: string;
}

const CARDIO_ACTIVITIES: ActivityOption[] = [
  { id: 'vogatore', label: 'Vogatore', icon: '🚣', tag: 'Concept2 / WaterRower' },
  { id: 'air_bike', label: 'Air Bike', icon: '🚴', tag: 'Assault / Echo Bike' },
  { id: 'skierg', label: 'SkiErg', icon: '⛷️', tag: 'Concept2 Ski' },
  { id: 'tapis_roulant', label: 'Tapis Roulant / Corsa', icon: '🏃', tag: 'Indoor & Pista' },
  { id: 'cyclette', label: 'Cyclette / Spin Bike', icon: '🚲', tag: 'Indoor Cycling' },
  { id: 'corda', label: 'Salto con la Corda', icon: '🪢', tag: 'Speed Rope' },
  { id: 'ellittica', label: 'Ellittica', icon: '🚶', tag: 'Basso Impatto' },
  { id: 'cardio_libero', label: 'Cardio Libero / Misto', icon: '⚡', tag: 'Bodyweight / Circuit' }
];

const INTERVAL_PRESETS: {
  id: string;
  label: string;
  subtitle: string;
  rounds: number;
  workSec: number;
  restSec: number;
}[] = [
  {
    id: 'tabata',
    label: 'Tabata Classico',
    subtitle: '8 round • 20" Max / 10" Rest',
    rounds: 8,
    workSec: 20,
    restSec: 10
  },
  {
    id: 'hiit_30_30',
    label: 'HIIT 30 / 30',
    subtitle: '10 round • 30" Sprint / 30" Rest',
    rounds: 10,
    workSec: 30,
    restSec: 30
  },
  {
    id: 'hiit_40_20',
    label: 'Intervals 40 / 20',
    subtitle: '8 round • 40" Forte / 20" Rest',
    rounds: 8,
    workSec: 40,
    restSec: 20
  },
  {
    id: 'threshold_60_60',
    label: 'Soglia 1\' : 1\'',
    subtitle: '6 round • 60" Forte / 60" Lento',
    rounds: 6,
    workSec: 60,
    restSec: 60
  }
];

export const CardioSetupModal: React.FC<CardioSetupModalProps> = ({ isOpen, onClose }) => {
  const { startCardioWorkout } = useWorkout();
  const {
    isConnected,
    deviceName,
    currentBpm,
    batteryLevel,
    isSimulated,
    isInsideIframe,
    connect,
    toggleSimulation
  } = useHeartRate();

  const [selectedActivity, setSelectedActivity] = useState<string>('vogatore');
  const [mode, setMode] = useState<CardioMode>('steady');

  // Steady state duration
  const [steadyDurationMin, setSteadyDurationMin] = useState<number>(20);
  const [targetCalories, setTargetCalories] = useState<number>(0);

  // Interval state
  const [intervalRounds, setIntervalRounds] = useState<number>(8);
  const [workSec, setWorkSec] = useState<number>(20);
  const [restSec, setRestSec] = useState<number>(10);

  // User biometrics for accurate caloric estimation (Keytel formula)
  const [userProfile, setUserProfile] = useState<CardioUserProfile>(() => getSavedUserProfile());

  const handleUpdateProfile = (patch: Partial<CardioUserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...patch };
      saveUserProfile(updated);
      return updated;
    });
  };

  // Heart rate connection modal
  const [showHrDetailsModal, setShowHrDetailsModal] = useState(false);

  if (!isOpen) return null;

  const currentActivityObj = CARDIO_ACTIVITIES.find(a => a.id === selectedActivity) || CARDIO_ACTIVITIES[0];

  // Calculate total interval time in seconds
  const totalIntervalSec = intervalRounds * (workSec + restSec);
  const totalIntervalMin = Math.floor(totalIntervalSec / 60);
  const totalIntervalRemainingSec = totalIntervalSec % 60;

  const handleApplyPreset = (preset: typeof INTERVAL_PRESETS[0]) => {
    setIntervalRounds(preset.rounds);
    setWorkSec(preset.workSec);
    setRestSec(preset.restSec);
  };

  const handleStart = () => {
    const config: CardioSessionConfig = {
      activity: selectedActivity,
      activityLabel: currentActivityObj.label,
      mode,
      targetDurationMin: mode === 'steady' ? steadyDurationMin : Math.round(totalIntervalSec / 60),
      targetCalories: targetCalories > 0 ? targetCalories : undefined,
      intervals: mode === 'intervals' ? {
        rounds: intervalRounds,
        workSec,
        restSec
      } : undefined,
      userProfile
    };

    startCardioWorkout(config);
    onClose();
  };

  // Quick cardio zone preview
  const getZoneColor = (bpm: number) => {
    if (bpm < 115) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (bpm < 135) return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
    if (bpm < 155) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (bpm < 175) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 font-black">
                <Heart className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                  Cardio Training & FC Live
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Avvia Seduta Cardio
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. Fascia Cardio Bluetooth Status Banner */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isConnected
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Bluetooth className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Fascia Cardio Bluetooth</span>
                      {isConnected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {isConnected
                        ? `Connessa: ${deviceName || 'Dispositivo BLE'}`
                        : 'Collega la tua fascia cardio per monitorare la FC live'}
                    </div>
                  </div>
                </div>

                {isConnected && currentBpm ? (
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1.5 ${getZoneColor(currentBpm)}`}>
                    <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
                    <span>{currentBpm} BPM</span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons for Strap */}
              <div className="flex items-center gap-2 pt-1">
                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => setShowHrDetailsModal(true)}
                    className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>Dettagli Fascia</span>
                    {batteryLevel !== null && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                        <Battery className="w-3 h-3 text-emerald-400" /> {batteryLevel}%
                      </span>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowHrDetailsModal(true)}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/25 transition-all"
                    >
                      <Bluetooth className="w-3.5 h-3.5" />
                      <span>Connetti Fascia (BLE)</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleSimulation}
                      className="py-2 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 border border-zinc-700 shrink-0"
                      title="Attiva simulazione battiti (Demo)"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Demo BPM</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. Parametri Corporei per Stima Calorie & Zone FC */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dati Corporei (Stima Calorie & FC)</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Formula Keytel / MET</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* Sesso */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                    Sesso
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-700/80">
                    <button
                      type="button"
                      onClick={() => handleUpdateProfile({ gender: 'uomo' })}
                      className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                        userProfile.gender === 'uomo'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateProfile({ gender: 'donna' })}
                      className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                        userProfile.gender === 'donna'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      F
                    </button>
                  </div>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    step="0.5"
                    value={userProfile.weightKg}
                    onChange={e => handleUpdateProfile({ weightKg: parseFloat(e.target.value) || 70 })}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Altezza */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                    Altezza (cm)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={userProfile.heightCm}
                    onChange={e => handleUpdateProfile({ heightCm: parseInt(e.target.value) || 175 })}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Età */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">
                    Età (anni)
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="99"
                    value={userProfile.age}
                    onChange={e => handleUpdateProfile({ age: parseInt(e.target.value) || 30 })}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2 py-1 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Selezione Tipo di Attività Cardio */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                <span>1. Tipo di Attività Cardio</span>
                <span className="text-rose-400 font-semibold">• {currentActivityObj.label}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CARDIO_ACTIVITIES.map(activity => {
                  const isSelected = selectedActivity === activity.id;
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => setSelectedActivity(activity.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/10 ring-1 ring-rose-500/50'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{activity.icon}</div>
                      <div className="text-xs font-bold text-white truncate">{activity.label}</div>
                      <div className="text-[9px] text-zinc-400 truncate">{activity.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Modalità: A Tempo vs Intervalli */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-2">
                2. Modalità di Allenamento
              </label>

              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('steady')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'steady'
                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>A Tempo (Steady)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('intervals')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mode === 'intervals'
                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Intervalli (HIIT)</span>
                </button>
              </div>
            </div>

            {/* 4. Dettagli configurazione in base alla modalità */}
            {mode === 'steady' ? (
              <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    Durata Target Seduta
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {steadyDurationMin} minuti
                  </span>
                </div>

                {/* Duration Pills */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 15, 20, 30, 45].map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setSteadyDurationMin(min)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        steadyDurationMin === min
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      {min}'
                    </button>
                  ))}
                </div>

                {/* Fine slider / adjuster */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSteadyDurationMin(m => Math.max(5, m - 5))}
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold flex items-center justify-center hover:bg-zinc-800"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={steadyDurationMin}
                    onChange={e => setSteadyDurationMin(parseInt(e.target.value) || 20)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setSteadyDurationMin(m => Math.min(120, m + 5))}
                    className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold flex items-center justify-center hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>

                {/* Calorie target opzionale */}
                <div className="pt-2 border-t border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-300 block">
                      Target Calorie (opzionale)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Obiettivo kcal per la sessione
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="25"
                      min="0"
                      max="1500"
                      placeholder="0"
                      value={targetCalories || ''}
                      onChange={e => setTargetCalories(parseInt(e.target.value) || 0)}
                      className="w-20 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-right font-mono font-bold text-white"
                    />
                    <span className="text-xs text-zinc-400 font-bold">kcal</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-2xl p-3.5 space-y-3.5">
                {/* Presets */}
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Preset Intervalli Popolari
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERVAL_PRESETS.map(preset => {
                      const isSelected =
                        intervalRounds === preset.rounds &&
                        workSec === preset.workSec &&
                        restSec === preset.restSec;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-400 text-white shadow-sm ring-1 ring-orange-500/40'
                              : 'bg-zinc-900/80 border-zinc-700/80 text-zinc-300 hover:border-zinc-600'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{preset.label}</div>
                          <div className="text-[10px] text-orange-400 font-mono mt-0.5">{preset.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom interval fields */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-700/60">
                  <div className="text-[11px] font-bold text-zinc-300">
                    Personalizzazione Giri e Secondi
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Rounds */}
                    <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-700/80 text-center">
                      <span className="text-[10px] text-zinc-400 font-semibold block mb-1">
                        Giri / Round
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIntervalRounds(r => Math.max(2, r - 1))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold font-mono text-white">
                          {intervalRounds}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIntervalRounds(r => Math.min(30, r + 1))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Work Sec */}
                    <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-700/80 text-center">
                      <span className="text-[10px] text-amber-400 font-semibold block mb-1">
                        Lavoro (sprint)
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setWorkSec(s => Math.max(5, s - 5))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold font-mono text-amber-400">
                          {workSec}"
                        </span>
                        <button
                          type="button"
                          onClick={() => setWorkSec(s => Math.min(300, s + 5))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rest Sec */}
                    <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-700/80 text-center">
                      <span className="text-[10px] text-cyan-400 font-semibold block mb-1">
                        Recupero (rest)
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRestSec(s => Math.max(5, s - 5))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold font-mono text-cyan-400">
                          {restSec}"
                        </span>
                        <button
                          type="button"
                          onClick={() => setRestSec(s => Math.min(300, s + 5))}
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary of intervals */}
                  <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-semibold">
                      Durata Totale Intervalli:
                    </span>
                    <span className="font-mono font-black text-orange-400">
                      {totalIntervalMin}:{totalIntervalRemainingSec < 10 ? `0${totalIntervalRemainingSec}` : totalIntervalRemainingSec} min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. 5 Cardio Training Zones Preview Banner */}
            <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  Zone Cardio d'Allenamento (Colori Live)
                </span>
                <span className="text-[10px] text-zinc-500">FC Max standard</span>
              </div>

              {/* 5 colored strips */}
              <div className="grid grid-cols-5 gap-1 text-center">
                <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-400">
                  <div className="text-[10px] font-black">Z1</div>
                  <div className="text-[9px] font-bold">&lt; 115</div>
                  <div className="text-[8px] text-blue-300/80 truncate">Recupero</div>
                </div>
                <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
                  <div className="text-[10px] font-black">Z2</div>
                  <div className="text-[9px] font-bold">115-134</div>
                  <div className="text-[8px] text-cyan-300/80 truncate">Fondo</div>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                  <div className="text-[10px] font-black">Z3</div>
                  <div className="text-[9px] font-bold">135-154</div>
                  <div className="text-[8px] text-emerald-300/80 truncate">Aerobico</div>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400">
                  <div className="text-[10px] font-black">Z4</div>
                  <div className="text-[9px] font-bold">155-174</div>
                  <div className="text-[8px] text-amber-300/80 truncate">Soglia</div>
                </div>
                <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400">
                  <div className="text-[10px] font-black">Z5</div>
                  <div className="text-[9px] font-bold">&ge; 175</div>
                  <div className="text-[8px] text-red-300/80 truncate">Massimale</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-zinc-950/90 border-t border-zinc-800/80 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
            >
              Annulla
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 active:scale-98 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Avvia {currentActivityObj.label} ({mode === 'steady' ? `${steadyDurationMin}'` : 'Intervalli'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Heart Rate Connection Details Modal */}
      <HeartRateModal
        isOpen={showHrDetailsModal}
        onClose={() => setShowHrDetailsModal(false)}
      />
    </>
  );
};

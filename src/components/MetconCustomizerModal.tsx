import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MetconResultLog, MetconMovementItem } from '../types/workout';
import {
  X,
  Plus,
  Trash2,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
  Check,
  Zap,
  RotateCcw
} from 'lucide-react';

interface MetconCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMetcon?: MetconResultLog;
  onApply: (metcon: MetconResultLog) => void;
}

export const MetconCustomizerModal: React.FC<MetconCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentMetcon,
  onApply
}) => {
  const { variants } = useWorkout();

  const [title, setTitle] = useState(currentMetcon?.title || "AMRAP 10' Funzionale");
  const [type, setType] = useState<'amrap' | 'for_time' | 'rounds_cap' | 'emom' | 'tabata' | 'free'>(
    currentMetcon?.type || 'amrap'
  );
  const [timeCapMin, setTimeCapMin] = useState(
    currentMetcon?.timeCapSec ? Math.round(currentMetcon.timeCapSec / 60) : 10
  );
  const [targetRounds, setTargetRounds] = useState(currentMetcon?.targetRounds || 3);
  const [emomIntervalSec, setEmomIntervalSec] = useState(currentMetcon?.emomIntervalSec || 60);
  const [instructions, setInstructions] = useState(
    currentMetcon?.sensations || 'Lavoro metabolico costante a RPE 8. Gestisci il ritmo senza andare a cedimento nei primi giri.'
  );

  const [movements, setMovements] = useState<MetconMovementItem[]>(() => {
    if (currentMetcon?.movements && currentMetcon.movements.length > 0) {
      return currentMetcon.movements;
    }
    return [
      { name: 'Thruster con bilanciere', repsOrDist: '10 ripetizioni', weightKg: 30 },
      { name: 'Air bike (Echo / Assault)', repsOrDist: '12 calorie', caloriesKcal: 12 },
      { name: 'Pallof press ai cavi', repsOrDist: '10 per lato', weightKg: 15 },
      { name: 'Burpees over the bar', repsOrDist: '8 ripetizioni' }
    ];
  });

  // Adding single movement state
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');
  const [repsOrDistInput, setRepsOrDistInput] = useState('10 ripetizioni');
  const [weightKgInput, setWeightKgInput] = useState<number | ''>('');
  const [caloriesInput, setCaloriesInput] = useState<number | ''>('');
  const [distanceInput, setDistanceInput] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleAddMovement = () => {
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    const name = selectedVariant ? selectedVariant.name : 'Esercizio personalizzato';

    let formattedRepsOrDist = repsOrDistInput.trim();
    if (!formattedRepsOrDist) {
      if (caloriesInput) formattedRepsOrDist = `${caloriesInput} cal`;
      else if (distanceInput) formattedRepsOrDist = `${distanceInput} m`;
      else if (weightKgInput) formattedRepsOrDist = `10 reps (${weightKgInput}kg)`;
      else formattedRepsOrDist = '10 reps';
    }

    const newMov: MetconMovementItem = {
      variantId: selectedVariantId,
      name,
      repsOrDist: formattedRepsOrDist,
      weightKg: weightKgInput !== '' ? Number(weightKgInput) : undefined,
      caloriesKcal: caloriesInput !== '' ? Number(caloriesInput) : undefined,
      distanceMeters: distanceInput !== '' ? Number(distanceInput) : undefined
    };

    setMovements(prev => [...prev, newMov]);
    // Reset inputs
    setRepsOrDistInput('10 ripetizioni');
    setWeightKgInput('');
    setCaloriesInput('');
    setDistanceInput('');
  };

  const handleRemoveMovement = (index: number) => {
    setMovements(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const timeCapSec = type === 'emom' 
      ? movements.length * targetRounds * emomIntervalSec 
      : timeCapMin * 60;

    const finalLog: MetconResultLog = {
      title: title.trim() || 'Metcon Personalizzato',
      type,
      movements,
      roundsCompleted: currentMetcon?.roundsCompleted || 0,
      partialReps: currentMetcon?.partialReps || 0,
      elapsedTimeSec: currentMetcon?.elapsedTimeSec || 0,
      sensations: instructions,
      timeCapSec,
      targetRounds: type === 'rounds_cap' || type === 'for_time' || type === 'emom' ? targetRounds : undefined,
      emomIntervalSec: type === 'emom' ? emomIntervalSec : undefined
    };

    onApply(finalLog);
    onClose();
  };

  // Preset templates
  const applyPreset = (presetKey: 'pdf_amrap8' | 'thruster_airbike' | 'core_cardio' | 'tabata_speed') => {
    if (presetKey === 'pdf_amrap8') {
      setTitle("AMRAP 8' (PDF Day 1)");
      setType('amrap');
      setTimeCapMin(8);
      setMovements([
        { name: 'Goblet squat con KB', repsOrDist: '10 ripetizioni', weightKg: 16 },
        { name: 'Push-up a terra', repsOrDist: '8 ripetizioni' },
        { name: 'Sit-up a terra', repsOrDist: '10 ripetizioni' }
      ]);
    } else if (presetKey === 'thruster_airbike') {
      setTitle('Metcon Thruster & Air Bike');
      setType('rounds_cap');
      setTargetRounds(3);
      setTimeCapMin(10);
      setMovements([
        { name: 'Thruster con bilanciere', repsOrDist: '12 ripetizioni', weightKg: 35 },
        { name: 'Air bike (Echo / Assault Bike)', repsOrDist: '15 calorie', caloriesKcal: 15 },
        { name: 'Burpees over the bar', repsOrDist: '10 ripetizioni' }
      ]);
    } else if (presetKey === 'core_cardio') {
      setTitle('Core & Cardio Burn (Pallof + SkiErg)');
      setType('amrap');
      setTimeCapMin(10);
      setMovements([
        { name: 'SkiErg Concept2', repsOrDist: '150 metri', distanceMeters: 150 },
        { name: 'Pallof press ai cavi / elastico', repsOrDist: '12 per lato', weightKg: 15 },
        { name: 'Plank (a terra o zavorrato)', repsOrDist: '40 secondi' },
        { name: 'Wall ball shot (Palla medica)', repsOrDist: '12 ripetizioni', weightKg: 6 }
      ]);
    } else if (presetKey === 'tabata_speed') {
      setTitle('EMOM 10 Minuti');
      setType('emom');
      setTimeCapMin(10);
      setMovements([
        { name: 'Min 1: Air bike o Vogatore', repsOrDist: '12-15 calorie', caloriesKcal: 14 },
        { name: 'Min 2: Devil press con manubri', repsOrDist: '8 ripetizioni', weightKg: 14 }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Personalizza Circuito
              </span>
              <h2 className="text-base font-bold text-white">
                Crea o Modifica Metcon
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick presets */}
          <div>
            <div className="text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Template Rapidi Consigliati
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => applyPreset('pdf_amrap8')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold whitespace-nowrap border border-zinc-700"
              >
                📄 PDF Originale AMRAP 8'
              </button>
              <button
                type="button"
                onClick={() => applyPreset('thruster_airbike')}
                className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-xs text-orange-300 font-semibold whitespace-nowrap border border-orange-500/30"
              >
                ⚡ Thruster + Air Bike
              </button>
              <button
                type="button"
                onClick={() => applyPreset('core_cardio')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs text-emerald-300 font-semibold whitespace-nowrap border border-emerald-500/30"
              >
                🛡️ Pallof + Plank + SkiErg
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tabata_speed')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold whitespace-nowrap border border-zinc-700"
              >
                ⏱️ EMOM 10 Min
              </button>
            </div>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Nome / Titolo Metcon
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Es. AMRAP 8', 3 giri a tempo, EMOM..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Tipo di Circuito
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                <option value="amrap">AMRAP (As Many Rounds As Possible)</option>
                <option value="rounds_cap">Giri a tempo (Time Cap)</option>
                <option value="for_time">For Time</option>
                <option value="emom">EMOM (Every Minute on the Minute)</option>
                <option value="tabata">Tabata</option>
                <option value="free">Libero / Senza timer fisso</option>
              </select>
            </div>

            {type !== 'emom' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {type === 'amrap' ? 'Durata (Minuti)' : 'Time Cap (Minuti)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timeCapMin}
                  onChange={e => setTimeCapMin(parseInt(e.target.value) || 8)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Frazione Intervallo
                </label>
                <select
                  value={emomIntervalSec}
                  onChange={e => setEmomIntervalSec(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono"
                >
                  <option value={30}>30 secondi (E30S)</option>
                  <option value={45}>45 secondi (E45S)</option>
                  <option value={60}>1 minuto (60s - Standard)</option>
                  <option value={90}>1m 30s (90s)</option>
                  <option value={120}>2 minuti (120s - E2MOM)</option>
                </select>
              </div>
            )}

            {(type === 'rounds_cap' || type === 'for_time' || type === 'emom') && (
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    Numero di Giri Multipli ({type === 'emom' ? 'Rotazione' : 'Target'})
                  </label>
                  {type === 'emom' && (
                    <span className="text-[10px] text-orange-400 font-mono font-semibold">
                      Totale: {movements.length * targetRounds} intervalli ({Math.round((movements.length * targetRounds * emomIntervalSec) / 60)} min)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={targetRounds}
                  onChange={e => setTargetRounds(parseInt(e.target.value) || 3)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* List of current movements in metcon */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Movimenti nel Circuito ({movements.length})
              </span>
              <span className="text-[11px] text-zinc-500">
                Esegui a rotazione continua
              </span>
            </div>

            <div className="space-y-2">
              {movements.map((mov, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">
                        {mov.name}
                      </div>
                      <div className="text-[11px] text-orange-300 flex items-center gap-2 flex-wrap">
                        <span>{mov.repsOrDist}</span>
                        {mov.weightKg && (
                          <span className="px-1.5 py-0.2 bg-zinc-700 rounded text-[10px] text-zinc-300">
                            {mov.weightKg} kg
                          </span>
                        )}
                        {mov.caloriesKcal && (
                          <span className="px-1.5 py-0.2 bg-orange-950/80 border border-orange-500/30 rounded text-[10px] text-orange-300">
                            {mov.caloriesKcal} cal
                          </span>
                        )}
                        {mov.distanceMeters && (
                          <span className="px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-500/30 rounded text-[10px] text-cyan-300">
                            {mov.distanceMeters} m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMovement(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-700"
                    title="Rimuovi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add movement section from database */}
          <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-2xl space-y-2.5">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              Aggiungi Esercizio dal Database
            </span>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Seleziona Esercizio (Thruster, Core, Cardio, Fondamentali...)
              </label>
              <select
                value={selectedVariantId}
                onChange={e => setSelectedVariantId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category} • {v.equipment})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">
                  Ripetizioni / Testo
                </label>
                <input
                  type="text"
                  placeholder="Es. 10 reps"
                  value={repsOrDistInput}
                  onChange={e => setRepsOrDistInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">
                  Carico (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Opzionale"
                  value={weightKgInput}
                  onChange={e => setWeightKgInput(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">
                  Calorie (kcal)
                </label>
                <input
                  type="number"
                  placeholder="Per bike/row"
                  value={caloriesInput}
                  onChange={e => setCaloriesInput(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-0.5">
                  Distanza (m)
                </label>
                <input
                  type="number"
                  step="50"
                  placeholder="Es. 250m"
                  value={distanceInput}
                  onChange={e => setDistanceInput(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMovement}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              Aggiungi Movimento al Metcon
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Applica alla Seduta
          </button>
        </div>
      </div>
    </div>
  );
};

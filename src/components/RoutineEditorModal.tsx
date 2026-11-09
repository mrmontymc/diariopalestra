import React, { useState } from 'react';
import { WorkoutRoutine, SuperSetPair } from '../types/workout';
import { useWorkout } from '../context/WorkoutContext';
import { X, Save, Trash2, Plus, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface RoutineEditorModalProps {
  routine: WorkoutRoutine;
  isOpen: boolean;
  onClose: () => void;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  routine,
  isOpen,
  onClose
}) => {
  const { updateRoutine, variants } = useWorkout();
  const [editedRoutine, setEditedRoutine] = useState<WorkoutRoutine>({ ...routine });

  if (!isOpen) return null;

  const handleSave = () => {
    updateRoutine(editedRoutine);
    onClose();
  };

  const handlePairRestChange = (pairId: string, newRest: number) => {
    setEditedRoutine(prev => ({
      ...prev,
      superSets: prev.superSets.map(p => (p.id === pairId ? { ...p, restBetweenRoundsSec: newRest } : p))
    }));
  };

  const handlePairRoundsChange = (pairId: string, newRounds: number) => {
    setEditedRoutine(prev => ({
      ...prev,
      superSets: prev.superSets.map(p => (p.id === pairId ? { ...p, targetRounds: newRounds } : p))
    }));
  };

  const handlePrimaryVariantChange = (pairId: string, variantId: string) => {
    const v = variants.find(item => item.id === variantId);
    if (!v) return;
    setEditedRoutine(prev => ({
      ...prev,
      superSets: prev.superSets.map(p =>
        p.id === pairId
          ? {
              ...p,
              primary: {
                ...p.primary,
                variantId,
                label: v.name
              }
            }
          : p
      )
    }));
  };

  const handleSecondaryVariantChange = (pairId: string, variantId: string) => {
    const v = variants.find(item => item.id === variantId);
    if (!v) return;
    setEditedRoutine(prev => ({
      ...prev,
      superSets: prev.superSets.map(p =>
        p.id === pairId
          ? {
              ...p,
              secondary: {
                ...p.secondary,
                variantId,
                label: v.name
              }
            }
          : p
      )
    }));
  };

  const movePair = (index: number, direction: 'up' | 'down') => {
    const newPairs = [...editedRoutine.superSets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPairs.length) return;
    const temp = newPairs[index];
    newPairs[index] = newPairs[targetIndex];
    newPairs[targetIndex] = temp;
    setEditedRoutine(prev => ({ ...prev, superSets: newPairs }));
  };

  const removePair = (pairId: string) => {
    setEditedRoutine(prev => ({
      ...prev,
      superSets: prev.superSets.filter(p => p.id !== pairId)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Personalizzazione Scheda
            </span>
            <h2 className="text-base font-bold text-white">
              Modifica {editedRoutine.dayLabel} - {editedRoutine.title}
            </h2>
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
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Titolo Seduta
            </label>
            <input
              type="text"
              value={editedRoutine.title}
              onChange={e => setEditedRoutine(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Sottotitolo / Focus
            </label>
            <input
              type="text"
              value={editedRoutine.subtitle}
              onChange={e => setEditedRoutine(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Super sets manager */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Super Serie & Esercizi
              </span>
              <span className="text-xs text-zinc-500">
                {editedRoutine.superSets.length} coppie
              </span>
            </div>

            <div className="space-y-3">
              {editedRoutine.superSets.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {pair.code}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {pair.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePair(idx, 'up')}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Sposta su"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === editedRoutine.superSets.length - 1}
                        onClick={() => movePair(idx, 'down')}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        title="Sposta giù"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePair(pair.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 ml-1"
                        title="Elimina coppia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Primary selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                      1° Esercizio (Fondamentale)
                    </label>
                    <select
                      value={pair.primary.variantId}
                      onChange={e => handlePrimaryVariantChange(pair.id, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.muscleGroup})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                      2° Esercizio (Metabolico / Braccia)
                    </label>
                    <select
                      value={pair.secondary.variantId}
                      onChange={e => handleSecondaryVariantChange(pair.id, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.muscleGroup})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rounds & Rest */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-700/50">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        Giri (Serie)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={pair.targetRounds}
                        onChange={e => handlePairRoundsChange(pair.id, parseInt(e.target.value) || 4)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        Recupero (secondi)
                      </label>
                      <input
                        type="number"
                        step="15"
                        min="30"
                        max="300"
                        value={pair.restBetweenRoundsSec}
                        onChange={e => handlePairRestChange(pair.id, parseInt(e.target.value) || 90)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metcon configuration */}
          {editedRoutine.metcon && (
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3 space-y-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Configurazione Metcon
              </span>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Titolo Metcon
                </label>
                <input
                  type="text"
                  value={editedRoutine.metcon.title}
                  onChange={e =>
                    setEditedRoutine(prev => ({
                      ...prev,
                      metcon: prev.metcon ? { ...prev.metcon, title: e.target.value } : undefined
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Istruzioni & Note
                </label>
                <textarea
                  rows={2}
                  value={editedRoutine.metcon.instructions}
                  onChange={e =>
                    setEditedRoutine(prev => ({
                      ...prev,
                      metcon: prev.metcon ? { ...prev.metcon, instructions: e.target.value } : undefined
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white resize-none"
                />
              </div>
            </div>
          )}
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
            onClick={handleSave}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseVariant, MuscleGroup, ExerciseCategory } from '../types/workout';
import { X, Check, Plus, Trophy, History, Dumbbell, Sparkles } from 'lucide-react';

interface VariantSelectorModalProps {
  currentVariantId: string;
  pattern: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (newVariantId: string, applyToMasterRoutine?: boolean) => void;
}

export const VariantSelectorModal: React.FC<VariantSelectorModalProps> = ({
  currentVariantId,
  pattern,
  isOpen,
  onClose,
  onSelect
}) => {
  const { variants, variantWeights, addVariant } = useWorkout();
  const [showAddForm, setShowAddForm] = useState(false);
  const [applyToMaster, setApplyToMaster] = useState(true);

  // New variant state
  const [newName, setNewName] = useState('');
  const [newEquipment, setNewEquipment] = useState<'bilanciere' | 'manubri' | 'kettlebell' | 'sbarra' | 'corpo libero' | 'vogatore' | 'cavi' | 'panca'>('bilanciere');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('gambe');
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('fondamentale');
  const [newStepKg, setNewStepKg] = useState<number>(2.5);
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  // Filter variants that match pattern or related muscle group
  const currentVar = variants.find(v => v.id === currentVariantId);
  const matchingVariants = variants.filter(v => {
    if (v.parentPattern === pattern) return true;
    if (currentVar && v.muscleGroup === currentVar.muscleGroup) return true;
    return false;
  });

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addVariant({
      name: newName.trim(),
      parentPattern: pattern || 'custom',
      category: newCategory,
      muscleGroup: newMuscle,
      equipment: newEquipment,
      defaultUnit: 'kg',
      progressionRule: `Aumenta di ${newStepKg} kg al completamento delle serie target.`,
      suggestedStepKg: newStepKg,
      isDefaultInPdf: false,
      notes: newNotes.trim()
    });

    onSelect(created.id, applyToMaster);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Personalizza Esercizio
            </div>
            <h2 className="text-lg font-bold text-white">
              Scegli o Cambia Variante
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

        {/* Content list or form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!showAddForm ? (
            <>
              <div className="text-xs text-zinc-400 mb-2">
                Ogni variante memorizza il proprio storico pesi e PR separatamente.
              </div>

              {/* Special recommendation for KB swing -> Goblet squat */}
              {pattern === 'swing' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Regola dal programma PDF:</span> Se la zona lombare protesta con il KB swing, sostituisci subito con il <span className="underline font-semibold">Goblet squat pesante</span>!
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {matchingVariants.map(variant => {
                  const isSelected = variant.id === currentVariantId;
                  const stats = variantWeights[variant.id];
                  const prWeight = stats?.maxWeightKg || 0;
                  const lastWeight = stats?.lastUsedWeightKg || 0;

                  return (
                    <div
                      key={variant.id}
                      onClick={() => onSelect(variant.id, applyToMaster)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40'
                          : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm text-white truncate">
                            {variant.name}
                          </span>
                          {variant.isDefaultInPdf && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-700 text-zinc-300">
                              PDF Default
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-zinc-800 text-zinc-400 capitalize">
                            {variant.equipment}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-1 mb-2">
                          {variant.progressionRule}
                        </p>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Trophy className="w-3.5 h-3.5" />
                            PR: {prWeight > 0 ? `${prWeight} kg` : 'Nessuno'}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <History className="w-3.5 h-3.5" />
                            Ultimo: {lastWeight > 0 ? `${lastWeight} kg` : '--'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-zinc-700 text-xs font-semibold text-zinc-200 hover:bg-zinc-600"
                          >
                            Seleziona
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (currentVar) {
                    setNewMuscle(currentVar.muscleGroup);
                    setNewCategory(currentVar.category);
                  }
                  setShowAddForm(true);
                }}
                className="w-full mt-3 py-3 border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Crea Nuova Variante Personalizzata
              </button>
            </>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Nuovo Esercizio o Variante
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Torna all'elenco
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Nome Esercizio / Variante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Hack squat con bilanciere"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Attrezzatura
                  </label>
                  <select
                    value={newEquipment}
                    onChange={e => setNewEquipment(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bilanciere">Bilanciere</option>
                    <option value="manubri">Manubri</option>
                    <option value="kettlebell">Kettlebell</option>
                    <option value="sbarra">Sbarra</option>
                    <option value="corpo libero">Corpo libero</option>
                    <option value="cavi">Cavi / Lat Machine</option>
                    <option value="vogatore">Vogatore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Step incremento (+ kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={newStepKg}
                    onChange={e => setNewStepKg(parseFloat(e.target.value) || 2.5)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Note di esecuzione (opzionale)
                </label>
                <textarea
                  rows={2}
                  placeholder="Indicazioni tecniche, postura o RPE..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold"
                >
                  Salva e Applica
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Master update toggle */}
        <div className="p-4 bg-zinc-950/70 border-t border-zinc-800/80">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToMaster}
              onChange={e => setApplyToMaster(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-zinc-800 border-zinc-700"
            />
            <span className="text-xs text-zinc-300">
              Aggiorna anche la scheda master per i prossimi allenamenti
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

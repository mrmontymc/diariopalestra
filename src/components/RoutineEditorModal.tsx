import React, { useState, useMemo } from 'react';
import { WorkoutRoutine, SuperSetPair, ExerciseVariant, MuscleGroup, ExerciseCategory, EquipmentType } from '../types/workout';
import { useWorkout } from '../context/WorkoutContext';
import { generateRandomMetcon, toMetconConfig } from '../utils/metconGenerator';
import { groupVariantsByMuscleGroup } from '../utils/muscleGroups';
import {
  X,
  Save,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Dumbbell,
  Check,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  Flame,
  HelpCircle,
  Dices
} from 'lucide-react';

interface RoutineEditorModalProps {
  routine: WorkoutRoutine;
  isOpen: boolean;
  onClose: () => void;
}

interface NewExerciseFormState {
  name: string;
  category: ExerciseCategory;
  progressionRule: string;
  suggestedStepKg: number;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  initialWeightKg: number;
  targetSets: number;
  targetReps: string;
  targetRepsNum: number;
  placement: 'new_pair' | 'existing_pair_primary' | 'existing_pair_secondary' | 'library_only';
  targetPairId?: string;
  companionVariantId?: string;
}

const PROGRESSION_PRESETS = [
  {
    id: 'barbell_linear',
    label: 'Bilanciere (+2.5 kg)',
    description: 'Aggiungi 2,5 kg quando chiudi 4×5 puliti con margine',
    stepKg: 2.5,
    rule: 'Se chiudi tutte le serie con forma pulita e 1-2 rip di margine, aumenta di 2,5 kg nella seduta successiva.'
  },
  {
    id: 'dumbbell_step',
    label: 'Manubri / KB (+2 kg)',
    description: 'Passa al manubrio/kettlebell successivo (+2 kg per mano)',
    stepKg: 2.0,
    rule: 'Quando completi tutte le ripetizioni target (es. 4×10-12), passa alla coppia di manubri successiva (+2 kg).'
  },
  {
    id: 'micro_load',
    label: 'Microcarichi (+1 kg)',
    description: 'Progressione fine con dischi da 0.5/1 kg (braccia o spalle)',
    stepKg: 1.0,
    rule: 'Aumenta di 1 kg appena le serie target sono chiuse con velocità uniforme.'
  },
  {
    id: 'heavy_step',
    label: 'Heavy / Stacchi (+5 kg)',
    description: 'Incremento di 5 kg per grandi alzate o hip thrust',
    stepKg: 5.0,
    rule: 'Aggiungi 5 kg al completamento delle serie target con buona tecnica.'
  },
  {
    id: 'bodyweight_weighted',
    label: 'Corpo Libero / Zavorra',
    description: 'Aggiungi zavorra (+2.5 kg) dopo aver consolidato le reps',
    stepKg: 2.5,
    rule: 'Quando chiudi 4×8-10 a corpo libero solido, inizia ad usare una zavorra di 2,5 kg.'
  },
  {
    id: 'reps_density',
    label: 'Densità / Ripetizioni',
    description: 'Incrementa il numero di ripetizioni o riduci il recupero',
    stepKg: 0,
    rule: 'Aumenta prima di 1-2 ripetizioni a parità di carico o accorcia il riposo di 15 secondi.'
  },
  {
    id: 'custom',
    label: 'Personalizzata',
    description: 'Scrivi la tua regola di carico specifica',
    stepKg: 2.5,
    rule: ''
  }
];

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  routine,
  isOpen,
  onClose
}) => {
  const { updateRoutine, variants, addVariant } = useWorkout();
  const [editedRoutine, setEditedRoutine] = useState<WorkoutRoutine>({ ...routine });

  // Memoize variants grouped and sorted by muscle group
  const groupedVariants = useMemo(() => groupVariantsByMuscleGroup(variants), [variants]);

  // Creation modal state for new custom exercises
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [newExForm, setNewExForm] = useState<NewExerciseFormState>({
    name: '',
    category: 'fondamentale',
    progressionRule: PROGRESSION_PRESETS[0].rule,
    suggestedStepKg: PROGRESSION_PRESETS[0].stepKg,
    muscleGroup: 'gambe',
    equipment: 'bilanciere',
    initialWeightKg: 40,
    targetSets: 4,
    targetReps: '5',
    targetRepsNum: 5,
    placement: 'new_pair'
  });

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

  // Add a brand new Super Serie pair to the routine
  const handleAddNewPair = () => {
    const pairLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextIdx = editedRoutine.superSets.length;
    const nextCode = pairLetters[nextIdx] || `${nextIdx + 1}`;

    // Select default variants
    const pVar = variants.find(v => v.category === 'fondamentale') || variants[0];
    const sVar = variants.find(v => v.category === 'metabolico' || v.category === 'braccia') || variants[1] || variants[0];

    const newPair: SuperSetPair = {
      id: `pair_${Date.now()}`,
      code: nextCode,
      title: `${pVar.name} + ${sVar.name}`,
      targetRounds: 4,
      restBetweenRoundsSec: 90,
      primary: {
        variantId: pVar.id,
        label: pVar.name,
        targetSets: 4,
        targetReps: '5',
        targetRepsNum: 5,
        type: pVar.category === 'braccia' ? 'braccia' : 'fondamentale'
      },
      secondary: {
        variantId: sVar.id,
        label: sVar.name,
        targetSets: 4,
        targetReps: '10-12',
        targetRepsNum: 10,
        type: 'metabolico'
      }
    };

    setEditedRoutine(prev => ({
      ...prev,
      superSets: [...prev.superSets, newPair]
    }));

    setSuccessBanner(`Nuova Coppia ${nextCode} aggiunta alla scheda!`);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  // Open creation modal targeted to an existing pair and slot
  const openCreateForExistingPair = (pairId: string, slot: 'primary' | 'secondary') => {
    const pair = editedRoutine.superSets.find(p => p.id === pairId);
    const isPrimary = slot === 'primary';

    setNewExForm(prev => ({
      ...prev,
      name: '',
      category: isPrimary ? 'fondamentale' : 'metabolico',
      progressionRule: isPrimary ? PROGRESSION_PRESETS[0].rule : PROGRESSION_PRESETS[1].rule,
      suggestedStepKg: isPrimary ? 2.5 : 2.0,
      initialWeightKg: isPrimary ? 50 : 16,
      targetReps: isPrimary ? '5' : '10-12',
      targetRepsNum: isPrimary ? 5 : 10,
      placement: isPrimary ? 'existing_pair_primary' : 'existing_pair_secondary',
      targetPairId: pairId,
      companionVariantId: isPrimary ? pair?.secondary.variantId : pair?.primary.variantId
    }));
    setFormError(null);
    setShowCreateExerciseModal(true);
  };

  // Preset selection handler in form
  const handleSelectPreset = (presetId: string) => {
    const preset = PROGRESSION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setNewExForm(prev => ({
      ...prev,
      progressionRule: preset.rule,
      suggestedStepKg: preset.stepKg
    }));
  };

  // Category change handler in form
  const handleCategoryChange = (cat: ExerciseCategory) => {
    const isFond = cat === 'fondamentale';
    const isMetab = cat === 'metabolico';
    const isBraccia = cat === 'braccia';

    const defaultPreset = isFond
      ? PROGRESSION_PRESETS[0]
      : (isMetab || isBraccia)
      ? PROGRESSION_PRESETS[1]
      : PROGRESSION_PRESETS[0];

    const defaultInitWeight = isFond ? 50 : (isMetab ? 16 : (isBraccia ? 12 : 20));

    setNewExForm(prev => ({
      ...prev,
      category: cat,
      progressionRule: defaultPreset.rule,
      suggestedStepKg: defaultPreset.stepKg,
      initialWeightKg: defaultInitWeight,
      targetReps: isFond ? '5' : (isMetab || isBraccia ? '10-12' : '8-10'),
      targetRepsNum: isFond ? 5 : 10
    }));
  };

  // Save and register custom exercise
  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExForm.name.trim()) {
      setFormError('Inserisci il nome dell\'esercizio');
      return;
    }

    if (!newExForm.progressionRule.trim()) {
      setFormError('Indica la logica di carico / progressione dell\'esercizio');
      return;
    }

    // 1. Add variant to global WorkoutContext with initial load
    const createdVariant = addVariant(
      {
        name: newExForm.name.trim(),
        parentPattern: 'custom',
        category: newExForm.category,
        muscleGroup: newExForm.muscleGroup,
        equipment: newExForm.equipment,
        defaultUnit: 'kg',
        progressionRule: newExForm.progressionRule.trim(),
        suggestedStepKg: Number(newExForm.suggestedStepKg) || 2.5,
        isDefaultInPdf: false,
        notes: `Esercizio personalizzato aggiunto dall'utente (${newExForm.category}).`
      },
      newExForm.initialWeightKg > 0 ? Number(newExForm.initialWeightKg) : undefined
    );

    // 2. Insert into edited routine based on chosen placement
    if (newExForm.placement === 'new_pair') {
      const pairLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const nextIdx = editedRoutine.superSets.length;
      const nextCode = pairLetters[nextIdx] || `${nextIdx + 1}`;

      const isPrimary = newExForm.category === 'fondamentale';
      const companionVar = newExForm.companionVariantId
        ? variants.find(v => v.id === newExForm.companionVariantId)
        : variants.find(v => v.category === (isPrimary ? 'metabolico' : 'fondamentale')) || variants[0];

      const newPair: SuperSetPair = {
        id: `pair_${Date.now()}`,
        code: nextCode,
        title: isPrimary
          ? `${createdVariant.name} + ${companionVar?.name || 'Metabolico'}`
          : `${companionVar?.name || 'Fondamentale'} + ${createdVariant.name}`,
        targetRounds: newExForm.targetSets || 4,
        restBetweenRoundsSec: 90,
        primary: isPrimary
          ? {
              variantId: createdVariant.id,
              label: createdVariant.name,
              targetSets: newExForm.targetSets || 4,
              targetReps: newExForm.targetReps || '5',
              targetRepsNum: newExForm.targetRepsNum || 5,
              type: 'fondamentale'
            }
          : {
              variantId: companionVar?.id || variants[0].id,
              label: companionVar?.name || variants[0].name,
              targetSets: newExForm.targetSets || 4,
              targetReps: '5',
              targetRepsNum: 5,
              type: 'fondamentale'
            },
        secondary: isPrimary
          ? {
              variantId: companionVar?.id || variants[1]?.id || variants[0].id,
              label: companionVar?.name || variants[1]?.name || variants[0].name,
              targetSets: newExForm.targetSets || 4,
              targetReps: '10-12',
              targetRepsNum: 10,
              type: 'metabolico'
            }
          : {
              variantId: createdVariant.id,
              label: createdVariant.name,
              targetSets: newExForm.targetSets || 4,
              targetReps: newExForm.targetReps || '10-12',
              targetRepsNum: newExForm.targetRepsNum || 10,
              type: newExForm.category === 'braccia' ? 'braccia' : 'metabolico'
            }
      };

      setEditedRoutine(prev => ({
        ...prev,
        superSets: [...prev.superSets, newPair]
      }));

      setSuccessBanner(`Esercizio "${createdVariant.name}" aggiunto in nuova Coppia ${nextCode}!`);
    } else if (newExForm.placement === 'existing_pair_primary' && newExForm.targetPairId) {
      setEditedRoutine(prev => ({
        ...prev,
        superSets: prev.superSets.map(p =>
          p.id === newExForm.targetPairId
            ? {
                ...p,
                primary: {
                  ...p.primary,
                  variantId: createdVariant.id,
                  label: createdVariant.name,
                  targetReps: newExForm.targetReps || '5',
                  targetRepsNum: newExForm.targetRepsNum || 5,
                  type: newExForm.category === 'braccia' ? 'braccia' : 'fondamentale'
                }
              }
            : p
        )
      }));
      setSuccessBanner(`Esercizio "${createdVariant.name}" inserito come 1° esercizio!`);
    } else if (newExForm.placement === 'existing_pair_secondary' && newExForm.targetPairId) {
      setEditedRoutine(prev => ({
        ...prev,
        superSets: prev.superSets.map(p =>
          p.id === newExForm.targetPairId
            ? {
                ...p,
                secondary: {
                  ...p.secondary,
                  variantId: createdVariant.id,
                  label: createdVariant.name,
                  targetReps: newExForm.targetReps || '10-12',
                  targetRepsNum: newExForm.targetRepsNum || 10,
                  type: newExForm.category === 'braccia' ? 'braccia' : 'metabolico'
                }
              }
            : p
        )
      }));
      setSuccessBanner(`Esercizio "${createdVariant.name}" inserito come 2° esercizio!`);
    } else {
      setSuccessBanner(`Esercizio "${createdVariant.name}" registrato nel database!`);
    }

    setShowCreateExerciseModal(false);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
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
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Success Banner */}
          {successBanner && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Routine Title and Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Titolo Seduta
              </label>
              <input
                type="text"
                value={editedRoutine.title}
                onChange={e => setEditedRoutine(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Super sets manager header with Quick Add Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Super Serie ({editedRoutine.superSets.length} coppie)
                </span>
              </div>

              {/* Action: Open New Exercise Creator */}
              <button
                type="button"
                onClick={() => {
                  setNewExForm(prev => ({
                    ...prev,
                    name: '',
                    category: 'fondamentale',
                    progressionRule: PROGRESSION_PRESETS[0].rule,
                    suggestedStepKg: 2.5,
                    initialWeightKg: 40,
                    targetSets: 4,
                    targetReps: '5',
                    targetRepsNum: 5,
                    placement: 'new_pair',
                    targetPairId: editedRoutine.superSets[0]?.id
                  }));
                  setFormError(null);
                  setShowCreateExerciseModal(true);
                }}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                title="Aggiungi un esercizio manuale indicando nome, categoria e logica di carico"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crea Esercizio</span>
              </button>
            </div>

            {/* List of Super Set Pairs */}
            <div className="space-y-3">
              {editedRoutine.superSets.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
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

                  {/* Primary Exercise Selector + Quick "+ Crea" button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-emerald-400">
                        1° Esercizio (Fondamentale)
                      </label>
                      <button
                        type="button"
                        onClick={() => openCreateForExistingPair(pair.id, 'primary')}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nuovo</span>
                      </button>
                    </div>
                    <select
                      value={pair.primary.variantId}
                      onChange={e => handlePrimaryVariantChange(pair.id, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {groupedVariants.map(g => (
                        <optgroup key={g.group} label={`${g.meta.icon} ${g.meta.label}`}>
                          {g.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.equipment})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Exercise Selector + Quick "+ Crea" button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-amber-400">
                        2° Esercizio (Metabolico / Braccia)
                      </label>
                      <button
                        type="button"
                        onClick={() => openCreateForExistingPair(pair.id, 'secondary')}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nuovo</span>
                      </button>
                    </div>
                    <select
                      value={pair.secondary.variantId}
                      onChange={e => handleSecondaryVariantChange(pair.id, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      {groupedVariants.map(g => (
                        <optgroup key={g.group} label={`${g.meta.icon} ${g.meta.label}`}>
                          {g.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.equipment})
                            </option>
                          ))}
                        </optgroup>
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

            {/* Bottom Pair Actions */}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleAddNewPair}
                className="flex-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Super Serie</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewExForm(prev => ({
                    ...prev,
                    name: '',
                    category: 'fondamentale',
                    progressionRule: PROGRESSION_PRESETS[0].rule,
                    suggestedStepKg: 2.5,
                    initialWeightKg: 40,
                    targetSets: 4,
                    targetReps: '5',
                    targetRepsNum: 5,
                    placement: 'new_pair'
                  }));
                  setFormError(null);
                  setShowCreateExerciseModal(true);
                }}
                className="flex-1 py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                <span>Crea Nuovo Esercizio</span>
              </button>
            </div>
          </div>

          {/* Metcon configuration */}
          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Configurazione Metcon
              </span>

              {/* Quick Random Generation Button */}
              <button
                type="button"
                onClick={() => {
                  const gen = generateRandomMetcon();
                  const config = toMetconConfig(gen);
                  setEditedRoutine(prev => ({ ...prev, metcon: config }));
                  setSuccessBanner(`Nuovo Metcon generato: ${gen.title}!`);
                  setTimeout(() => setSuccessBanner(null), 3000);
                }}
                className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                title="Genera un metcon casuale da 9 a 15 minuti con 1 cardio e 2/3 funzionali"
              >
                <Dices className="w-3.5 h-3.5 text-orange-400" />
                <span>🎲 Genera (9-15')</span>
              </button>
            </div>

            {editedRoutine.metcon ? (
              <>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Titolo Metcon ({editedRoutine.metcon.type.toUpperCase()})
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

                {/* Movements Preview */}
                {editedRoutine.metcon.movements && editedRoutine.metcon.movements.length > 0 && (
                  <div className="space-y-1 bg-zinc-950/60 p-2 rounded-xl border border-zinc-850">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Movimenti Circuito:</div>
                    {editedRoutine.metcon.movements.map((m, mIdx) => (
                      <div key={mIdx} className="text-[11px] flex items-center justify-between text-zinc-300">
                        <span className="truncate">• {m.name}</span>
                        <span className="text-orange-400 font-mono text-[10px] shrink-0 ml-1">{m.repsOrDist}</span>
                      </div>
                    ))}
                  </div>
                )}

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
              </>
            ) : (
              <div className="text-center py-2 text-xs text-zinc-400">
                <span>Nessun Metcon attivo per questa seduta. Tocca </span>
                <strong className="text-orange-400">"🎲 Genera (9-15')"</strong>
                <span> per crearne uno casuale.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </div>

      {/* MODAL 2: CREA NUOVO ESERCIZIO MANUALE (Nome, Categoria, Logica di Carico) */}
      {showCreateExerciseModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Aggiunta Esercizio
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Crea Nuovo Esercizio Manuale
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExerciseModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateCustomExercise} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-red-500/15 border border-red-500/40 rounded-xl text-xs font-bold text-red-300">
                  {formError}
                </div>
              )}

              {/* 1. Nome Esercizio */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Nome Esercizio <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Leg Press 45°, Affondi camminati, Curl su panca inclinata..."
                  value={newExForm.name}
                  onChange={e => setNewExForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 2. Categoria Esercizio */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Categoria Esercizio <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'fondamentale', label: 'Fondamentale', desc: 'Forza 4-5 rip' },
                    { id: 'metabolico', label: 'Metabolico', desc: 'Ipertrofia 10-12 rip' },
                    { id: 'braccia', label: 'Braccia', desc: 'Isolamento 10-12 rip' },
                    { id: 'accessorio', label: 'Accessorio', desc: 'Complementare' },
                    { id: 'core', label: 'Core / Addome', desc: 'Anti-estensione' },
                    { id: 'funzionale', label: 'Funzionale', desc: 'Metcon / Circuito' },
                    { id: 'cardio', label: 'Cardio', desc: 'Aerobico' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as ExerciseCategory)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        newExForm.category === cat.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-500/40'
                          : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-white capitalize">{cat.label}</div>
                      <div className="text-[9px] text-zinc-400 truncate">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Logica di Carico (Progressione) */}
              <div className="bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Logica di Carico & Progressione <span className="text-white">*</span></span>
                  </label>
                  <span className="text-[10px] text-zinc-400">Come incrementare il peso</span>
                </div>

                {/* Preset Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {PROGRESSION_PRESETS.map(preset => {
                    const isSelected = newExForm.progressionRule === preset.rule && newExForm.suggestedStepKg === preset.stepKg;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Editable Progression Rule text */}
                <div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Descrivi la logica di carico (es. Aggiungi 2,5 kg quando chiudi 4×5 con margine)..."
                    value={newExForm.progressionRule}
                    onChange={e => setNewExForm(prev => ({ ...prev, progressionRule: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                {/* Step in kg */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Incremento suggerito (kg):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 2.5, 5].map(step => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setNewExForm(prev => ({ ...prev, suggestedStepKg: step }))}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                          newExForm.suggestedStepKg === step
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        +{step}kg
                      </button>
                    ))}
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={newExForm.suggestedStepKg}
                      onChange={e => setNewExForm(prev => ({ ...prev, suggestedStepKg: parseFloat(e.target.value) || 0 }))}
                      className="w-14 bg-zinc-900 border border-zinc-700 rounded-lg py-0.5 text-center font-mono text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Gruppo Muscolare & Attrezzatura */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Gruppo Muscolare
                  </label>
                  <select
                    value={newExForm.muscleGroup}
                    onChange={e => setNewExForm(prev => ({ ...prev, muscleGroup: e.target.value as MuscleGroup }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white capitalize"
                  >
                    <option value="gambe">Gambe (Quadricipiti/Femorali)</option>
                    <option value="petto">Petto</option>
                    <option value="dorso">Dorso / Schiena</option>
                    <option value="spalle">Spalle</option>
                    <option value="glutei">Glutei</option>
                    <option value="braccia">Braccia (Bicipiti/Tricipiti)</option>
                    <option value="core">Core / Addome</option>
                    <option value="catena_posteriore">Catena Posteriore</option>
                    <option value="full">Full Body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Attrezzatura
                  </label>
                  <select
                    value={newExForm.equipment}
                    onChange={e => setNewExForm(prev => ({ ...prev, equipment: e.target.value as EquipmentType }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white capitalize"
                  >
                    <option value="bilanciere">Bilanciere</option>
                    <option value="manubri">Manubri</option>
                    <option value="kettlebell">Kettlebell</option>
                    <option value="cavi">Cavi / Puleggia</option>
                    <option value="panca">Macchina / Panca</option>
                    <option value="sbarra">Sbarra trazioni</option>
                    <option value="corpo libero">Corpo libero</option>
                    <option value="box_plyo">Box Plyo</option>
                    <option value="med_ball">Med Ball</option>
                  </select>
                </div>
              </div>

              {/* 5. Carico Iniziale di Partenza (kg) e Ripetizioni */}
              <div className="grid grid-cols-2 gap-2 bg-zinc-950/40 p-2.5 rounded-2xl border border-zinc-800">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Carico Iniziale (kg)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="400"
                      value={newExForm.initialWeightKg}
                      onChange={e => setNewExForm(prev => ({ ...prev, initialWeightKg: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white text-center"
                    />
                    <span className="text-xs text-zinc-400 font-bold">kg</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">
                    Carico di default nella scheda
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Reps Target / Serie
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="es. 5 o 10-12"
                      value={newExForm.targetReps}
                      onChange={e => {
                        const val = e.target.value;
                        const num = parseInt(val) || (newExForm.category === 'fondamentale' ? 5 : 10);
                        setNewExForm(prev => ({ ...prev, targetReps: val, targetRepsNum: num }));
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white text-center"
                    />
                    <span className="text-xs text-zinc-400 font-bold">rip</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">
                    {newExForm.targetSets} serie previste
                  </span>
                </div>
              </div>

              {/* 6. Inserimento nella Scheda */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Dove inserire l'esercizio nella scheda attuale?
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-850 border border-zinc-700/80 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="placement"
                      checked={newExForm.placement === 'new_pair'}
                      onChange={() => setNewExForm(prev => ({ ...prev, placement: 'new_pair' }))}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold">Aggiungi come NUOVA Super Serie</span>
                      <span className="text-[10px] text-zinc-400 block">
                        Crea una nuova coppia (es. Coppia {String.fromCharCode(65 + editedRoutine.superSets.length)})
                      </span>
                    </div>
                  </label>

                  {editedRoutine.superSets.length > 0 && (
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-850 border border-zinc-700/80 cursor-pointer text-xs text-white">
                      <input
                        type="radio"
                        name="placement"
                        checked={newExForm.placement === 'existing_pair_primary' || newExForm.placement === 'existing_pair_secondary'}
                        onChange={() => setNewExForm(prev => ({
                          ...prev,
                          placement: prev.category === 'fondamentale' ? 'existing_pair_primary' : 'existing_pair_secondary',
                          targetPairId: prev.targetPairId || editedRoutine.superSets[0].id
                        }))}
                        className="text-emerald-500 focus:ring-0"
                      />
                      <div className="flex-1">
                        <span className="font-bold">Sostituisci in una Super Serie esistente</span>
                        <div className="flex gap-2 mt-1">
                          <select
                            value={newExForm.targetPairId || editedRoutine.superSets[0]?.id}
                            onChange={e => setNewExForm(prev => ({ ...prev, targetPairId: e.target.value }))}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-white"
                          >
                            {editedRoutine.superSets.map(p => (
                              <option key={p.id} value={p.id}>
                                Coppia {p.code} ({p.title})
                              </option>
                            ))}
                          </select>

                          <select
                            value={newExForm.placement}
                            onChange={e => setNewExForm(prev => ({ ...prev, placement: e.target.value as any }))}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-white"
                          >
                            <option value="existing_pair_primary">1° Esercizio</option>
                            <option value="existing_pair_secondary">2° Esercizio</option>
                          </select>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExerciseModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Crea & Inserisci</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

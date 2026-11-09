import { ExerciseVariant, SetEntry, ExerciseVariantStats } from '../types/workout';

/**
 * Estimates 1-Rep Max using the Epley formula
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round((weightKg * (1 + reps / 30)) * 10) / 10;
}

export interface ProgressionFeedback {
  type: 'increase' | 'maintain' | 'fatigue_warning' | 'custom';
  message: string;
  suggestedWeightChangeKg?: number;
  newSuggestedWeightKg?: number;
  badgeText: string;
}

/**
 * Evaluates completed sets for an exercise against its target and PDF rules
 */
export function evaluateProgression(
  variant: ExerciseVariant,
  completedSets: SetEntry[],
  currentWeightKg: number,
  consecutiveDropCount = 0
): ProgressionFeedback | null {
  if (!completedSets || completedSets.length === 0) return null;

  const validSets = completedSets.filter(s => s.completed);
  if (validSets.length === 0) return null;

  // Check if consecutive fatigue drop occurred
  if (consecutiveDropCount >= 2 && variant.category === 'fondamentale') {
    return {
      type: 'fatigue_warning',
      badgeText: '⚠️ Allerta Affaticamento',
      message: 'Hai registrato un calo di ≥2 ripetizioni per 2 sedute di fila. Come da scheda: salta la seduta braccia e il metcon per recuperare.',
      suggestedWeightChangeKg: 0
    };
  }

  // Fondamentali progression: chiudi tutti i 4x5 puliti -> aggiungi 2.5 kg
  if (variant.category === 'fondamentale') {
    const isSquatOrBench = variant.parentPattern === 'squat' || variant.parentPattern === 'bench';
    const isHipThrust = variant.parentPattern === 'thrust';
    const isPullUp = variant.parentPattern === 'pullup';

    if (isPullUp) {
      const all8Reps = validSets.length >= 4 && validSets.every(s => s.actualReps >= 8);
      if (all8Reps) {
        return {
          type: 'increase',
          badgeText: '🎯 Zavorra Consigliata (+2,5 kg)',
          message: 'Hai chiuso un 4×8 solido a corpo libero! È ora di appendere un peso (+2,5 kg con cintura/disco).',
          suggestedWeightChangeKg: 2.5,
          newSuggestedWeightKg: (currentWeightKg || 0) + 2.5
        };
      }
    }

    const allTargetCompleted = validSets.length >= 4 && validSets.every(s => s.actualReps >= (s.targetReps || 5));
    if (allTargetCompleted) {
      const step = isHipThrust ? 5.0 : 2.5;
      return {
        type: 'increase',
        badgeText: `🔥 Progressione +${step} kg`,
        message: `Hai chiuso tutti i 4×5 puliti con margine! Prossima seduta: carica ${currentWeightKg + step} kg (+${step} kg).`,
        suggestedWeightChangeKg: step,
        newSuggestedWeightKg: currentWeightKg + step
      };
    }
  }

  // Metabolici progression: chiudi 4x12 -> passa al manubrio/kb successivo
  if (variant.category === 'metabolico') {
    const all12Hit = validSets.length >= 4 && validSets.every(s => s.actualReps >= 12);
    if (all12Hit) {
      const step = variant.suggestedStepKg || (variant.equipment === 'kettlebell' ? 4 : 2);
      return {
        type: 'increase',
        badgeText: '💪 Livello Superato',
        message: `Hai chiuso 4×12 completi! Ottimo stimolo metabolico: passa al manubrio/KB successivo (+${step} kg).`,
        suggestedWeightChangeKg: step,
        newSuggestedWeightKg: currentWeightKg + step
      };
    }
  }

  // Braccia progression
  if (variant.category === 'braccia' || variant.category === 'accessorio') {
    const allHit = validSets.length >= 3 && validSets.every(s => s.actualReps >= s.targetReps);
    if (allHit) {
      const step = variant.suggestedStepKg || 1.25;
      return {
        type: 'increase',
        badgeText: `✨ Obiettivo Raggiunto (+${step} kg)`,
        message: `Serie completate con margine. Puoi aumentare di ${step} kg al prossimo allenamento.`,
        suggestedWeightChangeKg: step,
        newSuggestedWeightKg: currentWeightKg + step
      };
    }
  }

  return {
    type: 'maintain',
    badgeText: 'Mantenimento Carico',
    message: 'Continua a consolidare la tecnica e la velocità delle ripetizioni con questo carico prima di salire.',
    suggestedWeightChangeKg: 0,
    newSuggestedWeightKg: currentWeightKg
  };
}

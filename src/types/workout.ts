export type MuscleGroup =
  | 'gambe'
  | 'petto'
  | 'dorso'
  | 'glutei'
  | 'spalle'
  | 'braccia'
  | 'core'
  | 'catena_posteriore'
  | 'full';

export type ExerciseCategory = 'fondamentale' | 'metabolico' | 'braccia' | 'cardio' | 'accessorio' | 'funzionale' | 'core';

export type EquipmentType =
  | 'bilanciere'
  | 'manubri'
  | 'kettlebell'
  | 'sbarra'
  | 'corpo libero'
  | 'vogatore'
  | 'air_bike'
  | 'skierg'
  | 'tapis_roulant'
  | 'cavi'
  | 'panca'
  | 'med_ball'
  | 'box_plyo';

export interface ExerciseVariant {
  id: string;
  name: string;
  parentPattern: string; // e.g. "squat", "bench", "pullup", "thrust", "row", "swing", "lunge", "pushpress", "biceps", "triceps", "shoulders", "core", "cardio", "thruster", "functional"
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  defaultUnit: 'kg' | 'kg_lato' | 'ripetizioni' | 'secondi' | 'metri' | 'calorie';
  progressionRule: string;
  suggestedStepKg?: number; // e.g. 2.5 for fondamentali, 2.0 for dumbbells
  isDefaultInPdf: boolean;
  notes?: string;
}

export interface SetEntry {
  setNumber: number;
  targetWeight: number;
  actualWeight: number;
  targetReps: number;
  actualReps: number;
  completed: boolean;
  rpe?: number;
}

export interface SuperSetPair {
  id: string;
  code: string; // 'A' | 'B' | 'C' | 'D' | '1' | '2' | '3'
  title: string;
  targetRounds: number;
  restBetweenRoundsSec: number; // 90 to 120
  primary: {
    variantId: string;
    label: string;
    targetSets: number;
    targetReps: string; // "5" or "10-12"
    targetRepsNum: number;
    type: 'fondamentale' | 'braccia';
  };
  secondary: {
    variantId: string;
    label: string;
    targetSets: number;
    targetReps: string; // "10-12 per lato" or "10-12"
    targetRepsNum: number;
    type: 'metabolico' | 'braccia';
  };
  notes?: string;
}

export interface MetconMovementItem {
  variantId?: string;
  name: string;
  repsOrDist: string;
  repsNum?: number;
  weightKg?: number;
  caloriesKcal?: number;
  distanceMeters?: number;
  note?: string;
}

export interface MetconConfig {
  id: string;
  title: string; // e.g. "AMRAP 8'", "3 giri a tempo (cap 10')", "4 giri (cap 10')", "EMOM 10'"
  type: 'amrap' | 'for_time' | 'rounds_cap' | 'emom' | 'tabata' | 'free';
  durationSec: number; // 480 for 8', 600 for 10'
  targetRounds?: number;
  timeCapSec?: number;
  movements: MetconMovementItem[];
  instructions: string;
}

export interface CardioConfig {
  title: string;
  equipment: 'vogatore' | 'air_bike' | 'skierg' | 'tapis_roulant';
  durationMin: number;
  distanceMeters?: number;
  caloriesKcal?: number;
  description: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string; // "Full body 1", "Braccia + cardio", etc.
  dayLabel: string; // "Lunedì", "Martedì", etc.
  dayKey: 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
  orderCode: string; // "A - B - C - D", "B - C - D - A", etc.
  subtitle: string; // "Apertura con lo squat"
  description: string;
  isRestDay?: boolean;
  superSets: SuperSetPair[];
  metcon?: MetconConfig;
  cardio?: CardioConfig;
  rulesNotes?: string[];
}

export interface ExerciseLogItem {
  variantId: string;
  variantName: string;
  isFondamentale: boolean;
  sets: SetEntry[];
  notes?: string;
}

export interface MetconResultLog {
  title: string;
  type: 'amrap' | 'for_time' | 'rounds_cap' | 'emom' | 'tabata' | 'free';
  movements: MetconMovementItem[];
  roundsCompleted: number;
  partialReps: number;
  elapsedTimeSec: number;
  sensations: string;
  rpe?: number;
  finishedBeforeCap?: boolean;
  targetRounds?: number;
  timeCapSec?: number;
  emomIntervalSec?: number; // default 60s per exercise minute
}

export interface CardioResultLog {
  equipment: 'vogatore' | 'air_bike' | 'skierg' | 'tapis_roulant';
  durationMin: number;
  distanceMeters?: number;
  caloriesKcal?: number;
  sensations: string;
  avgPace?: string;
}

export interface RestPeriodLog {
  timestamp: number;
  targetSec: number;
  durationSec: number;
  label: string;
}

export interface WorkoutSessionLog {
  id: string;
  routineId: string;
  routineTitle: string;
  dayKey?: 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
  date: string; // ISO date string
  startTime: number; // timestamp
  endTime?: number; // timestamp
  durationSec: number;
  completed: boolean;
  exerciseLogs: ExerciseLogItem[];
  metconLog?: MetconResultLog;
  cardioLog?: CardioResultLog;
  generalNotes?: string;
  fatigueAdjustmentsApplied?: boolean; // e.g. post-pallavolo adjustment
  
  // Real tracked rest time
  totalActualRestSec: number;
  averageRestSec: number;
  restPeriods: RestPeriodLog[];
}

export interface ExerciseVariantStats {
  variantId: string;
  variantName: string;
  maxWeightKg: number;
  lastUsedWeightKg: number;
  lastUsedReps: number;
  lastTrainedDate: string;
  history: {
    date: string;
    sets: { weight: number; reps: number; completed: boolean }[];
    maxWeight: number;
    volumeKg: number;
  }[];
  progressionStreak: number; // sessions closed with target reps
}

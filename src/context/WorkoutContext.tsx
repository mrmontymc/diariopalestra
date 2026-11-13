import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  WorkoutRoutine,
  ExerciseVariant,
  WorkoutSessionLog,
  ExerciseVariantStats,
  SuperSetPair,
  SetEntry,
  MetconConfig,
  MetconResultLog,
  HeartRateSessionData,
  CardioSessionConfig
} from '../types/workout';
import { DEFAULT_WEEKLY_ROUTINES } from '../data/defaultProgram';
import { INITIAL_EXERCISE_VARIANTS } from '../data/defaultVariants';
import { playTimerFinishBeep, playShortBeep, playCountdownWarningBeep } from '../utils/audio';

const STORAGE_KEYS = {
  ROUTINES: 'irontrack_routines_v3',
  VARIANTS: 'irontrack_variants_v2',
  VARIANT_WEIGHTS: 'irontrack_variant_weights_v2',
  SESSION_LOGS: 'irontrack_session_logs_v1',
  ACTIVE_SESSION: 'irontrack_active_session_v2',
  REST_TIMER: 'irontrack_rest_timer_v1',
  VOLLEYBALL_FRIDAY: 'irontrack_volleyball_friday_v1',
  PRS_RESET_AT: 'irontrack_prs_reset_at_v1',
};

// Initial default weights for common exercises to provide a great out-of-the-box experience
const INITIAL_VARIANT_WEIGHTS: Record<string, ExerciseVariantStats> = {
  back_squat: {
    variantId: 'back_squat',
    variantName: 'Back squat',
    maxWeightKg: 80,
    lastUsedWeightKg: 80,
    lastUsedReps: 5,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 80, reps: 5, completed: true },
          { weight: 80, reps: 5, completed: true },
          { weight: 80, reps: 5, completed: true },
          { weight: 80, reps: 5, completed: true }
        ],
        maxWeight: 80,
        volumeKg: 1600
      }
    ]
  },
  panca_piana: {
    variantId: 'panca_piana',
    variantName: 'Panca piana bilanciere',
    maxWeightKg: 70,
    lastUsedWeightKg: 70,
    lastUsedReps: 5,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 70, reps: 5, completed: true },
          { weight: 70, reps: 5, completed: true },
          { weight: 70, reps: 5, completed: true },
          { weight: 70, reps: 5, completed: true }
        ],
        maxWeight: 70,
        volumeKg: 1400
      }
    ]
  },
  rematore_panca_tbar: {
    variantId: 'rematore_panca_tbar',
    variantName: 'Rematore (petto poggiato o T-bar)',
    maxWeightKg: 55,
    lastUsedWeightKg: 55,
    lastUsedReps: 8,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 55, reps: 8, completed: true },
          { weight: 55, reps: 8, completed: true },
          { weight: 55, reps: 8, completed: true },
          { weight: 55, reps: 8, completed: true }
        ],
        maxWeight: 55,
        volumeKg: 1760
      }
    ]
  },
  military_press: {
    variantId: 'military_press',
    variantName: 'Military press',
    maxWeightKg: 45,
    lastUsedWeightKg: 45,
    lastUsedReps: 5,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 45, reps: 5, completed: true },
          { weight: 45, reps: 5, completed: true },
          { weight: 45, reps: 5, completed: true },
          { weight: 45, reps: 5, completed: true }
        ],
        maxWeight: 45,
        volumeKg: 900
      }
    ]
  },
  trazioni_sbarra: {
    variantId: 'trazioni_sbarra',
    variantName: 'Trazioni alla sbarra',
    maxWeightKg: 0,
    lastUsedWeightKg: 0,
    lastUsedReps: 5,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 0, reps: 5, completed: true },
          { weight: 0, reps: 5, completed: true },
          { weight: 0, reps: 5, completed: true },
          { weight: 0, reps: 5, completed: true }
        ],
        maxWeight: 0,
        volumeKg: 0
      }
    ]
  },
  hip_thrust: {
    variantId: 'hip_thrust',
    variantName: 'Hip thrust',
    maxWeightKg: 95,
    lastUsedWeightKg: 95,
    lastUsedReps: 7,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: [
      {
        date: '2026-11-02',
        sets: [
          { weight: 95, reps: 7, completed: true },
          { weight: 95, reps: 7, completed: true },
          { weight: 95, reps: 7, completed: true },
          { weight: 95, reps: 7, completed: true }
        ],
        maxWeight: 95,
        volumeKg: 2660
      }
    ]
  },
  stacco_manubri: {
    variantId: 'stacco_manubri',
    variantName: 'Stacco con manubri',
    maxWeightKg: 22,
    lastUsedWeightKg: 22,
    lastUsedReps: 9,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  push_press_manubri: {
    variantId: 'push_press_manubri',
    variantName: 'Push press con manubri',
    maxWeightKg: 16,
    lastUsedWeightKg: 16,
    lastUsedReps: 10,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  push_up: {
    variantId: 'push_up',
    variantName: 'Push-up',
    maxWeightKg: 0,
    lastUsedWeightKg: 0,
    lastUsedReps: 12,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  goblet_squat_pausa: {
    variantId: 'goblet_squat_pausa',
    variantName: 'Goblet squat con pausa',
    maxWeightKg: 20,
    lastUsedWeightKg: 20,
    lastUsedReps: 10,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  farmer_walk: {
    variantId: 'farmer_walk',
    variantName: 'Farmer walk (manubri o kettlebell)',
    maxWeightKg: 24,
    lastUsedWeightKg: 24,
    lastUsedReps: 40,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  kb_swing: {
    variantId: 'kb_swing',
    variantName: 'KB swing',
    maxWeightKg: 20,
    lastUsedWeightKg: 20,
    lastUsedReps: 12,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  affondi_indietro_manubri: {
    variantId: 'affondi_indietro_manubri',
    variantName: 'Affondi indietro con manubri',
    maxWeightKg: 16,
    lastUsedWeightKg: 16,
    lastUsedReps: 10,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  calf_raise_manubri: {
    variantId: 'calf_raise_manubri',
    variantName: 'Calf raise con manubri',
    maxWeightKg: 16,
    lastUsedWeightKg: 16,
    lastUsedReps: 15,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  air_squat_fermo: {
    variantId: 'air_squat_fermo',
    variantName: 'Air squat con fermo in buca',
    maxWeightKg: 0,
    lastUsedWeightKg: 0,
    lastUsedReps: 15,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  },
  rematore_manubri_petto: {
    variantId: 'rematore_manubri_petto',
    variantName: 'Rematore con manubri, petto poggiato',
    maxWeightKg: 16,
    lastUsedWeightKg: 16,
    lastUsedReps: 15,
    lastTrainedDate: '2026-11-02',
    progressionStreak: 1,
    history: []
  }
};

interface RestTimerState {
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  label: string;
}

interface WorkoutContextType {
  routines: WorkoutRoutine[];
  variants: ExerciseVariant[];
  variantWeights: Record<string, ExerciseVariantStats>;
  sessionLogs: WorkoutSessionLog[];
  activeSession: WorkoutSessionLog | null;
  restTimer: RestTimerState;
  playedVolleyballFriday: boolean;
  
  // Routine actions
  updateRoutine: (updated: WorkoutRoutine) => void;
  resetRoutinesToDefault: () => void;
  swapExerciseInRoutine: (routineId: string, pairId: string, role: 'primary' | 'secondary', newVariantId: string) => void;
  
  // Variant actions
  addVariant: (newVariant: Omit<ExerciseVariant, 'id'>, initialWeightKg?: number) => ExerciseVariant;
  updateVariant: (variant: ExerciseVariant) => void;
  getVariantById: (id: string) => ExerciseVariant | undefined;
  getVariantsForPattern: (pattern: string) => ExerciseVariant[];
  
  // Weight & History Tracking
  getWeightStatsForVariant: (variantId: string) => ExerciseVariantStats | undefined;
  getLastRecordedWeightForVariant: (variantId: string, variantName?: string) => number;
  recordExerciseSetWeight: (variantId: string, weightKg: number, reps: number, dateIso?: string, explicitVariantName?: string) => void;
  resetAllPRs: () => void;
  
  // Session actions
  startWorkout: (routineId: string) => void;
  startMetconWorkout: (metcon: MetconResultLog, title?: string) => void;
  startCardioWorkout: (config: CardioSessionConfig) => void;
  applyMetconToRoutine: (routineId: string, metcon: MetconConfig) => void;
  updateActiveSession: (updater: (prev: WorkoutSessionLog) => WorkoutSessionLog) => void;
  finishWorkout: (heartRateData?: HeartRateSessionData, sessionOverrides?: Partial<WorkoutSessionLog>) => void;
  discardActiveWorkout: () => void;
  deleteSessionLog: (id: string) => void;
  
  // Rest Timer & Real Rest Tracking
  startRestTimer: (seconds: number, label?: string) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  addTimeRestTimer: (extraSeconds: number) => void;
  stopRestTimer: () => void;
  recordActualRestPeriod: (durationSec: number, targetSec: number, label: string) => void;

  // Volleyball toggle for Saturday fatigue management
  setPlayedVolleyballFriday: (played: boolean) => void;

  // Export / Import
  exportUserData: () => string;
  importUserData: (jsonData: string) => boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Routines state
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load routines:', e);
    }
    return DEFAULT_WEEKLY_ROUTINES;
  });

  // 2. Exercise Variants state
  const [variants, setVariants] = useState<ExerciseVariant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VARIANTS);
      if (stored) {
        const parsed: ExerciseVariant[] = JSON.parse(stored);
        const existingIds = new Set(parsed.map(v => v.id));
        const missingDefaults = INITIAL_EXERCISE_VARIANTS.filter(v => !existingIds.has(v.id));
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          localStorage.setItem(STORAGE_KEYS.VARIANTS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load variants:', e);
    }
    return INITIAL_EXERCISE_VARIANTS;
  });

  // 3. Variant weight tracking state
  const [variantWeights, setVariantWeights] = useState<Record<string, ExerciseVariantStats>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VARIANT_WEIGHTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load variant weights:', e);
    }
    return INITIAL_VARIANT_WEIGHTS;
  });

  // 4. Session Logs
  const [sessionLogs, setSessionLogs] = useState<WorkoutSessionLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load session logs:', e);
    }
    return [];
  });

  // 5. Active Session (persisted so gym workout isn't lost on mobile refresh)
  const [activeSession, setActiveSession] = useState<WorkoutSessionLog | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load active session:', e);
    }
    return null;
  });

  // 6. Rest Timer
  const [restTimer, setRestTimer] = useState<RestTimerState>(() => {
    return {
      totalSeconds: 90,
      secondsRemaining: 0,
      isRunning: false,
      label: 'Recupero Super Serie'
    };
  });

  // 7. Volleyball toggle
  const [playedVolleyballFriday, setPlayedVolleyballFridayState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOLLEYBALL_FRIDAY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const setPlayedVolleyballFriday = (played: boolean) => {
    setPlayedVolleyballFridayState(played);
    localStorage.setItem(STORAGE_KEYS.VOLLEYBALL_FRIDAY, JSON.stringify(played));
  };

  // 8. PRs reset timestamp
  const [prsResetAt, setPrsResetAt] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRS_RESET_AT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VARIANTS, JSON.stringify(variants));
  }, [variants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VARIANT_WEIGHTS, JSON.stringify(variantWeights));
  }, [variantWeights]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  }, [activeSession]);

  // Reference to track rest period start time and target
  const currentRestRef = React.useRef<{ startTime: number; targetSec: number; label: string } | null>(null);

  // Rest Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (restTimer.isRunning && restTimer.secondsRemaining > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev.secondsRemaining <= 1) {
            playTimerFinishBeep();
            return { ...prev, secondsRemaining: 0, isRunning: false };
          }
          if (prev.secondsRemaining <= 4 && prev.secondsRemaining >= 2) {
            playCountdownWarningBeep();
          }
          return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimer.isRunning, restTimer.secondsRemaining]);

  // When timer completes cleanly, record the rest period in a separate effect
  useEffect(() => {
    if (restTimer.secondsRemaining === 0 && currentRestRef.current) {
      const rest = currentRestRef.current;
      currentRestRef.current = null;
      recordActualRestPeriod(rest.targetSec, rest.targetSec, rest.label);
    }
  }, [restTimer.secondsRemaining]);

  const recordActualRestPeriod = (durationSec: number, targetSec: number, label: string) => {
    if (durationSec <= 0) return;
    setActiveSession(prev => {
      if (!prev) return null;
      const newPeriod = {
        timestamp: Date.now(),
        targetSec,
        durationSec,
        label
      };
      const periods = [...(prev.restPeriods || []), newPeriod];
      const totalRest = (prev.totalActualRestSec || 0) + durationSec;
      const avgRest = periods.length > 0 ? Math.round(totalRest / periods.length) : 0;
      return {
        ...prev,
        totalActualRestSec: totalRest,
        restPeriods: periods,
        averageRestSec: avgRest
      };
    });
  };

  const startRestTimer = (seconds: number, label = 'Recupero') => {
    playShortBeep(700, 0.08);
    currentRestRef.current = {
      startTime: Date.now(),
      targetSec: seconds,
      label
    };
    setRestTimer({
      totalSeconds: seconds,
      secondsRemaining: seconds,
      isRunning: true,
      label
    });
  };

  const pauseRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resumeRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isRunning: true }));
  };

  const addTimeRestTimer = (extraSeconds: number) => {
    if (currentRestRef.current) {
      currentRestRef.current.targetSec = Math.max(5, currentRestRef.current.targetSec + extraSeconds);
    }
    setRestTimer(prev => {
      const nextRemaining = Math.max(0, prev.secondsRemaining + extraSeconds);
      if (nextRemaining === 0 && prev.secondsRemaining > 0) {
        playTimerFinishBeep();
      }
      return {
        ...prev,
        totalSeconds: Math.max(nextRemaining, prev.totalSeconds + (extraSeconds > 0 ? extraSeconds : 0)),
        secondsRemaining: nextRemaining,
        isRunning: nextRemaining > 0
      };
    });
  };

  const stopRestTimer = () => {
    if (currentRestRef.current && restTimer.isRunning) {
      const actualElapsed = Math.max(0, restTimer.totalSeconds - restTimer.secondsRemaining);
      if (actualElapsed > 3) {
        recordActualRestPeriod(actualElapsed, currentRestRef.current.targetSec, `${currentRestRef.current.label} (interrotto)`);
      }
      currentRestRef.current = null;
    }
    setRestTimer(prev => ({ ...prev, secondsRemaining: 0, isRunning: false }));
  };

  // Routine management
  const updateRoutine = (updated: WorkoutRoutine) => {
    setRoutines(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  const resetRoutinesToDefault = () => {
    setRoutines(DEFAULT_WEEKLY_ROUTINES);
  };

  const swapExerciseInRoutine = (
    routineId: string,
    pairId: string,
    role: 'primary' | 'secondary',
    newVariantId: string
  ) => {
    const newVariant = variants.find(v => v.id === newVariantId);
    if (!newVariant) return;

    setRoutines(prevRoutines =>
      prevRoutines.map(r => {
        if (r.id !== routineId) return r;
        const updatedPairs = r.superSets.map(pair => {
          if (pair.id !== pairId) return pair;
          if (role === 'primary') {
            return {
              ...pair,
              primary: {
                ...pair.primary,
                variantId: newVariant.id,
                label: newVariant.name
              }
            };
          } else {
            return {
              ...pair,
              secondary: {
                ...pair.secondary,
                variantId: newVariant.id,
                label: newVariant.name
              }
            };
          }
        });
        return { ...r, superSets: updatedPairs };
      })
    );
  };

  // Variant management
  const addVariant = (newVariantData: Omit<ExerciseVariant, 'id'>, initialWeightKg?: number): ExerciseVariant => {
    const id = `custom_${Date.now()}_${newVariantData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const fullVariant: ExerciseVariant = {
      ...newVariantData,
      id
    };
    setVariants(prev => [...prev, fullVariant]);
    if (initialWeightKg !== undefined && initialWeightKg > 0) {
      recordExerciseSetWeight(id, initialWeightKg, 5, new Date().toISOString(), fullVariant.name);
    }
    return fullVariant;
  };

  const updateVariant = (updated: ExerciseVariant) => {
    setVariants(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const getVariantById = (id: string) => {
    return variants.find(v => v.id === id);
  };

  const getVariantsForPattern = (pattern: string) => {
    return variants.filter(v => v.parentPattern === pattern);
  };

  const getWeightStatsForVariant = (variantId: string) => {
    return variantWeights[variantId];
  };

  const recordExerciseSetWeight = (
    variantId: string,
    weightKg: number,
    reps: number,
    dateIso = new Date().toISOString(),
    explicitVariantName?: string
  ) => {
    const variant = variants.find(v => v.id === variantId);
    const variantName = explicitVariantName || (variant ? variant.name : variantId);

    setVariantWeights(prev => {
      const existing = prev[variantId] || {
        variantId,
        variantName,
        maxWeightKg: 0,
        lastUsedWeightKg: 0,
        lastUsedReps: 0,
        lastTrainedDate: dateIso,
        progressionStreak: 0,
        history: []
      };

      const newMax = Math.max(existing.maxWeightKg, weightKg);
      const isTargetHit = reps >= 5;

      return {
        ...prev,
        [variantId]: {
          ...existing,
          variantName,
          lastUsedWeightKg: weightKg,
          lastUsedReps: reps,
          lastTrainedDate: dateIso,
          maxWeightKg: newMax,
          progressionStreak: isTargetHit ? existing.progressionStreak + 1 : existing.progressionStreak,
          history: [
            {
              date: dateIso,
              sets: [{ weight: weightKg, reps, completed: true }],
              maxWeight: weightKg,
              volumeKg: weightKg * reps
            },
            ...existing.history.slice(0, 30) // keep last 30 entries
          ]
        }
      };
    });
  };

  // Reset all PRs, max loads and progression streaks to zero
  const resetAllPRs = () => {
    const timestamp = Date.now();
    setPrsResetAt(timestamp);
    localStorage.setItem(STORAGE_KEYS.PRS_RESET_AT, JSON.stringify(timestamp));

    const resetMap: Record<string, ExerciseVariantStats> = {};
    variants.forEach(v => {
      resetMap[v.id] = {
        variantId: v.id,
        variantName: v.name,
        maxWeightKg: 0,
        lastUsedWeightKg: 0,
        lastUsedReps: 0,
        lastTrainedDate: new Date().toISOString().slice(0, 10),
        progressionStreak: 0,
        history: []
      };
    });
    setVariantWeights(resetMap);
    localStorage.setItem(STORAGE_KEYS.VARIANT_WEIGHTS, JSON.stringify(resetMap));
  };

  // Robust lookup: Default exercise weight MUST start from the last recorded weight
  const getLastRecordedWeightForVariant = (variantId: string, variantName?: string): number => {
    // 1. Direct match in variantWeights
    if (variantWeights[variantId] && variantWeights[variantId].lastUsedWeightKg !== undefined && variantWeights[variantId].lastUsedWeightKg > 0) {
      return variantWeights[variantId].lastUsedWeightKg;
    }

    // 2. Name-based match in variantWeights (case-insensitive and trimmed)
    if (variantName) {
      const normName = variantName.toLowerCase().trim();
      const match = Object.values(variantWeights).find(
        s => s.variantName.toLowerCase().trim() === normName && s.lastUsedWeightKg > 0
      );
      if (match) return match.lastUsedWeightKg;
    }

    // 3. Search backwards through all sessionLogs (chronologically most recent, after any PR reset)
    for (const session of sessionLogs) {
      if (!session.exerciseLogs) continue;
      const sTime = session.startTime || new Date(session.date).getTime();
      if (prsResetAt && sTime < prsResetAt) continue;

      for (const ex of session.exerciseLogs) {
        const isIdMatch = ex.variantId === variantId;
        const isNameMatch = variantName && ex.variantName.toLowerCase().trim() === variantName.toLowerCase().trim();
        if (isIdMatch || isNameMatch) {
          // Completed sets with positive weight
          const completedWithWeight = ex.sets.filter(s => s.completed && (s.actualWeight || 0) > 0);
          if (completedWithWeight.length > 0) {
            return completedWithWeight[completedWithWeight.length - 1].actualWeight;
          }
          // Any set with positive actualWeight
          const anySetWithWeight = ex.sets.slice().reverse().find(s => (s.actualWeight || 0) > 0);
          if (anySetWithWeight) {
            return anySetWithWeight.actualWeight;
          }
        }
      }
    }

    // 4. Default fallback: if PRs were explicitly reset to zero, return 0 (or empty barbell 20kg if barbell)
    const variant = variants.find(
      v => v.id === variantId || (variantName && v.name.toLowerCase().trim() === variantName.toLowerCase().trim())
    );
    if (prsResetAt) {
      return variant?.equipment === 'bilanciere' ? 20 : 0;
    }

    if (variant) {
      if (variant.category === 'fondamentale') {
        return variant.suggestedStepKg ? variant.suggestedStepKg * 20 : 50;
      }
      if (variant.category === 'braccia' || variant.equipment === 'manubri') {
        return 12;
      }
      if (variant.category === 'core') {
        return variant.equipment === 'cavi' ? 15 : 0;
      }
      return variant.suggestedStepKg ? variant.suggestedStepKg * 4 : 16;
    }

    return 20;
  };

  // Start workout from a routine
  const startWorkout = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    // Check if Friday volleyball is true and this is Saturday routine (Full body 3)
    const isSaturdayVolleyballReduction = routine.dayKey === 'sab' && playedVolleyballFriday;

    // Construct fresh exercise logs
    const exerciseLogs = routine.superSets.flatMap(pair => {
      const pVariant = variants.find(v => v.id === pair.primary.variantId);
      const sVariant = variants.find(v => v.id === pair.secondary.variantId);

      // Default load starts strictly from the last recorded weight!
      let pTargetWeight = getLastRecordedWeightForVariant(pair.primary.variantId, pair.primary.label);
      let sTargetWeight = getLastRecordedWeightForVariant(pair.secondary.variantId, pair.secondary.label);

      // Apply volleyball Saturday reduction if enabled (from PDF: carichi più leggeri su hip thrust e goblet squat -20-25%)
      let pRounds = pair.targetRounds;
      if (isSaturdayVolleyballReduction) {
        if (pair.primary.variantId === 'hip_thrust' || pair.code === 'B1') {
          pTargetWeight = Math.round((pTargetWeight * 0.75) * 2) / 2;
        }
        if (pair.secondary.variantId === 'goblet_squat_pausa' || pair.code === 'B2') {
          sTargetWeight = Math.round((sTargetWeight * 0.75) * 2) / 2;
        }
      }

      // Generate sets
      const primarySets: SetEntry[] = Array.from({ length: pRounds }, (_, i) => ({
        setNumber: i + 1,
        targetWeight: pTargetWeight,
        actualWeight: pTargetWeight,
        targetReps: pair.primary.targetRepsNum,
        actualReps: pair.primary.targetRepsNum,
        completed: false
      }));

      const secondarySets: SetEntry[] = Array.from({ length: pRounds }, (_, i) => ({
        setNumber: i + 1,
        targetWeight: sTargetWeight,
        actualWeight: sTargetWeight,
        targetReps: pair.secondary.targetRepsNum,
        actualReps: pair.secondary.targetRepsNum,
        completed: false
      }));

      return [
        {
          variantId: pair.primary.variantId,
          variantName: pair.primary.label,
          isFondamentale: pair.primary.type === 'fondamentale',
          sets: primarySets
        },
        {
          variantId: pair.secondary.variantId,
          variantName: pair.secondary.label,
          isFondamentale: false,
          sets: secondarySets
        }
      ];
    });

    const newSession: WorkoutSessionLog = {
      id: `session_${Date.now()}`,
      routineId: routine.id,
      routineTitle: `${routine.dayLabel} - ${routine.title}`,
      dayKey: routine.dayKey,
      date: new Date().toISOString(),
      startTime: Date.now(),
      durationSec: 0,
      completed: false,
      exerciseLogs,
      fatigueAdjustmentsApplied: isSaturdayVolleyballReduction,
      totalActualRestSec: 0,
      averageRestSec: 0,
      restPeriods: [],
      metconLog: routine.metcon
        ? {
            title: routine.metcon.title,
            type: routine.metcon.type || 'amrap',
            movements: routine.metcon.movements || [],
            roundsCompleted: 0,
            partialReps: 0,
            elapsedTimeSec: 0,
            sensations: routine.metcon.instructions || '',
            finishedBeforeCap: false,
            timeCapSec: routine.metcon.timeCapSec || routine.metcon.durationSec,
            targetRounds: routine.metcon.targetRounds
          }
        : undefined,
      cardioLog: routine.cardio
        ? {
            equipment: routine.cardio.equipment || 'vogatore',
            durationMin: routine.cardio.durationMin,
            distanceMeters: routine.cardio.distanceMeters || 0,
            caloriesKcal: routine.cardio.caloriesKcal || 0,
            sensations: ''
          }
        : undefined
    };

    setActiveSession(newSession);
  };

  const startMetconWorkout = (metcon: MetconResultLog, sessionTitle?: string) => {
    const newSession: WorkoutSessionLog = {
      id: `session_${Date.now()}`,
      routineId: 'metcon_standalone',
      routineTitle: sessionTitle || `Metcon - ${metcon.title}`,
      date: new Date().toISOString(),
      startTime: Date.now(),
      durationSec: 0,
      completed: false,
      exerciseLogs: [],
      totalActualRestSec: 0,
      averageRestSec: 0,
      restPeriods: [],
      metconLog: metcon
    };
    setActiveSession(newSession);
  };

  const startCardioWorkout = (config: CardioSessionConfig) => {
    const durationEst = config.mode === 'steady'
      ? (config.targetDurationMin || 20)
      : Math.round(((config.intervals?.rounds || 8) * ((config.intervals?.workSec || 20) + (config.intervals?.restSec || 10))) / 60);

    const newSession: WorkoutSessionLog = {
      id: `session_${Date.now()}`,
      routineId: 'cardio_standalone',
      routineTitle: `Cardio: ${config.activityLabel}`,
      date: new Date().toISOString(),
      startTime: Date.now(),
      durationSec: 0,
      completed: false,
      exerciseLogs: [],
      totalActualRestSec: 0,
      averageRestSec: 0,
      restPeriods: [],
      cardioSessionConfig: config,
      cardioLog: {
        equipment: config.activity,
        durationMin: durationEst,
        caloriesKcal: config.targetCalories || 0,
        sensations: '',
        mode: config.mode,
        intervalsCompleted: 0,
        totalIntervals: config.mode === 'intervals' ? config.intervals?.rounds : undefined
      }
    };
    setActiveSession(newSession);
  };

  const applyMetconToRoutine = (routineId: string, metconConfig: MetconConfig) => {
    setRoutines(prev =>
      prev.map(r => (r.id === routineId ? { ...r, metcon: metconConfig } : r))
    );
  };

  const updateActiveSession = (updater: (prev: WorkoutSessionLog) => WorkoutSessionLog) => {
    setActiveSession(prev => (prev ? updater(prev) : null));
  };

  const finishWorkout = (
    heartRateData?: HeartRateSessionData,
    sessionOverrides?: Partial<WorkoutSessionLog>
  ) => {
    if (!activeSession) return;

    const now = Date.now();
    const duration = Math.round((now - activeSession.startTime) / 1000);
    const finalAvgRest = (activeSession.restPeriods && activeSession.restPeriods.length > 0)
      ? Math.round((activeSession.totalActualRestSec || 0) / activeSession.restPeriods.length)
      : (activeSession.totalActualRestSec || 0);

    const completedSession: WorkoutSessionLog = {
      ...activeSession,
      ...sessionOverrides,
      endTime: now,
      durationSec: sessionOverrides?.durationSec ?? duration,
      completed: true,
      totalActualRestSec: activeSession.totalActualRestSec || 0,
      averageRestSec: finalAvgRest,
      restPeriods: activeSession.restPeriods || [],
      heartRateData: heartRateData || sessionOverrides?.heartRateData || activeSession.heartRateData
    };

    // Update weights tracking for each completed exercise
    const updatedWeights = { ...variantWeights };

    completedSession.exerciseLogs.forEach(log => {
      const completedSets = log.sets.filter(s => s.completed);
      if (completedSets.length > 0) {
        const maxSetWeight = Math.max(...completedSets.map(s => s.actualWeight || 0));
        const lastSet = completedSets[completedSets.length - 1];
        const existing = updatedWeights[log.variantId] || {
          variantId: log.variantId,
          variantName: log.variantName,
          maxWeightKg: 0,
          lastUsedWeightKg: 0,
          lastUsedReps: 0,
          lastTrainedDate: completedSession.date,
          progressionStreak: 0,
          history: []
        };

        const totalVol = completedSets.reduce((sum, s) => sum + (s.actualWeight || 0) * (s.actualReps || 0), 0);

        updatedWeights[log.variantId] = {
          ...existing,
          variantName: log.variantName,
          lastUsedWeightKg: lastSet.actualWeight,
          lastUsedReps: lastSet.actualReps,
          lastTrainedDate: completedSession.date,
          maxWeightKg: Math.max(existing.maxWeightKg, maxSetWeight),
          progressionStreak: existing.progressionStreak + 1,
          history: [
            {
              date: completedSession.date,
              sets: completedSets.map(s => ({
                weight: s.actualWeight,
                reps: s.actualReps,
                completed: true
              })),
              maxWeight: maxSetWeight,
              volumeKg: totalVol
            },
            ...existing.history.slice(0, 30)
          ]
        };
      }
    });

    setVariantWeights(updatedWeights);
    setSessionLogs(prev => [completedSession, ...prev]);
    setActiveSession(null);
    stopRestTimer();
  };

  const discardActiveWorkout = () => {
    setActiveSession(null);
    stopRestTimer();
  };

  const deleteSessionLog = (id: string) => {
    setSessionLogs(prev => prev.filter(s => s.id !== id));
  };

  const exportUserData = (): string => {
    const data = {
      routines,
      variants,
      variantWeights,
      sessionLogs,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importUserData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.routines) setRoutines(parsed.routines);
      if (parsed.variants) setVariants(parsed.variants);
      if (parsed.variantWeights) setVariantWeights(parsed.variantWeights);
      if (parsed.sessionLogs) setSessionLogs(parsed.sessionLogs);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        routines,
        variants,
        variantWeights,
        sessionLogs,
        activeSession,
        restTimer,
        playedVolleyballFriday,
        updateRoutine,
        resetRoutinesToDefault,
        swapExerciseInRoutine,
        addVariant,
        updateVariant,
        getVariantById,
        getVariantsForPattern,
        getWeightStatsForVariant,
        getLastRecordedWeightForVariant,
        recordExerciseSetWeight,
        resetAllPRs,
        startWorkout,
        startMetconWorkout,
        startCardioWorkout,
        applyMetconToRoutine,
        updateActiveSession,
        finishWorkout,
        discardActiveWorkout,
        deleteSessionLog,
        startRestTimer,
        pauseRestTimer,
        resumeRestTimer,
        addTimeRestTimer,
        stopRestTimer,
        recordActualRestPeriod,
        setPlayedVolleyballFriday,
        exportUserData,
        importUserData
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

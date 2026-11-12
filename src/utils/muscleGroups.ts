import { MuscleGroup, ExerciseVariant } from '../types/workout';

export interface MuscleGroupMeta {
  key: MuscleGroup;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const MUSCLE_GROUPS: Record<MuscleGroup, MuscleGroupMeta> = {
  gambe: {
    key: 'gambe',
    label: 'Gambe & Quadricipiti',
    shortLabel: 'Gambe',
    icon: '🦵',
    description: 'Squat, pressa, affondi e quadricipiti'
  },
  petto: {
    key: 'petto',
    label: 'Petto & Pettorali',
    shortLabel: 'Petto',
    icon: '🎯',
    description: 'Panca piana, inclinata, dip e croci'
  },
  dorso: {
    key: 'dorso',
    label: 'Dorso & Dorsali',
    shortLabel: 'Dorso',
    icon: '🦅',
    description: 'Trazioni, rematore, lat machine e pulley'
  },
  spalle: {
    key: 'spalle',
    label: 'Spalle & Deltoidi',
    shortLabel: 'Spalle',
    icon: '🛡️',
    description: 'Military press, alzate laterali e posteriori'
  },
  braccia: {
    key: 'braccia',
    label: 'Braccia (Bicipiti & Tricipiti)',
    shortLabel: 'Braccia',
    icon: '💪',
    description: 'Curl con bilanciere/manubri, push down, french press'
  },
  glutei: {
    key: 'glutei',
    label: 'Glutei',
    shortLabel: 'Glutei',
    icon: '🍑',
    description: 'Hip thrust, ponti glutei, kickback'
  },
  catena_posteriore: {
    key: 'catena_posteriore',
    label: 'Catena Posteriore & Femorali',
    shortLabel: 'Catena Post.',
    icon: '⚡',
    description: 'Stacchi da terra, stacco rumeno, kettlebell swing'
  },
  core: {
    key: 'core',
    label: 'Addome & Core',
    shortLabel: 'Core',
    icon: '🧱',
    description: 'Plank, hollow body, russian twist, roll-out'
  },
  full: {
    key: 'full',
    label: 'Full Body & Funzionale',
    shortLabel: 'Full Body',
    icon: '🔥',
    description: 'Thruster, burpees, complessi e multiarticolari'
  }
};

export const ORDERED_MUSCLE_GROUPS: MuscleGroup[] = [
  'gambe',
  'petto',
  'dorso',
  'spalle',
  'braccia',
  'glutei',
  'catena_posteriore',
  'core',
  'full'
];

export interface GroupedVariants {
  group: MuscleGroup;
  meta: MuscleGroupMeta;
  variants: ExerciseVariant[];
}

/**
 * Groups and sorts variants by muscle group in canonical order, with variants alphabetically sorted.
 */
export function groupVariantsByMuscleGroup(variants: ExerciseVariant[]): GroupedVariants[] {
  const map = new Map<MuscleGroup, ExerciseVariant[]>();

  ORDERED_MUSCLE_GROUPS.forEach(g => {
    map.set(g, []);
  });

  variants.forEach(v => {
    const groupKey = v.muscleGroup || 'full';
    const list = map.get(groupKey) || [];
    list.push(v);
    map.set(groupKey, list);
  });

  const result: GroupedVariants[] = [];
  ORDERED_MUSCLE_GROUPS.forEach(g => {
    const list = map.get(g) || [];
    if (list.length > 0) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
      result.push({
        group: g,
        meta: MUSCLE_GROUPS[g],
        variants: list
      });
    }
  });

  return result;
}

/**
 * Returns a flat array of variants sorted by muscle group order, then by name.
 */
export function sortVariantsByMuscleGroup(variants: ExerciseVariant[]): ExerciseVariant[] {
  return groupVariantsByMuscleGroup(variants).flatMap(g => g.variants);
}

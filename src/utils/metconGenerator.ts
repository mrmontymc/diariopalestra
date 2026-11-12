import { MetconMovementItem, MetconResultLog, MetconConfig } from '../types/workout';

export interface GeneratedMetcon {
  id: string;
  title: string;
  type: 'amrap' | 'for_time' | 'emom';
  durationMin: number;
  timeCapSec: number;
  targetRounds?: number;
  emomIntervalSec?: number;
  cardioMovement: MetconMovementItem;
  functionalMovements: MetconMovementItem[];
  allMovements: MetconMovementItem[];
  instructions: string;
}

interface GeneratorOptions {
  durationMin?: number; // 9 to 15, default random
  functionalCount?: 2 | 3; // 2 or 3, default random
  preferredType?: 'amrap' | 'for_time' | 'emom' | 'random';
  intensity?: 'moderate' | 'high' | 'beast';
}

// 1. CARDIO POOL (Always 1, with calorie target)
interface CardioTemplate {
  variantId: string;
  name: string;
  baseCalories: { [duration: number]: number }; // calories mapped to duration
  equipment: 'air_bike' | 'vogatore' | 'skierg' | 'tapis_roulant';
  note: string;
}

const CARDIO_TEMPLATES: CardioTemplate[] = [
  {
    variantId: 'air_bike',
    name: 'Air bike (Echo / Assault Bike)',
    baseCalories: { 9: 10, 10: 12, 11: 12, 12: 15, 13: 15, 14: 18, 15: 20 },
    equipment: 'air_bike',
    note: 'Ritmo costante, spinta sincrona braccia e gambe'
  },
  {
    variantId: 'vogatore_metcon',
    name: 'Vogatore Concept2 (RowErg)',
    baseCalories: { 9: 12, 10: 14, 11: 15, 12: 16, 13: 18, 14: 20, 15: 22 },
    equipment: 'vogatore',
    note: 'Passo split controllato, forte spinta con i talloni'
  },
  {
    variantId: 'skierg',
    name: 'SkiErg Concept2',
    baseCalories: { 9: 10, 10: 12, 11: 12, 12: 14, 13: 15, 14: 16, 15: 18 },
    equipment: 'skierg',
    note: 'Flessione del busto con addome contratto, trazione energica'
  },
  {
    variantId: 'curved_treadmill',
    name: 'Tapis roulant curvo / Skillmill',
    baseCalories: { 9: 10, 10: 12, 11: 12, 12: 15, 13: 15, 14: 18, 15: 20 },
    equipment: 'tapis_roulant',
    note: 'Corsa sul terzo anteriore della pedana, cadenza elevata'
  },
  {
    variantId: 'shuttle_run_metcon',
    name: 'Corsa a navetta (Shuttle run sprint)',
    baseCalories: { 9: 10, 10: 12, 11: 12, 12: 14, 13: 15, 14: 16, 15: 18 },
    equipment: 'tapis_roulant',
    note: 'Sprint 10m andata e ritorno con tocco mano a terra'
  },
  {
    variantId: 'tapis_salita_camminata',
    name: 'Tapis in salita a camminata (low impact)',
    baseCalories: { 9: 10, 10: 10, 11: 12, 12: 12, 13: 14, 14: 15, 15: 16 },
    equipment: 'tapis_roulant',
    note: 'Camminata a pendenza sostenuta senza impatti su caviglie e ginocchia'
  }
];

// 2. FUNCTIONAL POOL - Grouped by complementary movement patterns
interface FunctionalTemplate {
  variantId: string;
  name: string;
  pattern: 'power_overhead' | 'hips_legs' | 'gymnastics_core';
  repsRange: [number, number];
  unitLabel: string;
  defaultWeightKg?: number;
  note: string;
}

const FUNCTIONAL_TEMPLATES: FunctionalTemplate[] = [
  // GROUP 1: Power & Overhead
  {
    variantId: 'thruster_bilanciere',
    name: 'Thruster con bilanciere',
    pattern: 'power_overhead',
    repsRange: [9, 12],
    unitLabel: 'rip',
    defaultWeightKg: 35,
    note: 'Accosciata profonda e spinta fluida sopra la testa'
  },
  {
    variantId: 'thruster_manubri',
    name: 'Thruster con 2 manubri',
    pattern: 'power_overhead',
    repsRange: [10, 12],
    unitLabel: 'rip',
    defaultWeightKg: 16,
    note: 'Manubri alle spalle, squat e lock-out continuo'
  },
  {
    variantId: 'db_snatch_alt',
    name: 'Dumbbell snatch alternato a terra',
    pattern: 'power_overhead',
    repsRange: [12, 16],
    unitLabel: 'rip',
    defaultWeightKg: 18,
    note: 'Slancio esplosivo da terra alternando le braccia'
  },
  {
    variantId: 'hang_power_clean_db',
    name: 'Hang power clean con 2 manubri',
    pattern: 'power_overhead',
    repsRange: [10, 12],
    unitLabel: 'rip',
    defaultWeightKg: 18,
    note: 'Dalle ginocchia alle spalle con potente estensione delle anche'
  },
  {
    variantId: 'push_press_db',
    name: 'Push press esplosivo con manubri',
    pattern: 'power_overhead',
    repsRange: [10, 12],
    unitLabel: 'rip',
    defaultWeightKg: 16,
    note: 'Dip rapido con le gambe e spinta esplosiva overhead'
  },
  {
    variantId: 'kettlebell_clean_jerk',
    name: 'Clean & jerk con kettlebell',
    pattern: 'power_overhead',
    repsRange: [10, 12],
    unitLabel: 'rip',
    defaultWeightKg: 20,
    note: 'Girata al petto e spinta ad incastro (5-6 per lato)'
  },
  {
    variantId: 'power_clean_bilanciere',
    name: 'Power clean con bilanciere',
    pattern: 'power_overhead',
    repsRange: [8, 10],
    unitLabel: 'rip',
    defaultWeightKg: 40,
    note: 'Partenza da terra o sospensione, ricezione a 1/4 di squat'
  },

  // GROUP 2: Hips, Posterior & Legs
  {
    variantId: 'kb_swing_usa',
    name: 'Kettlebell swing (Russian / American)',
    pattern: 'hips_legs',
    repsRange: [15, 20],
    unitLabel: 'rip',
    defaultWeightKg: 24,
    note: 'Cerniera d\'anca esplosiva, dorsali ingaggiati'
  },
  {
    variantId: 'wall_ball',
    name: 'Wall ball shot (Palla medica 9/6kg)',
    pattern: 'hips_legs',
    repsRange: [14, 18],
    unitLabel: 'rip',
    defaultWeightKg: 9,
    note: 'Squat sotto il parallelo e lancio pulito a 3 metri'
  },
  {
    variantId: 'box_jump',
    name: 'Box jump (Salto su box 60/50cm)',
    pattern: 'hips_legs',
    repsRange: [10, 12],
    unitLabel: 'salti',
    note: 'Atterraggio morbido, estensione completa delle anche in cima'
  },
  {
    variantId: 'burpee_box_jump',
    name: 'Burpee box jump over',
    pattern: 'hips_legs',
    repsRange: [8, 10],
    unitLabel: 'rip',
    note: 'Petto a terra, risalita e salto oltre il box'
  },
  {
    variantId: 'walking_lunges_db',
    name: 'Affondi camminati con manubri',
    pattern: 'hips_legs',
    repsRange: [12, 16],
    unitLabel: 'passi',
    defaultWeightKg: 14,
    note: 'Ginocchio sfiora il pavimento a 90°, tronco eretto'
  },
  {
    variantId: 'goblet_squat_metcon',
    name: 'Goblet squat dinamico con KB',
    pattern: 'hips_legs',
    repsRange: [12, 15],
    unitLabel: 'rip',
    defaultWeightKg: 20,
    note: 'Gomiti dentro le ginocchia, discesa e risalita dinamica'
  },
  {
    variantId: 'slam_ball',
    name: 'Slam ball a terra esplosiva',
    pattern: 'hips_legs',
    repsRange: [12, 15],
    unitLabel: 'rip',
    defaultWeightKg: 12,
    note: 'Estensione totale e schiacciata a terra a tutta forza'
  },
  {
    variantId: 'sandbag_clean',
    name: 'Clean con sacca zavorrata / D-Ball',
    pattern: 'hips_legs',
    repsRange: [8, 10],
    unitLabel: 'rip',
    defaultWeightKg: 30,
    note: 'Sollevamento da terra a spalla alternata'
  },

  // GROUP 3: Gymnastics, Core & Bodyweight
  {
    variantId: 'burpees_over_bar',
    name: 'Burpees over the bar / manubrio',
    pattern: 'gymnastics_core',
    repsRange: [8, 12],
    unitLabel: 'rip',
    note: 'Petto e cosce a terra, salto a due piedi oltre l\'attrezzo'
  },
  {
    variantId: 'toes_to_bar',
    name: 'Toes-to-bar alla sbarra',
    pattern: 'gymnastics_core',
    repsRange: [8, 12],
    unitLabel: 'rip',
    note: 'Kipping fluido, punte dei piedi a contatto con la sbarra'
  },
  {
    variantId: 'hand_release_pushup',
    name: 'Hand release push-up',
    pattern: 'gymnastics_core',
    repsRange: [10, 14],
    unitLabel: 'rip',
    note: 'Rilascio completo dei palmi a terra, risalita rigida in plank'
  },
  {
    variantId: 'renegade_row_db',
    name: 'Renegade row con 2 manubri',
    pattern: 'gymnastics_core',
    repsRange: [10, 12],
    unitLabel: 'rip',
    defaultWeightKg: 16,
    note: 'Plank stabile sui manubri (5-6 trazioni per lato)'
  },
  {
    variantId: 'devil_press',
    name: 'Devil press con 2 manubri',
    pattern: 'gymnastics_core',
    repsRange: [6, 8],
    unitLabel: 'rip',
    defaultWeightKg: 14,
    note: 'Burpee sui manubri + snatch esplosivo overhead continuo'
  },
  {
    variantId: 'man_makers_db',
    name: 'Man makers completi con manubri',
    pattern: 'gymnastics_core',
    repsRange: [5, 7],
    unitLabel: 'rip',
    defaultWeightKg: 12,
    note: 'Push-up + row dx + row sx + squat clean thruster'
  }
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a randomized Metcon following the user's specific rules:
 * - 1 Cardio with target calories
 * - 2 or 3 Functional exercises (balanced complementary movement patterns)
 * - Duration randomly in the range 9 to 15 minutes (or specified)
 */
export function generateRandomMetcon(options: GeneratorOptions = {}): GeneratedMetcon {
  // 1. Duration in range 9 to 15 minutes
  const availableDurations = [9, 10, 11, 12, 13, 14, 15];
  const durationMin = options.durationMin && options.durationMin >= 9 && options.durationMin <= 15
    ? options.durationMin
    : getRandomElement(availableDurations);

  // 2. Type: amrap, for_time, emom
  let type: 'amrap' | 'for_time' | 'emom';
  if (options.preferredType && options.preferredType !== 'random') {
    type = options.preferredType;
  } else {
    const types: ('amrap' | 'for_time' | 'emom')[] = ['amrap', 'amrap', 'for_time', 'emom'];
    type = getRandomElement(types);
  }

  // 3. Select 1 Cardio Movement with Calorie Target
  const cardioTemplate = getRandomElement(CARDIO_TEMPLATES);
  const targetCalories = cardioTemplate.baseCalories[durationMin] || 15;
  const cardioMovement: MetconMovementItem = {
    variantId: cardioTemplate.variantId,
    name: cardioTemplate.name,
    repsOrDist: `${targetCalories} calorie`,
    caloriesKcal: targetCalories,
    note: cardioTemplate.note
  };

  // 4. Select 2 or 3 Functional Movements
  const functionalCount: 2 | 3 = options.functionalCount || (Math.random() > 0.45 ? 3 : 2);

  // Group functional templates by pattern to avoid movement overlap
  const powerPool = FUNCTIONAL_TEMPLATES.filter(f => f.pattern === 'power_overhead');
  const legsPool = FUNCTIONAL_TEMPLATES.filter(f => f.pattern === 'hips_legs');
  const gymnasticsPool = FUNCTIONAL_TEMPLATES.filter(f => f.pattern === 'gymnastics_core');

  const selectedFunctional: FunctionalTemplate[] = [];

  // Pick 1 from Power / Overhead
  selectedFunctional.push(getRandomElement(powerPool));

  if (functionalCount === 2) {
    // Pick 1 from either legs or gymnastics
    const otherPool = Math.random() > 0.5 ? legsPool : gymnasticsPool;
    selectedFunctional.push(getRandomElement(otherPool));
  } else {
    // Pick 1 from legs AND 1 from gymnastics for 3 distinct patterns!
    selectedFunctional.push(getRandomElement(legsPool));
    selectedFunctional.push(getRandomElement(gymnasticsPool));
  }

  // Convert functional templates to MetconMovementItem with scaled reps based on duration & type
  const functionalMovements: MetconMovementItem[] = selectedFunctional.map(template => {
    const minReps = template.repsRange[0];
    const maxReps = template.repsRange[1];
    
    // Scale slightly by duration: 9-10 min -> lower reps (fast sprint); 14-15 min -> solid aerobic volume
    const targetReps = durationMin <= 10
      ? minReps
      : durationMin >= 14
      ? maxReps
      : Math.round((minReps + maxReps) / 2);

    let repsString = `${targetReps} ${template.unitLabel}`;
    if (template.defaultWeightKg) {
      repsString += ` (${template.defaultWeightKg} kg)`;
    }

    return {
      variantId: template.variantId,
      name: template.name,
      repsOrDist: repsString,
      repsNum: targetReps,
      weightKg: template.defaultWeightKg,
      note: template.note
    };
  });

  // Combine movements: Cardio first, then functional exercises
  const allMovements = [cardioMovement, ...functionalMovements];

  // Title and configuration details
  let title = '';
  let targetRounds: number | undefined;
  let emomIntervalSec: number | undefined;
  const timeCapSec = durationMin * 60;

  if (type === 'amrap') {
    title = `AMRAP ${durationMin}'`;
  } else if (type === 'for_time') {
    // 3 to 5 rounds depending on duration
    const rounds = durationMin <= 10 ? 3 : durationMin <= 13 ? 4 : 5;
    targetRounds = rounds;
    title = `${rounds} Giri a Tempo (Cap ${durationMin}')`;
  } else {
    // EMOM: 1 movement per minute. Number of stations = allMovements.length (3 or 4)
    const stationsCount = allMovements.length;
    const calcRounds = Math.floor(durationMin / stationsCount);
    targetRounds = Math.max(2, calcRounds);
    emomIntervalSec = 60;
    title = `EMOM ${durationMin}' (${stationsCount} Stazioni)`;
  }

  const instructions = type === 'amrap'
    ? `Esegui il massimo numero di giri completi in ${durationMin} minuti. Gestisci il cardio (${targetCalories} cal) a ritmo sostenuto ma costante (RPE 8) per non bruciarti nei primi minuti.`
    : type === 'for_time'
    ? `Completa i ${targetRounds || 4} giri nel minor tempo possibile entro il time cap di ${durationMin} minuti. Punta a completare ogni giro sotto i ${Math.floor(durationMin / (targetRounds || 4))} minuti.`
    : `Ogni minuto al minuto (EMOM): minuto 1 cardio (${targetCalories} cal), minuti successivi un esercizio funzionale a rotazione per ${durationMin} minuti totali.`;

  return {
    id: `metcon_gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    type,
    durationMin,
    timeCapSec,
    targetRounds,
    emomIntervalSec,
    cardioMovement,
    functionalMovements,
    allMovements,
    instructions
  };
}

/**
 * Converts a GeneratedMetcon to MetconResultLog for direct workout activation
 */
export function toMetconResultLog(gen: GeneratedMetcon): MetconResultLog {
  return {
    title: gen.title,
    type: gen.type,
    movements: gen.allMovements,
    roundsCompleted: 0,
    partialReps: 0,
    elapsedTimeSec: 0,
    sensations: gen.instructions,
    timeCapSec: gen.timeCapSec,
    targetRounds: gen.targetRounds,
    emomIntervalSec: gen.emomIntervalSec
  };
}

/**
 * Converts a GeneratedMetcon to MetconConfig for routine saving
 */
export function toMetconConfig(gen: GeneratedMetcon): MetconConfig {
  return {
    id: gen.id,
    title: gen.title,
    type: gen.type,
    durationSec: gen.timeCapSec,
    targetRounds: gen.targetRounds,
    timeCapSec: gen.timeCapSec,
    movements: gen.allMovements,
    instructions: gen.instructions
  };
}

export interface WarmupExercise {
  name: string;
  repsOrTime: string;
  notes?: string;
  isRamp?: boolean;
}

export interface RampOption {
  targetExercise: string;
  defaultKg: number;
  calculateRamp: (targetKg: number) => { step: string; weightKg: number; reps: string; note: string }[];
}

export interface WarmupProtocol {
  id: string;
  routineDayKey: 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
  routineTitle: string;
  sessionType: 'A' | 'B' | 'Braccia';
  openingExercise: string;
  durationLabel: string; // "5' base + 6-8' specifico"
  commonBase: {
    cardio: string;
    mobilityCircuits: string;
    exercises: WarmupExercise[];
  };
  specificBlock: {
    title: string;
    focus: string;
    exercises: WarmupExercise[];
    rampGuide?: RampOption;
    rampGuides?: RampOption[];
  };
  specialRules: string[];
}

export const COMMON_BASE_EXERCISES: WarmupExercise[] = [
  { name: 'Cat-cow a terra', repsOrTime: '8 ripetizioni', notes: 'Mobilizza la colonna in flessione ed estensione ritmica con respiro profondo.' },
  { name: "World's greatest stretch", repsOrTime: '4 per lato', notes: 'Affondo profondo con rotazione toracica verso il ginocchio anteriore.' },
  { name: 'Glute bridge a terra', repsOrTime: '10 ripetizioni', notes: 'Fermo isometrico di 1" in cima con glutei serrati, bacino neutro.' },
  { name: 'Scap push-up (piegamenti scapolari)', repsOrTime: '10 ripetizioni', notes: 'Braccia tese: solo adduzione e abduzione pura delle scapole.' }
];

// Rampa Squat (dal PDF: bilanciere vuoto ×8, 40% ×5, 60% ×3, 80% ×2, poi serie vere)
export const RAMP_SQUAT: RampOption = {
  targetExercise: 'Back Squat',
  defaultKg: 80,
  calculateRamp: (targetKg: number) => {
    const bar = 20;
    const target = Math.max(bar, targetKg || 80);
    const s1 = bar;
    const s2 = Math.round((target * 0.40) / 2.5) * 2.5;
    const s3 = Math.round((target * 0.60) / 2.5) * 2.5;
    const s4 = Math.round((target * 0.80) / 2.5) * 2.5;

    return [
      { step: '1ª Serie Rampa', weightKg: s1, reps: '8 ripetizioni', note: 'Bilanciere vuoto: profondità e traiettoria' },
      { step: '2ª Serie Rampa', weightKg: Math.max(bar, s2), reps: '5 ripetizioni', note: '40% del carico target: ritmo costante' },
      { step: '3ª Serie Rampa', weightKg: Math.max(s2 + 5, s3), reps: '3 ripetizioni', note: '60% del carico target: risalita veloce' },
      { step: '4ª Serie Rampa', weightKg: Math.max(s3 + 5, s4), reps: '2 ripetizioni', note: '80% del carico target: compattezza core, poi le 4 serie vere' }
    ];
  }
};

// Rampa Panca (dal PDF: bilanciere ×10, 50% ×5, 70% ×3, 85% ×1, poi serie vere)
export const RAMP_PANCA: RampOption = {
  targetExercise: 'Panca Piana',
  defaultKg: 70,
  calculateRamp: (targetKg: number) => {
    const bar = 20;
    const target = Math.max(bar, targetKg || 70);
    const s1 = bar;
    const s2 = Math.round((target * 0.50) / 2.5) * 2.5;
    const s3 = Math.round((target * 0.70) / 2.5) * 2.5;
    const s4 = Math.round((target * 0.85) / 2.5) * 2.5;

    return [
      { step: '1ª Serie Rampa', weightKg: s1, reps: '10 ripetizioni', note: 'Bilanciere vuoto: setto scapolare e fermo al petto' },
      { step: '2ª Serie Rampa', weightKg: Math.max(bar, s2), reps: '5 ripetizioni', note: '50% del carico target: leg drive attivo' },
      { step: '3ª Serie Rampa', weightKg: Math.max(s2 + 5, s3), reps: '3 ripetizioni', note: '70% del carico target: spinta decisa' },
      { step: '4ª Serie Rampa', weightKg: Math.max(s3 + 2.5, s4), reps: '1 ripetizione', note: '85% del carico target: risveglio neurale, poi le 4 serie vere' }
    ];
  }
};

// Rampa Hip Thrust (dal PDF: bilanciere vuoto ×10, 50% ×5, 70% ×3, poi serie vere)
export const RAMP_HIP_THRUST: RampOption = {
  targetExercise: 'Hip Thrust',
  defaultKg: 95,
  calculateRamp: (targetKg: number) => {
    const bar = 20;
    const target = Math.max(bar, targetKg || 95);
    const s1 = bar;
    const s2 = Math.round((target * 0.50) / 2.5) * 2.5;
    const s3 = Math.round((target * 0.70) / 2.5) * 2.5;

    return [
      { step: '1ª Serie Rampa', weightKg: s1, reps: '10 ripetizioni', note: 'Bilanciere vuoto: blocco 2" al picco' },
      { step: '2ª Serie Rampa', weightKg: Math.max(bar + 10, s2), reps: '5 ripetizioni', note: '50% del carico target: tibie verticali' },
      { step: '3ª Serie Rampa', weightKg: Math.max(s2 + 10, s3), reps: '3 ripetizioni', note: '70% del carico target: glutei attivi, poi le 4 serie vere' }
    ];
  }
};

// Rampa Military Press (dal PDF: bilanciere vuoto ×8, 50% ×5, 70% ×3, poi serie vere)
export const RAMP_MILITARY: RampOption = {
  targetExercise: 'Military Press',
  defaultKg: 45,
  calculateRamp: (targetKg: number) => {
    const bar = 20;
    const target = Math.max(bar, targetKg || 45);
    const s1 = bar;
    const s2 = Math.round((target * 0.50) / 2.5) * 2.5;
    const s3 = Math.round((target * 0.70) / 2.5) * 2.5;

    return [
      { step: '1ª Serie Rampa', weightKg: s1, reps: '8 ripetizioni', note: 'Bilanciere vuoto: glutei serrati, traiettoria verticale' },
      { step: '2ª Serie Rampa', weightKg: Math.max(bar, s2), reps: '5 ripetizioni', note: '50% del carico target: strict press pulita' },
      { step: '3ª Serie Rampa', weightKg: Math.max(s2 + 2.5, s3), reps: '3 ripetizioni', note: '70% del carico target: compattezza, poi le 4 serie vere' }
    ];
  }
};

// ============================================================================
// PROTOCOLLI DI RISCALDAMENTO SPECIFICO DEL NUOVO PDF
// ============================================================================
export const WARMUP_PROTOCOLS: Record<string, WarmupProtocol> = {
  // --- LUNEDÌ (SEDUTA A) ---
  lun: {
    id: 'warmup_seduta_a_lun',
    routineDayKey: 'lun',
    sessionType: 'A',
    routineTitle: 'Seduta A (Squat, Panca, Rematore)',
    openingExercise: 'Back Squat & Panca Piana',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda (oppure Air bike, SkiErg, Tapis roulant)",
      mobilityCircuits: '2 giri completi senza pausa:',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta A (Squat, Panca, Rematore)',
      focus: 'Mobilità bacino, attivazione core, cuffia dei rotatori e rampe progressive',
      exercises: [
        {
          name: 'Goblet squat con kettlebell leggera',
          repsOrTime: '2 serie × 8 rip',
          notes: 'Pausa di 3" sul fondo per aprire il bacino e mantenere il petto alto.'
        },
        {
          name: 'Dead bug a terra',
          repsOrTime: '2 serie × 8 per lato',
          notes: 'Schiena lombare incollata al suolo, controllo respiratorio.'
        },
        {
          name: 'Hip hinge con bastone (o stacco manubri leggeri)',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Cerniera d\'anca impeccabile: prepara lo stacco con manubri dello slot 2.'
        },
        {
          name: 'Band pull-apart + Extrarotazione con elastico',
          repsOrTime: '2×15 pull-apart + 1×12/lato extrarot.',
          notes: 'Scalda deltoidi posteriori, romboidi e cuffia dei rotatori per la panca.'
        },
        {
          name: 'Scap push-up a terra',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Adduzione e abduzione scapolare controllata.'
        },
        {
          name: 'Rampa squat bilanciere',
          repsOrTime: 'Bilanciere vuoto ×8, 40% ×5, 60% ×3, 80% ×2',
          notes: 'Poi parti con le 4 serie vere da 5 colpi.',
          isRamp: true
        },
        {
          name: 'Rampa panca & Rematore',
          repsOrTime: 'Panca: bilanciere ×10, 50% ×5, 70% ×3, 85% ×1 • Rematore: 1 serie leggera da 8',
          notes: 'Poi esegui le serie vere.',
          isRamp: true
        }
      ],
      rampGuide: RAMP_SQUAT,
      rampGuides: [RAMP_SQUAT, RAMP_PANCA]
    },
    specialRules: [
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere. Non rifare tutto il riscaldamento.',
      'Zona lombare rigida: fai 2 giri in più di glute bridge e dead bug prima di squat, stacco o swing.',
      'Rematore petto poggiato: fai solo 1 serie leggera da 8 ripetizioni prima delle 4×8 vere.'
    ]
  },

  // --- GIOVEDÌ (SEDUTA A - ORDINE RUOTATO) ---
  gio: {
    id: 'warmup_seduta_a_gio',
    routineDayKey: 'gio',
    sessionType: 'A',
    routineTitle: 'Seduta A (Rematore, Squat, Panca)',
    openingExercise: 'Rematore & Back Squat',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda (oppure Air bike, SkiErg, Tapis roulant)",
      mobilityCircuits: '2 giri completi senza pausa:',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta A (Apertura con Rematore a schiena fresca)',
      focus: 'Attivazione dorsale, catena posteriore per KB swing e rampe Squat/Panca',
      exercises: [
        {
          name: 'Goblet squat con kettlebell leggera',
          repsOrTime: '2 serie × 8 rip',
          notes: 'Pausa di 3" sul fondo per aprire il bacino e mantenere il petto alto.'
        },
        {
          name: 'Dead bug a terra',
          repsOrTime: '2 serie × 8 per lato',
          notes: 'Attivazione core profondo.'
        },
        {
          name: 'Hip hinge con bastone (o stacco manubri leggeri)',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Cerniera d\'anca impeccabile: prepara il KB swing dello slot 2.'
        },
        {
          name: 'Band pull-apart + Extrarotazione con elastico',
          repsOrTime: '2×15 pull-apart + 1×12/lato extrarot.',
          notes: 'Cuffia dei rotatori e scapole pronte.'
        },
        {
          name: 'Scap push-up',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Protrai e ritrai le scapole a braccia tese.'
        },
        {
          name: 'Rematore petto poggiato (Apertura giovedì)',
          repsOrTime: '1 serie leggera da 8 rip',
          notes: 'Poi subito le 4 serie da 8 colpi a schiena fresca!'
        },
        {
          name: 'Rampa squat bilanciere',
          repsOrTime: 'Bilanciere vuoto ×8, 40% ×5, 60% ×3, 80% ×2',
          notes: 'Poi le serie vere da 5 colpi.',
          isRamp: true
        },
        {
          name: 'Rampa panca piana',
          repsOrTime: 'Bilanciere ×10, 50% ×5, 70% ×3, 85% ×1',
          notes: 'Poi le 4 serie vere da 5 colpi.',
          isRamp: true
        }
      ],
      rampGuide: RAMP_SQUAT,
      rampGuides: [RAMP_SQUAT, RAMP_PANCA]
    },
    specialRules: [
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere. Non rifare tutto il riscaldamento.',
      'Zona lombare rigida: 2 giri in più di glute bridge e dead bug prima di squat, stacco o swing.',
      'Slot 2 Giovedì: KB swing al posto dello stacco (cerniera balistica).'
    ]
  },

  // --- MARTEDÌ (SEDUTA B) ---
  mar: {
    id: 'warmup_seduta_b_mar',
    routineDayKey: 'mar',
    sessionType: 'B',
    routineTitle: 'Seduta B (Hip thrust, Military, Trazioni)',
    openingExercise: 'Hip Thrust & Military Press',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda (oppure Air bike, SkiErg, Tapis roulant)",
      mobilityCircuits: '2 giri completi senza pausa:',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta B (Hip thrust, Military, Trazioni)',
      focus: 'Attivazione glutei con fermo, decompressione alla sbarra, stabilità spalle',
      exercises: [
        {
          name: 'Glute bridge con pausa di 2"',
          repsOrTime: '2 serie × 10 rip',
          notes: 'Prepara l\'hip thrust con forte contrazione isometrica in cima.'
        },
        {
          name: 'Dead bug a terra',
          repsOrTime: '1 serie × 8 per lato',
          notes: 'Controllo stabilità pelvica e lombare neutra.'
        },
        {
          name: 'Band pull-apart + Passaggi di spalla con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 passaggi',
          notes: 'Prepara la mobilità overhead per il military press.'
        },
        {
          name: 'Dead hang alla sbarra + Scap pull-up',
          repsOrTime: '2×20" hang + 1×8 scap pull-up',
          notes: 'Decompressione discale e risveglio del gran dorsale.'
        },
        {
          name: 'Rampa hip thrust',
          repsOrTime: 'Bilanciere vuoto ×10, 50% ×5, 70% ×3',
          notes: 'Poi le 4 serie vere da 6-8 ripetizioni con blocco al picco.',
          isRamp: true
        },
        {
          name: 'Rampa military press & Trazioni',
          repsOrTime: 'Military: bilanciere ×8, 50% ×5, 70% ×3 • Trazioni: 3 facilitate (elastico), 3 pulite',
          notes: 'Poi le serie vere.',
          isRamp: true
        }
      ],
      rampGuide: RAMP_HIP_THRUST,
      rampGuides: [RAMP_HIP_THRUST, RAMP_MILITARY]
    },
    specialRules: [
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere. Non rifare tutto il riscaldamento.',
      'Trazioni: prima delle serie pesanti, 3 con elastico e 3 pulite a corpo libero sono sufficienti.',
      'Se la zona lombare è rigida: fai 2 giri in più di glute bridge e dead bug prima dell\'hip thrust.'
    ]
  },

  // --- SABATO (SEDUTA B - ORDINE RUOTATO & POST-PALLAVOLO) ---
  sab: {
    id: 'warmup_seduta_b_sab',
    routineDayKey: 'sab',
    sessionType: 'B',
    routineTitle: 'Seduta B (Si apre col Military; Hip thrust per ultimo)',
    openingExercise: 'Military Press & Trazioni',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda (oppure Air bike, SkiErg, Tapis roulant)",
      mobilityCircuits: '2 giri completi senza pausa:',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta B Sabato (Apertura Military Press)',
      focus: 'Spalle, trazioni e protezione gambe post-pallavolo',
      exercises: [
        {
          name: 'Band pull-apart + Passaggi di spalla con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 passaggi',
          notes: 'Apertura con Military press: deltoidi caldi e mobilità toracica.'
        },
        {
          name: 'Dead hang alla sbarra + Scap pull-up',
          repsOrTime: '2×20" hang + 1×8 scap pull-up',
          notes: 'Decompressione discale e presa salda.'
        },
        {
          name: 'Glute bridge con pausa di 2"',
          repsOrTime: '2 serie × 10 rip',
          notes: 'Prepara l\'hip thrust che oggi viene eseguito per ultimo.'
        },
        {
          name: 'Dead bug a terra',
          repsOrTime: '1 serie × 8 per lato',
          notes: 'Core attivo per stabilizzare la colonna.'
        },
        {
          name: 'Rampa military press',
          repsOrTime: 'Bilanciere vuoto ×8, 50% ×5, 70% ×3',
          notes: 'Poi le 4 serie vere da 5 colpi strict in piedi.',
          isRamp: true
        },
        {
          name: 'Avvicinamento trazioni',
          repsOrTime: '3 reps facilitate (elastico), 3 a corpo libero',
          notes: 'Poi le 4 serie vere (o zavorrate se a 4×8 corpo libero).'
        },
        {
          name: 'Rampa hip thrust',
          repsOrTime: 'Bilanciere vuoto ×10, 50% ×5, 70% ×3',
          notes: 'Eseguito per ultimo: se vieni da pallavolo, mantieni il carico più leggero (-20-25%).',
          isRamp: true
        }
      ],
      rampGuide: RAMP_MILITARY,
      rampGuides: [RAMP_MILITARY, RAMP_HIP_THRUST]
    },
    specialRules: [
      'REGOLA PALLAVOLO (Venerdì): se hai giocato a pallavolo, AGGIUNGI SUBITO AL RISCALDAMENTO 2×10 alzate sul tallone (polpacci) e 2×10 abduzioni d\'anca con elastico per proteggere caviglie e ginocchia.',
      'Nel workout post-pallavolo: carichi più leggeri su hip thrust (-20-25%) e goblet squat con pausa.',
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere.'
    ]
  },

  // --- VENERDÌ (BRACCIA + CARDIO SENZA PALLAVOLO) ---
  ven: {
    id: 'warmup_ven_braccia',
    routineDayKey: 'ven',
    sessionType: 'Braccia',
    routineTitle: 'Venerdì - Braccia + Cardio (solo se NO pallavolo)',
    openingExercise: 'Super serie Braccia & Vogatore',
    durationLabel: "5' cardiovascolare + mobilità articolare",
    commonBase: {
      cardio: "5' di vogatore a ritmo facile (o Air bike / SkiErg / corda)",
      mobilityCircuits: 'Attivazione cardiovascolare aerobica di base',
      exercises: [
        { name: 'Rotazioni di polsi e gomiti', repsOrTime: '15 per senso', notes: 'Prepara gomiti e polsi per curl e french press.' },
        { name: 'Dislocazioni con elastico / bastone', repsOrTime: '12 ripetizioni', notes: 'Mobilità scapolo-omerale per le alzate laterali.' },
        { name: 'Band pull-apart', repsOrTime: '15 ripetizioni', notes: 'Attivazione romboidi e cuffia dei rotatori.' }
      ]
    },
    specificBlock: {
      title: 'Blocco specifico: Braccia & Spalle (Antagoniste)',
      focus: 'Vascolarizzazione tendinea bicipiti e tricipiti senza accumulo di fatica',
      exercises: [
        {
          name: 'Curl con manubri leggeri (o bilanciere vuoto)',
          repsOrTime: '1 serie × 12 rip leggere',
          notes: 'Movimento fluido, pompa sangue nei flessori del gomito.'
        },
        {
          name: 'Pushdown con elastico o french press leggera',
          repsOrTime: '1 serie × 12 rip leggere',
          notes: 'Scalda il tendine tricipitale senza forzare l\'estensione.'
        },
        {
          name: 'Alzate laterali con manubri da 2-4 kg',
          repsOrTime: '1 serie × 12 rip',
          notes: 'Focus abduzione pura della spalla.'
        }
      ]
    },
    specialRules: [
      'Se venerdì giochi a pallavolo: la seduta braccia/cardio salta e non si recupera!',
      'Niente cedimento: le braccia hanno già lavorato duramente nei fondamentali.',
      'Il cardio finale di 25-35\' di vogatore deve restare a ritmo facile e costante (base aerobica per i 2000 m).'
    ]
  }
};

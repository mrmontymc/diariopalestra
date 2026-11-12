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
  { name: 'Cat-cow a terra', repsOrTime: '8 ripetizioni', notes: 'Mobilizza la colonna in flessione ed estensione con respiro controllato.' },
  { name: "World's greatest stretch", repsOrTime: '4 per lato', notes: 'Affondo profondo con rotazione toracica verso il ginocchio anteriore.' },
  { name: 'Glute bridge a terra', repsOrTime: '10 ripetizioni', notes: 'Attivazione glutei con retroversione del bacino al picco.' },
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
// PROTOCOLLI DI RISCALDAMENTO SPECIFICO DEL NUOVO PDF (PAGINA 2)
// ============================================================================
export const WARMUP_PROTOCOLS: Record<string, WarmupProtocol> = {
  // --- LUNEDÌ (SEDUTA A - SQUAT, PANCA, REMATORE) ---
  lun: {
    id: 'warmup_seduta_a_lun',
    routineDayKey: 'lun',
    sessionType: 'A',
    routineTitle: 'Seduta A (Squat, Panca, Rematore)',
    openingExercise: 'Back Squat & Panca Piana',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda",
      mobilityCircuits: '2 giri: 8 cat-cow, 4 world\'s greatest stretch per lato, 10 glute bridge, 10 scap push-up',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta A (Squat, Panca, Rematore)',
      focus: 'Mobilità anche, core, polpacci, cuffia dei rotatori e rampe pesi',
      exercises: [
        {
          name: '1. Goblet squat con pausa di 3" sul fondo',
          repsOrTime: '2 serie × 8 rip',
          notes: 'Con kettlebell leggera: apertura del bacino e petto alto.'
        },
        {
          name: '2. Dead bug',
          repsOrTime: '2 serie × 8 per lato',
          notes: 'Schiena lombare incollata al suolo, controllo respiratorio diaframmatico.'
        },
        {
          name: '3. Alzate sul tallone (Calf)',
          repsOrTime: '1 serie × 15 rip',
          notes: 'Prepara i polpacci per la super serie A2 (Calf raise con manubri).'
        },
        {
          name: '4. Band pull-apart + Extrarotazione con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 per lato',
          notes: 'Scalda deltoidi posteriori, romboidi e cuffia dei rotatori per la panca.'
        },
        {
          name: '5. Scap push-up',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Adduzione e abduzione scapolare pura a braccia distese.'
        },
        {
          name: '6. Rampa squat bilanciere',
          repsOrTime: 'Bilanciere vuoto ×8, 40% ×5, 60% ×3, 80% ×2',
          notes: 'Poi parti direttamente con le 4 serie vere da 5 colpi.',
          isRamp: true
        },
        {
          name: '7. Rampa panca & Rematore',
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
      'Zona lombare rigida: 2 giri in più di glute bridge e dead bug prima di squat, hip thrust o swing.',
      'Sabato dopo pallavolo: aggiungi 2×10 abduzioni d\'anca con elastico e 2×10 alzate sul tallone.'
    ]
  },

  // --- GIOVEDÌ (SEDUTA A - ORDINE RUOTATO: REMATORE, SQUAT, PANCA) ---
  gio: {
    id: 'warmup_seduta_a_gio',
    routineDayKey: 'gio',
    sessionType: 'A',
    routineTitle: 'Seduta A (Rematore, Squat, Panca - A3-A1-A2)',
    openingExercise: 'Rematore petto poggiato & Back Squat',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda",
      mobilityCircuits: '2 giri: 8 cat-cow, 4 world\'s greatest stretch per lato, 10 glute bridge, 10 scap push-up',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta A Giovedì (Parti col Rematore a schiena fresca)',
      focus: 'Attivazione dorsale, mobilità anche, polpacci e rampe',
      exercises: [
        {
          name: '1. Goblet squat con pausa di 3" sul fondo',
          repsOrTime: '2 serie × 8 rip',
          notes: 'Con kettlebell leggera: apertura del bacino e mobilità caviglie.'
        },
        {
          name: '2. Dead bug',
          repsOrTime: '2 serie × 8 per lato',
          notes: 'Core attivo e colonna neutra.'
        },
        {
          name: '3. Alzate sul tallone (Calf)',
          repsOrTime: '1 serie × 15 rip',
          notes: 'Prepara i polpacci per la super serie A2 con panca.'
        },
        {
          name: '4. Band pull-apart + Extrarotazione con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 per lato',
          notes: 'Cuffia dei rotatori e scapole pronte.'
        },
        {
          name: '5. Scap push-up',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Controllo scapolare.'
        },
        {
          name: 'Apertura Rematore petto poggiato',
          repsOrTime: '1 serie leggera da 8 rip',
          notes: 'Poi parti subito con le 4×8 vere a schiena fresca!'
        },
        {
          name: '6. Rampa squat bilanciere',
          repsOrTime: 'Bilanciere vuoto ×8, 40% ×5, 60% ×3, 80% ×2',
          notes: 'Poi le 4 serie vere da 5 colpi.',
          isRamp: true
        },
        {
          name: '7. Rampa panca piana',
          repsOrTime: 'Bilanciere ×10, 50% ×5, 70% ×3, 85% ×1',
          notes: 'Poi le 4 serie vere da 5 colpi.',
          isRamp: true
        }
      ],
      rampGuide: RAMP_SQUAT,
      rampGuides: [RAMP_SQUAT, RAMP_PANCA]
    },
    specialRules: [
      'Ordine Giovedì: A3 - A1 - A2 (parti col rematore petto poggiato a schiena fresca).',
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere.',
      'Zona lombare rigida: 2 giri in più di glute bridge e dead bug prima di squat o stacco.'
    ]
  },

  // --- MARTEDÌ (SEDUTA B - MILITARY, TRAZIONI, HIP THRUST) ---
  mar: {
    id: 'warmup_seduta_b_mar',
    routineDayKey: 'mar',
    sessionType: 'B',
    routineTitle: 'Seduta B (Military, Trazioni, Hip thrust)',
    openingExercise: 'Military Press, Trazioni & Hip Thrust',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda",
      mobilityCircuits: '2 giri: 8 cat-cow, 4 world\'s greatest stretch per lato, 10 glute bridge, 10 scap push-up',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta B (Military, Trazioni, Hip thrust)',
      focus: 'Mobilità spalle overhead, trazioni, glutei e rampe progressive',
      exercises: [
        {
          name: '1. Band pull-apart + Passaggi di spalla con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 passaggi',
          notes: 'Prepara il military press con mobilità scapolo-omerale.'
        },
        {
          name: '2. Air squat con fermo di 3"',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Prepara la super serie B1 (Air squat con fermo in buca 3-5").'
        },
        {
          name: '3. Dead hang + Scap pull-up',
          repsOrTime: '2×20" hang + 1×8 scap pull-up',
          notes: 'Decompressione discale alla sbarra e attivazione gran dorsale.'
        },
        {
          name: '4. Glute bridge con pausa di 2"',
          repsOrTime: '2 serie × 10 rip',
          notes: 'Prepara l\'hip thrust con contrazione isometrica al picco.'
        },
        {
          name: '5. Rampa military press',
          repsOrTime: 'Bilanciere vuoto ×8, 50% ×5, 70% ×3',
          notes: 'Poi le 4 serie vere da 5 colpi strict in piedi.',
          isRamp: true
        },
        {
          name: '6. Trazioni & Hip thrust avvicinamento',
          repsOrTime: 'Trazioni: 3 facilitate (elastico), 3 pulite • Hip thrust: bilanciere vuoto ×10, 50% ×5, 70% ×3',
          notes: 'Poi parti con le serie vere del programma.',
          isRamp: true
        }
      ],
      rampGuide: RAMP_MILITARY,
      rampGuides: [RAMP_MILITARY, RAMP_HIP_THRUST]
    },
    specialRules: [
      'Ordine Martedì: B1 - B2 - B3 (Military press, poi trazioni, poi hip thrust).',
      'Ogni nuova coppia: prima serie del fondamentale leggera (~60%), poi le 4 vere. Non rifare tutto il riscaldamento.',
      'Zona lombare rigida: 2 giri in più di glute bridge e dead bug prima di hip thrust o farmer carry.'
    ]
  },

  // --- SABATO (SEDUTA B - ORDINE RUOTATO: B2 - B1 - B3) ---
  sab: {
    id: 'warmup_seduta_b_sab',
    routineDayKey: 'sab',
    sessionType: 'B',
    routineTitle: 'Seduta B (Apri con le Trazioni; Hip thrust per ultimo)',
    openingExercise: 'Trazioni alla sbarra & Military Press',
    durationLabel: "5' base + 6-8' specifico",
    commonBase: {
      cardio: "2' di vogatore facile o corda",
      mobilityCircuits: '2 giri: 8 cat-cow, 4 world\'s greatest stretch per lato, 10 glute bridge, 10 scap push-up',
      exercises: COMMON_BASE_EXERCISES
    },
    specificBlock: {
      title: 'Blocco specifico: Seduta B Sabato (B2 Trazioni - B1 Military - B3 Hip thrust)',
      focus: 'Apertura trazioni, spalle e protezione gambe post-pallavolo',
      exercises: [
        {
          name: '1. Band pull-apart + Passaggi di spalla con elastico',
          repsOrTime: '2×15 pull-apart + 1×12 passaggi',
          notes: 'Mobilità scapolare e toracica.'
        },
        {
          name: '2. Air squat con fermo di 3"',
          repsOrTime: '1 serie × 10 rip',
          notes: 'Prepara la super serie metabolica (o leg curl se zero impatto).'
        },
        {
          name: '3. Dead hang + Scap pull-up',
          repsOrTime: '2×20" hang + 1×8 scap pull-up',
          notes: 'Oggi apri con B2 (Trazioni alla sbarra): dorsale caldo e pronto.'
        },
        {
          name: '4. Glute bridge con pausa di 2"',
          repsOrTime: '2 serie × 10 rip',
          notes: 'Prepara l\'hip thrust che oggi viene svolto per ultimo.'
        },
        {
          name: '5. Trazioni: avvicinamento specifico',
          repsOrTime: '3 facilitate (elastico), 3 pulite a corpo libero',
          notes: 'Poi le 4 serie vere da 5 colpi (apertura della seduta).'
        },
        {
          name: '6. Rampa military press',
          repsOrTime: 'Bilanciere vuoto ×8, 50% ×5, 70% ×3',
          notes: 'Poi le 4 serie vere da 5 colpi strict.',
          isRamp: true
        },
        {
          name: '7. Rampa hip thrust (eseguito per ultimo)',
          repsOrTime: 'Bilanciere vuoto ×10, 50% ×5, 70% ×3',
          notes: 'Se vieni da pallavolo al venerdì, mantieni il carico più leggero (-20-25%).',
          isRamp: true
        }
      ],
      rampGuide: RAMP_MILITARY,
      rampGuides: [RAMP_MILITARY, RAMP_HIP_THRUST]
    },
    specialRules: [
      'Ordine Sabato: B2 - B1 - B3 (apri con le trazioni; hip thrust per ultimo, più leggero se vieni da pallavolo).',
      'SABATO DOPO PALLAVOLO: aggiungi subito 2×10 abduzioni d\'anca con elastico e 2×10 alzate sul tallone per proteggere caviglie e ginocchia.',
      'Metcon post-pallavolo a basso impatto: camminata in salita su tapis (o air bike), niente cerniere né impatto.'
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
      'Braccia + cardio solo se non c\'è pallavolo: se hai giocato, la seduta salta e non si recupera!',
      'Niente cedimento: le braccia lavorano già nei fondamentali (trazioni, panca, military, rematore).',
      'Cardio finale: 25-35\' di vogatore a ritmo facile e costante (non a tutta, base aerobica per i 2000 m).'
    ]
  }
};

import { WorkoutRoutine, SuperSetPair } from '../types/workout';

// ============================================================================
// SUPER SERIE CANONICHE DEL PROGRAMMA (SEDUTA A / SEDUTA B)
// ============================================================================

// --- SEDUTA A: SLOT 1 ---
export const SUPER_SET_A1: SuperSetPair = {
  id: 'pair_A1',
  code: 'A1',
  title: 'Super serie A1 (Gambe / Spalle)',
  targetRounds: 4,
  restBetweenRoundsSec: 90, // 90" dopo squat
  primary: {
    variantId: 'back_squat',
    label: 'Back squat',
    targetSets: 4,
    targetReps: '4×5',
    targetRepsNum: 5,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'push_press_manubri',
    label: 'Push press con manubri (kb, alternato)',
    targetSets: 4,
    targetReps: '4×10',
    targetRepsNum: 10,
    type: 'metabolico'
  },
  notes: 'Fondamentale 4×5 (margine 1-2 rip) e subito il metabolico 4×10. Poi riposo 90". Esempio: squat 5 reps (40") + push press 10 reps (40") + riposo 90" = ~2\'50" a giro, ~11\' per coppia.'
};

// --- SEDUTA A: SLOT 2 (LUNEDÌ: STACCO CON MANUBRI) ---
export const SUPER_SET_A2_LUN: SuperSetPair = {
  id: 'pair_A2_lun',
  code: 'A2',
  title: 'Super serie A2 (Petto / Cerniera d\'anca - Lunedì)',
  targetRounds: 4,
  restBetweenRoundsSec: 90, // 90" dopo panca
  primary: {
    variantId: 'panca_piana',
    label: 'Panca piana',
    targetSets: 4,
    targetReps: '4×5',
    targetRepsNum: 5,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'stacco_manubri',
    label: 'Stacco con manubri (Lunedì)',
    targetSets: 4,
    targetReps: '4×8-10',
    targetRepsNum: 9,
    type: 'metabolico'
  },
  notes: 'Lunedì: Stacco con manubri a carico moderato, schiena neutra. Se la zona lombare protesta, passa a goblet squat pesante o saltalo. Riposo 90".'
};

// --- SEDUTA A: SLOT 2 (GIOVEDÌ: KB SWING) ---
export const SUPER_SET_A2_GIO: SuperSetPair = {
  id: 'pair_A2_gio',
  code: 'A2',
  title: 'Super serie A2 (Petto / Cerniera balistica - Giovedì)',
  targetRounds: 4,
  restBetweenRoundsSec: 90, // 90" dopo panca
  primary: {
    variantId: 'panca_piana',
    label: 'Panca piana',
    targetSets: 4,
    targetReps: '4×5',
    targetRepsNum: 5,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'kb_swing',
    label: 'KB swing (2 mani, 1 mano) (Giovedì)',
    targetSets: 4,
    targetReps: '4×10-12',
    targetRepsNum: 11,
    type: 'metabolico'
  },
  notes: 'Giovedì: KB swing esplosivo a 2 mani o 1 mano. Cerniera pura. Se i lombari protestano, sostituisci con Goblet squat pesante. Riposo 90".'
};

// --- SEDUTA A: SLOT 3 ---
export const SUPER_SET_A3: SuperSetPair = {
  id: 'pair_A3',
  code: 'A3',
  title: 'Super serie A3 (Dorso orizzontale / Gambe unilaterale)',
  targetRounds: 4,
  restBetweenRoundsSec: 75, // 60-75" dopo rematore
  primary: {
    variantId: 'rematore_panca_tbar',
    label: 'Rematore petto poggiato o T-bar',
    targetSets: 4,
    targetReps: '4×8',
    targetRepsNum: 8,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'affondi_indietro_manubri',
    label: 'Affondi indietro con manubri (camminati, bulgaro, step-up)',
    targetSets: 4,
    targetReps: '4×8-10 per lato',
    targetRepsNum: 9,
    type: 'metabolico'
  },
  notes: 'Rematore 4×8 su panca inclinata con manubri o T-bar (alternativa: pulley seduto). Affondi indietro 4×8-10 per lato. Riposo 60-75".'
};

// --- SEDUTA B: SLOT 1 ---
export const SUPER_SET_B1: SuperSetPair = {
  id: 'pair_B1',
  code: 'B1',
  title: 'Super serie B1 (Glutei / Spinta orizzontale)',
  targetRounds: 4,
  restBetweenRoundsSec: 90, // 90" dopo hip thrust
  primary: {
    variantId: 'hip_thrust',
    label: 'Hip thrust',
    targetSets: 4,
    targetReps: '4×6-8',
    targetRepsNum: 7,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'push_up',
    label: 'Push-up (piedi rialzati, tempo, zavorrato)',
    targetSets: 4,
    targetReps: '4×10-15',
    targetRepsNum: 12,
    type: 'metabolico'
  },
  notes: 'Hip thrust 4×6-8 con blocco al picco + push-up 4×10-15. Riposo 90". Dopo pallavolo al venerdì: carichi più leggeri sull\'hip thrust.'
};

// --- SEDUTA B: SLOT 2 ---
export const SUPER_SET_B2: SuperSetPair = {
  id: 'pair_B2',
  code: 'B2',
  title: 'Super serie B2 (Spalle verticali / Squat leggero)',
  targetRounds: 4,
  restBetweenRoundsSec: 90, // 90" dopo military
  primary: {
    variantId: 'military_press',
    label: 'Military press',
    targetSets: 4,
    targetReps: '4×5',
    targetRepsNum: 5,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'goblet_squat_pausa',
    label: 'Goblet squat con pausa (front squat kb, cossack)',
    targetSets: 4,
    targetReps: '4×10',
    targetRepsNum: 10,
    type: 'metabolico'
  },
  notes: 'Military press 4×5 strict (in piedi, glutei e addome serrati, no gambe) + goblet squat con pausa di 2-3" in buca 4×10. Riposo 90".'
};

// --- SEDUTA B: SLOT 3 ---
export const SUPER_SET_B3: SuperSetPair = {
  id: 'pair_B3',
  code: 'B3',
  title: 'Super serie B3 (Trazioni verticali / Carry & Core)',
  targetRounds: 4,
  restBetweenRoundsSec: 75, // 60-75" dopo trazioni
  primary: {
    variantId: 'trazioni_sbarra',
    label: 'Trazioni alla sbarra',
    targetSets: 4,
    targetReps: '4×5',
    targetRepsNum: 5,
    type: 'fondamentale'
  },
  secondary: {
    variantId: 'farmer_walk',
    label: 'Farmer walk (suitcase, rack walk)',
    targetSets: 4,
    targetReps: '4×40 m',
    targetRepsNum: 40,
    type: 'metabolico'
  },
  notes: 'Trazioni 4×5 (se arrivi a 4×8 a corpo libero, usa zavorra). Farmer walk 4×40 m con manubri o KB. Riposo 60-75".'
};

// --- SUPER SERIE BRACCIA (VENERDÌ SENZA PALLAVOLO) ---
export const ARMS_PAIR_1: SuperSetPair = {
  id: 'pair_arms_1',
  code: '1',
  title: 'Super serie Braccia 1 (Bicipiti / Tricipiti)',
  targetRounds: 3,
  restBetweenRoundsSec: 75,
  primary: {
    variantId: 'curl_bilanciere',
    label: 'Curl bilanciere',
    targetSets: 3,
    targetReps: '3×10-12',
    targetRepsNum: 11,
    type: 'braccia'
  },
  secondary: {
    variantId: 'french_press_manubrio',
    label: 'French press con manubrio',
    targetSets: 3,
    targetReps: '3×10-12',
    targetRepsNum: 11,
    type: 'braccia'
  },
  notes: 'Super serie antagoniste, senza cedimento.'
};

export const ARMS_PAIR_2: SuperSetPair = {
  id: 'pair_arms_2',
  code: '2',
  title: 'Super serie Braccia 2 (Bicipiti / Tricipiti)',
  targetRounds: 3,
  restBetweenRoundsSec: 75,
  primary: {
    variantId: 'curl_martello',
    label: 'Curl a martello con manubri',
    targetSets: 3,
    targetReps: '3×10-12',
    targetRepsNum: 11,
    type: 'braccia'
  },
  secondary: {
    variantId: 'dip_panche',
    label: 'Dip tra panche (o push-up stretti)',
    targetSets: 3,
    targetReps: '3×10-12',
    targetRepsNum: 11,
    type: 'braccia'
  },
  notes: 'Niente cedimento: le braccia lavorano già nei fondamentali.'
};

export const ARMS_PAIR_3: SuperSetPair = {
  id: 'pair_arms_3',
  code: '3',
  title: 'Super serie Braccia 3 (Spalle / Avambracci)',
  targetRounds: 3,
  restBetweenRoundsSec: 75,
  primary: {
    variantId: 'alzate_laterali',
    label: 'Alzate laterali',
    targetSets: 3,
    targetReps: '3×12-15',
    targetRepsNum: 13,
    type: 'braccia'
  },
  secondary: {
    variantId: 'curl_inverso',
    label: 'Curl inverso',
    targetSets: 3,
    targetReps: '3×12-15',
    targetRepsNum: 13,
    type: 'braccia'
  },
  notes: 'Focus su isolamento e bruciore controllato, senza oscillare.'
};

// ============================================================================
// SCHEDA SETTIMANALE CANONICA (4 FULL BODY A/B + BRACCIA/CARDIO)
// ============================================================================
export const DEFAULT_WEEKLY_ROUTINES: WorkoutRoutine[] = [
  // 1. LUNEDÌ - SEDUTA A
  {
    id: 'routine_lun_seduta_a',
    dayLabel: 'Lunedì',
    dayKey: 'lun',
    title: 'Seduta A (Full body)',
    subtitle: 'Squat, panca, rematore • Stacco con manubri in slot 2',
    orderCode: 'A1 - A2 - A3 + Finisher opzionale',
    description: 'A1: Back squat (4×5) + Push press (4×10) • A2: Panca piana (4×5) + Stacco con manubri (4×8-10) • A3: Rematore petto poggiato (4×8) + Affondi indietro (4×8-10/lato).',
    superSets: [
      { ...SUPER_SET_A1, id: 'fb_a_lun_pair_A1' },
      { ...SUPER_SET_A2_LUN, id: 'fb_a_lun_pair_A2' },
      { ...SUPER_SET_A3, id: 'fb_a_lun_pair_A3' }
    ],
    metcon: {
      id: 'finisher_seduta_a_amrap6',
      title: 'Finisher opzionale: AMRAP 6\'',
      type: 'amrap',
      durationSec: 360,
      movements: [
        { name: 'Goblet squat', repsOrDist: '10 ripetizioni' },
        { name: 'Push-up', repsOrDist: '8 ripetizioni' },
        { name: 'Sit-up', repsOrDist: '10 ripetizioni' }
      ],
      instructions: 'Solo se i fondamentali di giornata sono stati completati puliti. 10 goblet squat, 8 push-up, 10 sit-up: massimo numero di giri in 6 minuti.'
    },
    rulesNotes: [
      'Ordine Lunedì: A1 - A2 - A3.',
      'Fondamentale: 4×5 (o 4×8 per rematore), margine 1-2 ripetizioni.',
      'Metabolico: subito dopo il fondamentale, poi recupero 90" (60-75" per rematore).',
      'Progressione: chiudi 4×5 puliti -> +2,5 kg la volta successiva.'
    ]
  },

  // 2. MARTEDÌ - SEDUTA B
  {
    id: 'routine_mar_seduta_b',
    dayLabel: 'Martedì',
    dayKey: 'mar',
    title: 'Seduta B (Full body)',
    subtitle: 'Hip thrust, military, trazioni • Ordine standard',
    orderCode: 'B1 - B2 - B3 + Finisher opzionale',
    description: 'B1: Hip thrust (4×6-8) + Push-up (4×10-15) • B2: Military press (4×5) + Goblet squat con pausa (4×10) • B3: Trazioni alla sbarra (4×5) + Farmer walk (4×40 m).',
    superSets: [
      { ...SUPER_SET_B1, id: 'fb_b_mar_pair_B1' },
      { ...SUPER_SET_B2, id: 'fb_b_mar_pair_B2' },
      { ...SUPER_SET_B3, id: 'fb_b_mar_pair_B3' }
    ],
    metcon: {
      id: 'finisher_seduta_b_3rounds_cap8',
      title: 'Finisher opzionale: 3 giri a tempo (cap 8\')',
      type: 'rounds_cap',
      durationSec: 480,
      targetRounds: 3,
      timeCapSec: 480,
      movements: [
        { name: 'Vogatore', repsOrDist: '250 m' },
        { name: 'Knee raise alla sbarra', repsOrDist: '10 ripetizioni' }
      ],
      instructions: 'Solo se le trazioni sono andate bene. 3 giri a tempo (time cap 8 minuti): 250 m di vogatore + 10 knee raise alla sbarra.'
    },
    rulesNotes: [
      'Ordine Martedì: B1 - B2 - B3.',
      'Hip thrust: 4×6-8 con blocco al picco.',
      'Military press: 4×5 strict in piedi.',
      'Trazioni: 4×5 pulite, mento sopra la sbarra.'
    ]
  },

  // 3. MERCOLEDÌ - RIPOSO
  {
    id: 'routine_mer_riposo',
    dayLabel: 'Mercoledì',
    dayKey: 'mer',
    title: 'RIPOSO',
    subtitle: 'Fisso, non si tocca',
    orderCode: 'Recupero completo',
    description: 'Recupero fisiologico e neurale completo. Permette di arrivare freschi alla Seduta A ruotata del Giovedì.',
    isRestDay: true,
    superSets: [],
    rulesNotes: [
      'Fisso, non si tocca: riposo essenziale per supercompensare e preservare il sistema nervoso.',
      'Idratazione, alimentazione proteica e sonno ristoratore.'
    ]
  },

  // 4. GIOVEDÌ - SEDUTA A (ORDINE RUOTATO)
  {
    id: 'routine_gio_seduta_a',
    dayLabel: 'Giovedì',
    dayKey: 'gio',
    title: 'Seduta A (Ordine ruotato)',
    subtitle: 'Rematore, squat, panca • KB swing in slot 2',
    orderCode: 'A3 - A1 - A2 + Finisher opzionale',
    description: 'Rotazione intelligente: A3: Rematore petto poggiato (4×8) + Affondi indietro (4×8-10/lato) [a schiena fresca] • A1: Back squat (4×5) + Push press (4×10) • A2: Panca piana (4×5) + KB swing (4×10-12).',
    superSets: [
      { ...SUPER_SET_A3, id: 'fb_a_gio_pair_A3' },
      { ...SUPER_SET_A1, id: 'fb_a_gio_pair_A1' },
      { ...SUPER_SET_A2_GIO, id: 'fb_a_gio_pair_A2' }
    ],
    metcon: {
      id: 'finisher_seduta_a_gio_amrap6',
      title: 'Finisher opzionale: AMRAP 6\'',
      type: 'amrap',
      durationSec: 360,
      movements: [
        { name: 'Goblet squat', repsOrDist: '10 ripetizioni' },
        { name: 'Push-up', repsOrDist: '8 ripetizioni' },
        { name: 'Sit-up', repsOrDist: '10 ripetizioni' }
      ],
      instructions: 'Solo se i fondamentali di giornata sono stati completati puliti. 10 goblet squat, 8 push-up, 10 sit-up per 6 minuti.'
    },
    rulesNotes: [
      'Ordine Giovedì: A3 - A1 - A2 (parti col rematore, a schiena fresca).',
      'In slot 2: KB swing (2 mani, 1 mano) al posto dello stacco.',
      'Recupero 90" dopo panca e squat; 60-75" dopo il rematore.'
    ]
  },

  // 5. VENERDÌ - PALLAVOLO / BRACCIA + CARDIO
  {
    id: 'routine_ven_braccia_cardio',
    dayLabel: 'Venerdì',
    dayKey: 'ven',
    title: 'Pallavolo / Braccia + cardio',
    subtitle: 'Braccia + cardio solo se non c\'è pallavolo',
    orderCode: 'Pallavolo OPPURE Super serie braccia + Vogatore',
    description: 'Super serie antagoniste per braccia senza arrivare a cedimento + 25-35 min di vogatore costante a ritmo aerobico (base per i 2000 m). Se c\'è pallavolo, la seduta salta e NON si recupera!',
    superSets: [
      { ...ARMS_PAIR_1, id: 'arms_pair_1_ven' },
      { ...ARMS_PAIR_2, id: 'arms_pair_2_ven' },
      { ...ARMS_PAIR_3, id: 'arms_pair_3_ven' }
    ],
    cardio: {
      title: 'Cardio finale: 25-35\' di vogatore a ritmo facile e costante (o Air bike / SkiErg / Tapis)',
      equipment: 'vogatore',
      durationMin: 30,
      description: '25-35 minuti a ritmo facile e costante, non a tutta. Base aerobica per l\'obiettivo sui 2000 m.'
    },
    rulesNotes: [
      'Braccia + cardio solo se non c\'è pallavolo.',
      'Venerdì con pallavolo: questa seduta salta e non si recupera.',
      'Niente cedimento: le braccia lavorano già nei fondamentali (trazioni, panca, military, rematore).'
    ]
  },

  // 6. SABATO - SEDUTA B (ORDINE RUOTATO)
  {
    id: 'routine_sab_seduta_b',
    dayLabel: 'Sabato',
    dayKey: 'sab',
    title: 'Seduta B (Ordine ruotato)',
    subtitle: 'Si apre col military • Hip thrust per ultimo',
    orderCode: 'B2 - B3 - B1 + Finisher opzionale',
    description: 'Ordine ruotato: B2: Military press (4×5) + Goblet squat con pausa (4×10) • B3: Trazioni alla sbarra (4×5) + Farmer walk (4×40 m) • B1: Hip thrust (4×6-8) + Push-up (4×10-15). Dopo pallavolo: carichi più leggeri su hip thrust e goblet!',
    superSets: [
      { ...SUPER_SET_B2, id: 'fb_b_sab_pair_B2' },
      { ...SUPER_SET_B3, id: 'fb_b_sab_pair_B3' },
      { ...SUPER_SET_B1, id: 'fb_b_sab_pair_B1' }
    ],
    metcon: {
      id: 'finisher_seduta_b_sab_3rounds_cap8',
      title: 'Finisher opzionale: 3 giri a tempo (cap 8\')',
      type: 'rounds_cap',
      durationSec: 480,
      targetRounds: 3,
      timeCapSec: 480,
      movements: [
        { name: 'Vogatore', repsOrDist: '250 m' },
        { name: 'Knee raise alla sbarra', repsOrDist: '10 ripetizioni' }
      ],
      instructions: 'Solo se le trazioni sono andate bene. 3 giri a tempo (cap 8 minuti): 250 m di vogatore + 10 knee raise alla sbarra.'
    },
    rulesNotes: [
      'Ordine Sabato: B2 - B3 - B1 (apri col military; hip thrust per ultimo).',
      'REGOLA PALLAVOLO: se hai giocato venerdì, usa carichi più leggeri su hip thrust e goblet squat (-20-25%).',
      'Nel riscaldamento dopo pallavolo: aggiungi 2×10 alzate sul tallone e 2×10 abduzioni d\'anca con elastico.'
    ]
  },

  // 7. DOMENICA - OFF
  {
    id: 'routine_dom_off',
    dayLabel: 'Domenica',
    dayKey: 'dom',
    title: 'Off',
    subtitle: 'Recupero completo',
    orderCode: 'Recupero totale',
    description: 'Recupero completo e ricarica in vista della nuova settimana da Lunedì.',
    isRestDay: true,
    superSets: [],
    rulesNotes: [
      'Recupero completo: sonno, idratazione e pasti regolari.',
      'Se sei arrivato sfinito al sabato, puoi svolgere oggi con calma la Seduta B.'
    ]
  }
];

export const GENERAL_GUIDELINES = {
  rulesOfThumb: [
    {
      title: 'Struttura A/B',
      content: '4 sedute full body da 3 super serie (A/B alternate) + giorno braccia e cardio. Ogni fondamentale due volte a settimana, ciascuno con il suo metabolico.'
    },
    {
      title: 'Come si esegue',
      content: 'Fondamentale (4×5 con 1-2 rip di margine; rematore 4×8, hip thrust 4×6-8) e subito il metabolico (4×10-12). Poi riposo 60-90" (90" dopo squat, panca, military, hip thrust; 60-75" dopo trazioni e rematore).'
    },
    {
      title: 'Gestione Pallavolo (Venerdì & Sabato)',
      content: 'Venerdì con pallavolo: la seduta braccia salta e non si recupera. Sabato dopo pallavolo: si apre col military; hip thrust per ultimo con carichi più leggeri (-20-25%) così come sul goblet squat. Al riscaldamento aggiungi 2×10 alzate sul tallone e 2×10 abduzioni con elastico.'
    },
    {
      title: 'Zona lombare rigida',
      content: 'Se la zona lombare protesta: nello stacco con manubri passa a goblet squat pesante o saltalo. Al riscaldamento fai 2 giri in più di glute bridge e dead bug prima di squat, stacco o swing.'
    },
    {
      title: 'Regole delle varianti',
      content: 'Cambia ogni 3-4 settimane una sola variante nuova per volta. Si cambia l\'esecuzione, non il pattern (fondamentale e rematore restano invariati nelle prime 8 settimane, così i progressi si leggono chiaramente).'
    }
  ],
  progressionRules: [
    {
      group: 'Fondamentali (4×5 / 4×8 / 4×6-8)',
      rule: 'Chiudi tutti i 4×5 puliti (4×8 per rematore, 4×6-8 per hip thrust) -> aggiungi 2,5 kg nella seduta successiva.'
    },
    {
      group: 'Metabolici (4×10-12)',
      rule: 'Chiudi il tetto di ripetizioni con forma solida -> passa al carico successivo o alla variante più dura.'
    },
    {
      group: 'Allarme fatica & scarico',
      rule: 'Se un fondamentale cala di 2 ripetizioni per due sedute di fila: riduci il volume del 30% per una settimana.'
    },
    {
      group: 'Finisher opzionale',
      rule: 'Solo se i fondamentali di giornata sono stati completati puliti (o se le trazioni sono andate bene al Sabato).'
    }
  ]
};

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
    label: 'Push press con manubri leggeri (kb, alternato)',
    targetSets: 4,
    targetReps: '4×15',
    targetRepsNum: 15,
    type: 'metabolico'
  },
  notes: 'Fondamentale 4×5 (margine 1-2 rip) e subito il metabolico 4×15 leggeri (RPE 7-8). Poi riposo 90". Push press leggero con tecnica pulita.'
};

// --- SEDUTA A: SLOT 2 (CANONICO DAL NUOVO PDF: PANCA PIANA + CALF RAISE) ---
export const SUPER_SET_A2: SuperSetPair = {
  id: 'pair_A2',
  code: 'A2',
  title: 'Super serie A2 (Petto / Polpacci)',
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
    variantId: 'calf_raise_manubri',
    label: 'Calf raise con manubri (a una gamba, seduto)',
    targetSets: 4,
    targetReps: '4×15',
    targetRepsNum: 15,
    type: 'metabolico'
  },
  notes: 'Panca piana 4×5 (margine 1-2 rip) e subito calf raise 4×15 con manubri (in piedi, a una gamba o seduto soleo con pausa 2" in alto). Poi riposo 90".'
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
    targetReps: '4×10 per lato',
    targetRepsNum: 10,
    type: 'metabolico'
  },
  notes: 'Rematore petto poggiato o T-bar 4×8 (alternative: pulley seduto. No lat machine: è verticale). Subito affondi indietro con manubri 4×10 per lato. Riposo 60-75".'
};

// --- SEDUTA B: SLOT 1 ---
export const SUPER_SET_B1: SuperSetPair = {
  id: 'pair_B1',
  code: 'B1',
  title: 'Super serie B1 (Spalle verticali / Squat leggero)',
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
    variantId: 'air_squat_fermo',
    label: 'Air squat con fermo in buca di 3-5" (goblet con kb)',
    targetSets: 4,
    targetReps: '4×15',
    targetRepsNum: 15,
    type: 'metabolico'
  },
  notes: 'Military press 4×5 strict in piedi e subito air squat con fermo in buca di 3-5" 4×15 (goblet con kb se facile. Con macchine: mar leg extension, sab leg curl). Poi riposo 90".'
};

// --- SEDUTA B: SLOT 2 ---
export const SUPER_SET_B2: SuperSetPair = {
  id: 'pair_B2',
  code: 'B2',
  title: 'Super serie B2 (Trazioni verticali / Spinta orizzontale)',
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
    variantId: 'push_up',
    label: 'Push-up (piedi rialzati, tempo, zavorrato)',
    targetSets: 4,
    targetReps: '4×15',
    targetRepsNum: 15,
    type: 'metabolico'
  },
  notes: 'Trazioni 4×5 pulite fino al mento sopra la sbarra e subito push-up 4×15 (standard, piedi rialzati, tempo, deficit). Poi riposo 60-75".'
};

// --- SEDUTA B: SLOT 3 ---
export const SUPER_SET_B3: SuperSetPair = {
  id: 'pair_B3',
  code: 'B3',
  title: 'Super serie B3 (Glutei / Trazione orizzontale moderata)',
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
    variantId: 'rematore_manubri_petto',
    label: 'Rematore con manubri, petto poggiato (T-bar, pulley)',
    targetSets: 4,
    targetReps: '4×15',
    targetRepsNum: 15,
    type: 'metabolico'
  },
  notes: 'Hip thrust 4×6-8 con blocco al picco + Rematore con manubri petto poggiato 4×15 (RPE 7). Il martedì esegui il rematore con manubri moderato (giorno dopo il rematore pesante). Poi riposo 90".'
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
// SCHEDA SETTIMANALE CANONICA (4 FULL BODY A/B + METCON CALORIE + BRACCIA/CARDIO)
// ============================================================================
export const DEFAULT_WEEKLY_ROUTINES: WorkoutRoutine[] = [
  // 1. LUNEDÌ - SEDUTA A
  {
    id: 'routine_lun_seduta_a',
    dayLabel: 'Lunedì',
    dayKey: 'lun',
    title: 'Seduta A (Full body)',
    subtitle: 'Squat, panca, rematore • Metcon: Air bike + swing',
    orderCode: 'A1 - A2 - A3',
    description: 'A1: Back squat (4×5) + Push press leggeri (4×15) • A2: Panca piana (4×5) + Calf raise manubri (4×15) • A3: Rematore petto poggiato (4×8) + Affondi indietro (4×10/lato).',
    superSets: [
      { ...SUPER_SET_A1, id: 'fb_a_lun_pair_A1' },
      { ...SUPER_SET_A2, id: 'fb_a_lun_pair_A2' },
      { ...SUPER_SET_A3, id: 'fb_a_lun_pair_A3' }
    ],
    metcon: {
      id: 'metcon_lun_airbike_swing',
      title: 'Metcon finale: Air bike + swing',
      type: 'rounds_cap',
      durationSec: 540,
      targetRounds: 3,
      timeCapSec: 600,
      movements: [
        { name: 'Air bike', repsOrDist: '12 cal', caloriesKcal: 12 },
        { name: 'KB swing', repsOrDist: '15 rip', repsNum: 15 },
        { name: 'V-up', repsOrDist: '10 rip', repsNum: 10 }
      ],
      instructions: '3 giri a tempo (cap 9-10\', RPE 7-8): 12 cal air bike, 15 KB swing, 10 V-up. Se serve tempo, riduci a 2 giri.'
    },
    rulesNotes: [
      'Ordine Lunedì: A1 - A2 - A3.',
      'Fondamentale: 4×5 (o 4×8 per rematore), margine 1-2 ripetizioni.',
      'Metabolico: subito dopo il fondamentale (RPE 7-8), poi recupero 90" (60-75" dopo rematore).',
      'Metcon finale: 3 giri a tempo (cap 9-10\'), cardio a calorie + 2-3 funzionali, RPE 7-8.'
    ]
  },

  // 2. MARTEDÌ - SEDUTA B
  {
    id: 'routine_mar_seduta_b',
    dayLabel: 'Martedì',
    dayKey: 'mar',
    title: 'Seduta B (Full body)',
    subtitle: 'Military, trazioni, hip thrust • Metcon: Rower + carry',
    orderCode: 'B1 - B2 - B3',
    description: 'B1: Military press (4×5) + Air squat con fermo 3-5" (4×15) • B2: Trazioni alla sbarra (4×5) + Push-up (4×15) • B3: Hip thrust (4×6-8) + Rematore con manubri moderato (4×15).',
    superSets: [
      { ...SUPER_SET_B1, id: 'fb_b_mar_pair_B1' },
      { ...SUPER_SET_B2, id: 'fb_b_mar_pair_B2' },
      { ...SUPER_SET_B3, id: 'fb_b_mar_pair_B3' }
    ],
    metcon: {
      id: 'metcon_mar_rower_carry',
      title: 'Metcon finale: Rower + carry',
      type: 'rounds_cap',
      durationSec: 540,
      targetRounds: 3,
      timeCapSec: 600,
      movements: [
        { name: 'Vogatore (RowErg)', repsOrDist: '12-15 cal', caloriesKcal: 14 },
        { name: 'Farmer walk con manubri', repsOrDist: '40 m', distanceMeters: 40 },
        { name: 'Sit-up a terra', repsOrDist: '10 rip', repsNum: 10 }
      ],
      instructions: '3 giri a tempo (cap 9-10\', RPE 7-8): 12-15 cal rower, 40 m farmer walk, 10 sit-up. Rematore a manubri del martedì moderato (giorno dopo il rematore pesante).'
    },
    rulesNotes: [
      'Ordine Martedì: B1 - B2 - B3.',
      'Military press: 4×5 strict in piedi, no gambe.',
      'Air squat: fermo di 3-5" in buca (con le macchine: martedì leg extension).',
      'Rematore con manubri petto poggiato: carico moderato a RPE 7, il giorno dopo il rematore pesante.'
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
    subtitle: 'Rematore, squat, panca • Metcon: Ski erg + stacco',
    orderCode: 'A3 - A1 - A2',
    description: 'Ordine ruotato: A3: Rematore petto poggiato (4×8) + Affondi indietro (4×10/lato) [a schiena fresca] • A1: Back squat (4×5) + Push press leggeri (4×15) • A2: Panca piana (4×5) + Calf raise manubri (4×15).',
    superSets: [
      { ...SUPER_SET_A3, id: 'fb_a_gio_pair_A3' },
      { ...SUPER_SET_A1, id: 'fb_a_gio_pair_A1' },
      { ...SUPER_SET_A2, id: 'fb_a_gio_pair_A2' }
    ],
    metcon: {
      id: 'metcon_gio_skierg_stacco',
      title: 'Metcon finale: Ski erg + stacco con manubri',
      type: 'rounds_cap',
      durationSec: 540,
      targetRounds: 3,
      timeCapSec: 600,
      movements: [
        { name: 'SkiErg Concept2', repsOrDist: '10 cal', caloriesKcal: 10 },
        { name: 'Stacco con manubri (moderati, schiena neutra)', repsOrDist: '10 rip', repsNum: 10 },
        { name: 'Farmer walk con manubri', repsOrDist: '40 m', distanceMeters: 40 }
      ],
      instructions: '3 giri a tempo (cap 9-10\', RPE 7-8): 10 cal ski erg, 10 stacco con manubri (carico moderato, schiena rigorosamente neutra), 40 m farmer walk.'
    },
    rulesNotes: [
      'Ordine Giovedì: A3 - A1 - A2 (parti col rematore, a schiena fresca).',
      'Rematore 4×8: alternativa T-bar o pulley seduto (no lat machine).',
      'Recupero 90" dopo squat e panca; 60-75" dopo il rematore.',
      'Cerniere (stacco con manubri e swing): previste solo nei metcon di lunedì e giovedì; mai dopo pallavolo.'
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
    description: 'Super serie antagoniste per braccia senza cedimento + 25-35\' di vogatore costante a ritmo facile aerobico (base per i 2000 m). Se c\'è pallavolo, la seduta salta e NON si recupera!',
    superSets: [
      { ...ARMS_PAIR_1, id: 'arms_pair_1_ven' },
      { ...ARMS_PAIR_2, id: 'arms_pair_2_ven' },
      { ...ARMS_PAIR_3, id: 'arms_pair_3_ven' }
    ],
    cardio: {
      title: 'Cardio finale: 25-35\' di vogatore a ritmo facile e costante',
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
    subtitle: 'Apri con le trazioni • Hip thrust per ultimo',
    orderCode: 'B2 - B1 - B3',
    description: 'Ordine ruotato: B2: Trazioni alla sbarra (4×5) + Push-up (4×15) • B1: Military press (4×5) + Air squat con fermo / leg curl (4×15) • B3: Hip thrust (4×6-8) + Rematore con manubri (4×15). Dopo pallavolo: carichi più leggeri sull\'hip thrust!',
    superSets: [
      { ...SUPER_SET_B2, id: 'fb_b_sab_pair_B2' },
      { ...SUPER_SET_B1, id: 'fb_b_sab_pair_B1' },
      { ...SUPER_SET_B3, id: 'fb_b_sab_pair_B3' }
    ],
    metcon: {
      id: 'metcon_sab_tapis_salita',
      title: 'Metcon finale: Tapis in salita, low impact (dopo pallavolo)',
      type: 'rounds_cap',
      durationSec: 540,
      targetRounds: 3,
      timeCapSec: 600,
      movements: [
        { name: 'Tapis in salita a camminata (o air bike facile)', repsOrDist: '10 cal', caloriesKcal: 10 },
        { name: 'Farmer walk con manubri', repsOrDist: '40 m', distanceMeters: 40 },
        { name: 'Knee raise alla sbarra', repsOrDist: '10 rip', repsNum: 10 }
      ],
      instructions: '3 giri a tempo (cap 9-10\', RPE 7-8): 10 cal tapis in salita a camminata (o air bike facile), 40 m farmer walk, 10 knee raise alla sbarra. Niente cerniere né impatto.'
    },
    rulesNotes: [
      'Ordine Sabato: B2 - B1 - B3 (apri con le trazioni; hip thrust per ultimo, più leggero se vieni da pallavolo).',
      'REGOLA PALLAVOLO: se hai giocato venerdì, usa carichi più leggeri su hip thrust e air squat (-20-25%). Con le macchine usa il leg curl (nessun impatto).',
      'Nel riscaldamento dopo pallavolo: aggiungi 2×10 abduzioni d\'anca con elastico e 2×10 alzate sul tallone.',
      'Metcon post-pallavolo a basso impatto: camminata in salita (o air bike), niente salti o cerniere pesanti.'
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
      title: 'Struttura A/B & Volume',
      content: '4 sedute full body da 3 super serie (A/B alternate), metcon con cardio a calorie e giorno braccia + cardio. Ogni fondamentale due volte a settimana. Volume settimanale: spinta 32 serie, trazione 24 (rapporto 4:3).'
    },
    {
      title: 'Come si esegue la super serie',
      content: 'Fondamentale e subito il metabolico, poi riposo. Margine di 1-2 ripetizioni sul fondamentale, RPE 7-8 sul metabolico. Riposo 60-90": 90" dopo squat, panca, military e hip thrust; 60-75" dopo rematore e trazioni. Durata stimata: ~60\' a seduta, metcon incluso. Se serve tempo, riduci il metcon a 2 giri.'
    },
    {
      title: 'Gestione Pallavolo (Venerdì & Sabato)',
      content: 'Venerdì con pallavolo: la seduta braccia salta e non si recupera. Se le sedute di pesi non tengono, salta anche questa. Sabato dopo pallavolo: apri con le trazioni (B2 - B1 - B3); hip thrust per ultimo con carichi più leggeri. Al riscaldamento aggiungi 2×10 abduzioni con elastico e 2×10 alzate sul tallone.'
    },
    {
      title: 'Zona lombare rigida',
      content: 'Se la zona lombare è rigida: 2 giri in più di glute bridge e dead bug prima di squat, hip thrust o swing. Nello stacco con manubri passa a goblet squat pesante o saltalo.'
    },
    {
      title: 'Regole delle varianti (Pagina 5 PDF)',
      content: 'Cambia ogni 3-4 settimane una sola variante nuova per volta (si cambia l\'esecuzione, non il pattern). Fondamentali e rematore (petto poggiato o T-bar) non cambiano nelle prime 8 settimane. Cerniere (swing, stacco) solo nei metcon di lunedì e giovedì; mai dopo pallavolo. Leg extension e leg curl: mai nella stessa seduta, e leg curl mai abbinato all\'hip thrust.'
    }
  ],
  progressionRules: [
    {
      group: 'Fondamentali (4×5 / 4×8 / 4×6-8)',
      rule: 'Chiudi tutti i 4×5 puliti con 1-2 rip di margine (rematore 4×8 e hip thrust 4×6-8: stessa regola sul tetto) -> aggiungi 2,5 kg nella seduta successiva.'
    },
    {
      group: 'Metabolici (4×15 / 4×10 per lato)',
      rule: 'Chiudi 15 ripetizioni facili -> passa al carico successivo o alla variante più dura.'
    },
    {
      group: 'Allarme fatica & scarico',
      rule: 'Se un fondamentale cala di 2 ripetizioni per due sedute di fila: riduci il volume del 30% per una settimana.'
    },
    {
      group: 'Metcon finale (3 giri a tempo, cap 9-10\', RPE 7-8)',
      rule: 'Cardio a calorie (10-15 cal) + 2-3 funzionali. Se serve tempo o sei affaticato, riduci a 2 giri.'
    }
  ]
};

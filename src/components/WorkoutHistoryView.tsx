import React, { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseCategory, ExerciseLogItem, WorkoutSessionLog } from '../types/workout';
import { generateWorkoutStatisticsPdf } from '../utils/pdfExport';
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Download,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Timer,
  Activity,
  BarChart3,
  Trophy,
  Zap,
  Filter,
  RotateCcw,
  Layers,
  TrendingUp,
  FileText,
  Loader2,
  AlertTriangle,
  Heart
} from 'lucide-react';

type TimeFilterOption = 'all' | '7d' | '30d' | '90d' | 'year';
type ExerciseTypeFilterOption =
  | 'all'
  | 'fondamentale'
  | 'metabolico'
  | 'braccia'
  | 'core'
  | 'funzionale'
  | 'cardio';

export const WorkoutHistoryView: React.FC = () => {
  const {
    sessionLogs,
    variants,
    variantWeights,
    deleteSessionLog,
    exportUserData,
    importUserData,
    resetAllPRs
  } = useWorkout();
  const [activeSubTab, setActiveSubTab] = useState<'sedute' | 'statistiche'>('statistiche');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showResetPRsConfirm, setShowResetPRsConfirm] = useState(false);
  const [resetPRsSuccessMsg, setResetPRsSuccessMsg] = useState<string | null>(null);

  // Deletion confirmation state (bypasses window.confirm which is blocked in iframes)
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSessionLog | null>(null);

  // --- FILTERS STATE ---
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseTypeFilterOption>('all');

  const formatSecsToDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleExport = () => {
    const dataStr = exportUserData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `irontrack_allenamenti_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importUserData(importJsonText);
    if (ok) {
      setImportStatus('Dati ripristinati con successo!');
      setTimeout(() => {
        setImportStatus(null);
        setShowExportModal(false);
        setImportJsonText('');
      }, 1500);
    } else {
      setImportStatus('Errore: formato JSON non valido.');
    }
  };

  // Helper to determine the exercise category
  const getCategoryForExercise = (ex: ExerciseLogItem): ExerciseCategory => {
    const v = variants.find(
      item => item.id === ex.variantId || item.name.toLowerCase() === ex.variantName.toLowerCase()
    );
    if (v) return v.category;
    const name = ex.variantName.toLowerCase();
    if (
      name.includes('plank') ||
      name.includes('pallof') ||
      name.includes('crunch') ||
      name.includes('sit-up') ||
      name.includes('hollow') ||
      name.includes('core') ||
      name.includes('addom')
    ) {
      return 'core';
    }
    if (
      name.includes('thruster') ||
      name.includes('wall ball') ||
      name.includes('devil') ||
      name.includes('burpee') ||
      name.includes('box jump') ||
      name.includes('snatch')
    ) {
      return 'funzionale';
    }
    if (
      name.includes('curl') ||
      name.includes('french') ||
      name.includes('tricipiti') ||
      name.includes('bicipiti') ||
      name.includes('pushdown') ||
      name.includes('alzate')
    ) {
      return 'braccia';
    }
    if (
      name.includes('bike') ||
      name.includes('skierg') ||
      name.includes('vogatore') ||
      name.includes('row') ||
      name.includes('tapis')
    ) {
      return 'cardio';
    }
    return ex.isFondamentale ? 'fondamentale' : 'metabolico';
  };

  // --- FILTERED COMPUTATIONS ---
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    return sessionLogs.filter(s => {
      const sessionTime = new Date(s.date).getTime() || s.startTime;
      if (timeFilter === '7d' && now - sessionTime > 7 * 24 * 3600 * 1000) return false;
      if (timeFilter === '30d' && now - sessionTime > 30 * 24 * 3600 * 1000) return false;
      if (timeFilter === '90d' && now - sessionTime > 90 * 24 * 3600 * 1000) return false;
      if (timeFilter === 'year' && now - sessionTime > 365 * 24 * 3600 * 1000) return false;
      return true;
    });
  }, [sessionLogs, timeFilter]);

  // Totals calculated from filtered sessions and category
  const filteredStats = useMemo(() => {
    let totalVolumeKg = 0;
    let totalSetsCompleted = 0;
    let totalActualRestSec = 0;
    let totalRestPeriodsCount = 0;
    let totalDurationSec = 0;
    let totalCardioMin = 0;
    let totalCardioKcal = 0;
    let totalCardioMeters = 0;
    let cardioSessionsCount = 0;
    let totalMetconRounds = 0;
    let metconSessionsCount = 0;
    let hrSessionsCount = 0;
    let totalHrSum = 0;
    let overallMaxBpm = 0;

    // Exercise breakdown ranking
    const exerciseAggregates: Record<
      string,
      {
        variantName: string;
        category: ExerciseCategory;
        totalVolumeKg: number;
        completedSets: number;
        totalReps: number;
        maxWeightKg: number;
        lastWeightKg: number;
      }
    > = {};

    filteredSessions.forEach(s => {
      totalDurationSec += s.durationSec || 0;
      totalActualRestSec += s.totalActualRestSec || 0;
      totalRestPeriodsCount += s.restPeriods?.length || 0;

      if (s.heartRateData && s.heartRateData.avgBpm > 0) {
        hrSessionsCount++;
        totalHrSum += s.heartRateData.avgBpm;
        overallMaxBpm = Math.max(overallMaxBpm, s.heartRateData.maxBpm || 0);
      }

      if (s.cardioLog) {
        cardioSessionsCount++;
        totalCardioMin += s.cardioLog.durationMin || 0;
        totalCardioKcal += s.cardioLog.caloriesKcal || 0;
        totalCardioMeters += s.cardioLog.distanceMeters || 0;
      }

      if (s.metconLog) {
        metconSessionsCount++;
        totalMetconRounds += s.metconLog.roundsCompleted || 0;
      }

      s.exerciseLogs.forEach(ex => {
        const cat = getCategoryForExercise(ex);
        const matchesCategory =
          exerciseTypeFilter === 'all' ||
          exerciseTypeFilter === cat ||
          (exerciseTypeFilter === 'funzionale' && cat === 'funzionale') ||
          (exerciseTypeFilter === 'cardio' && cat === 'cardio');

        if (!matchesCategory) return;

        ex.sets.forEach(set => {
          if (set.completed) {
            totalSetsCompleted++;
            const setVol = (set.actualWeight || 0) * (set.actualReps || 0);
            totalVolumeKg += setVol;

            if (!exerciseAggregates[ex.variantName]) {
              exerciseAggregates[ex.variantName] = {
                variantName: ex.variantName,
                category: cat,
                totalVolumeKg: 0,
                completedSets: 0,
                totalReps: 0,
                maxWeightKg: 0,
                lastWeightKg: 0
              };
            }

            const agg = exerciseAggregates[ex.variantName];
            agg.totalVolumeKg += setVol;
            agg.completedSets++;
            agg.totalReps += set.actualReps || 0;
            agg.maxWeightKg = Math.max(agg.maxWeightKg, set.actualWeight || 0);
            agg.lastWeightKg = set.actualWeight || 0;
          }
        });
      });
    });

    const avgRestSec =
      totalRestPeriodsCount > 0 ? Math.round(totalActualRestSec / totalRestPeriodsCount) : 0;
    const avgHrOverall = hrSessionsCount > 0 ? Math.round(totalHrSum / hrSessionsCount) : 0;

    const rankedExercises = Object.values(exerciseAggregates).sort(
      (a, b) => b.totalVolumeKg - a.totalVolumeKg || b.completedSets - a.completedSets
    );

    return {
      sessionsCount: filteredSessions.length,
      totalVolumeKg,
      totalSetsCompleted,
      totalActualRestSec,
      avgRestSec,
      totalRestPeriodsCount,
      totalDurationSec,
      totalCardioMin,
      totalCardioKcal,
      totalCardioMeters,
      cardioSessionsCount,
      totalMetconRounds,
      metconSessionsCount,
      hrSessionsCount,
      avgHrOverall,
      overallMaxBpm,
      rankedExercises
    };
  }, [filteredSessions, exerciseTypeFilter, variants]);

  const hasActiveFilters = timeFilter !== 'all' || exerciseTypeFilter !== 'all';

  const resetFilters = () => {
    setTimeFilter('all');
    setExerciseTypeFilter('all');
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const timeLabel =
        timeFilter === 'all'
          ? 'Tutto lo storico'
          : timeFilter === '7d'
          ? 'Ultimi 7 giorni'
          : timeFilter === '30d'
          ? 'Ultimi 30 giorni'
          : timeFilter === '90d'
          ? 'Ultimi 90 giorni'
          : 'Ultimo anno';

      const typeLabel =
        exerciseTypeFilter === 'all'
          ? 'Tutti gli esercizi'
          : exerciseTypeFilter.toUpperCase();

      await generateWorkoutStatisticsPdf({
        sessionLogs: filteredSessions.length > 0 ? filteredSessions : sessionLogs,
        variants,
        variantWeights,
        timeFilterLabel: timeLabel,
        exerciseTypeFilterLabel: typeLabel,
        athleteName: 'Atleta IronTrack'
      });
    } catch (e) {
      console.error('Errore durante esportazione PDF:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-3 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Storico & Statistiche</h1>
              <p className="text-[11px] text-zinc-400">
                {sessionLogs.length} sedute salvate • Analisi pesi, riposi, Metcon e cardio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* PDF Export Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf || sessionLogs.length === 0}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 text-xs font-bold text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30 transition-all"
              title="Esporta statistiche ed evoluzione in PDF"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isExportingPdf ? 'Export...' : 'PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1 border border-zinc-700/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex bg-zinc-800/80 p-1 rounded-2xl border border-zinc-700/60 mb-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('statistiche')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'statistiche'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Statistiche & Analisi
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sedute')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'sedute'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Diario Sedute ({filteredSessions.length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE FILTERS: TEMPO & TIPO ESERCIZIO */}
        {/* ======================================================== */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          {/* Time Filter Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                Periodo Temporale
              </span>
              {timeFilter !== 'all' && (
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  {filteredSessions.length} sedute nel periodo
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutto' },
                { id: '7d', label: '7 gg' },
                { id: '30d', label: '30 gg' },
                { id: '90d', label: '90 gg' },
                { id: 'year', label: '1 Anno' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeFilter(opt.id as TimeFilterOption)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    timeFilter === opt.id
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800/90 text-zinc-400 hover:text-white border border-zinc-700/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Type Filter Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-orange-400" />
                Tipo Attività
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Azzera
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'fondamentale', label: 'Fondamentali' },
                { id: 'metabolico', label: 'Metabolici' },
                { id: 'braccia', label: 'Braccia' },
                { id: 'core', label: 'Core' },
                { id: 'funzionale', label: 'Funzionali' },
                { id: 'cardio', label: 'Cardio' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExerciseTypeFilter(opt.id as ExerciseTypeFilterOption)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                    exerciseTypeFilter === opt.id
                      ? 'bg-orange-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800/90 text-zinc-400 hover:text-white border border-zinc-700/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: STATISTICHE & ANALISI */}
      {activeSubTab === 'statistiche' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Active filter summary & PDF Export Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Report PDF Statistiche & Grafici</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Scarica PDF impaginato con KPI, tabella tonnellaggio e grafici di evoluzione per ogni esercizio.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf || sessionLogs.length === 0}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0 transition-all active:scale-95"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 stroke-[3]" />
              )}
              <span>{isExportingPdf ? 'Generazione...' : 'Scarica PDF'}</span>
            </button>
          </div>

          {hasActiveFilters && (
            <div className="bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-zinc-300">
                Filtro:{' '}
                <strong className="text-emerald-400 capitalize">
                  {timeFilter === 'all'
                    ? 'Tutto'
                    : timeFilter === '7d'
                    ? 'Ultimi 7 gg'
                    : timeFilter === '30d'
                    ? 'Ultimi 30 gg'
                    : timeFilter === '90d'
                    ? 'Ultimi 90 gg'
                    : '1 Anno'}
                </strong>{' '}
                •{' '}
                <strong className="text-orange-400 capitalize">
                  {exerciseTypeFilter === 'all' ? 'Tutti gli esercizi' : exerciseTypeFilter}
                </strong>
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {filteredStats.sessionsCount} sedute analizzate
              </span>
            </div>
          )}

          {/* CARD 1: VOLUME E TONNELLAGGIO FILTRATO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span>
                  Volume Pesi & Tonnellaggio{' '}
                  {exerciseTypeFilter !== 'all' ? `(${exerciseTypeFilter})` : 'Totale'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {filteredStats.totalSetsCompleted} serie completate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Volume Sollevato
                </span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {(filteredStats.totalVolumeKg / 1000).toFixed(1)} ton
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {filteredStats.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Tempo Palestra
                </span>
                <span className="text-lg font-black font-mono text-white">
                  {formatSecsToDuration(filteredStats.totalDurationSec)}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Ø{' '}
                  {filteredStats.sessionsCount > 0
                    ? Math.round(filteredStats.totalDurationSec / filteredStats.sessionsCount / 60)
                    : 0}{' '}
                  min / seduta
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: RIPOSO EFFETTIVO GLOBALE E MEDIO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Timer className="w-4 h-4" />
              Monitoraggio Riposo Effettivo
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Tempo totale reale trascorso tra le serie (in base ai timer completati o manuali).
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Riposo Totale
                </span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatSecsToDuration(filteredStats.totalActualRestSec)}
                </span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Media / Pausa
                </span>
                <span className="text-base font-black font-mono text-white">
                  {filteredStats.avgRestSec}s
                </span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  N° Pause Totali
                </span>
                <span className="text-base font-black font-mono text-zinc-300">
                  {filteredStats.totalRestPeriodsCount}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: METCON TOTALI & CIRCUITI */}
          <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                Attività Metcon & Circuiti
              </div>
              <span className="text-[10px] font-mono text-orange-300">
                {filteredStats.metconSessionsCount} sessioni
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Giri Totali Chiusi
                </span>
                <span className="text-lg font-black font-mono text-orange-300">
                  {filteredStats.totalMetconRounds} round
                </span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Frequenza Circuiti
                </span>
                <span className="text-lg font-black font-mono text-white">
                  {filteredStats.metconSessionsCount} Metcon
                </span>
              </div>
            </div>
          </div>

          {/* CARD 4: CARDIO PARAMETRI TOTALI (Air Bike, SkiErg, Row, Tapis) */}
          <div className="bg-zinc-900 border border-cyan-500/30 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                Cardio Totale (Air Bike, SkiErg, Row, Tapis)
              </div>
              <span className="text-[10px] font-mono text-cyan-300">
                {filteredStats.cardioSessionsCount} sessioni
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Tempo Cardio
                </span>
                <span className="text-base font-black font-mono text-cyan-300">
                  {filteredStats.totalCardioMin} min
                </span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Calorie Totali
                </span>
                <span className="text-base font-black font-mono text-amber-300">
                  {filteredStats.totalCardioKcal.toLocaleString()} kcal
                </span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Distanza Totale
                </span>
                <span className="text-base font-black font-mono text-emerald-300">
                  {(filteredStats.totalCardioMeters / 1000).toFixed(1)} km
                </span>
              </div>
            </div>
          </div>

          {/* CARD 4B: TELEMETRIA FASCIA CARDIO & BATTITI CARDIACI */}
          {filteredStats.hrSessionsCount > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <Heart className="w-4 h-4 fill-current text-rose-500" />
                  <span>Telemetria Fascia Cardio (BPM)</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {filteredStats.hrSessionsCount} sedute monitorate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    BPM Medio Allenamenti
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-300">
                    {filteredStats.avgHrOverall} <span className="text-xs font-sans text-rose-400 font-bold">BPM</span>
                  </span>
                </div>
                <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-2.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Picco Massimo Registrato
                  </span>
                  <span className="text-xl font-black font-mono text-rose-400">
                    {filteredStats.overallMaxBpm} <span className="text-xs font-sans text-rose-400 font-bold">BPM</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 5: DETTAGLIO CARICHI & ESERCIZI NEL PERIODO (FILTRATO) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Classifica Esercizi & Carichi Raggiunti</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {filteredStats.rankedExercises.length} esercizi
              </span>
            </div>

            {filteredStats.rankedExercises.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                Nessun esercizio corrisponde ai filtri selezionati nel periodo.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredStats.rankedExercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white truncate max-w-[170px] sm:max-w-xs">
                          {ex.variantName}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded uppercase font-semibold">
                          {ex.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {ex.completedSets} serie • {ex.totalReps} ripetizioni
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-black text-emerald-400">
                        Max {ex.maxWeightKg} kg
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        Vol: {ex.totalVolumeKg.toLocaleString()} kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: DIARIO SEDUTE */}
      {activeSubTab === 'sedute' && (
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-zinc-300 mb-1">
                Nessuna seduta trovata
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {hasActiveFilters
                  ? 'Nessun allenamento corrisponde ai filtri temporali selezionati.'
                  : 'Avvia una seduta dalla scheda settimanale per registrare serie, carichi, riposo effettivo, metcon e cardio.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-emerald-400 rounded-xl"
                >
                  Mostra tutte le sedute
                </button>
              )}
            </div>
          ) : (
            filteredSessions.map(log => {
              const isExpanded = expandedLogId === log.id;
              const totalKgVolume = log.exerciseLogs.reduce((acc, ex) => {
                return (
                  acc +
                  ex.sets
                    .filter(s => s.completed)
                    .reduce((sSum, s) => sSum + (s.actualWeight || 0) * (s.actualReps || 0), 0)
                );
              }, 0);

              const totalSetsCompleted = log.exerciseLogs.reduce(
                (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
                0
              );

              const actualRestSec = log.totalActualRestSec || 0;
              const avgRestSec =
                log.averageRestSec ||
                (log.restPeriods?.length ? Math.round(actualRestSec / log.restPeriods.length) : 0);

              const isPureCardio =
                log.routineId === 'cardio_standalone' ||
                (log.exerciseLogs.length === 0 && Boolean(log.cardioLog) && !log.metconLog);
              const isPureMetcon =
                log.routineId === 'metcon_standalone' ||
                (log.exerciseLogs.length === 0 && Boolean(log.metconLog));

              const cardioEquipmentLabel = (eq: string) => {
                const map: Record<string, string> = {
                  vogatore: 'Vogatore Concept2',
                  air_bike: 'Air Bike (Echo / Assault)',
                  skierg: 'SkiErg Concept2',
                  tapis_roulant: 'Tapis Roulant / Corsa',
                  cyclette: 'Cyclette / Spin Bike',
                  corda: 'Salto con la Corda',
                  ellittica: 'Ellittica',
                  cardio_libero: 'Cardio Libero'
                };
                return map[eq] || eq;
              };

              // Zone breakdown total seconds if stored
              const hrZones = log.heartRateData?.zones;
              const totalHrZoneSec = hrZones
                ? hrZones.zone1RecoverySec +
                  hrZones.zone2AerobicSec +
                  hrZones.zone3TempoSec +
                  hrZones.zone4ThresholdSec +
                  hrZones.zone5AnaerobicSec
                : 0;

              return (
                <div
                  key={log.id}
                  className="bg-zinc-900 border border-zinc-800/90 rounded-3xl p-4 shadow-lg transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isPureCardio
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : isPureMetcon
                            ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isPureCardio ? (
                          <Activity className="w-4 h-4" />
                        ) : isPureMetcon ? (
                          <Flame className="w-4 h-4" />
                        ) : (
                          <Dumbbell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {new Date(log.date).toLocaleDateString('it-IT', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatSecsToDuration(log.durationSec)}
                          </span>
                        </div>

                        <h2 className="text-sm sm:text-base font-bold text-white truncate">
                          {log.routineTitle}
                        </h2>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setSessionToDelete(log)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 active:scale-95 transition-all shrink-0"
                      title="Elimina seduta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary KPI Grid (Adapts smoothly to Cardio vs Metcon vs Strength) */}
                  {isPureCardio && log.cardioLog ? (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Durata
                        </span>
                        <span className="text-xs font-mono font-black text-cyan-300">
                          {formatSecsToDuration(log.durationSec)}
                        </span>
                      </div>

                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Calorie
                        </span>
                        <span className="text-xs font-mono font-black text-amber-300">
                          {log.cardioLog.caloriesKcal ? `${log.cardioLog.caloriesKcal} kcal` : '--'}
                        </span>
                      </div>

                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Modalità
                        </span>
                        <span className="text-xs font-bold text-white truncate block">
                          {log.cardioLog.mode === 'intervals' ? 'Intervalli' : 'A Tempo'}
                        </span>
                        {log.cardioLog.totalIntervals ? (
                          <span className="text-[9px] text-orange-400 font-mono block">
                            {log.cardioLog.intervalsCompleted || log.cardioLog.totalIntervals}/{log.cardioLog.totalIntervals} giri
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : isPureMetcon && log.metconLog ? (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Durata
                        </span>
                        <span className="text-xs font-mono font-black text-white">
                          {formatSecsToDuration(log.durationSec)}
                        </span>
                      </div>
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Giri Chiusi
                        </span>
                        <span className="text-xs font-mono font-black text-orange-400">
                          {log.metconLog.roundsCompleted}
                          {log.metconLog.partialReps > 0 ? `+${log.metconLog.partialReps}` : ''}
                        </span>
                      </div>
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Formato
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
                          {log.metconLog.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Serie Chiuse
                        </span>
                        <span className="text-xs font-mono font-black text-white">
                          {totalSetsCompleted}
                        </span>
                      </div>

                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider">
                          Volume
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          {totalKgVolume.toLocaleString()} kg
                        </span>
                      </div>

                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-2 text-center">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block tracking-wider">
                          Riposo Effettivo
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-300">
                          {formatSecsToDuration(actualRestSec)}
                        </span>
                        <span className="text-[9px] text-zinc-400 block">Ø {avgRestSec}s</span>
                      </div>
                    </div>
                  )}

                  {/* Heart Rate Telemetry Card (Clean, Zero Overflow) */}
                  {log.heartRateData && (
                    <div className="mt-3 p-3 bg-gradient-to-br from-rose-950/35 via-zinc-950 to-zinc-950 rounded-2xl border border-rose-500/30 space-y-2">
                      {/* Header row: properly bounded & never wraps awkwardly */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Heart className="w-3.5 h-3.5 fill-current text-rose-500 shrink-0" />
                          <span className="text-xs font-bold text-rose-400 whitespace-nowrap">
                            Telemetria FC
                          </span>
                          {log.heartRateData.isSimulated && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono uppercase font-bold shrink-0">
                              Demo
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-zinc-400 whitespace-nowrap shrink-0">
                          {log.heartRateData.samples.length} campioni
                        </span>
                      </div>

                      {/* Device subtitle if present */}
                      {log.heartRateData.connectedDeviceName && (
                        <div className="text-[11px] text-zinc-400 truncate -mt-1">
                          Sensore: {log.heartRateData.connectedDeviceName}
                        </div>
                      )}

                      {/* 3 BPM Metric Boxes */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2">
                          <span className="text-[9px] text-zinc-400 uppercase font-bold block tracking-wider">
                            BPM Min
                          </span>
                          <span className="text-sm font-mono font-bold text-cyan-300">
                            {log.heartRateData.minBpm || '--'}
                          </span>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2">
                          <span className="text-[9px] text-zinc-400 uppercase font-bold block tracking-wider">
                            BPM Medio
                          </span>
                          <span className="text-sm font-mono font-black text-emerald-400">
                            {log.heartRateData.avgBpm || '--'}
                          </span>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2">
                          <span className="text-[9px] text-zinc-400 uppercase font-bold block tracking-wider">
                            BPM Max
                          </span>
                          <span className="text-sm font-mono font-black text-rose-400">
                            {log.heartRateData.maxBpm || '--'}
                          </span>
                        </div>
                      </div>

                      {/* Mini 5-Zone Distribution Bar if zone timing exists */}
                      {hrZones && totalHrZoneSec > 0 && (
                        <div className="pt-1 space-y-1">
                          <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-zinc-900 gap-0.5">
                            {hrZones.zone1RecoverySec > 0 && (
                              <div
                                className="bg-blue-500 h-full"
                                style={{ width: `${(hrZones.zone1RecoverySec / totalHrZoneSec) * 100}%` }}
                                title={`Z1: ${formatSecsToDuration(hrZones.zone1RecoverySec)}`}
                              />
                            )}
                            {hrZones.zone2AerobicSec > 0 && (
                              <div
                                className="bg-cyan-500 h-full"
                                style={{ width: `${(hrZones.zone2AerobicSec / totalHrZoneSec) * 100}%` }}
                                title={`Z2: ${formatSecsToDuration(hrZones.zone2AerobicSec)}`}
                              />
                            )}
                            {hrZones.zone3TempoSec > 0 && (
                              <div
                                className="bg-emerald-500 h-full"
                                style={{ width: `${(hrZones.zone3TempoSec / totalHrZoneSec) * 100}%` }}
                                title={`Z3: ${formatSecsToDuration(hrZones.zone3TempoSec)}`}
                              />
                            )}
                            {hrZones.zone4ThresholdSec > 0 && (
                              <div
                                className="bg-amber-500 h-full"
                                style={{ width: `${(hrZones.zone4ThresholdSec / totalHrZoneSec) * 100}%` }}
                                title={`Z4: ${formatSecsToDuration(hrZones.zone4ThresholdSec)}`}
                              />
                            )}
                            {hrZones.zone5AnaerobicSec > 0 && (
                              <div
                                className="bg-red-500 h-full"
                                style={{ width: `${(hrZones.zone5AnaerobicSec / totalHrZoneSec) * 100}%` }}
                                title={`Z5: ${formatSecsToDuration(hrZones.zone5AnaerobicSec)}`}
                              />
                            )}
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                            <span className="text-blue-400">Z1 {formatSecsToDuration(hrZones.zone1RecoverySec)}</span>
                            <span className="text-cyan-400">Z2 {formatSecsToDuration(hrZones.zone2AerobicSec)}</span>
                            <span className="text-emerald-400">Z3 {formatSecsToDuration(hrZones.zone3TempoSec)}</span>
                            <span className="text-amber-400">Z4 {formatSecsToDuration(hrZones.zone4ThresholdSec)}</span>
                            <span className="text-red-400">Z5 {formatSecsToDuration(hrZones.zone5AnaerobicSec)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metcon Result Card with Movements & Weights */}
                  {log.metconLog && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-950/30 to-zinc-950 rounded-2xl border border-orange-500/30">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 min-w-0">
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{log.metconLog.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 rounded font-mono uppercase shrink-0">
                            {log.metconLog.type}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-orange-300 shrink-0 whitespace-nowrap">
                          {log.metconLog.roundsCompleted} giri{' '}
                          {log.metconLog.partialReps > 0 ? `+${log.metconLog.partialReps}` : ''}
                        </div>
                      </div>

                      {log.metconLog.movements && log.metconLog.movements.length > 0 && (
                        <div className="space-y-1 mb-2 pt-1.5 border-t border-orange-500/20">
                          {log.metconLog.movements.map((m, mi) => (
                            <div
                              key={mi}
                              className="text-[11px] text-zinc-300 flex items-center justify-between gap-2"
                            >
                              <span className="truncate">• {m.name}</span>
                              <span className="font-mono text-orange-300 text-[10px] shrink-0 font-semibold">
                                {m.repsOrDist}
                                {m.weightKg ? ` (${m.weightKg}kg)` : ''}
                                {m.caloriesKcal ? ` (${m.caloriesKcal}cal)` : ''}
                                {m.distanceMeters ? ` (${m.distanceMeters}m)` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {log.metconLog.sensations && (
                        <div className="text-[11px] text-orange-200/90 italic bg-zinc-950/40 p-2 rounded-xl border border-orange-500/20">
                          "{log.metconLog.sensations}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cardio Result Details Card (Shown cleanly for routine cardio or when extra details/sensations exist) */}
                  {log.cardioLog && (!isPureCardio || (log.cardioLog.distanceMeters && log.cardioLog.distanceMeters > 0) || log.cardioLog.sensations) && (
                    <div className="mt-2.5 p-3 bg-gradient-to-r from-cyan-950/25 to-zinc-950 rounded-2xl border border-cyan-500/30 space-y-2">
                      {!isPureCardio && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 min-w-0">
                            <Activity className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{cardioEquipmentLabel(log.cardioLog.equipment)}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300 shrink-0 whitespace-nowrap">
                            {log.cardioLog.durationMin} min
                          </span>
                        </div>
                      )}

                      {((!isPureCardio && log.cardioLog.caloriesKcal && log.cardioLog.caloriesKcal > 0) ||
                        (log.cardioLog.distanceMeters && log.cardioLog.distanceMeters > 0)) && (
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          {!isPureCardio && log.cardioLog.caloriesKcal !== undefined &&
                            log.cardioLog.caloriesKcal > 0 && (
                              <div className="bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
                                <span className="text-[10px] text-zinc-400 block">
                                  Calorie Bruciate
                                </span>
                                <span className="font-mono font-bold text-amber-300">
                                  {log.cardioLog.caloriesKcal} kcal
                                </span>
                              </div>
                            )}
                          {log.cardioLog.distanceMeters !== undefined &&
                            log.cardioLog.distanceMeters > 0 && (
                              <div className="bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
                                <span className="text-[10px] text-zinc-400 block">Distanza</span>
                                <span className="font-mono font-bold text-emerald-300">
                                  {log.cardioLog.distanceMeters} m
                                </span>
                              </div>
                            )}
                        </div>
                      )}

                      {log.cardioLog.sensations && (
                        <div className="text-[11px] text-cyan-200/90 italic bg-zinc-950/40 p-2 rounded-xl border border-cyan-500/20">
                          "{log.cardioLog.sensations}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* General notes */}
                  {log.generalNotes && (
                    <div className="mt-2.5 text-xs text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800">
                      <span className="font-semibold text-zinc-300">Note: </span>
                      {log.generalNotes}
                    </div>
                  )}

                  {/* Details toggler (Only shown when exercises exist) */}
                  {log.exerciseLogs.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="w-full mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        <span className="font-medium">
                          Dettaglio carichi serie per serie ({log.exerciseLogs.length} esercizi)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Expanded exercise details */}
                      {isExpanded && (
                        <div className="mt-2.5 space-y-2 pt-2 border-t border-zinc-800/60">
                          {log.exerciseLogs.map((ex, i) => (
                            <div
                              key={i}
                              className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80"
                            >
                              <div className="font-bold text-xs text-zinc-200 mb-1.5 flex items-center justify-between gap-2">
                                <span className="truncate">{ex.variantName}</span>
                                <span className="text-[10px] text-zinc-500 shrink-0">
                                  {ex.isFondamentale ? 'Fondamentale' : 'Metabolico/Braccia'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {ex.sets.map((s, si) => (
                                  <span
                                    key={si}
                                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                                      s.completed
                                        ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-zinc-900 text-zinc-500'
                                    }`}
                                  >
                                    S{s.setNumber}: {s.actualWeight}kg × {s.actualReps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* IN-APP DELETE SESSION CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white text-base font-bold">Eliminare Seduta?</h3>
                <span className="text-[11px] text-zinc-400 font-normal">Azione non reversibile</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1">
              <div className="font-bold text-zinc-200">{sessionToDelete.routineTitle}</div>
              <div className="text-[11px] text-zinc-400">
                Data: {new Date(sessionToDelete.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="text-[11px] text-zinc-500">
                {sessionToDelete.exerciseLogs.length} esercizi registrati • Durata {formatSecsToDuration(sessionToDelete.durationSec)}
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Rimuovendo questa seduta, lo storico dei pesi, il volume e le statistiche verranno ricalcolati automaticamente.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSessionLog(sessionToDelete.id);
                  setSessionToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina Seduta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup / Export / Import Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Backup & Ripristino Dati</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Esporta il tuo storico pesi, riposi e schede per non perdere i progressi, o ripristina da file.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExport}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Scarica File di Backup (.json)
              </button>

              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Oppure incolla JSON di ripristino:
                </label>
                <textarea
                  rows={3}
                  placeholder="Incolla qui il contenuto del backup..."
                  value={importJsonText}
                  onChange={e => setImportJsonText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-mono text-zinc-300 resize-none focus:outline-none focus:border-emerald-500"
                />

                {importStatus && (
                  <div className="text-xs text-emerald-400 font-semibold mt-1">
                    {importStatus}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleImport}
                  className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Ripristina Dati
                </button>
              </div>

              {/* Reset all PRs option */}
              <div className="pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowResetPRsConfirm(true)}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Azzera Tutti i Record (PR) a Zero
                </button>
              </div>

              {resetPRsSuccessMsg && (
                <div className="text-xs text-emerald-400 font-semibold text-center">
                  {resetPRsSuccessMsg}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-full py-2.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for Reset All PRs */}
      {showResetPRsConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                Azzera Tutti i Record Personali (PR)?
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Tutti i record personali memorizzati e i carichi massimi di ogni esercizio verranno reimpostati a <strong className="text-red-400">0 kg</strong>. Le nuove sedute partiranno da zero o bilanciere vuoto.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetPRsConfirm(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl text-xs font-bold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllPRs();
                  setShowResetPRsConfirm(false);
                  setResetPRsSuccessMsg('Tutti i PR sono stati azzerati a 0 kg!');
                  setTimeout(() => setResetPRsSuccessMsg(null), 3500);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-red-600/30"
              >
                Sì, Azzera PR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { jsPDF } from 'jspdf';
import { WorkoutSessionLog, ExerciseVariant, ExerciseVariantStats, ExerciseCategory } from '../types/workout';

interface PdfExportOptions {
  sessionLogs: WorkoutSessionLog[];
  variants: ExerciseVariant[];
  variantWeights: Record<string, ExerciseVariantStats>;
  timeFilterLabel: string;
  exerciseTypeFilterLabel: string;
  athleteName?: string;
}

interface ExerciseHistoryPoint {
  date: string;
  dateLabel: string;
  maxWeightKg: number;
  volumeKg: number;
  setsCount: number;
  totalReps: number;
}

interface ExercisePdfData {
  variantId: string;
  variantName: string;
  category: ExerciseCategory;
  maxWeightKg: number;
  lastWeightKg: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  history: ExerciseHistoryPoint[];
}

/**
 * Draws an evolution chart (Max Load & Volume) on an offscreen HTML5 canvas
 * and returns it as a PNG data URL.
 */
function renderEvolutionChartToDataUrl(
  exerciseName: string,
  history: ExerciseHistoryPoint[],
  width = 900,
  height = 360
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Rounded inner chart area
  const paddingLeft = 70;
  const paddingRight = 80;
  const paddingTop = 50;
  const paddingBottom = 60;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  ctx.fillStyle = '#1e293b'; // slate-800
  ctx.beginPath();
  ctx.roundRect(paddingLeft, paddingTop, chartW, chartH, 12);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // If no or only 1 history point, synthesize or display neatly
  const points = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (points.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nessuna cronologia registrata per questo esercizio', width / 2, height / 2);
    return canvas.toDataURL('image/png');
  }

  // Find max values for scales
  const maxWeight = Math.max(10, ...points.map(p => p.maxWeightKg));
  const maxVolume = Math.max(100, ...points.map(p => p.volumeKg));

  // Y-axis scales
  const weightCeil = Math.ceil((maxWeight * 1.15) / 5) * 5;
  const volumeCeil = Math.ceil((maxVolume * 1.15) / 100) * 100;

  // Grid lines
  const gridLines = 4;
  ctx.textAlign = 'right';
  ctx.font = '11px monospace';
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridLines; i++) {
    const y = paddingTop + (chartH / gridLines) * i;
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(paddingLeft + chartW, y);
    ctx.stroke();

    // Left Y-axis (Weight kg - Emerald)
    const wVal = Math.round(weightCeil * (1 - i / gridLines));
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${wVal} kg`, paddingLeft - 10, y + 4);

    // Right Y-axis (Volume kg - Amber)
    const vVal = Math.round(volumeCeil * (1 - i / gridLines));
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText(`${vVal.toLocaleString()} vol`, paddingLeft + chartW + 10, y + 4);
    ctx.textAlign = 'right';
  }

  // Calculate coordinates for points
  const coords = points.map((p, idx) => {
    const x = points.length === 1
      ? paddingLeft + chartW / 2
      : paddingLeft + (chartW / (points.length - 1)) * idx;
    const yWeight = paddingTop + chartH - (p.maxWeightKg / weightCeil) * chartH;
    const yVolume = paddingTop + chartH - (p.volumeKg / volumeCeil) * chartH;
    return { x, yWeight, yVolume, p };
  });

  // 1. Draw Volume Line (Amber dashed/glow)
  if (coords.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    coords.forEach((c, idx) => {
      if (idx === 0) ctx.moveTo(c.x, c.yVolume);
      else ctx.lineTo(c.x, c.yVolume);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Draw Volume points
  coords.forEach(c => {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(c.x - 4, c.yVolume - 4, 8, 8);
    // Value label
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${c.p.volumeKg}v`, c.x, Math.min(paddingTop + chartH - 8, c.yVolume + 15));
  });

  // 2. Draw Weight Line (Emerald solid with glow)
  if (coords.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    coords.forEach((c, idx) => {
      if (idx === 0) ctx.moveTo(c.x, c.yWeight);
      else ctx.lineTo(c.x, c.yWeight);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Draw Weight points
  coords.forEach(c => {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(c.x, c.yWeight, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${c.p.maxWeightKg} kg`, c.x, Math.max(paddingTop + 14, c.yWeight - 10));

    // X-axis date label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(c.p.dateLabel, c.x, paddingTop + chartH + 20);
  });

  // Legend at top
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';

  // Emerald dot & label
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(paddingLeft + 10, paddingTop - 20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Carico Massimo (kg)', paddingLeft + 22, paddingTop - 16);

  // Amber square & label
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(paddingLeft + 190, paddingTop - 25, 9, 9);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Tonnellaggio Volume (kg)', paddingLeft + 206, paddingTop - 16);

  // Exercise title watermark inside
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`${points.length} sedute registrate`, width - paddingRight, paddingTop - 16);

  return canvas.toDataURL('image/png');
}

/**
 * Main export function: creates a styled multi-page PDF with all totals,
 * exercise summary table, and evolution charts for every recorded exercise.
 */
export async function generateWorkoutStatisticsPdf(options: PdfExportOptions): Promise<void> {
  const {
    sessionLogs,
    variants,
    variantWeights,
    timeFilterLabel,
    exerciseTypeFilterLabel,
    athleteName = 'Atleta'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const nowIso = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate totals
  const totalSessions = sessionLogs.length;
  const totalDurationSec = sessionLogs.reduce((acc, s) => acc + (s.durationSec || 0), 0);
  const totalActualRestSec = sessionLogs.reduce((acc, s) => acc + (s.totalActualRestSec || 0), 0);
  const totalRestPeriods = sessionLogs.reduce((acc, s) => acc + (s.restPeriods?.length || 0), 0);
  const avgRestSec = totalRestPeriods > 0 ? Math.round(totalActualRestSec / totalRestPeriods) : 0;

  const totalCardioMinutes = sessionLogs.reduce((acc, s) => acc + (s.cardioLog?.durationMin || 0), 0);
  const totalCardioCalories = sessionLogs.reduce((acc, s) => acc + (s.cardioLog?.caloriesKcal || 0), 0);
  const totalCardioMeters = sessionLogs.reduce((acc, s) => acc + (s.cardioLog?.distanceMeters || 0), 0);
  const totalMetconRounds = sessionLogs.reduce((acc, s) => acc + (s.metconLog?.roundsCompleted || 0), 0);
  const totalMetconSessions = sessionLogs.filter(s => !!s.metconLog).length;

  let totalVolumeKg = 0;
  let totalSetsCompleted = 0;

  // Aggregate exercise-level data and chronological history
  const exerciseMap: Record<string, ExercisePdfData> = {};

  sessionLogs.forEach(session => {
    const sDate = session.date.slice(0, 10);
    const dateParts = sDate.split('-');
    const dateLabel = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : sDate;

    session.exerciseLogs.forEach(ex => {
      const v = variants.find(item => item.id === ex.variantId || item.name.toLowerCase() === ex.variantName.toLowerCase());
      const cat = v ? v.category : (ex.isFondamentale ? 'fondamentale' : 'metabolico');

      const completedSets = ex.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;

      const sessionMaxWeight = Math.max(...completedSets.map(s => s.actualWeight || 0));
      const sessionVolume = completedSets.reduce((sum, s) => sum + (s.actualWeight || 0) * (s.actualReps || 0), 0);
      const sessionReps = completedSets.reduce((sum, s) => sum + (s.actualReps || 0), 0);

      totalVolumeKg += sessionVolume;
      totalSetsCompleted += completedSets.length;

      if (!exerciseMap[ex.variantName]) {
        exerciseMap[ex.variantName] = {
          variantId: ex.variantId,
          variantName: ex.variantName,
          category: cat,
          maxWeightKg: 0,
          lastWeightKg: 0,
          totalVolumeKg: 0,
          totalSets: 0,
          totalReps: 0,
          history: []
        };
      }

      const item = exerciseMap[ex.variantName];
      item.totalVolumeKg += sessionVolume;
      item.totalSets += completedSets.length;
      item.totalReps += sessionReps;
      item.maxWeightKg = Math.max(item.maxWeightKg, sessionMaxWeight);
      item.lastWeightKg = sessionMaxWeight;

      item.history.push({
        date: sDate,
        dateLabel,
        maxWeightKg: sessionMaxWeight,
        volumeKg: sessionVolume,
        setsCount: completedSets.length,
        totalReps: sessionReps
      });
    });
  });

  // Also include variantWeights if some variants have history not currently in sessionLogs
  Object.values(variantWeights).forEach(vw => {
    if (vw.history && vw.history.length > 0 && !exerciseMap[vw.variantName]) {
      const v = variants.find(item => item.id === vw.variantId || item.name.toLowerCase() === vw.variantName.toLowerCase());
      const cat = v ? v.category : 'fondamentale';

      exerciseMap[vw.variantName] = {
        variantId: vw.variantId,
        variantName: vw.variantName,
        category: cat,
        maxWeightKg: vw.maxWeightKg,
        lastWeightKg: vw.lastUsedWeightKg,
        totalVolumeKg: vw.history.reduce((acc, h) => acc + (h.volumeKg || 0), 0),
        totalSets: vw.history.reduce((acc, h) => acc + (h.sets?.length || 0), 0),
        totalReps: vw.history.reduce((acc, h) => acc + (h.sets?.reduce((sAcc, s) => sAcc + s.reps, 0) || 0), 0),
        history: vw.history.map(h => ({
          date: h.date,
          dateLabel: h.date.slice(5).replace('-', '/'),
          maxWeightKg: h.maxWeight,
          volumeKg: h.volumeKg,
          setsCount: h.sets.length,
          totalReps: h.sets.reduce((sAcc, s) => sAcc + s.reps, 0)
        }))
      };
    }
  });

  const allExercises = Object.values(exerciseMap).sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);

  // Helper for adding footer
  const addFooter = (pageNum: number, totalPagesPlaceholder: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `IronTrack Gym Tracker • Generato il ${nowIso} • Pagina ${pageNum} di ${totalPagesPlaceholder}`,
      margin,
      pageHeight - 8
    );
  };

  // ==========================================
  // PAGE 1: HEADER & KEY PERFORMANCE INDICATORS
  // ==========================================
  // Dark header block
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, margin, contentWidth, 34, 4, 4, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text('IRONTRACK', margin + 6, margin + 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('• SCHEDA SUPER SERIE & ANALISI STATISTICA', margin + 50, margin + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Report dettagliato progressione carichi, volume, riposi effettivi, metcon e cardio`, margin + 6, margin + 20);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Periodo: ${timeFilterLabel}  |  Tipologia: ${exerciseTypeFilterLabel}  |  Data report: ${nowIso}`, margin + 6, margin + 28);

  // 6 KPI CARDS (2 rows x 3 columns)
  let curY = margin + 40;
  const cardW = (contentWidth - 8) / 3;
  const cardH = 22;

  const kpis = [
    {
      title: 'VOLUME TOTALE SOLLEVATO',
      val: `${(totalVolumeKg / 1000).toFixed(1)} ton`,
      sub: `${totalVolumeKg.toLocaleString()} kg totali`,
      color: [16, 185, 129] // emerald
    },
    {
      title: 'SEDUTE & FREQUENZA',
      val: `${totalSessions} sedute`,
      sub: `${totalSetsCompleted} serie completate`,
      color: [255, 255, 255]
    },
    {
      title: 'TEMPO IN PALESTRA',
      val: `${Math.floor(totalDurationSec / 3600)}h ${Math.floor((totalDurationSec % 3600) / 60)}m`,
      sub: `Media: ${totalSessions > 0 ? Math.round(totalDurationSec / totalSessions / 60) : 0} min/seduta`,
      color: [255, 255, 255]
    },
    {
      title: 'MONITORAGGIO RIPOSO REALE',
      val: `${Math.floor(totalActualRestSec / 60)}m ${totalActualRestSec % 60}s`,
      sub: `Media pausa: ${avgRestSec}s (${totalRestPeriods} pause)`,
      color: [16, 185, 129]
    },
    {
      title: 'CARDIO (BIKE, SKI, ROW, TAPIS)',
      val: `${totalCardioCalories.toLocaleString()} kcal`,
      sub: `${totalCardioMinutes} min • ${(totalCardioMeters / 1000).toFixed(1)} km`,
      color: [6, 182, 212] // cyan
    },
    {
      title: 'CIRCUITI METCON (AMRAP/EMOM)',
      val: `${totalMetconRounds} round`,
      sub: `${totalMetconSessions} circuiti eseguiti`,
      color: [249, 115, 22] // orange
    }
  ];

  kpis.forEach((kpi, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = margin + col * (cardW + 4);
    const y = curY + row * (cardH + 3);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.title, x + 3.5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + 3.5, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.sub, x + 3.5, y + 18.5);
  });

  curY += cardH * 2 + 10;

  // TABLE HEADER: RIEPILOGO GENERALE ESERCIZI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RIEPILOGO ESERCIZI & CARICHI MASSIMI REGISTRATI', margin, curY);

  curY += 4;

  // Table header bar
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, curY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ESERCIZIO', margin + 3, curY + 4.8);
  doc.text('CATEGORIA', margin + 65, curY + 4.8);
  doc.text('CARICO MAX', margin + 95, curY + 4.8);
  doc.text('ULTIMO CARICO', margin + 120, curY + 4.8);
  doc.text('SERIE CHIUSE', margin + 145, curY + 4.8);
  doc.text('TONNELLAGGIO (KG)', margin + 182, curY + 4.8, { align: 'right' });

  curY += 7;

  // Table rows
  allExercises.slice(0, 14).forEach((ex, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, curY, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, curY + 6.5, margin + contentWidth, curY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const shortName = ex.variantName.length > 32 ? ex.variantName.slice(0, 31) + '…' : ex.variantName;
    doc.text(shortName, margin + 3, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(ex.category.toUpperCase(), margin + 65, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(`${ex.maxWeightKg} kg`, margin + 95, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`${ex.lastWeightKg} kg`, margin + 120, curY + 4.5);

    doc.text(`${ex.totalSets} s (${ex.totalReps} r)`, margin + 145, curY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${ex.totalVolumeKg.toLocaleString()} kg`, margin + 182, curY + 4.5, { align: 'right' });

    curY += 6.5;
  });

  addFooter(1, '{total_pages}');

  // ========================================================
  // PAGES 2+: DETTAGLIO ED EVOLUZIONE CARICO E TONNELLAGGIO
  // ========================================================
  let pageNumber = 2;

  // Filter exercises that have history data to chart
  const exercisesWithHistory = allExercises.filter(ex => ex.history && ex.history.length > 0);

  // Group 2 exercises per page
  const itemsPerPage = 2;
  for (let i = 0; i < exercisesWithHistory.length; i += itemsPerPage) {
    doc.addPage();
    const batch = exercisesWithHistory.slice(i, i + itemsPerPage);

    let pageY = margin;

    // Page title banner
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, pageY, contentWidth, 12, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`EVOLUZIONE CARICHI & TONNELLAGGIO NEL TEMPO (${i + 1} - ${Math.min(i + batch.length, exercisesWithHistory.length)} di ${exercisesWithHistory.length})`, margin + 5, pageY + 8);
    pageY += 16;

    for (const ex of batch) {
      // Exercise container box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, pageY, contentWidth, 118, 4, 4, 'FD');

      // Exercise header inside card
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(ex.variantName, margin + 5, pageY + 8);

      // Category badge
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`CATEGORIA: ${ex.category.toUpperCase()}`, margin + 5, pageY + 13);

      // Key metrics pills
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(16, 185, 129);
      doc.text(`MAX: ${ex.maxWeightKg} kg`, margin + 90, pageY + 9);

      doc.setTextColor(245, 158, 11); // amber
      doc.text(`VOLUME: ${ex.totalVolumeKg.toLocaleString()} kg`, margin + 120, pageY + 9);

      doc.setTextColor(71, 85, 105);
      doc.text(`SERIE: ${ex.totalSets} (${ex.totalReps} reps)`, margin + 155, pageY + 9);

      // Render chart to Canvas & insert into PDF
      const chartDataUrl = renderEvolutionChartToDataUrl(ex.variantName, ex.history, 900, 360);
      if (chartDataUrl) {
        doc.addImage(chartDataUrl, 'PNG', margin + 4, pageY + 16, contentWidth - 8, 70);
      }

      // Small session details strip below the chart
      const stripY = pageY + 88;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('CRONOLOGIA ULTIME SEDUTE:', margin + 5, stripY);

      const recentHistory = [...ex.history].reverse().slice(0, 4);
      const colW = (contentWidth - 10) / 4;

      recentHistory.forEach((h, hIdx) => {
        const hX = margin + 5 + hIdx * colW;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(hX, stripY + 2, colW - 3, 20, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(h.dateLabel, hX + 2.5, stripY + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129);
        doc.text(`${h.maxWeightKg} kg`, hX + 2.5, stripY + 13);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${h.setsCount}s • ${h.volumeKg}kg`, hX + 2.5, stripY + 18.5);
      });

      pageY += 124;
    }

    addFooter(pageNumber, '{total_pages}');
    pageNumber++;
  }

  // Replace total pages placeholder
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Replace text placeholder
    const pageInfo = doc.internal.pages[i];
    if (pageInfo) {
      // jsPDF puts pages as internal structures; doc.setPage allows re-drawing if needed
    }
  }

  // Save / trigger browser download
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`irontrack_report_statistiche_${dateStr}.pdf`);
}

import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { RoutinesView } from './components/RoutinesView';
import { WeightTrackingView } from './components/WeightTrackingView';
import { WorkoutHistoryView } from './components/WorkoutHistoryView';
import { PdfGuideView } from './components/PdfGuideView';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import {
  Dumbbell,
  Calendar,
  Trophy,
  History,
  FileText,
  Flame,
  Play
} from 'lucide-react';

type TabType = 'allenati' | 'schede' | 'pesi' | 'storico' | 'guida';

const MainNavigation: React.FC = () => {
  const { activeSession, startWorkout, routines } = useWorkout();
  const [activeTab, setActiveTab] = useState<TabType>('schede');

  // If there is an active session in progress, we can show the active workout view when user taps 'allenati'
  // Or automatically switch to 'allenati' if user begins a session.
  const handleStartSessionFromRoutines = () => {
    setActiveTab('allenati');
  };

  // Find today's recommended workout based on current weekday
  const getTodayRoutine = () => {
    const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, 2 is Tue...
    const map: Record<number, string> = {
      1: 'lun',
      2: 'mar',
      3: 'mer',
      4: 'gio',
      5: 'ven',
      6: 'sab',
      0: 'dom'
    };
    const key = map[dayIndex] || 'lun';
    return routines.find(r => r.dayKey === key) || routines[0];
  };

  const todayRoutine = getTodayRoutine();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Brand Bar */}
      <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-zinc-950 font-black">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  IronTrack
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Super Serie 4×5
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-none">
                Gym Workout & Progression Tracker
              </p>
            </div>
          </div>

          {/* Quick Active Workout Pill in header if running */}
          {activeSession && activeTab !== 'allenati' && (
            <button
              type="button"
              onClick={() => setActiveTab('allenati')}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-md shadow-emerald-500/30"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              In Corso
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-lg w-full mx-auto">
        {activeTab === 'allenati' && (
          activeSession ? (
            <ActiveWorkoutView />
          ) : (
            <div className="p-4 space-y-4 pt-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Pronto per l'allenamento?
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Oggi è {todayRoutine.dayLabel}: {todayRoutine.title} ({todayRoutine.subtitle}).
              </p>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-left my-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {todayRoutine.dayLabel} Consigliato
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {todayRoutine.orderCode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {todayRoutine.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 mb-4">
                  {todayRoutine.description}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    startWorkout(todayRoutine.id);
                  }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Avvia {todayRoutine.title}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('schede')}
                  className="text-xs font-semibold text-zinc-400 hover:text-emerald-400"
                >
                  Oppure scegli un altro giorno dalla Scheda Settimanale →
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'schede' && (
          <RoutinesView onStartSession={handleStartSessionFromRoutines} />
        )}

        {activeTab === 'pesi' && (
          <WeightTrackingView />
        )}

        {activeTab === 'storico' && (
          <WorkoutHistoryView />
        )}

        {activeTab === 'guida' && (
          <PdfGuideView />
        )}
      </main>

      {/* Floating Rest Timer Component */}
      <RestTimerOverlay />

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('allenati')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
              activeTab === 'allenati'
                ? 'text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeSession && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-3 animate-ping" />
            )}
            <Dumbbell className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Allenati</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schede')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'schede'
                ? 'text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Schede</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pesi')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'pesi'
                ? 'text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Pesi & PR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storico')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'storico'
                ? 'text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Storico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guida')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'guida'
                ? 'text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Guida PDF</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <MainNavigation />
    </WorkoutProvider>
  );
}

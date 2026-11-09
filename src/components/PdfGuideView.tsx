import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { GENERAL_GUIDELINES } from '../data/defaultProgram';

export const PdfGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regole' | 'progressione' | 'coppie'>('regole');

  return (
    <div className="space-y-4 pb-28 pt-3 px-3 sm:px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                Guida & Principi Scheda
              </h1>
              <p className="text-[11px] text-zinc-400">
                Basato sul documento PDF ufficiale del programma
              </p>
            </div>
          </div>

          <a
            href="/assets/aistudio/scheda_allenamento_settimanale_2477b477.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1 border border-zinc-700"
            title="Apri PDF originale"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </a>
        </div>

        {/* Tab switch */}
        <div className="flex bg-zinc-800/80 p-1 rounded-2xl mt-3 border border-zinc-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('regole')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'regole'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Regole & Principi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('progressione')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'progressione'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Progressioni
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coppie')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'coppie'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Le 4 Coppie
          </button>
        </div>
      </div>

      {/* Tab: Regole */}
      {activeTab === 'regole' && (
        <div className="space-y-3">
          {/* Come si esegue una super serie */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              Come si esegue una super serie
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>1° Fondamentale:</strong> 4×5 pesante ma con 1-2 ripetizioni di margine (RIR 1-2).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>2° Metabolico:</strong> subito dopo il fondamentale, 4×10-12 (per lato se unilaterale). Nessuna pausa tra i due!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Recupero 90-120":</strong> solo dopo aver completato il metabolico. Poi si riparte (4 giri per coppia).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Attrezzatura:</strong> solo bilanciere, sbarra, manubri, KB e panca. Nessun macchinario.
                </span>
              </li>
            </ul>
          </div>

          {/* Regole di buon senso */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Regole di buon senso (dal PDF)
            </div>

            {GENERAL_GUIDELINES.rulesOfThumb.map((r, i) => (
              <div key={i} className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
                <div className="text-xs font-bold text-white mb-0.5">
                  {r.title}
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed">
                  {r.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Progressione */}
      {activeTab === 'progressione' && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              Regole di Progressione Automatica
            </div>

            <div className="space-y-2.5">
              {GENERAL_GUIDELINES.progressionRules.map((p, idx) => (
                <div key={idx} className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
                  <div className="text-xs font-bold text-emerald-300 mb-1">
                    {p.group}
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {p.rule}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calo & Fatigue alert explanation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              Gestione Fatica & Scarico
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              La progressione non è sempre lineare. Se noti un calo di 2 ripetizioni per due sedute consecutive sullo stesso fondamentale, il sistema nervoso sta segnalando accumulo di fatica. 
              <br /><br />
              <strong>Azione consigliata:</strong> salta la seduta delle braccia e il metcon per recuperare piena freschezza prima di riprendere a caricare.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Le 4 Coppie */}
      {activeTab === 'coppie' && (
        <div className="space-y-3">
          {[
            {
              code: 'A',
              title: 'Super serie A',
              fond: 'Back squat (gambe) [4×5]',
              met: 'Renegade row con manubri (dorso/core) [4×10-12/lato]',
              tip: 'Distretti: arti inferiori + tirata orizzontale in plank anti-rotazione.'
            },
            {
              code: 'B',
              title: 'Super serie B',
              fond: 'Panca piana bilanciere (petto) [4×5]',
              met: 'KB swing (catena posteriore) [4×10-12]',
              tip: 'Distretti: spinta orizzontale + cerniera d\'anca esplosiva per femorali e glutei.'
            },
            {
              code: 'C',
              title: 'Super serie C',
              fond: 'Trazioni alla sbarra (dorso) [4×5]',
              met: 'Affondi indietro con manubri (gambe) [4×10-12/lato]',
              tip: 'Distretti: tirata verticale + lavoro gambe unilaterale e stabilità.'
            },
            {
              code: 'D',
              title: 'Super serie D',
              fond: 'Hip thrust bilanciere (glutei) [4×5]',
              met: 'Push press con manubri (spalle) [4×10-12]',
              tip: 'Distretti: massima estensione d\'anca + spinta verticale esplosiva di deltoidi.'
            }
          ].map(pair => (
            <div key={pair.code} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {pair.code}
                </span>
                <span className="text-sm font-bold text-white">{pair.title}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-300">
                  <span className="font-semibold text-zinc-400">1° Fondamentale: </span>
                  {pair.fond}
                </div>
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300">
                  <span className="font-semibold text-zinc-400">2° Metabolico: </span>
                  {pair.met}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 mt-2">
                💡 {pair.tip}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

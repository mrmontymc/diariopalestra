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
  ChevronRight,
  Layers
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
                Scheda settimanale: 4 full body da 3 super serie + metcon a calorie
              </p>
            </div>
          </div>

          <a
            href="/assets/aistudio/scheda_allenamento_settimanale_c3a69b27.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1 border border-zinc-700"
            title="Apri PDF originale"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Ufficiale</span>
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
            Le Due Sedute (A/B)
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
              Come si esegue la scheda
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>1° Fondamentale e subito il metabolico:</strong> margine di 1-2 ripetizioni sul fondamentale, RPE 7-8 sul metabolico.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Riposo 60-90":</strong> 90" dopo squat, panca, military e hip thrust; 60-75" dopo rematore e trazioni.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Metcon finale:</strong> 3 giri a tempo (cap 9-10'), cardio a calorie + 2-3 funzionali, RPE 7-8. Se serve tempo, riduci a 2 giri.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Volume settimanale:</strong> spinta 32 serie, trazione 24 (rapporto bilanciato 4:3). Durata stimata ~60' a seduta.
                </span>
              </li>
            </ul>
          </div>

          {/* Regole di buon senso */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Regole e Linee Guida Ufficiali
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
              Regole di Progressione
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
              Se un fondamentale cala di 2 ripetizioni per due sedute consecutive, riduci il volume del 30% per una settimana.
              <br /><br />
              <strong>Rematore del martedì:</strong> carico moderato, eseguito il giorno dopo il rematore pesante del lunedì.
              <br />
              <strong>Push press:</strong> leggero, con tecnica impeccabile.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Le Due Sedute (A/B) */}
      {activeTab === 'coppie' && (
        <div className="space-y-3">
          {/* Seduta A */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Seduta A
                </span>
                <span className="text-sm font-bold text-white">Lunedì e Giovedì</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">3 super serie</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">A1 • Gambe & Spalle (Riposo 90")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Back squat 4×5 <span className="text-zinc-500 font-normal">+</span> Push press manubri 4×15 (leggeri)</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">A2 • Petto & Polpacci (Riposo 90")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Panca piana 4×5 <span className="text-zinc-500 font-normal">+</span> Calf raise manubri 4×15 (a una gamba, seduto)</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">A3 • Dorso & Gambe unilaterali (Riposo 60-75")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Rematore petto poggiato 4×8 <span className="text-zinc-500 font-normal">+</span> Affondi indietro manubri 4×10 per lato</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-800/50 text-[11px] text-zinc-300 space-y-1">
              <div>🔄 <strong>Ordine coppie:</strong> Lunedì A1 - A2 - A3 • Giovedì A3 - A1 - A2 (rematore a schiena fresca).</div>
              <div>🔥 <strong>Metcon Lunedì:</strong> 12 cal air bike, 15 KB swing, 10 V-up (3 giri, cap 9-10').</div>
              <div>🔥 <strong>Metcon Giovedì:</strong> 10 cal ski erg, 10 stacco manubri, 40 m farmer walk.</div>
            </div>
          </div>

          {/* Seduta B */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-bold">
                  Seduta B
                </span>
                <span className="text-sm font-bold text-white">Martedì e Sabato</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">3 super serie</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">B1 • Spalle & Squat leggero (Riposo 90")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Military press 4×5 <span className="text-zinc-500 font-normal">+</span> Air squat con fermo 3-5" 4×15 (mar leg extension, sab leg curl)</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">B2 • Trazioni & Petto (Riposo 60-75")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Trazioni alla sbarra 4×5 <span className="text-zinc-500 font-normal">+</span> Push-up 4×15 (tempo, piedi rialzati, zavorrato)</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">B3 • Glutei & Dorso moderato (Riposo 90")</div>
                <div className="text-xs text-zinc-200 mt-1 font-semibold">Hip thrust 4×6-8 <span className="text-zinc-500 font-normal">+</span> Rematore con manubri petto poggiato 4×15 (RPE 7)</div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-800/50 text-[11px] text-zinc-300 space-y-1">
              <div>🔄 <strong>Ordine coppie:</strong> Martedì B1 - B2 - B3 • Sabato B2 - B1 - B3 (apri con le trazioni; hip thrust per ultimo).</div>
              <div>🔥 <strong>Metcon Martedì:</strong> 12-15 cal rower, 40 m farmer walk, 10 sit-up (3 giri, cap 9-10').</div>
              <div>🔥 <strong>Metcon Sabato (post-pallavolo):</strong> 10 cal tapis in salita a camminata (o air bike), 40 m farmer walk, 10 knee raise. Zero impatto!</div>
            </div>
          </div>

          {/* Venerdì Braccia + Cardio */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
                Venerdì
              </span>
              <span className="text-sm font-bold text-white">Pallavolo / Braccia + Cardio</span>
            </div>
            <p className="text-xs text-zinc-400">
              Braccia + cardio solo se non c'è pallavolo. Super serie antagoniste senza cedimento: Curl bilanciere / French press • Curl martello / Dip tra panche • Alzate laterali / Curl inverso + 25-35' di vogatore a ritmo facile e costante.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

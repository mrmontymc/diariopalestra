import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check, X, Smartphone, Globe, Share2, MoreVertical, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, isIOS, isChrome, install, hasDeferredPrompt } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running standalone and not recently installed, don't show the button
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (hasDeferredPrompt) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      } else if (outcome === 'manual_guide') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Header action button */}
      {justInstalled ? (
        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
          <Check className="w-3.5 h-3.5" />
          Installata!
        </span>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Installa l'app su Chrome o sul tuo smartphone"
          className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Installa</span>
        </button>
      )}

      {/* Guide Modal if prompt is not directly interceptable or user needs guide */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/25">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Installa IronTrack
                </h3>
                <p className="text-xs text-zinc-400">
                  Usa l'app a schermo intero e offline
                </p>
              </div>
            </div>

            {/* Instruction content based on browser */}
            <div className="space-y-3.5 my-4 text-xs text-zinc-300">
              {isIOS ? (
                <>
                  <p className="text-zinc-400">
                    Installa l'app sul tuo iPhone o iPad da Safari:
                  </p>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      Tocca l'icona <strong className="text-white">Condividi</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />) nella barra in basso.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      Scorri verso il basso e tocca <strong className="text-white">"Aggiungi alla schermata Home"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />).
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      Conferma premendo <strong className="text-white">"Aggiungi"</strong> in alto a destra.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                    💡 <strong>Installazione rapida da Google Chrome:</strong>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      Su Chrome per smartphone, tocca i <strong className="text-white">tre puntini in alto a destra</strong> (<MoreVertical className="w-3 h-3 inline mx-0.5 text-emerald-400" />).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      Seleziona <strong className="text-white">"Installa applicazione"</strong> oppure <strong className="text-white">"Aggiungi a schermata Home"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      Tocca <strong className="text-white">"Installa"</strong> per avviare IronTrack a schermo intero come una vera app nativa, senza barre del browser!
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Da PC: clicca sull'icona del computer/download a destra nella barra indirizzi.</span>
                  </div>
                </>
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold rounded-2xl text-xs uppercase tracking-wider text-center shadow-lg shadow-emerald-500/20"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
};

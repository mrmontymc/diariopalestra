import React from 'react';
import { useHeartRate } from '../context/HeartRateContext';
import {
  Heart,
  Bluetooth,
  BluetoothOff,
  Battery,
  X,
  AlertCircle,
  Zap,
  Info,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Search
} from 'lucide-react';

interface HeartRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeartRateModal: React.FC<HeartRateModalProps> = ({ isOpen, onClose }) => {
  const {
    isConnected,
    isConnecting,
    deviceName,
    currentBpm,
    avgBpm,
    maxBpm,
    minBpm,
    batteryLevel,
    isSimulated,
    isSupported,
    isInsideIframe,
    isPermissionsPolicyBlocked,
    errorMessage,
    samples,
    connect,
    disconnect,
    toggleSimulation
  } = useHeartRate();

  if (!isOpen) return null;

  // Calculate cardio zone label and color
  const getZoneInfo = (bpm: number | null) => {
    if (!bpm || bpm <= 0) {
      return { label: 'In attesa segnale', color: 'text-zinc-500', bg: 'bg-zinc-800 border-zinc-700', zone: 'Z0' };
    }
    if (bpm < 115) {
      return { label: 'Zona 1 • Recupero / Warm-up', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', zone: 'Z1' };
    }
    if (bpm < 135) {
      return { label: 'Zona 2 • Aerobico Leggero', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', zone: 'Z2' };
    }
    if (bpm < 155) {
      return { label: 'Zona 3 • Aerobico / Tempo', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', zone: 'Z3' };
    }
    if (bpm < 175) {
      return { label: 'Zona 4 • Soglia Anaerobica', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', zone: 'Z4' };
    }
    return { label: 'Zona 5 • Massimale / VO2 Max', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', zone: 'Z5' };
  };

  const zoneInfo = getZoneInfo(currentBpm);
  const recentSamples = samples.slice(-20);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              isConnected
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                isConnected && currentBpm ? 'fill-current animate-pulse' : ''
              }`}
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Fascia Cardio Bluetooth
            </h3>
            <p className="text-[11px] text-zinc-400">
              Rilevazione frequenza cardiaca (BLE GATT)
            </p>
          </div>
        </div>

        {/* Connection status card */}
        <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Stato Connessione
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? 'bg-rose-400 animate-ping'
                    : isConnecting
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  isConnected
                    ? 'text-rose-400'
                    : isConnecting
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {isConnected
                  ? 'Connessa'
                  : isConnecting
                  ? 'Ricerca...'
                  : 'Non connessa'}
              </span>
            </div>
          </div>

          {isConnected && deviceName && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60">
              <span className="text-zinc-300 font-medium truncate max-w-[180px]">
                {deviceName}
              </span>
              {batteryLevel !== null && (
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  {batteryLevel}%
                </span>
              )}
              {isSimulated && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold uppercase border border-amber-500/30">
                  Demo
                </span>
              )}
            </div>
          )}
        </div>

        {/* IFRAME / PERMISSIONS POLICY WARNING (Shown when inside preview iframe or blocked) */}
        {(isInsideIframe || isPermissionsPolicyBlocked) && !isConnected && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-zinc-950 border border-amber-500/40 text-left space-y-2.5 mb-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sblocca Bluetooth in Google Chrome</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Google Chrome richiede che l'app sia aperta <strong>a schermo intero o installata</strong> per consentire l'accesso Bluetooth alla fascia cardio (bloccato all'interno dell'anteprima iFrame).
            </p>
            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all text-center no-underline"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apri l'App in Google Chrome</span>
            </a>
          </div>
        )}

        {/* Live BPM Gauges when connected */}
        {isConnected ? (
          <div className="space-y-3 mb-3">
            {/* Big Heart Rate Pulse Tile */}
            <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-4 text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-2 right-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${zoneInfo.bg} ${zoneInfo.color}`}>
                  {zoneInfo.zone}
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-1.5 my-1">
                <span
                  className="text-5xl font-black font-mono tracking-tight text-white transition-all"
                  style={{
                    textShadow: currentBpm ? '0 0 25px rgba(244, 63, 94, 0.35)' : 'none'
                  }}
                >
                  {currentBpm ?? '--'}
                </span>
                <span className="text-sm font-bold text-rose-400 uppercase tracking-wider font-sans">
                  BPM
                </span>
              </div>

              <div className="text-xs font-semibold text-zinc-300 mt-1">
                {zoneInfo.label}
              </div>

              {/* Live Sparkline of last 20 readings */}
              {recentSamples.length > 3 && (
                <div className="mt-3 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-end justify-between h-9 gap-1 px-1">
                    {recentSamples.map((s, idx) => {
                      const minH = 45;
                      const maxH = 190;
                      const pct = Math.max(10, Math.min(100, Math.round(((s.bpm - minH) / (maxH - minH)) * 100)));
                      return (
                        <div
                          key={idx}
                          title={`${s.bpm} BPM`}
                          className="flex-1 bg-rose-500/70 hover:bg-rose-400 rounded-t transition-all"
                          style={{ height: `${pct}%` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono mt-1 px-1">
                    <span>Recenti</span>
                    <span>{samples.length} campioni</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">
                  BPM Min
                </span>
                <span className="text-base font-black font-mono text-cyan-300">
                  {minBpm > 0 ? minBpm : '--'}
                </span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">
                  BPM Medio
                </span>
                <span className="text-base font-black font-mono text-emerald-300">
                  {avgBpm > 0 ? avgBpm : '--'}
                </span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-2.5">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">
                  BPM Max
                </span>
                <span className="text-base font-black font-mono text-rose-400">
                  {maxBpm > 0 ? maxBpm : '--'}
                </span>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              type="button"
              onClick={disconnect}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-200 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-zinc-700/60"
            >
              <BluetoothOff className="w-3.5 h-3.5" />
              <span>Disconnetti Fascia Cardio</span>
            </button>
          </div>
        ) : (
          /* Disconnected State: Action Buttons & Troubleshooting Instructions */
          <div className="space-y-3 mb-3">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Crucial Android OS Bluetooth Unpair Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left space-y-1.5 text-[11px] text-zinc-300">
              <div className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>La fascia è già associata al telefono?</span>
              </div>
              <p className="text-zinc-300 leading-snug">
                Se hai collegato la fascia in <strong>Impostazioni &gt; Bluetooth del telefono</strong> o in un'altra app (Polar, Garmin, Strava):
              </p>
              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-amber-200 text-[11px] space-y-1">
                <div>1. Vai in <strong>Impostazioni &gt; Bluetooth</strong> dello smartphone.</div>
                <div>2. Premi sulla fascia e seleziona <strong>"Dissocia" / "Dimentica"</strong>.</div>
                <div>3. Chiudi altre app di fitness aperte in background.</div>
                <div>4. Premi il pulsante qui sotto per connetterla direttamente a IronTrack!</div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Nota: Le fasce BLE accettano una sola connessione GATT alla volta. Se è associata al telefono, il sistema operativo la occupa impedendo a Chrome di leggerla.
              </p>
            </div>

            {/* Connect Primary Button */}
            <button
              type="button"
              disabled={isConnecting}
              onClick={() => connect(false)}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-98 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Ricerca Dispositivo BLE...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 stroke-[2.5]" />
                  <span>Connetti Fascia Cardio Bluetooth</span>
                </>
              )}
            </button>

            {/* Broad Scan Fallback Button */}
            <button
              type="button"
              disabled={isConnecting}
              onClick={() => connect(true)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-300 hover:text-white font-bold rounded-2xl text-[11px] flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Non trovi la fascia? Cerca tutti i dispositivi</span>
            </button>

            {/* Quick Demo Mode Button */}
            <button
              type="button"
              onClick={toggleSimulation}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-amber-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Attiva Simulazione Battiti (Demo)</span>
            </button>

            {/* Pairing Checklist */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl text-left space-y-1.5 text-[11px] text-zinc-400">
              <div className="text-zinc-200 font-bold flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-rose-400" />
                <span>Requisiti per il collegamento:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-zinc-400">
                <li>Indossa la fascia cardio inumidendo gli elettrodi in gomma.</li>
                <li>Attiva il <strong>Bluetooth</strong> e la <strong>Posizione/Geolocalizzazione</strong> dello smartphone (richiesta da Android per la scansione BLE).</li>
                <li>Usa Google Chrome o l'icona installata sulla schermata Home.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider text-center transition-colors"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

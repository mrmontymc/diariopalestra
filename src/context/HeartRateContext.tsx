import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { HeartRateSample, HeartRateSessionData, HeartRateZoneBreakdown } from '../types/workout';

// Standard Bluetooth GATT Heart Rate Service and Characteristics
const HEART_RATE_SERVICE_UUID = 'heart_rate';
const HEART_RATE_MEASUREMENT_UUID = 'heart_rate_measurement';
const BATTERY_SERVICE_UUID = 'battery_service';
const BATTERY_LEVEL_UUID = 'battery_level';

export interface HeartRateContextType {
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  currentBpm: number | null;
  avgBpm: number;
  maxBpm: number;
  minBpm: number;
  batteryLevel: number | null;
  isSimulated: boolean;
  isSupported: boolean;
  isInsideIframe: boolean;
  isPermissionsPolicyBlocked: boolean;
  errorMessage: string | null;
  samples: HeartRateSample[];
  zoneBreakdown: HeartRateZoneBreakdown;
  connect: (acceptAllDevices?: boolean) => Promise<boolean>;
  disconnect: () => void;
  toggleSimulation: () => void;
  resetSessionData: () => void;
  getSessionData: () => HeartRateSessionData | undefined;
}

const HeartRateContext = createContext<HeartRateContextType | undefined>(undefined);

export function parseHeartRateValue(dataView: DataView): { hr: number; contactDetected?: boolean } {
  const flags = dataView.getUint8(0);
  const is16Bit = (flags & 0x01) !== 0;
  const contactSupported = (flags & 0x04) !== 0;
  const contactDetected = contactSupported ? (flags & 0x02) !== 0 : undefined;
  const energyExpended = (flags & 0x08) !== 0;

  let offset = 1;
  const hr = is16Bit ? dataView.getUint16(offset, true) : dataView.getUint8(offset);
  offset += is16Bit ? 2 : 1;

  if (energyExpended) {
    offset += 2;
  }

  return { hr, contactDetected };
}

export const HeartRateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [currentBpm, setCurrentBpm] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionsPolicyBlocked, setIsPermissionsPolicyBlocked] = useState(false);

  // Detect whether we are running embedded inside an iframe (like AI Studio preview)
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Live session samples
  const [samples, setSamples] = useState<HeartRateSample[]>([]);

  // BLE device and characteristic references
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const simulationIntervalRef = useRef<number | null>(null);

  // Check Web Bluetooth support
  const isSupported = typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        window.clearInterval(simulationIntervalRef.current);
      }
      if (deviceRef.current && deviceRef.current.gatt && deviceRef.current.gatt.connected) {
        deviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  // Compute calculated metrics
  const validSamples = samples.filter(s => s.bpm > 30 && s.bpm < 240);
  const avgBpm = validSamples.length > 0
    ? Math.round(validSamples.reduce((sum, s) => sum + s.bpm, 0) / validSamples.length)
    : (currentBpm || 0);

  const maxBpm = validSamples.length > 0
    ? Math.max(...validSamples.map(s => s.bpm))
    : (currentBpm || 0);

  const minBpm = validSamples.length > 0
    ? Math.min(...validSamples.map(s => s.bpm))
    : (currentBpm || 0);

  // Heart rate zones breakdown (Zone 1 to 5)
  const zoneBreakdown: HeartRateZoneBreakdown = {
    zone1RecoverySec: 0,
    zone2AerobicSec: 0,
    zone3TempoSec: 0,
    zone4ThresholdSec: 0,
    zone5AnaerobicSec: 0
  };

  validSamples.forEach(s => {
    if (s.bpm < 115) zoneBreakdown.zone1RecoverySec += 1;
    else if (s.bpm < 135) zoneBreakdown.zone2AerobicSec += 1;
    else if (s.bpm < 155) zoneBreakdown.zone3TempoSec += 1;
    else if (s.bpm < 175) zoneBreakdown.zone4ThresholdSec += 1;
    else zoneBreakdown.zone5AnaerobicSec += 1;
  });

  const recordSample = useCallback((bpm: number) => {
    if (bpm <= 30 || bpm > 240) return;
    const now = Date.now();
    const workoutSec = Math.max(0, Math.floor((now - sessionStartTimeRef.current) / 1000));
    setSamples(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (now - last.timestamp < 900) {
          return prev;
        }
      }
      return [...prev, { timestamp: now, workoutSecond: workoutSec, bpm }];
    });
  }, []);

  const handleCharacteristicValueChanged = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (target && target.value) {
      try {
        const { hr } = parseHeartRateValue(target.value);
        if (hr > 30 && hr < 240) {
          setCurrentBpm(hr);
          recordSample(hr);
        }
      } catch (err) {
        console.warn('Error parsing BLE heart rate value:', err);
      }
    }
  }, [recordSample]);

  const onDisconnected = useCallback(() => {
    console.log('Fascia cardio BLE disconnessa');
    setIsConnected(false);
    setCurrentBpm(null);
    setDeviceName(null);
  }, []);

  // Connect via Web Bluetooth (with optional broad filter)
  const connect = useCallback(async (acceptAllDevices: boolean = false): Promise<boolean> => {
    setErrorMessage(null);
    setIsPermissionsPolicyBlocked(false);

    if (!isSupported) {
      setErrorMessage(
        'Web Bluetooth non supportato su questo browser. Usa Google Chrome su Android, PC o Mac.'
      );
      return false;
    }

    try {
      setIsConnecting(true);

      const optionalServices: BluetoothServiceUUID[] = [
        'heart_rate',
        0x180D,
        '0000180d-0000-1000-8000-00805f9b34fb',
        'battery_service',
        0x180F,
        '0000180f-0000-1000-8000-00805f9b34fb'
      ];

      let device: BluetoothDevice;

      if (acceptAllDevices) {
        device = await navigator.bluetooth!.requestDevice({
          acceptAllDevices: true,
          optionalServices
        });
      } else {
        device = await navigator.bluetooth!.requestDevice({
          filters: [
            { services: ['heart_rate'] }
          ],
          optionalServices
        });
      }

      deviceRef.current = device;
      setDeviceName(device.name || 'Fascia Cardio BLE');

      device.addEventListener('gattserverdisconnected', onDisconnected);

      // Connect GATT server
      const server = await device.gatt!.connect();

      // Get Heart Rate Service with dual fallback
      let hrService: BluetoothRemoteGATTService;
      try {
        hrService = await server.getPrimaryService('heart_rate');
      } catch {
        hrService = await server.getPrimaryService(0x180D);
      }

      // Get Heart Rate Measurement Characteristic with dual fallback
      let hrChar: BluetoothRemoteGATTCharacteristic;
      try {
        hrChar = await hrService.getCharacteristic('heart_rate_measurement');
      } catch {
        hrChar = await hrService.getCharacteristic(0x2A37);
      }
      characteristicRef.current = hrChar;

      // Start notifications
      await hrChar.startNotifications();
      hrChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      // Optional: try to read battery level
      try {
        let batteryService: BluetoothRemoteGATTService | undefined;
        try {
          batteryService = await server.getPrimaryService('battery_service');
        } catch {
          batteryService = await server.getPrimaryService(0x180F);
        }
        if (batteryService) {
          const batteryChar = await batteryService.getCharacteristic('battery_level');
          const batteryData = await batteryChar.readValue();
          const level = batteryData.getUint8(0);
          setBatteryLevel(level);
        }
      } catch {
        // Battery service optional
      }

      setIsConnected(true);
      setIsConnecting(false);
      setIsSimulated(false);
      return true;
    } catch (err: unknown) {
      console.warn('BLE connection error:', err);
      setIsConnecting(false);
      const msg = err instanceof Error ? err.message : String(err);

      // Inspect for common mobile Chrome issues:
      if (msg.includes('permissions policy') || msg.includes('disallowed by permissions policy')) {
        setIsPermissionsPolicyBlocked(true);
        setErrorMessage(
          'Il browser blocca il Bluetooth all\'interno dell\'anteprima (iFrame). Apri l\'app direttamente in Google Chrome o dalla schermata Home per connettere la fascia.'
        );
      } else if (msg.includes('User cancelled') || msg.includes('User cancelled the requestDevice() chooser')) {
        setErrorMessage('Ricerca dispositivo annullata.');
      } else if (msg.includes('GATT') || msg.includes('Connection failed') || msg.includes('NetworkError')) {
        setErrorMessage(
          'Connessione fallita. Se la fascia risulta collegata nelle impostazioni Bluetooth del telefono o a un\'altra app, DISSOCIALA dalle impostazioni del telefono per liberarla e riprova!'
        );
      } else {
        setErrorMessage(`Impossibile connettere la fascia: ${msg}`);
      }
      return false;
    }
  }, [isSupported, handleCharacteristicValueChanged, onDisconnected]);

  // Disconnect device
  const disconnect = useCallback(() => {
    if (simulationIntervalRef.current) {
      window.clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (characteristicRef.current) {
      try {
        characteristicRef.current.removeEventListener(
          'characteristicvaluechanged',
          handleCharacteristicValueChanged
        );
        characteristicRef.current.stopNotifications().catch(() => {});
      } catch (e) {
        console.warn('Error stopping notifications:', e);
      }
      characteristicRef.current = null;
    }

    if (deviceRef.current && deviceRef.current.gatt && deviceRef.current.gatt.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setIsSimulated(false);
    setCurrentBpm(null);
    setDeviceName(null);
  }, [handleCharacteristicValueChanged]);

  // Simulation mode (for testing without physical chest strap)
  const toggleSimulation = useCallback(() => {
    if (isSimulated) {
      if (simulationIntervalRef.current) {
        window.clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulated(false);
      setIsConnected(false);
      setCurrentBpm(null);
      setDeviceName(null);
    } else {
      // Stop real device if connected
      disconnect();

      setIsSimulated(true);
      setIsConnected(true);
      setDeviceName('Fascia Cardio (Simulazione)');
      setBatteryLevel(92);
      setErrorMessage(null);

      let currentSimBpm = 132;
      setCurrentBpm(currentSimBpm);
      recordSample(currentSimBpm);

      simulationIntervalRef.current = window.setInterval(() => {
        // Natural heart rate drift simulation between 120 and 165
        const delta = Math.floor(Math.random() * 5) - 2;
        currentSimBpm = Math.min(178, Math.max(115, currentSimBpm + delta));
        setCurrentBpm(currentSimBpm);
        recordSample(currentSimBpm);
      }, 1000);
    }
  }, [isSimulated, disconnect, recordSample]);

  const resetSessionData = useCallback(() => {
    setSamples([]);
    sessionStartTimeRef.current = Date.now();
  }, []);

  const getSessionData = useCallback((): HeartRateSessionData | undefined => {
    if (samples.length === 0 && !currentBpm) return undefined;
    return {
      connectedDeviceName: deviceName || undefined,
      currentBpm: currentBpm || undefined,
      avgBpm,
      maxBpm,
      minBpm,
      samples,
      zones: zoneBreakdown,
      batteryLevel: batteryLevel || undefined,
      isSimulated
    };
  }, [samples, currentBpm, deviceName, avgBpm, maxBpm, minBpm, zoneBreakdown, batteryLevel, isSimulated]);

  return (
    <HeartRateContext.Provider
      value={{
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
        zoneBreakdown,
        connect,
        disconnect,
        toggleSimulation,
        resetSessionData,
        getSessionData
      }}
    >
      {children}
    </HeartRateContext.Provider>
  );
};

export const useHeartRate = (): HeartRateContextType => {
  const context = useContext(HeartRateContext);
  if (!context) {
    throw new Error('useHeartRate must be used within a HeartRateProvider');
  }
  return context;
};

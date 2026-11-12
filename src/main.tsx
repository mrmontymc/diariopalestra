import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nuovo aggiornamento IronTrack disponibile');
  },
  onOfflineReady() {
    console.log('IronTrack pronta per l\'uso offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);


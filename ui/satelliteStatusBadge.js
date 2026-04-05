import { createStatusBadge } from './statusBadge.js';

export function createSatelliteStatusBadge() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  return createStatusBadge({
    top: mobile ? '95px' : '110px',
    left: 'auto',
    right: mobile ? '12px' : '20px',
    bottom: 'auto',
    initialStatus: 'UPDATING',
    labelPrefix: 'SATELLITES',
    palette: {
      liveDot: '#ffe066',
      liveGlow: '0 0 20px rgba(255,224,102,0.95)',
      liveBorder: 'rgba(255,224,102,0.35)',
      liveText: '#fff9e6',
      cachedDot: '#a0ffc3',
      cachedGlow: '0 0 12px rgba(160,255,195,0.85)',
      cachedBorder: 'rgba(160,255,195,0.25)',
      cachedText: '#eafef2',
      fallbackDot: '#ffcf5a',
      fallbackGlow: '0 0 12px rgba(255,207,90,0.85)',
      fallbackBorder: 'rgba(255,207,90,0.25)',
      fallbackText: '#fff4d4',
      updatingDot: '#8c9cff',
      updatingGlow: '0 0 12px rgba(140,156,255,0.85)',
      updatingBorder: 'rgba(140,156,255,0.25)',
      updatingText: '#dde2ff',
    },
  });
}

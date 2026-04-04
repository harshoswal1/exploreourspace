import { createStatusBadge } from './statusBadge.js';

export function createSatelliteStatusBadge() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  return createStatusBadge({
    top: 'auto',
    left: 'auto',
    right: mobile ? '12px' : '20px',
    bottom: mobile ? '152px' : '116px',
    initialStatus: 'UPDATING',
    labelPrefix: 'SATELLITES',
    palette: {
      liveDot: '#6bd8ff',
      liveGlow: '0 0 12px rgba(107,216,255,0.85)',
      liveBorder: 'rgba(107,216,255,0.28)',
      liveText: '#d5f4ff',
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

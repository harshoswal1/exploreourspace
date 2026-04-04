import { createStatusBadge } from './statusBadge.js';

export function createAsteroidStatusBadge() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  return createStatusBadge({
    top: 'auto',
    left: 'auto',
    right: mobile ? '12px' : '20px',
    bottom: mobile ? '72px' : '20px',
    initialStatus: 'UPDATING',
    labelPrefix: 'ASTEROIDS',
    palette: {
      liveDot: '#f5712a',
      liveGlow: '0 0 12px rgba(255, 100, 16, 0.85)',
      liveBorder: 'rgba(255,154,98,0.28)',
      liveText: '#ffe4d6',
      fallbackDot: '#d7b98a',
      fallbackGlow: '0 0 12px rgba(215,185,138,0.85)',
      fallbackBorder: 'rgba(215,185,138,0.26)',
      fallbackText: '#f8eddc',
      updatingDot: '#ffc04d',
      updatingGlow: '0 0 12px rgba(255,192,77,0.85)',
      updatingBorder: 'rgba(255,192,77,0.26)',
      updatingText: '#fff1cf',
    },
  });
}

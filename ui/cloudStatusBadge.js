import { createStatusBadge } from './statusBadge.js';

export function createCloudStatusBadge() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  return createStatusBadge({
    top: 'auto',
    left: 'auto',
    right: mobile ? '12px' : '20px',
    bottom: mobile ? '15px' : '68px',
    initialStatus: 'UPDATING',
    labelPrefix: 'CLOUDS',
    palette: {
      liveDot: '#38ff88',
      liveGlow: '0 0 12px rgba(56,255,136,0.85)',
      liveBorder: 'rgba(56,255,136,0.25)',
      liveText: '#d8ffe8',
      fallbackDot: '#ffb84d',
      fallbackGlow: '0 0 12px rgba(255,184,77,0.85)',
      fallbackBorder: 'rgba(255,184,77,0.25)',
      fallbackText: '#ffe9c7',
      updatingDot: '#58a6ff',
      updatingGlow: '0 0 12px rgba(88,166,255,0.85)',
      updatingBorder: 'rgba(88,166,255,0.25)',
      updatingText: '#d8ebff',
    },
  });
}

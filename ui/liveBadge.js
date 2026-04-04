export function createLiveBadge() {
  const badge = document.createElement('div');
  badge.textContent = 'LIVE';

  const mobile = window.matchMedia('(max-width: 900px)').matches;
  badge.dataset.uiElement = 'true';
  badge.style.position = 'absolute';
  badge.style.top = mobile ? '12px' : '20px';
  badge.style.right = mobile ? '12px' : '20px';
  badge.style.bottom = 'auto';
  badge.style.display = 'flex';
  badge.style.alignItems = 'center';
  badge.style.gap = '8px';
  badge.style.padding = '8px 12px';
  badge.style.border = '1px solid rgba(255,255,255,0.18)';
  badge.style.borderRadius = '999px';
  badge.style.background = 'rgba(8,12,20,0.58)';
  badge.style.backdropFilter = 'blur(18px)';
  badge.style.webkitBackdropFilter = 'blur(18px)';
  badge.style.boxShadow = '0 8px 24px rgba(0,0,0,0.28)';
  badge.style.color = '#ffffff';
  badge.style.fontFamily = 'Arial, sans-serif';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = '700';
  badge.style.letterSpacing = '0.18em';
  badge.style.zIndex = '20';

  const dot = document.createElement('span');
  dot.style.width = '8px';
  dot.style.height = '8px';
  dot.style.borderRadius = '50%';
  dot.style.background = '#ff4d4d';
  dot.style.boxShadow = '0 0 12px rgba(255,77,77,0.85)';

  badge.prepend(dot);
  document.body.appendChild(badge);

  let visible = true;
  setInterval(() => {
    visible = !visible;
    dot.style.opacity = visible ? '1' : '0.35';
  }, 900);

  return badge;
}

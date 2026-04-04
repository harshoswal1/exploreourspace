function getStatusStyles(status, palette) {
  if (status === 'LIVE') {
    return {
      dot: palette.liveDot,
      glow: palette.liveGlow,
      border: palette.liveBorder,
      text: palette.liveText,
    };
  }

  if (status === 'CACHED') {
    return {
      dot: palette.cachedDot,
      glow: palette.cachedGlow,
      border: palette.cachedBorder,
      text: palette.cachedText,
    };
  }

  if (status === 'FALLBACK') {
    return {
      dot: palette.fallbackDot,
      glow: palette.fallbackGlow,
      border: palette.fallbackBorder,
      text: palette.fallbackText,
    };
  }

  return {
    dot: palette.updatingDot,
    glow: palette.updatingGlow,
    border: palette.updatingBorder,
    text: palette.updatingText,
  };
}

export function createStatusBadge({
  top,
  left,
  right,
  bottom,
  initialStatus = 'UPDATING',
  labelPrefix,
  palette,
}) {
  const badge = document.createElement('div');
  badge.dataset.uiElement = 'true';
  badge.style.position = 'absolute';
  if (top !== undefined) badge.style.top = top;
  if (left !== undefined) badge.style.left = left;
  if (right !== undefined) badge.style.right = right;
  if (bottom !== undefined) badge.style.bottom = bottom;
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
  badge.style.fontSize = '11px';
  badge.style.fontWeight = '700';
  badge.style.letterSpacing = '0.12em';
  badge.style.zIndex = '20';

  const dot = document.createElement('span');
  dot.style.width = '8px';
  dot.style.height = '8px';
  dot.style.borderRadius = '50%';

  const label = document.createElement('span');
  label.style.display = 'block';
  label.style.lineHeight = '1.2';

  const detailLabel = document.createElement('span');
  detailLabel.style.display = 'block';
  detailLabel.style.fontSize = '10px';
  detailLabel.style.opacity = '0.75';
  detailLabel.style.marginTop = '2px';

  badge.appendChild(dot);
  badge.appendChild(label);
  badge.appendChild(detailLabel);
  document.body.appendChild(badge);

  let pulseVisible = true;
  setInterval(() => {
    pulseVisible = !pulseVisible;
    dot.style.opacity = pulseVisible ? '1' : '0.4';
  }, 900);

  function setStatus(status, detail = '') {
    const styles = getStatusStyles(status, palette);
    dot.style.background = styles.dot;
    dot.style.boxShadow = styles.glow;
    badge.style.borderColor = styles.border;
    badge.style.color = styles.text;
    label.textContent = `${labelPrefix} ${status}`;
    detailLabel.textContent = detail ? `Last updated: ${detail}` : '';
  }

  setStatus(initialStatus);

  return { setStatus };
}

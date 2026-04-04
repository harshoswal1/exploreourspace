export function createFollowExitButton() {
  const button = document.createElement('button');
  button.textContent = 'Exit Follow';

  const mobile = window.matchMedia('(max-width: 900px)').matches;
  button.dataset.uiElement = 'true';
  button.style.position = 'absolute';
  button.style.top = mobile ? '60px' : '68px';
  button.style.right = mobile ? '12px' : '20px';
  button.style.bottom = 'auto';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '999px';
  button.style.fontSize = '12px';
  button.style.fontWeight = '700';
  button.style.letterSpacing = '0.08em';
  button.style.color = '#ffffff';
  button.style.background = 'rgba(8,12,20,0.58)';
  button.style.border = '1px solid rgba(255,255,255,0.18)';
  button.style.backdropFilter = 'blur(18px)';
  button.style.webkitBackdropFilter = 'blur(18px)';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.28)';
  button.style.cursor = 'pointer';
  button.style.zIndex = '20';
  button.style.display = 'none';

  document.body.appendChild(button);
  return button;
}

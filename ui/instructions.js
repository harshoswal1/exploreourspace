export function createInstructions() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const container = document.createElement('div');
  container.style.position = 'absolute';
  // Higher on mobile to avoid overlapping with bottom navigation buttons
  container.style.bottom = isMobile ? '150px' : '40px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.zIndex = '100';
  container.style.pointerEvents = 'none';
  
  const panel = document.createElement('div');
  panel.style.background = 'rgba(8, 12, 20, 0.7)';
  panel.style.backdropFilter = 'blur(16px)';
  panel.style.webkitBackdropFilter = 'blur(16px)';
  panel.dataset.uiElement = 'true';
  panel.style.border = '1px solid rgba(255, 255, 255, 0.12)';
  panel.style.borderRadius = '18px';
  panel.style.padding = isMobile ? '14px 20px' : '18px 28px';
  panel.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
  panel.style.color = '#f4fbff';
  panel.style.fontFamily = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  panel.style.textAlign = 'center';
  panel.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  panel.style.width = isMobile ? 'calc(100vw - 60px)' : 'auto';
  panel.style.maxWidth = '480px';

  const content = `
    <div style="font-size: ${isMobile ? '13px' : '15px'}; line-height: 1.5; font-weight: 500;">
      <div style="margin-bottom: 10px;">
        <span style="color: #f9d180; text-transform: uppercase; font-size: 0.85em; letter-spacing: 0.05em; font-weight: 700;">Interaction Guide</span>
      </div>
      <div style="margin-bottom: 10px;">
        <span style="color: #f6fbff;">Tap ◎</span> (Top Left) 
        <br/> <span style="font-size: 0.9em; color: #a0c8ff; opacity: 0.8;">to toggle Layers, Objects, orbits & weather controls</span>
      </div>
      <div style="margin-bottom: 10px;">
        <span style="color: #ffe066;">Double Tap</span> on Satellites, Asteroids, or Moon 
        <br/> <span style="font-size: 0.9em; color: #a0c8ff; opacity: 0.8;">for closer 3D look & real-time data</span>
      </div>
      <div>
        <span style="color: #7ee7ff;">Touch Earth</span> 
        <br/> <span style="font-size: 0.9em; color: #a0c8ff; opacity: 0.8;">for local climate & location info</span>
      </div>
    </div>
    <div id="close-hint" style="margin-top: 14px; font-size: 9px; color: rgba(255,255,255,0.3); cursor: pointer; pointer-events: auto; text-transform: uppercase; letter-spacing: 0.15em;">
      Tap to dismiss
    </div>
  `;
  
  panel.innerHTML = content;
  container.appendChild(panel);
  document.body.appendChild(container);

  const dismiss = () => {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(15px)';
    setTimeout(() => container.remove(), 600);
  };

  const closeBtn = panel.querySelector('#close-hint');
  closeBtn.addEventListener('click', dismiss);

  // Auto-dismiss after 12 seconds to keep the UI clean
  setTimeout(() => {
    if (container.parentNode) dismiss();
  }, 60000);

  return container;
}
export function createHomePage(onStart) {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'radial-gradient(circle at center, rgba(10, 20, 40, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)';
  overlay.style.backdropFilter = 'blur(20px)';
  overlay.style.webkitBackdropFilter = 'blur(20px)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '2000';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'Arial, sans-serif';
  overlay.style.textAlign = 'center';
  overlay.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
  overlay.style.padding = '20px';

  const content = `
    <div style="max-width: 500px; animation: fadeIn 1s ease-out;">
      <h1 style="font-size: ${isMobile ? '28px' : '48px'}; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 10px; font-weight: 900; color: #f7fbff; text-shadow: 0 0 20px rgba(124, 200, 255, 0.4);">The Space</h1>
      <p style="font-size: ${isMobile ? '12px' : '16px'}; color: #a0c8ff; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px; opacity: 0.8;">Intelligence Visualizer</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin-bottom: 50px; background: rgba(255,255,255,0.03); padding: 25px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <div>
          <h3 style="color: #ffe066; font-size: 13px; margin-bottom: 8px;">🛰️ SATELLITES</h3>
          <p style="font-size: 11px; line-height: 1.4; color: rgba(255,255,255,0.6);">Live tracking via TLE data. Identified by <span style="color:#ffe066">Yellow</span> markers.</p>
        </div>
        <div>
          <h3 style="color: #f5712a; font-size: 13px; margin-bottom: 8px;">☄️ ASTEROIDS</h3>
          <p style="font-size: 11px; line-height: 1.4; color: rgba(255,255,255,0.6);">Real-time NASA NEO feed. Identified by <span style="color:#f5712a">Orange</span> markers.</p>
        </div>
        <div>
          <h3 style="color: #7ee7ff; font-size: 13px; margin-bottom: 8px;">🌍 EARTH</h3>
          <p style="font-size: 11px; line-height: 1.4; color: rgba(255,255,255,0.6);">Tap any point for climate, temperature, and regional data.</p>
        </div>
        <div>
          <h3 style="color: #ffffff; font-size: 13px; margin-bottom: 8px;">🕹️ CONTROLS</h3>
          <p style="font-size: 11px; line-height: 1.4; color: rgba(255,255,255,0.6);">Drag to Orbit. Scroll to Zoom. Double-Tap to Focus on objects.</p>
        </div>
      </div>

      <button id="explore-btn" style="
        padding: 16px 48px;
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: white;
        background: linear-gradient(135deg, #2058a0 0%, #102040 100%);
        border: 1px solid rgba(124, 200, 255, 0.4);
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(32, 88, 160, 0.4);
        transition: all 0.3s ease;
        outline: none;
      ">Explore Earth</button>
    </div>

    <style>
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      #explore-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 50px rgba(124, 200, 255, 0.6);
        background: linear-gradient(135deg, #2a6bc2 0%, #102040 100%);
      }
      #explore-btn:active { transform: scale(0.98); }
    </style>
  `;

  overlay.innerHTML = content;
  document.body.appendChild(overlay);

  const btn = overlay.querySelector('#explore-btn');
  btn.addEventListener('click', () => {
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    if (onStart) onStart();
    setTimeout(() => overlay.remove(), 800);
  });

  return overlay;
}
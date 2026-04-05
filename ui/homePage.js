export function createHomePage(onStart) {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'transparent'; // Show the 3D scene behind!
  overlay.style.backdropFilter = 'blur(8px)';
  overlay.style.webkitBackdropFilter = 'blur(8px)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '5000';
  overlay.style.color = 'white';
  overlay.style.fontFamily = '"Segoe UI", Roboto, sans-serif';
  overlay.style.textAlign = 'center';
  overlay.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
  overlay.style.padding = '20px';
  overlay.style.overflow = 'hidden';

  const content = `
    <div class="nebula"></div>
    <div class="hud-grid"></div>
    <div class="vignette"></div>

    <div class="story-wrapper" style="max-width: 800px; position: relative; z-index: 10;">
      <div id="story-step-1" class="intro-sequence">
        <div class="glitch-text" data-text="SYSTEM ACCESS">SYSTEM ACCESS</div>
        <h1 style="font-size: ${isMobile ? '32px' : '64px'}; font-weight: 900; letter-spacing: 0.15em; margin: 0; color: #fff; text-shadow: 0 0 30px rgba(126, 231, 255, 0.4);">ORBITAL UPLINK</h1>
        <div style="height: 1px; width: 100px; background: #7ee7ff; margin: 20px auto; box-shadow: 0 0 10px #7ee7ff;"></div>
        <p class="typewriter">ESTABLISHING SECURE CONNECTION TO DEEP SPACE NETWORK...</p>
      </div>

      <div id="story-step-2" style="display: none; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="tech-header">
          <span class="bracket">[</span> SYSTEM STATUS: OPTIMAL <span class="bracket">]</span>
        </div>
        <h2 style="font-size: ${isMobile ? '24px' : '42px'}; letter-spacing: 0.1em; color: #7ee7ff; text-transform: uppercase; margin: 10px 0 40px;">Orbital Intelligence Platform</h2>
        
        <div class="hud-info-grid">
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <h4>ORBITAL_SENSORS</h4>
            <p>Tracking 800+ Live Satellites</p>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <h4>NEO_DETECTION</h4>
            <p>NASA Asteroid Feed Active</p>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <h4>GEO_METRICS</h4>
            <p>Climate & Regional Analytics</p>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <h4>NAV_COMMAND</h4>
            <p>Double-Tap to Lock Target</p>
          </div>
        </div>

        <button id="explore-btn" class="sci-fi-btn">
          <span class="btn-glitch"></span>
          INITIALIZE EXPLORATION
        </button>
      </div>
    </div>

    <!-- Bottom Signature -->
    <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10; font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(126, 231, 255, 0.5); text-transform: uppercase;">
      @Harsh Oswal
    </div>

    <style>
      .vignette { position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle, transparent 40%, black 150%); z-index: 1; }
      .intro-sequence { animation: introFade 3s forwards; }
      @keyframes introFade { 0% { opacity:0; transform:scale(1.1); } 20% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; transform:scale(1); } }
      
      .glitch-text { font-family: monospace; color: #7ee7ff; letter-spacing: 1em; margin-bottom: 10px; position: relative; }
      .typewriter { font-family: monospace; font-size: 10px; color: #7ee7ff; letter-spacing: 0.2em; overflow: hidden; white-space: nowrap; border-right: 2px solid; animation: typing 2s steps(40, end), blink .75s step-end infinite; margin: 0 auto; width: fit-content; }
      @keyframes typing { from { width: 0 } to { width: 100% } }
      @keyframes blink { from, to { border-color: transparent } 50% { border-color: #7ee7ff } }

      .hud-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 40px; }
      .hud-card { background: rgba(126, 231, 255, 0.05); border: 1px solid rgba(126, 231, 255, 0.1); padding: 20px; position: relative; text-align: left; transition: background 0.3s; }
      .hud-card:hover { background: rgba(126, 231, 255, 0.1); }
      .hud-card h4 { color: #7ee7ff; font-family: monospace; font-size: 12px; margin: 0 0 5px; letter-spacing: 1px; }
      .hud-card p { color: rgba(255,255,255,0.6); font-size: 11px; margin: 0; }
      .card-corner { position: absolute; width: 8px; height: 8px; border: 2px solid #7ee7ff; }
      .tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
      .tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }

      .sci-fi-btn { 
        background: transparent; border: 1px solid #7ee7ff; color: #7ee7ff; padding: 20px 40px; 
        font-family: monospace; font-weight: bold; letter-spacing: 3px; cursor: pointer; position: relative;
        overflow: hidden; transition: all 0.3s; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
      }
      .sci-fi-btn:hover { background: #7ee7ff; color: #000; box-shadow: 0 0 30px #7ee7ff; }
      
      .nebula { 
        position: absolute; width: 100%; height: 100%; 
        background: radial-gradient(circle at 50% 50%, rgba(0, 120, 255, 0.1), transparent 70%);
        animation: pulseNebula 10s infinite alternate;
      }
      @keyframes pulseNebula { from { opacity: 0.5; } to { opacity: 1; } }
    </style>
  `;

  overlay.innerHTML = content;
  document.body.appendChild(overlay);

  // Handle Story Transitions
  const step1 = overlay.querySelector('#story-step-1');
  const step2 = overlay.querySelector('#story-step-2');

  setTimeout(() => {
    step1.style.display = 'none';
    step2.style.display = 'block';
    step2.style.animation = 'step2In 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards';
    
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `@keyframes step2In { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(styleSheet);
  }, 3000);

  const btn = overlay.querySelector('#explore-btn');
  btn.addEventListener('click', () => {
    // Start fade out
    overlay.style.transition = 'all 1.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.1)';
    
    // Start the app logic after a slight delay to let the fade breathe
    setTimeout(() => {
      if (onStart) onStart();
      overlay.style.visibility = 'hidden';
      setTimeout(() => overlay.remove(), 500);
    }, 600);
  });

  return overlay;
}
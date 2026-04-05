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
    <div class="radar-sweep"></div>
    
    <!-- Floating Space Elements -->
    <div class="sat-anim sat-1"></div>
    <div class="sat-anim sat-2"></div>

    <!-- Side Telemetry Streams -->
    <div class="telemetry-stream left-stream"></div>
    <div class="telemetry-stream right-stream"></div>

    <div class="story-wrapper" style="max-width: 800px; position: relative; z-index: 10;">
      <div id="story-step-1" class="intro-sequence">
        <div class="glitch-text" data-text="ENCRYPTED UPLINK">ENCRYPTED UPLINK</div>
        <h1 style="font-size: ${isMobile ? '32px' : '64px'}; font-weight: 900; letter-spacing: 0.15em; margin: 0; color: #fff; text-shadow: 0 0 30px rgba(126, 231, 255, 0.6);">ORBITAL VISUALIZER</h1>
        <div style="height: 1px; width: 100px; background: #7ee7ff; margin: 20px auto; box-shadow: 0 0 10px #7ee7ff;"></div>
        <p class="typewriter">SYNCHRONIZING WITH DEEP SPACE NETWORK [DSN-7]...</p>
      </div>

      <div id="story-step-2" style="display: none; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="tech-header">
          <span class="status-dot"></span> <span class="bracket">[</span> SYSTEM STATUS: ACTIVE <span class="bracket">]</span>
        </div>
        <h2 style="font-size: ${isMobile ? '24px' : '38px'}; letter-spacing: 0.1em; color: #7ee7ff; text-transform: uppercase; margin: 10px 0 35px; font-weight: 300;">Intelligence Dashboard</h2>
        
        <div class="hud-info-grid">
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <div class="card-icon">${getSatSVG()}</div>
            <div class="card-content">
              <h4>ORBITAL_SENSORS</h4>
              <p>800+ Live Satellites</p>
              <div class="signal-bar"><div class="fill" style="width: 85%"></div></div>
            </div>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <div class="card-icon">${getAsteroidSVG()}</div>
            <div class="card-content">
              <h4>NEO_DETECTION</h4>
              <p>NASA Trajectory Feed</p>
              <div class="signal-bar"><div class="fill" style="width: 92%"></div></div>
            </div>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <div class="card-icon">${getEarthSVG()}</div>
            <div class="card-content">
              <h4>GEO_METRICS</h4>
              <p>Global Climate Scan</p>
              <div class="signal-bar"><div class="fill" style="width: 70%"></div></div>
            </div>
          </div>
          <div class="hud-card">
            <div class="card-corner tl"></div><div class="card-corner tr"></div>
            <div class="card-icon">${getNavSVG()}</div>
            <div class="card-content">
              <h4>NAV_COMMAND</h4>
              <p>Target-Lock Enabled</p>
              <div class="signal-bar"><div class="fill" style="width: 100%"></div></div>
            </div>
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
      
      /* Telemetry Data Streams */
      .telemetry-stream { position: absolute; top: 0; bottom: 0; width: 60px; font-family: monospace; font-size: 8px; color: rgba(126, 231, 255, 0.2); overflow: hidden; line-height: 1.5; pointer-events: none; z-index: 2; padding: 20px 10px; }
      .left-stream { left: 10px; text-align: left; }
      .right-stream { right: 10px; text-align: right; }
      .telemetry-stream::after { content: "01011010 POS_X: 42.102 SYNCING... PING 24ms COORDINATES LOCKED 12.09N 77.01E ALTITUDE 400KM TARGET_SAT_ISS_01 DATA_PACKET_RECEIVED [OK]"; display: block; animation: streamScroll 15s linear infinite; }
      @keyframes streamScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }

      /* Floating Satellites */
      .sat-anim { position: absolute; width: 40px; height: 40px; opacity: 0.15; pointer-events: none; z-index: 1; filter: drop-shadow(0 0 5px #7ee7ff); }
      .sat-1 { top: 20%; left: -50px; animation: orbit1 25s infinite linear; background: url('data:image/svg+xml;utf8,${getSatSVG("#7ee7ff")}') no-repeat; }
      .sat-2 { top: 60%; right: -50px; animation: orbit2 35s infinite linear; background: url('data:image/svg+xml;utf8,${getSatSVG("#7ee7ff")}') no-repeat; }
      @keyframes orbit1 { from { transform: translateX(0vw) rotate(0deg); } to { transform: translateX(110vw) rotate(360deg); } }
      @keyframes orbit2 { from { transform: translateX(0) rotate(0deg); } to { transform: translateX(-110vw) rotate(-360deg); } }

      .radar-sweep { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, transparent, rgba(126, 231, 255, 0.05) 50%, transparent 100%); background-size: 100% 200px; animation: sweep 8s linear infinite; pointer-events: none; z-index: 1; }
      @keyframes sweep { from { background-position: 0 -200px; } to { background-position: 0 100vh; } }

      .glitch-text { font-family: monospace; color: #7ee7ff; letter-spacing: 1em; margin-bottom: 10px; position: relative; }
      .typewriter { font-family: monospace; font-size: 10px; color: #7ee7ff; letter-spacing: 0.2em; overflow: hidden; white-space: nowrap; border-right: 2px solid; animation: typing 2s steps(40, end), blink .75s step-end infinite; margin: 0 auto; width: fit-content; }
      @keyframes typing { from { width: 0 } to { width: 100% } }
      @keyframes blink { from, to { border-color: transparent } 50% { border-color: #7ee7ff } }

      .hud-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 40px; }
      .hud-card { background: rgba(126, 231, 255, 0.03); border: 1px solid rgba(126, 231, 255, 0.1); padding: 15px; position: relative; text-align: left; transition: all 0.3s; display: flex; align-items: center; gap: 12px; }
      .hud-card:hover { background: rgba(126, 231, 255, 0.08); border-color: rgba(126, 231, 255, 0.3); transform: translateY(-2px); }
      .card-icon { width: 24px; color: #7ee7ff; opacity: 0.8; }
      .hud-card h4 { color: #7ee7ff; font-family: monospace; font-size: 12px; margin: 0 0 5px; letter-spacing: 1px; }
      .hud-card p { color: rgba(255,255,255,0.6); font-size: 11px; margin: 0; }
      .signal-bar { width: 100%; height: 2px; background: rgba(126, 231, 255, 0.1); margin-top: 8px; position: relative; overflow: hidden; }
      .signal-bar .fill { height: 100%; background: #7ee7ff; box-shadow: 0 0 5px #7ee7ff; animation: signalPulse 2s infinite ease-in-out; }
      @keyframes signalPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      
      .status-dot { width: 6px; height: 6px; background: #00ff88; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #00ff88; animation: blinkStatus 1.5s infinite; }
      @keyframes blinkStatus { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

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
        position: absolute; width: 100%; height: 100%; z-index: 0;
        background: radial-gradient(circle at 30% 20%, rgba(0, 120, 255, 0.08), transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(100, 0, 255, 0.05), transparent 50%);
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

function getSatSVG(color = "currentColor") {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5"><rect x="2" y="9" width="4" height="6"/><rect x="18" y="9" width="4" height="6"/><path d="M6 12h12M12 8v8M12 12l3 3M12 12l-3-3"/><circle cx="12" cy="12" r="2" fill="${color}"/></svg>`;
}

function getAsteroidSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/><path d="M12 22V12M12 12L4 7M12 12l8-5"/></svg>`;
}

function getEarthSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
}

function getNavSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M12 9l3 3-3 3-3-3 3-3z"/></svg>`;
}
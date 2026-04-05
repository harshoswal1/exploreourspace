export function createHomePage(onStart) {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  // Inject high-end sci-fi fonts
  if (!document.getElementById('sci-fi-fonts')) {
    const link = document.createElement('link');
    link.id = 'sci-fi-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=Share+Tech+Mono&display=swap';
    document.head.appendChild(link);
  }

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'radial-gradient(circle at center, rgba(10, 20, 40, 0.4) 0%, rgba(0, 0, 0, 0.9) 100%)';
  overlay.style.backdropFilter = 'blur(15px)';
  overlay.style.webkitBackdropFilter = 'blur(15px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '5000';
  overlay.style.color = 'white';
  overlay.style.fontFamily = "'Rajdhani', sans-serif";
  overlay.style.textAlign = 'center';
  overlay.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
  overlay.style.padding = '20px';
  overlay.style.overflowY = 'auto'; // Safety for very small screens

  const content = `
    <div class="vignette"></div>

    <!-- System Integrity Bar -->
    <div class="integrity-bar-wrap" id="integrity-container" style="position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); width: 240px; z-index: 10; opacity: 0; pointer-events: none; transition: opacity 0.5s ease;">
      <div class="integrity-label">ESTABLISHING QUANTUM LINK</div>
      <div class="integrity-track"><div class="integrity-fill" id="integrity-fill"></div></div>
    </div>

    <div class="story-wrapper" style="max-width: 800px; position: relative; z-index: 10; width: 100%;">
      <div id="story-step-1" class="intro-sequence">
        <div class="glitch-text" style="font-family: 'Orbitron'; font-weight: 700; color: #ffcc33;">INTRODUCING</div>
        <h1 style="font-size: ${isMobile ? '36px' : '72px'}; font-weight: 900; letter-spacing: 0.2em; margin: 10px 0 0; color: #fff; text-shadow: 0 0 30px rgba(255, 204, 51, 0.4); font-family: 'Orbitron', sans-serif; text-transform: uppercase;">THE SPACE</h1>
        <div style="font-size: ${isMobile ? '12px' : '18px'}; font-family: 'Rajdhani', sans-serif; letter-spacing: 0.8em; text-transform: uppercase; color: #fff; font-weight: 500; margin-bottom: 10px;">COMPANY</div>
        <div style="height: 2px; width: 120px; background: linear-gradient(90deg, transparent, #ffcc33, transparent); margin: 20px auto;"></div>
        
        <div style="margin-top: 50px;">
          <button id="next-btn" class="sci-fi-btn" style="padding: 18px 55px; font-size: 14px;">
            <span class="btn-text">NEXT</span>
          </button>
        </div>
      </div>

      <div id="story-step-2" style="display: none; animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="tech-header">
          <span class="status-dot"></span> <span class="bracket">[</span> SYSTEM STATUS: ACTIVE <span class="bracket">]</span>
        </div>
        <h2 style="font-size: ${isMobile ? '20px' : '36px'}; letter-spacing: 0.4em; color: #fff; text-transform: uppercase; margin: 10px 0 15px; font-weight: 700; font-family: 'Orbitron';">Core Modules</h2>
        
        <!-- Unique Summary Brief -->
        <div class="mission-brief">
          <span class="brief-tag">MISSION BRIEF:</span> 
          Initialize a unified strategic uplink to monitor Earth's orbital congestion, celestial hazards, and planetary health through multi-spectral data streams.
        </div>
        
        <div class="hud-info-grid">
          <div class="module-item">
            <div class="card-icon">${getSatSVG("#ffcc33")}</div>
            <div class="card-content">
              <div class="module-header"><h4>Orbital Surveillance</h4> <span class="module-status">NOMINAL</span></div>
              <p>Mapping the 800+ active satellites currently maintaining LEO/MEO positions via real-time telemetry.</p>
            </div>
          </div>
          <div class="module-item">
            <div class="card-icon">${getAsteroidSVG("#ffcc33")}</div>
            <div class="card-content">
              <div class="module-header"><h4>Deep Space Guard</h4> <span class="module-status">SCANNING</span></div>
              <p>Real-time trajectory interception for Near-Earth Objects (NEOs) sourced directly from NASA JPL feeds.</p>
            </div>
          </div>
          <div class="module-item">
            <div class="card-icon">${getEarthSVG("#ffcc33")}</div>
            <div class="card-content">
              <div class="module-header"><h4>Planetary Vitals</h4> <span class="module-status">ACTIVE</span></div>
              <p>Multi-spectral Earth diagnostics, providing atmospheric data and climate metadata across global coordinates.</p>
            </div>
          </div>
        </div>
        
        <!-- Boot Log inside step 2, but hidden until Explore is clicked -->
        <div class="boot-log" id="boot-log" style="opacity: 0; transition: opacity 0.5s ease;"></div>

        <button id="explore-btn" class="sci-fi-btn">
          <div class="btn-content">
            <span class="btn-text">EXPLORE EARTH</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Bottom Signature -->
    <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10; font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(126, 231, 255, 0.5); text-transform: uppercase;">
      @Harsh Oswal
    </div>

    <style>
      * { box-sizing: border-box; }
      .vignette { position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle, transparent 40%, black 150%); z-index: 1; }
      .intro-sequence { animation: introFade 5s forwards; }
      @keyframes introFade { 0% { opacity:0; transform:scale(1.1); } 20% { opacity:1; } 100% { opacity:1; transform:scale(1); } }
      
      .boot-log { font-family: 'Share Tech Mono'; font-size: 11px; color: #7ee7ff; opacity: 0.7; margin-top: 30px; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; height: 60px; overflow: hidden; line-height: 1.6; text-transform: uppercase; }

      .integrity-label { font-size: 10px; color: #7ee7ff; text-align: center; margin-bottom: 10px; letter-spacing: 2px; font-weight: 700; font-family: 'Share Tech Mono'; }
      .integrity-track { width: 100%; height: 2px; background: rgba(126, 231, 255, 0.1); border-radius: 1px; overflow: hidden; }
      .integrity-fill { height: 100%; width: 0%; background: #7ee7ff; box-shadow: 0 0 10px #7ee7ff; transition: width 3s cubic-bezier(0.1, 0, 0.1, 1); }

      .glitch-text { font-family: 'Rajdhani'; font-size: 14px; font-weight: 700; color: #ffcc33; letter-spacing: 0.4em; margin-bottom: 15px; position: relative; }
      .typewriter { font-family: 'Share Tech Mono'; font-size: 14px; font-weight: 500; color: #ffcc33; letter-spacing: 0.3em; overflow: hidden; white-space: nowrap; border-right: 2px solid; animation: typing 2s steps(40, end), blink .75s step-end infinite; margin: 0 auto; width: fit-content; text-transform: uppercase; }
      @keyframes typing { from { width: 0 } to { width: 100% } }
      @keyframes blink { from, to { border-color: transparent } 50% { border-color: #ffcc33 } }

      .hud-info-grid { display: flex; flex-direction: column; gap: 20px; margin-bottom: 50px; max-width: 600px; margin-left: auto; margin-right: auto; }
      .module-item { padding: 15px 20px; position: relative; text-align: left; display: flex; align-items: center; gap: 25px; transition: all 0.3s ease; background: rgba(255, 204, 51, 0.02); border-left: 2px solid rgba(255, 204, 51, 0.1); }
      .module-item:hover { transform: translateX(10px); background: rgba(255, 204, 51, 0.05); border-left-color: #ffcc33; }
      .card-icon { width: 24px; color: #ffcc33; opacity: 0.8; }
      .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
      .module-item h4 { color: #fff; font-family: 'Orbitron'; font-size: 14px; margin: 0; letter-spacing: 2px; font-weight: 700; }
      .module-status { font-family: 'Share Tech Mono'; font-size: 9px; color: #ffcc33; letter-spacing: 1px; opacity: 0.6; border: 1px solid rgba(255, 204, 51, 0.3); padding: 2px 6px; border-radius: 2px; }
      .module-item p { color: rgba(255, 204, 51, 0.6); font-family: 'Rajdhani'; font-size: 14px; font-weight: 500; margin: 0; line-height: 1.4; max-width: 450px; }

      .mission-brief {
        font-family: 'Rajdhani';
        font-size: 14px;
        color: rgba(255, 204, 51, 0.8);
        margin-bottom: 30px;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.6;
        letter-spacing: 1px;
        border-top: 1px solid rgba(255, 204, 51, 0.3);
        border-bottom: 1px solid rgba(255, 204, 51, 0.3);
        padding: 15px 0;
        text-align: center;
      }
      .brief-tag { color: #ffcc33; font-weight: 700; margin-right: 8px; font-family: 'Orbitron'; font-size: 11px; }

      .status-dot { width: 6px; height: 6px; background: #00ff88; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #00ff88; animation: blinkStatus 1.5s infinite; }
      @keyframes blinkStatus { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      .tech-header { font-family: 'Orbitron'; font-weight: 700; font-size: 12px; letter-spacing: 2px; color: #ffcc33; margin-bottom: 10px; }

      .sci-fi-btn { 
        background: rgba(255, 204, 51, 0.05); border: 1px solid #ffcc33; color: #ffcc33; padding: 22px 60px; 
        font-family: 'Orbitron'; font-weight: 900; letter-spacing: 5px; cursor: pointer; position: relative;
        overflow: hidden; transition: all 0.3s; 
        border-radius: 4px;
      }
      .sci-fi-btn:hover { background: #ffcc33; color: #000; box-shadow: 0 0 40px rgba(255, 204, 51, 0.5); transform: translateY(-3px); }
      .btn-text { position: relative; z-index: 2; }
    </style>
  `;

  overlay.innerHTML = content;
  document.body.appendChild(overlay);

  const integrityFill = overlay.querySelector('#integrity-fill');
  const integrityContainer = overlay.querySelector('#integrity-container');
  const log = overlay.querySelector('#boot-log');

  // Handle Story Transitions
  const step1 = overlay.querySelector('#story-step-1');
  const step2 = overlay.querySelector('#story-step-2');
  const nextBtn = overlay.querySelector('#next-btn');

  nextBtn.addEventListener('click', () => {
    step1.style.display = 'none';
    step2.style.display = 'block';
    step2.style.animation = 'step2In 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards';
    
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `@keyframes step2In { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(styleSheet);
  });

  const btn = overlay.querySelector('#explore-btn');
  const hudGrid = overlay.querySelector('.hud-info-grid');
  const missionBrief = overlay.querySelector('.mission-brief');
  const techHeader = overlay.querySelector('.tech-header');
  const capabilitiesTitle = overlay.querySelector('h2');

  btn.addEventListener('click', () => {
    // Hide Step 2 UI elements to make room for loader
    btn.style.display = 'none';
    hudGrid.style.opacity = '0';
    missionBrief.style.opacity = '0';
    techHeader.style.opacity = '0';
    capabilitiesTitle.style.opacity = '0';

    // Show Loader
    integrityContainer.style.opacity = '1';
    log.style.opacity = '1';

    const messages = [
      "> AUTHENTICATING COMMANDER: HARSH OSWAL",
      "> DECRYPTING SAT-UPLINK [AES-256]",
      "> FETCHING TLE ORBITAL PARAMETERS...",
      "> NASA NEO FEED: CONNECTED",
      "> ATMOSPHERIC SCANNERS: CALIBRATING",
      "> SYSTEM CORE: READY"
    ];

    messages.forEach((msg, i) => {
      setTimeout(() => {
        log.innerHTML += `<div>${msg}</div>`;
        integrityFill.style.width = `${(i + 1) * 16.6}%`;

        // Final Transition after last message
        if (i === messages.length - 1) {
          setTimeout(() => {
            overlay.style.transition = 'all 1.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
              if (onStart) onStart();
              overlay.style.visibility = 'hidden';
              setTimeout(() => overlay.remove(), 500);
            }, 600);
          }, 800);
        }
      }, 500 * i);
    });
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
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
    <!-- Animated Starfield Background -->
    <div class="nebula"></div>
    <div class="nebula2"></div>
    <div class="hud-grid"></div>
    <div class="scanline"></div>
    <div class="css-stars"></div>

    <div class="story-wrapper" style="max-width: 600px; position: relative; z-index: 2;">
      <div id="story-step-1" class="fade-in-out">
        <h2 style="font-size: ${isMobile ? '18px' : '24px'}; letter-spacing: 0.8em; text-transform: uppercase; color: #ffffff; margin-bottom: 20px; font-weight: 200; font-family: 'Courier New', monospace;">COMMANDER <br/> <span style="font-weight: 800; color: #7ee7ff; text-shadow: 0 0 15px #7ee7ff;">HARSH OSWAL</span></h2>
        <p style="font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #7ee7ff; opacity: 0.6; margin-top: 40px; font-family: monospace;">[ ESTABLISHING UPLINK... ]</p>
      </div>

      <div id="story-step-2" style="display: none;">
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: ${isMobile ? '32px' : '58px'}; text-transform: uppercase; letter-spacing: 0.4em; margin-bottom: 10px; font-weight: 900; color: #ffffff; text-shadow: 0 0 40px rgba(124, 200, 255, 0.8);">WELCOME TO THE UNIVERSE</h1>
        </div>
        <p style="font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #a0c8ff; margin-bottom: 40px;">Data Visualization Protocol v4.0</p>
        
        <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'}; gap: 20px; text-align: left; margin-bottom: 50px; background: rgba(0, 20, 40, 0.4); padding: 25px; border-left: 4px solid #7ee7ff; border-radius: 4px; border-top: 1px solid rgba(126, 231, 255, 0.2); backdrop-filter: blur(15px);">
          <div>
            <h3 style="color: #ffe066; font-size: 11px; margin-bottom: 6px; font-family: monospace;">> ORBITAL_SENSORS</h3>
            <p style="font-size: 10px; line-height: 1.5; color: rgba(160, 200, 255, 0.8);">800+ Active satellites synced via TLE telemetry.</p>
          </div>
          <div>
            <h3 style="color: #f5712a; font-size: 11px; margin-bottom: 6px; font-family: monospace;">> NEO_DETECTION</h3>
            <p style="font-size: 10px; line-height: 1.5; color: rgba(160, 200, 255, 0.8);">NASA live-feed asteroid trajectory mapping.</p>
          </div>
          <div>
            <h3 style="color: #7ee7ff; font-size: 11px; margin-bottom: 6px; font-family: monospace;">> GEO_METRICS</h3>
            <p style="font-size: 10px; line-height: 1.5; color: rgba(160, 200, 255, 0.8);">Surface climate analysis & regional data projection.</p>
          </div>
          <div>
            <h3 style="color: #ffffff; font-size: 11px; margin-bottom: 6px; font-family: monospace;">> NAV_SYSTEM</h3>
            <p style="font-size: 10px; line-height: 1.5; color: rgba(160, 200, 255, 0.8);">Tactical rotation, zoom, and target locking controls.</p>
          </div>
        </div>

        <button id="explore-btn" style="
          padding: 20px 60px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: white;
          background: linear-gradient(135deg, rgba(30, 75, 138, 0.8) 0%, rgba(10, 20, 40, 0.9) 100%);
          border: 1px solid #7ee7ff;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(30, 75, 138, 0.5);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: monospace;
        ">Explore Earth</button>
      </div>
    </div>

    <style>
      .fade-in-out { animation: fadeInOut 3s forwards; }
      @keyframes fadeInOut {
        0% { opacity: 0; transform: scale(0.95); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.05); }
      }

      .hud-grid {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
        background-image: linear-gradient(rgba(126, 231, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126, 231, 255, 0.05) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .scanline {
        position: absolute; top: 0; left: 0; width: 100%; height: 2px; z-index: 2; pointer-events: none;
        background: rgba(126, 231, 255, 0.2); box-shadow: 0 0 15px rgba(126, 231, 255, 0.4);
        animation: scan 8s linear infinite;
      }
      @keyframes scan { 0% { top: -5%; } 100% { top: 105%; } }

      .nebula {
        position: absolute; width: 150%; height: 150%;
        background: radial-gradient(circle at 30% 30%, rgba(100, 50, 255, 0.05), transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(0, 120, 255, 0.05), transparent 50%);
        filter: blur(80px);
        animation: drift 40s infinite alternate linear;
      }
      .nebula2 {
        position: absolute; width: 150%; height: 150%;
        background: radial-gradient(circle at 80% 20%, rgba(255, 50, 150, 0.05), transparent 40%),
                    radial-gradient(circle at 20% 80%, rgba(0, 255, 200, 0.05), transparent 40%);
        filter: blur(60px);
        animation: drift 60s infinite alternate-reverse linear;
      }
      @keyframes drift { 
        from { transform: translate(-10%, -10%) rotate(0deg); } 
        to { transform: translate(5%, 5%) rotate(5deg); } 
      }
      
      /* Reliable CSS Stars */
      .css-stars {
        position: absolute; width: 100%; height: 100%;
        background-image: 
          radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
          radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
          radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
        background-size: 550px 550px, 350px 350px, 250px 250px;
        background-position: 0 0, 40px 60px, 130px 270px;
        z-index: 1;
        opacity: 0.4;
      }

      #explore-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 60px rgba(124, 200, 255, 0.7);
        background: linear-gradient(135deg, #2561b3 0%, #0a1428 100%);
        border-color: rgba(124, 200, 255, 0.8);
      }
      #explore-btn:active { transform: scale(0.98); }
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
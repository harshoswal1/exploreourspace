export function createHomePage(onStart) {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  // Deep space base gradient
  overlay.style.background = 'radial-gradient(circle at center, #001233 0%, #000814 100%)';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.webkitBackdropFilter = 'blur(10px)';
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
    <div class="stars-container">
      <div class="stars"></div>
      <div class="stars2"></div>
    </div>

    <div class="story-wrapper" style="max-width: 600px; position: relative; z-index: 2;">
      <div id="story-step-1" class="fade-in-out">
        <h2 style="font-size: ${isMobile ? '18px' : '24px'}; letter-spacing: 0.8em; text-transform: uppercase; color: #ffffff; margin-bottom: 20px; font-weight: 300;">Harsh Oswal <br/> <span style="font-size: 0.5em; opacity: 0.5; letter-spacing: 0.3em;">Presents</span></h2>
        <p style="font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #7ee7ff; opacity: 0.8; margin-top: 40px;">Initializing Cosmic Link...</p>
      </div>

      <div id="story-step-2" style="display: none;">
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: ${isMobile ? '32px' : '58px'}; text-transform: uppercase; letter-spacing: 0.4em; margin-bottom: 10px; font-weight: 900; color: #ffffff; text-shadow: 0 0 40px rgba(124, 200, 255, 0.8);">WELCOME TO THE UNIVERSE</h1>
        </div>
        <p style="font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #a0c8ff; margin-bottom: 40px;">Data Visualization Protocol v4.0</p>
        
        <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'}; gap: 20px; text-align: left; margin-bottom: 50px; background: rgba(255,255,255,0.03); padding: 25px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(15px); border-bottom: 2px solid rgba(124, 200, 255, 0.2);">
          <div>
            <h3 style="color: #ffe066; font-size: 13px; margin-bottom: 6px;">🛰️ TRACKING</h3>
            <p style="font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.7);"><span style="color:#ffe066">Yellow</span> nodes represent 800+ live satellites.</p>
          </div>
          <div>
            <h3 style="color: #f5712a; font-size: 13px; margin-bottom: 6px;">☄️ THREATS</h3>
            <p style="font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.7);"><span style="color:#f5712a">Orange</span> markers track Near-Earth Asteroids.</p>
          </div>
          <div>
            <h3 style="color: #7ee7ff; font-size: 13px; margin-bottom: 6px;">🌍 INSIGHTS</h3>
            <p style="font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.7);">Interact with Earth to view real-time climate and region data.</p>
          </div>
          <div>
            <h3 style="color: #ffffff; font-size: 13px; margin-bottom: 6px;">🕹️ NAVIGATE</h3>
            <p style="font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.7);">Drag to rotate, Scroll to zoom, Double-Tap to focus on objects.</p>
          </div>
        </div>

        <button id="explore-btn" style="
          padding: 20px 60px;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: white;
          background: linear-gradient(135deg, #1e4b8a 0%, #0a1428 100%);
          border: 1px solid rgba(124, 200, 255, 0.4);
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(30, 75, 138, 0.5);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          outline: none;
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

      .nebula {
        position: absolute; width: 150%; height: 150%;
        background: radial-gradient(circle at 30% 30%, rgba(100, 50, 255, 0.15), transparent 40%),
                    radial-gradient(circle at 70% 60%, rgba(50, 150, 255, 0.15), transparent 40%);
        filter: blur(80px);
        animation: drift 40s infinite alternate linear;
      }
      @keyframes drift { from { transform: rotate(0deg) scale(1); } to { transform: rotate(10deg) scale(1.1); } }
      
      .stars-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: hidden; }
      .stars, .stars2, .stars3 { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; display: block; }
      .stars { background: #000 url(https://www.script-tutorials.com/demos/360/images/stars.png) repeat top center; z-index: 0; animation: move-stars 200s linear infinite; }
      .stars2 { background: transparent url(https://www.script-tutorials.com/demos/360/images/twinkling.png) repeat top center; z-index: 1; animation: move-twink 200s linear infinite; }
      
      @keyframes move-stars { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }
      @keyframes move-twink { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }

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
export function createAudioControl() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  
  // Using a more stable redirector link from Archive.org
  const audio = new Audio();
  audio.src = 'https://archive.org/download/interstellar-main-theme-hans-zimmer/Interstellar%20Main%20Theme%20-%20Hans%20Zimmer.mp3';
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = 'auto';

  const button = document.createElement('button');
  button.dataset.uiElement = 'true';
  button.innerHTML = '🔇';
  button.title = 'Play Background Music';
  button.style.position = 'absolute';
  
  // Positioned in the top-right area, between the Live Badge and the Search Bar
  button.style.top = isMobile ? '12px' : '25px';
  button.style.right = isMobile ? '70px' : '492px';
  
  button.style.width = isMobile ? '32px' : '40px';
  button.style.height = isMobile ? '32px' : '40px';
  button.style.borderRadius = '50%';
  button.style.background = 'rgba(8,12,20,0.58)';
  button.style.border = '1px solid rgba(255,255,255,0.18)';
  button.style.backdropFilter = 'blur(18px)';
  button.style.webkitBackdropFilter = 'blur(18px)';
  button.style.color = 'white';
  button.style.fontSize = isMobile ? '14px' : '18px';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.zIndex = '25';
  button.style.transition = 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease';
  button.style.outline = 'none';

  let isPlaying = false;

  audio.addEventListener('error', () => {
    console.error('Audio failed to load. Check your network or the source URL.');
    button.innerHTML = '⚠️';
    button.title = 'Audio failed to load';
  });

  button.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      button.innerHTML = '🔇';
      button.style.boxShadow = 'none';
      isPlaying = false;
    } else {
      // Show a loading icon if the audio hasn't buffered enough to play yet
      if (audio.readyState < 2) {
        button.innerHTML = '⏳';
      }

      audio.play()
        .then(() => {
          isPlaying = true;
          button.innerHTML = '🔊';
          button.style.boxShadow = '0 0 15px rgba(124, 200, 255, 0.4)';
        })
        .catch(err => {
          console.warn('Playback failed. This usually happens if the browser blocks audio or the file is missing:', err);
          button.innerHTML = '🔇';
          isPlaying = false;
        });
    }
  });

  button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.1)');
  button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

  document.body.appendChild(button);
  
  return { button, audio };
}
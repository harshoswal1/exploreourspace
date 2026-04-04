export function createAudioControl() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  
  // Using a public archive link for the Interstellar Main Theme
  const audio = new Audio('https://ia801404.us.archive.org/24/items/interstellar-main-theme-hans-zimmer/Interstellar%20Main%20Theme%20-%20Hans%20Zimmer.mp3');
  audio.loop = true;
  audio.volume = 0.4;

  const button = document.createElement('button');
  button.dataset.uiElement = 'true';
  button.innerHTML = '🔇';
  button.title = 'Play Background Music';
  button.style.position = 'absolute';
  
  // Positioned in the top-right area, between the Live Badge and the Search Bar
  button.style.top = isMobile ? '12px' : '20px';
  button.style.right = isMobile ? '70px' : '72px';
  
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

  button.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      button.innerHTML = '🔇';
      button.style.boxShadow = 'none';
    } else {
      audio.play().catch(err => console.warn('Audio playback blocked by browser policy:', err));
      button.innerHTML = '🔊';
      button.style.boxShadow = '0 0 15px rgba(124, 200, 255, 0.4)';
    }
    isPlaying = !isPlaying;
  });

  button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.1)');
  button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');

  document.body.appendChild(button);
  
  return { button, audio };
}
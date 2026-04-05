const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3', // Heavy cinematic thud (Match Start vibe)
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Sharp tactical UI click
  transition: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3', // Mechanical menu slide
  lock: 'https://assets.mixkit.co/active_storage/sfx/588/588-preview.mp3', // Metallic chambering (Weapon Lock)
  error: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Tactical error buzz
  zoom: 'https://assets.mixkit.co/active_storage/sfx/594/594-preview.mp3' // Mechanical scope adjustment snap
};

const sounds = {};

// Preload sounds
Object.entries(SFX_URLS).forEach(([key, url]) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.preload = 'auto';
  sounds[key] = audio;
});

/**
 * Plays a sound effect by key.
 * @param {string} key - 'boot', 'click', 'transition', 'lock', 'error', or 'zoom'
 */
export function playSFX(key) {
  const sfx = sounds[key];
  if (sfx) {
    // Clone the node so we can play the same sound overlappingly
    const track = sfx.cloneNode();
    track.volume = sfx.volume;
    track.play().catch(() => { /* Ignore autoplay blocks */ });
  }
}
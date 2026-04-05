const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // High tech beep
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Short digital blip
  transition: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3', // Digital whoosh
  lock: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', // Target lock
  error: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Low buzz
  zoom: 'https://assets.mixkit.co/active_storage/sfx/2805/2805-preview.mp3' // Mechanical camera zoom
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
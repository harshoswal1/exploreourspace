const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', // Instant mechanical lock
  click: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3', // Tiny metallic click
  transition: 'https://assets.mixkit.co/active_storage/sfx/592/592-preview.mp3', // Fast metallic slide
  lock: 'https://assets.mixkit.co/active_storage/sfx/875/875-preview.mp3', // Quick metallic latch
  error: 'https://assets.mixkit.co/active_storage/sfx/122/122-preview.mp3', // Quick mechanical grind
  zoom: 'https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3' // Instant mechanical snap (bearing hit)
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
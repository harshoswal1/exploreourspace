const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  transition: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  lock: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  zoom: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3'
};

const sounds = {};

// Preload sounds
Object.entries(SFX_URLS).forEach(([key, url]) => {
  const audio = new Audio(url);
  audio.volume = 0.1;
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
    // Stop any current playback and reset to ensure "one beat" response
    sfx.currentTime = 0;
    sfx.play().catch(() => { /* Ignore autoplay blocks */ });
  }
}
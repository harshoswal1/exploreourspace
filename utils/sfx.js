const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  transition: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  lock: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  zoom: 'https://assets.mixkit.co/active_storage/sfx/441/441-preview.mp3',
  loading: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3' // Computer data processing loop
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
 * @param {string} key - 'boot', 'click', 'transition', 'lock', 'error', 'zoom', or 'loading'
 * @param {boolean} loop - Whether the sound should loop
 */
export function playSFX(key, loop = false) {
  const sfx = sounds[key];
  if (sfx) {
    sfx.currentTime = 0;
    sfx.loop = loop;
    sfx.play().catch(() => { /* Ignore autoplay blocks */ });
  }
}

/**
 * Stops a specific sound effect.
 * @param {string} key 
 */
export function stopSFX(key) {
  const sfx = sounds[key];
  if (sfx) {
    sfx.pause();
    sfx.currentTime = 0;
  }
}
const SFX_URLS = {
  boot: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3', // Mechanical power hum
  click: 'https://assets.mixkit.co/active_storage/sfx/878/878-preview.mp3', // Heavy metallic switch
  transition: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3', // Industrial metal slide
  lock: 'https://assets.mixkit.co/active_storage/sfx/875/875-preview.mp3', // Heavy metallic latch
  error: 'https://assets.mixkit.co/active_storage/sfx/122/122-preview.mp3', // Mechanical grinding
  zoom: 'https://assets.mixkit.co/active_storage/sfx/2823/2823-preview.mp3' // Metallic ball bearing / rolling friction
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
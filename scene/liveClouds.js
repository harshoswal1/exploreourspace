import * as THREE from 'https://esm.sh/three@0.152.2';

const FALLBACK_CLOUDS_URL =
  'https://threejs.org/examples/textures/planets/earth_clouds_1024.png';

export function createLiveCloudLayer(renderer) {
  const fallbackTexture = new THREE.TextureLoader().load(FALLBACK_CLOUDS_URL);
  fallbackTexture.colorSpace = THREE.SRGBColorSpace;
  fallbackTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  return {
    texture: fallbackTexture,
    fallbackTexture,
    getStatus: () => 'FALLBACK',
    isUsingFallback: () => true,
    update: () => {},
  };
}

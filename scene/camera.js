import * as THREE from 'https://esm.sh/three@0.152.2';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 10);

  return camera;
}

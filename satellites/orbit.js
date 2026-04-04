import * as satellite from 'https://esm.sh/satellite.js@4.0.0';
import * as THREE from 'https://esm.sh/three@0.152.2';

export function getPosition(satrec) {
  if (satrec?.staticPosition) {
    return new THREE.Vector3(...satrec.staticPosition);
  }

  const now = new Date();
  const pv = satellite.propagate(satrec, now);
  if (!pv.position) return null;

  const position = pv.position;
  const scale = 3 / 6371;

  const vec = new THREE.Vector3(
    position.x * scale,
    position.y * scale,
    position.z * scale
  );

  return vec.multiplyScalar(1.1);
}

export function createOrbitLine(satrec) {
  const points = [];
  if (satrec?.staticOrbit) {
    const staticPoints = satrec.staticOrbit.map(
      (point) => new THREE.Vector3(point[0], point[1], point[2])
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(staticPoints);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.4,
    });

    return new THREE.Line(geometry, material);
  }

  const now = new Date();

  for (let i = 0; i < 90; i++) {
    const time = new Date(now.getTime() + i * 60000);
    const pv = satellite.propagate(satrec, time);
    if (!pv.position) continue;

    const scale = 3 / 6371;
    const pos = new THREE.Vector3(
      pv.position.x * scale,
      pv.position.y * scale,
      pv.position.z * scale
    ).multiplyScalar(1.1);

    points.push(pos);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.4,
  });

  return new THREE.Line(geometry, material);
}

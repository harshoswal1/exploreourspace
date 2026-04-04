import * as THREE from 'https://esm.sh/three@0.152.2';

const FULL_ROTATION_MS = 60 * 60 * 1000;

function hashAngle(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash / 4294967295) * Math.PI * 2;
}

function getVisualDistance(missDistanceKm) {
  const normalized = Math.log10(Math.max(missDistanceKm, 50000));
  return THREE.MathUtils.clamp(7 + (normalized - 4.7) * 13, 7, 55);
}

function getBasePolar(name) {
  return 0.65 + (hashAngle(`${name}-polar`) / (Math.PI * 2)) * 1.3;
}

function getSpeed(entry) {
  return 0.00002 + (entry.hazardous ? 0.000025 : 0.000012);
}

function getOrbitPhase(nowMs, entry) {
  const orbitMs = FULL_ROTATION_MS / getSpeed(entry);
  const normalizedTime = ((nowMs % orbitMs) + orbitMs) % orbitMs;
  return (normalizedTime / orbitMs) * Math.PI * 2;
}

export function getAsteroidPosition(entry, nowMs) {
  const radius = getVisualDistance(entry.missDistanceKm);
  const baseAzimuth = hashAngle(entry.name);
  const basePolar = getBasePolar(entry.name);
  const angle = baseAzimuth + getOrbitPhase(nowMs, entry);

  return new THREE.Vector3(
    radius * Math.sin(basePolar) * Math.cos(angle),
    radius * Math.cos(basePolar),
    radius * Math.sin(basePolar) * Math.sin(angle)
  );
}

export function createAsteroidPath(entry) {
  const points = [];
  const radius = getVisualDistance(entry.missDistanceKm);
  const basePolar = getBasePolar(entry.name);
  const steps = 256;

  for (let i = 0; i <= steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const angle = hashAngle(entry.name) + theta;
    points.push(
      new THREE.Vector3(
        radius * Math.sin(basePolar) * Math.cos(angle),
        radius * Math.cos(basePolar),
        radius * Math.sin(basePolar) * Math.sin(angle)
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: entry.hazardous ? 0xff6f61 : 0xff9d8e,
    transparent: true,
    opacity: entry.hazardous ? 0.5 : 0.34,
  });

  return new THREE.LineLoop(geometry, material);
}

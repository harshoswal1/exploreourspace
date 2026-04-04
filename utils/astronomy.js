import * as THREE from 'https://esm.sh/three@0.152.2';

const DEG2RAD = Math.PI / 180;

export function getSolarDeclination(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86400000);

  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  return (
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)
  );
}

export function getSunDirection(date) {
  const declination = getSolarDeclination(date);

  return new THREE.Vector3(
    1,
    Math.sin(declination) * 0.45,
    0
  ).normalize();
}

import * as THREE from 'https://esm.sh/three@0.152.2';

import { createLabel } from '../satellites/mesh.js';

function createTrail(color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.45, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);

  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28,
    })
  );
}

export function createAsteroidMesh(isHazardous) {
  const color = isHazardous ? 0xff2f2f : 0xd61f1f;
  const emissive = isHazardous ? 0xff1010 : 0xc40018;
  const rimColor = isHazardous ? 0xff2424 : 0xff2d2d;
  const pointColor = isHazardous ? 0xff1f1f : 0xff2626;

  const point = new THREE.Mesh(
    new THREE.SphereGeometry(isHazardous ? 0.2 : 0.17, 12, 12),
    new THREE.MeshBasicMaterial({
      color: pointColor,
      transparent: true,
      opacity: isHazardous ? 0.92 : 0.84,
    })
  );
  point.material.toneMapped = false;

  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(isHazardous ? 0.12 : 0.1, 1),
    new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: isHazardous ? 2.4 : 2,
      roughness: 1,
      metalness: 0.02,
      flatShading: true,
    })
  );

  const glow = new THREE.Mesh(
    new THREE.IcosahedronGeometry(isHazardous ? 0.145 : 0.12, 1),
    new THREE.MeshBasicMaterial({
      color: rimColor,
      transparent: true,
      opacity: isHazardous ? 0.58 : 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

  const hitMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );

  const group = new THREE.Group();
  const trail = createTrail(rimColor);

  group.add(point);
  group.add(trail);
  group.add(glow);
  group.add(rock);
  group.add(hitMesh);
  group.userData = { point, rock, glow, trail };

  return group;
}

export function createAsteroidLabel(name) {
  const label = createLabel(name);
  label.scale.set(1.15, 0.32, 1);
  label.material.opacity = 0.9;
  return label;
}

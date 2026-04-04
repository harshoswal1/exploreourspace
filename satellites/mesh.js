import * as THREE from 'https://esm.sh/three@0.152.2';

export function createLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 64;

  context.fillStyle = 'white';
  context.font = '24px Arial';
  context.fillText(text, 10, 40);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.5, 0.4, 1);

  return sprite;
}

export function createSatelliteMesh() {
  const group = new THREE.Group();

  const pointGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
  pointMat.toneMapped = false;
  const point = new THREE.Mesh(pointGeo, pointMat);
  group.add(point);

  const bodyGeo = new THREE.BoxGeometry(0.03, 0.02, 0.02, 2, 2, 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 1.0,
    roughness: 0.4,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);

  const panelGeo = new THREE.BoxGeometry(0.12, 0.004, 0.03, 2, 2, 2);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0b1f4a,
    metalness: 0.5,
    roughness: 0.6,
  });

  const panelLeft = new THREE.Mesh(panelGeo, panelMat);
  panelLeft.position.x = -0.09;

  const panelRight = new THREE.Mesh(panelGeo, panelMat);
  panelRight.position.x = 0.09;

  const model = new THREE.Group();
  body.add(panelLeft);
  body.add(panelRight);
  model.add(body);

  const antennaGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.1);
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  antenna.rotation.z = Math.PI / 2;
  antenna.position.y = 0.03;
  model.add(antenna);

  group.add(model);

  const hitGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  group.add(hitMesh);

  group.userData = { point, model };

  return group;
}

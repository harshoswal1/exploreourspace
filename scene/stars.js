import * as THREE from 'https://esm.sh/three@0.152.2';

function randomSpherePoint(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const sinPhi = Math.sin(phi);

  return new THREE.Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta)
  );
}

function createStarLayer(count, radiusMin, radiusMax, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
    const point = randomSpherePoint(radius);
    const bandBias = Math.exp(-Math.pow(point.y / 140, 2)) * 0.4;

    point.x += (Math.random() - 0.5) * 45 * bandBias;
    point.z += (Math.random() - 0.5) * 45 * bandBias;

    positions.push(point.x, point.y, point.z);

    const temperature = Math.random();
    if (temperature < 0.14) {
      color.setRGB(0.72, 0.82, 1.0);
    } else if (temperature < 0.32) {
      color.setRGB(0.86, 0.91, 1.0);
    } else if (temperature < 0.84) {
      color.setRGB(1.0, 0.98, 0.94);
    } else {
      color.setRGB(1.0, 0.87, 0.74);
    }

    const intensity = 0.55 + Math.random() * 0.45;
    colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

export function createStars(scene) {
  const starsGroup = new THREE.Group();

  const distantStars = createStarLayer(9000, 180, 520, 0.7, 0.75);
  const brightStars = createStarLayer(1200, 150, 420, 1.5, 0.95);

  starsGroup.add(distantStars);
  starsGroup.add(brightStars);
  starsGroup.rotation.z = THREE.MathUtils.degToRad(23.5);

  scene.add(starsGroup);
  return starsGroup;
}

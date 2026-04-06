import * as THREE from 'https://esm.sh/three@0.152.2';

const WIND_SPEED_RADIUS = 3.055;
const WIND_PARTICLE_RADIUS = 3.065;
const WIND_REFRESH_MS = 15 * 60 * 1000;
const LATITUDE_STEP = 8;
const LONGITUDE_STEP = 10;
const SPEED_CANVAS_WIDTH = 2048;
const SPEED_CANVAS_HEIGHT = 1024;
const PARTICLE_CANVAS_WIDTH = 2048;
const PARTICLE_CANVAS_HEIGHT = 1024;
const PARTICLE_COUNT = 1800;

function createWindGridPoints() {
  const points = [];

  // Reduced density to lower API per-request size and avoid 429.
  for (let latitude = -80; latitude <= 80; latitude += 16) {
    for (let longitude = -180; longitude < 180; longitude += 16) {
      points.push({ latitude, longitude });
    }
  }

  return points;
}

function buildLiveWindUrl(points) {
  const latitudes = points.map((point) => point.latitude).join(',');
  const longitudes = points.map((point) => point.longitude).join(',');

  return (
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitudes}` +
    `&longitude=${longitudes}` +
    '&current=wind_speed_10m,wind_direction_10m' +
    '&wind_speed_unit=ms' +
    '&timeformat=unixtime' +
    '&cell_selection=nearest'
  );
}

async function fetchJsonWithRetry(url, options = {}) {
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { ...options, cache: 'no-store' });
      if (response.ok) return response;

      if (response.status === 429) {
        const delay = Math.min(60000, BASE_DELAY_MS * Math.pow(2, attempt));
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (attempt === MAX_ATTEMPTS) {
          throw new Error('Live wind request failed with status 429');
        }
        continue;
      }

      throw new Error(`Live wind request failed with status ${response.status}`);
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * attempt));
    }
  }
}


function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapUnit(value) {
  let wrapped = value;
  while (wrapped < 0) wrapped += 1;
  while (wrapped >= 1) wrapped -= 1;
  return wrapped;
}

function samplePalette(t) {
  const stops = [
    [0.0, [63, 74, 153]],
    [0.25, [78, 132, 211]],
    [0.5, [95, 208, 207]],
    [0.72, [163, 232, 162]],
    [0.88, [255, 214, 102]],
    [1.0, [255, 120, 90]],
  ];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1) {
      const alpha = (t - t0) / (t1 - t0 || 1);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * alpha),
        Math.round(c0[1] + (c1[1] - c0[1]) * alpha),
        Math.round(c0[2] + (c1[2] - c0[2]) * alpha),
      ];
    }
  }

  return stops[stops.length - 1][1];
}

function createWindTextures() {
  const speedCanvas = document.createElement('canvas');
  speedCanvas.width = SPEED_CANVAS_WIDTH;
  speedCanvas.height = SPEED_CANVAS_HEIGHT;

  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = PARTICLE_CANVAS_WIDTH;
  particleCanvas.height = PARTICLE_CANVAS_HEIGHT;

  const speedTexture = new THREE.CanvasTexture(speedCanvas);
  speedTexture.colorSpace = THREE.SRGBColorSpace;
  speedTexture.needsUpdate = true;

  const particleTexture = new THREE.CanvasTexture(particleCanvas);
  particleTexture.colorSpace = THREE.SRGBColorSpace;
  particleTexture.needsUpdate = true;

  return { speedCanvas, particleCanvas, speedTexture, particleTexture };
}

function createWindMeshes(speedTexture, particleTexture) {
  const group = new THREE.Group();

  const speedMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WIND_SPEED_RADIUS, 128, 128),
    new THREE.MeshBasicMaterial({
      map: speedTexture,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );

  const particleMesh = new THREE.Mesh(
    new THREE.SphereGeometry(WIND_PARTICLE_RADIUS, 128, 128),
    new THREE.MeshBasicMaterial({
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );

  group.add(speedMesh);
  group.add(particleMesh);

  return { group, speedMesh, particleMesh };
}

function buildGridIndex(points) {
  const latitudes = [...new Set(points.map((point) => point.latitude))].sort((a, b) => a - b);
  const longitudes = [...new Set(points.map((point) => point.longitude))].sort((a, b) => a - b);
  const map = new Map();

  points.forEach((point, index) => {
    map.set(`${point.latitude}:${point.longitude}`, index);
  });

  return { latitudes, longitudes, map };
}

async function fetchLiveWinds(points) {
  const response = await fetchJsonWithRetry(buildLiveWindUrl(points), { mode: 'cors', cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Live wind request failed with status ${response.status}`);
  }

  const data = await response.json();
  const locations = Array.isArray(data) ? data : [data];

  return points.map((point, index) => {
    const sample = locations[index]?.current;
    return {
      latitude: point.latitude,
      longitude: point.longitude,
      speed: Number(sample?.wind_speed_10m ?? 0),
      direction: Number(sample?.wind_direction_10m ?? 0),
    };
  });
}

function createFallbackWinds(points) {
  return points.map((point) => {
    const absLat = Math.abs(point.latitude);
    const zonal =
      absLat < 15 ? -7.5 : absLat < 30 ? -10.5 : absLat < 60 ? 14.5 : -8;
    const meridional = Math.sin(THREE.MathUtils.degToRad(point.longitude * 1.8)) * 2.4;
    const speed = Math.hypot(zonal, meridional);
    const direction =
      (270 - THREE.MathUtils.radToDeg(Math.atan2(meridional, zonal)) + 360) % 360;

    return {
      latitude: point.latitude,
      longitude: point.longitude,
      speed,
      direction,
    };
  });
}

function getWindVector(sample) {
  const directionRad = THREE.MathUtils.degToRad(sample.direction);
  const towardX = -Math.sin(directionRad) * sample.speed;
  const towardY = -Math.cos(directionRad) * sample.speed;
  return { u: towardX, v: towardY };
}

function createFieldState(points) {
  const values = points.map(() => ({ speed: 0, direction: 0, u: 0, v: 0 }));
  const index = buildGridIndex(points);
  return { points, values, index };
}

function setFieldSamples(fieldState, samples) {
  samples.forEach((sample, i) => {
    const vector = getWindVector(sample);
    fieldState.values[i] = {
      speed: sample.speed,
      direction: sample.direction,
      u: vector.u,
      v: vector.v,
    };
  });
}

function findBounds(sortedValues, value) {
  if (value <= sortedValues[0]) return [sortedValues[0], sortedValues[0], 0];
  if (value >= sortedValues[sortedValues.length - 1]) {
    const last = sortedValues[sortedValues.length - 1];
    return [last, last, 0];
  }

  for (let i = 0; i < sortedValues.length - 1; i += 1) {
    const a = sortedValues[i];
    const b = sortedValues[i + 1];
    if (value >= a && value <= b) {
      return [a, b, (value - a) / (b - a || 1)];
    }
  }

  const fallback = sortedValues[0];
  return [fallback, fallback, 0];
}

function getFieldSample(fieldState, latitude, longitude) {
  const normalizedLongitude = ((longitude + 180 + 360) % 360) - 180;
  const [lat0, lat1, latMix] = findBounds(fieldState.index.latitudes, clamp(latitude, -80, 80));

  const wrappedLongitude =
    normalizedLongitude < fieldState.index.longitudes[0]
      ? normalizedLongitude + 360
      : normalizedLongitude;
  const longitudesExtended = [
    ...fieldState.index.longitudes,
    fieldState.index.longitudes[0] + 360,
  ];
  const [lon0Extended, lon1Extended, lonMix] = findBounds(longitudesExtended, wrappedLongitude);
  const lon0 = lon0Extended > 180 ? lon0Extended - 360 : lon0Extended;
  const lon1 = lon1Extended > 180 ? lon1Extended - 360 : lon1Extended;

  const key00 = `${lat0}:${lon0}`;
  const key01 = `${lat0}:${lon1}`;
  const key10 = `${lat1}:${lon0}`;
  const key11 = `${lat1}:${lon1}`;

  const s00 = fieldState.values[fieldState.index.map.get(key00)] || fieldState.values[0];
  const s01 = fieldState.values[fieldState.index.map.get(key01)] || s00;
  const s10 = fieldState.values[fieldState.index.map.get(key10)] || s00;
  const s11 = fieldState.values[fieldState.index.map.get(key11)] || s10;

  const u0 = s00.u + (s01.u - s00.u) * lonMix;
  const u1 = s10.u + (s11.u - s10.u) * lonMix;
  const v0 = s00.v + (s01.v - s00.v) * lonMix;
  const v1 = s10.v + (s11.v - s10.v) * lonMix;
  const speed0 = s00.speed + (s01.speed - s00.speed) * lonMix;
  const speed1 = s10.speed + (s11.speed - s10.speed) * lonMix;

  const u = u0 + (u1 - u0) * latMix;
  const v = v0 + (v1 - v0) * latMix;
  const speed = speed0 + (speed1 - speed0) * latMix;

  return { u, v, speed };
}

function renderSpeedTexture(fieldState, speedCanvas) {
  const context = speedCanvas.getContext('2d');
  if (!context) return;

  const imageData = context.createImageData(speedCanvas.width, speedCanvas.height);
  const { data } = imageData;

  for (let y = 0; y < speedCanvas.height; y += 1) {
    const latitude = 90 - (y / speedCanvas.height) * 180;

    for (let x = 0; x < speedCanvas.width; x += 1) {
      const longitude = (x / speedCanvas.width) * 360 - 180;
      const sample = getFieldSample(fieldState, latitude, longitude);
      const speedNormalized = clamp(sample.speed / 28, 0, 1);
      const [r, g, b] = samplePalette(speedNormalized);
      const index = (y * speedCanvas.width + x) * 4;

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = Math.round(84 + speedNormalized * 116);
    }
  }

  context.putImageData(imageData, 0, 0);
}

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    u: Math.random(),
    v: Math.random(),
    age: Math.random() * 100,
  }));
}

function respawnParticle(particle) {
  particle.u = Math.random();
  particle.v = Math.random();
  particle.age = 0;
}

function renderParticles(fieldState, particleCanvas, particles, nowMs) {
  const context = particleCanvas.getContext('2d');
  if (!context) return;

  context.fillStyle = 'rgba(8, 12, 24, 0.11)';
  context.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
  context.lineWidth = 0.9;
  context.lineCap = 'round';

  const delta = 0.18;

  particles.forEach((particle) => {
    const latitude = 90 - particle.v * 180;
    const longitude = particle.u * 360 - 180;
    const sample = getFieldSample(fieldState, latitude, longitude);
    const speedFactor = clamp(sample.speed / 18, 0.15, 1.4);
    const cosLat = Math.max(0.2, Math.cos(THREE.MathUtils.degToRad(latitude)));
    const du = (sample.u / 2200) * delta / cosLat;
    const dv = (-sample.v / 2200) * delta;

    const prevX = particle.u * particleCanvas.width;
    const prevY = particle.v * particleCanvas.height;

    particle.u = wrapUnit(particle.u + du);
    particle.v = clamp(particle.v + dv, 0.002, 0.998);
    particle.age += 1;

    if (particle.age > 180 || sample.speed < 0.15) {
      respawnParticle(particle);
      return;
    }

    const nextX = particle.u * particleCanvas.width;
    const nextY = particle.v * particleCanvas.height;
    const alpha = 0.2 + clamp(sample.speed / 18, 0, 0.7);
    const pulse = 0.82 + 0.18 * Math.sin(nowMs * 0.002 + particle.age * 0.09);
    const dx = nextX - prevX;
    const dy = nextY - prevY;
    const trailScale = 4.2 + speedFactor * 1.6;
    const tailX = prevX - dx * trailScale;
    const tailY = prevY - dy * trailScale;
    const grad = context.createLinearGradient(tailX, tailY, nextX, nextY);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.7, `rgba(200, 240, 255, ${alpha * 0.45 * pulse})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * pulse})`);

    context.strokeStyle = grad;
    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(nextX, nextY);
    context.stroke();

    const angle = Math.atan2(dy, dx || 0.0001);
    const spearLength = 2 + speedFactor * 1.1;
    const spearWidth = 0.7 + speedFactor * 0.3;

    context.save();
    context.translate(nextX, nextY);
    context.rotate(angle);
    context.fillStyle = `rgba(255,255,255,${0.7 + alpha * 0.35})`;
    context.beginPath();
    context.moveTo(spearLength, 0);
    context.lineTo(-0.3, spearWidth);
    context.lineTo(-0.3, -spearWidth);
    context.closePath();
    context.fill();
    context.restore();
  });
}

export function createEarthWindField(renderer) {
  const points = createWindGridPoints();
  const fieldState = createFieldState(points);
  const particles = createParticles();
  const { speedCanvas, particleCanvas, speedTexture, particleTexture } = createWindTextures();
  speedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  particleTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const { group } = createWindMeshes(speedTexture, particleTexture);
  let lastRefreshAt = 0;
  let loading = false;
  let nextWindRefreshAt = 0;
  let windRetryCount = 0;

  async function refresh() {
    const now = Date.now();
    if (now < nextWindRefreshAt) {
      return;
    }
    if (loading) return;
    loading = true;

    try {
      const samples = await fetchLiveWinds(points);
      setFieldSamples(fieldState, samples);
      renderSpeedTexture(fieldState, speedCanvas);
      speedTexture.needsUpdate = true;
      lastRefreshAt = Date.now();
      windRetryCount = 0;
      nextWindRefreshAt = 0;
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        console.warn('Live wind data is rate-limited (429), applying fallback wind vector field.');
      } else {
        console.error('Failed to refresh live wind field:', error);
      }
      setFieldSamples(fieldState, createFallbackWinds(points));
      renderSpeedTexture(fieldState, speedCanvas);
      speedTexture.needsUpdate = true;
      lastRefreshAt = Date.now();

      if (error.message && error.message.includes('429')) {
        windRetryCount = Math.min(windRetryCount + 1, 6);
        nextWindRefreshAt = Date.now() + 60000 * Math.pow(2, windRetryCount - 1);
      } else {
        windRetryCount = 0;
        nextWindRefreshAt = Date.now() + 60000;
      }
    } finally {
      loading = false;
    }
  }

  function update(now = new Date()) {
    if (Date.now() - lastRefreshAt > WIND_REFRESH_MS) {
      refresh();
    }

    renderParticles(fieldState, particleCanvas, particles, now.getTime());
    particleTexture.needsUpdate = true;
  }

  group.visible = false;
  refresh();

  return {
    group,
    setVisible: (visible) => {
      group.visible = visible;
    },
    update,
  };
}

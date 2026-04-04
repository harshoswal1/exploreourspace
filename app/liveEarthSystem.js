import * as THREE from 'https://esm.sh/three@0.152.2';

const EARTH_RADIUS = 3;
const WEATHER_REFRESH_MS = 20 * 60 * 1000;
const ALERT_REFRESH_MS = 15 * 60 * 1000;
const WEATHER_CANVAS_WIDTH = 1024;
const WEATHER_CANVAS_HEIGHT = 512;
const WEATHER_LAYER_ORDER = ['none', 'temperature', 'rain', 'pressure', 'humidity'];
const WEATHER_LAYER_LABELS = {
  none: 'Off',
  temperature: 'Temp',
  rain: 'Rain',
  pressure: 'Pressure',
  humidity: 'Humidity',
};
const PLACE_LABELS = [
  { name: 'India', type: 'country', latitude: 22, longitude: 79 },
  { name: 'United States', type: 'country', latitude: 39, longitude: -98 },
  { name: 'Brazil', type: 'country', latitude: -14, longitude: -52 },
  { name: 'Australia', type: 'country', latitude: -25, longitude: 133 },
  { name: 'China', type: 'country', latitude: 35, longitude: 104 },
  { name: 'Greenland', type: 'country', latitude: 72, longitude: -42 },
  { name: 'Mumbai', type: 'city', latitude: 19.07, longitude: 72.88 },
  { name: 'London', type: 'city', latitude: 51.5, longitude: -0.12 },
  { name: 'Tokyo', type: 'city', latitude: 35.67, longitude: 139.65 },
  { name: 'New York', type: 'city', latitude: 40.71, longitude: -74.0 },
  { name: 'Dubai', type: 'city', latitude: 25.2, longitude: 55.27 },
  { name: 'Sydney', type: 'city', latitude: -33.86, longitude: 151.2 },
];
const alertTypeColors = {
  earthquake: '#ffb36c',
  wildfire: '#ff6b57',
  cyclone: '#7ee7ff',
  volcano: '#ffd36c',
};
const FALLBACK_ALERT_ITEMS = [
  {
    type: 'cyclone',
    title: 'Arabian Sea storm watch',
    subtitle: 'Severe Storms',
    latitude: 17,
    longitude: 67,
    sortTime: Date.now() - 15 * 60 * 1000,
  },
  {
    type: 'wildfire',
    title: 'Western US wildfire cluster',
    subtitle: 'Wildfires',
    latitude: 38,
    longitude: -121,
    sortTime: Date.now() - 30 * 60 * 1000,
  },
  {
    type: 'earthquake',
    title: 'Earthquake activity near Pacific Rim',
    subtitle: 'Seismic activity',
    latitude: 35,
    longitude: 142,
    sortTime: Date.now() - 45 * 60 * 1000,
  },
  {
    type: 'volcano',
    title: 'Volcanic watch in Indonesia',
    subtitle: 'Volcanoes',
    latitude: -7,
    longitude: 110,
    sortTime: Date.now() - 60 * 60 * 1000,
  },
];
const reusableVectorA = new THREE.Vector3();
const reusableVectorB = new THREE.Vector3();
const reusableVectorC = new THREE.Vector3();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function latLonToVector3(radius, latitude, longitude) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createTextSprite(text, { fontSize = 26, padding = 14, fill = '#f4fbff' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(8,12,20,0.52)';
    context.fillRect(10, 14, canvas.width - 20, canvas.height - 28);
    context.strokeStyle = 'rgba(180,220,255,0.16)';
    context.lineWidth = 2;
    context.strokeRect(10, 14, canvas.width - 20, canvas.height - 28);
    context.fillStyle = fill;
    context.font = `600 ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set((canvas.width / 96) * (padding / 14), (canvas.height / 96) * 0.42, 1);
  sprite.userData.canvas = canvas;
  sprite.userData.context = context;
  sprite.userData.texture = texture;
  return sprite;
}

function updateSpriteText(sprite, text, fill = '#f4fbff') {
  const { canvas, context, texture } = sprite.userData;
  if (!canvas || !context || !texture) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(8,12,20,0.52)';
  context.fillRect(10, 14, canvas.width - 20, canvas.height - 28);
  context.strokeStyle = 'rgba(180,220,255,0.16)';
  context.lineWidth = 2;
  context.strokeRect(10, 14, canvas.width - 20, canvas.height - 28);
  context.fillStyle = fill;
  context.font = '600 26px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  texture.needsUpdate = true;
}

function createAuroraMesh() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.11, 96, 96),
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormalLocal;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vNormalLocal = normalize(normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormalLocal;
        varying vec2 vUv;

        void main() {
          float polar = smoothstep(0.56, 0.9, abs(vNormalLocal.y));
          float waveA = 0.55 + 0.45 * sin((vUv.x * 22.0) + time * 0.7);
          float waveB = 0.55 + 0.45 * sin((vUv.y * 34.0) - time * 0.9);
          float alpha = polar * waveA * waveB * 0.32;
          vec3 color = mix(vec3(0.22, 0.95, 0.62), vec3(0.43, 0.56, 1.0), 0.35 + 0.35 * waveB);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
}

function createWeatherGridPoints() {
  const points = [];
  // Reduced grid density for rate-limited API tiers to avoid 429.
  for (let latitude = -75; latitude <= 75; latitude += 30) {
    for (let longitude = -180; longitude < 180; longitude += 30) {
      points.push({ latitude, longitude });
    }
  }
  return points;
}

function buildLiveWeatherUrl(points) {
  const latitudes = points.map((point) => point.latitude).join(',');
  const longitudes = points.map((point) => point.longitude).join(',');

  return (
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitudes}` +
    `&longitude=${longitudes}` +
    '&current=temperature_2m,rain,surface_pressure,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&wind_speed_unit=ms' +
    '&timeformat=unixtime' +
    '&cell_selection=nearest'
  );
}

function createFallbackWeatherSamples(points) {
  return points.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    temperature: 30 - Math.abs(point.latitude) * 0.55 + Math.sin(point.longitude * 0.08) * 4,
    rain: Math.max(0, 2.1 - Math.abs(point.latitude) * 0.025 + Math.sin(point.longitude * 0.15) * 0.8),
    pressure: 1012 + Math.sin(point.longitude * 0.09) * 9 - Math.abs(point.latitude) * 0.08,
    humidity: clamp(72 - Math.abs(point.latitude) * 0.38 + Math.cos(point.longitude * 0.1) * 14, 12, 98),
    windSpeed: 3 + Math.abs(Math.sin(point.longitude * 0.06)) * 10,
    weatherCode: 0,
  }));
}

async function fetchLiveWeatherSamples(points) {
  const response = await fetchJsonWithRetry(buildLiveWeatherUrl(points), {
    mode: 'cors',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [data];

  return points.map((point, index) => {
    const current = items[index]?.current || {};
    return {
      latitude: point.latitude,
      longitude: point.longitude,
      temperature: Number(current.temperature_2m ?? 0),
      rain: Number(current.rain ?? 0),
      pressure: Number(current.surface_pressure ?? 1013),
      humidity: Number(current.relative_humidity_2m ?? 0),
      windSpeed: Number(current.wind_speed_10m ?? 0),
      weatherCode: Number(current.weather_code ?? 0),
    };
  });
}

function lerpColor(colorA, colorB, alpha) {
  return [
    Math.round(colorA[0] + (colorB[0] - colorA[0]) * alpha),
    Math.round(colorA[1] + (colorB[1] - colorA[1]) * alpha),
    Math.round(colorA[2] + (colorB[2] - colorA[2]) * alpha),
  ];
}

function sampleStops(stops, t) {
  const normalized = clamp(t, 0, 1);

  for (let index = 0; index < stops.length - 1; index += 1) {
    const [t0, color0] = stops[index];
    const [t1, color1] = stops[index + 1];
    if (normalized <= t1) {
      return lerpColor(color0, color1, (normalized - t0) / (t1 - t0 || 1));
    }
  }

  return stops[stops.length - 1][1];
}

function getLayerValue(sample, layer) {
  if (layer === 'temperature') return sample.temperature;
  if (layer === 'rain') return sample.rain;
  if (layer === 'pressure') return sample.pressure;
  if (layer === 'humidity') return sample.humidity;
  return 0;
}

function getLayerRange(layer) {
  if (layer === 'temperature') return [-20, 42];
  if (layer === 'rain') return [0, 8];
  if (layer === 'pressure') return [980, 1035];
  if (layer === 'humidity') return [0, 100];
  return [0, 1];
}

function getLayerPalette(layer) {
  if (layer === 'temperature') {
    return [
      [0, [45, 80, 188]],
      [0.35, [90, 180, 255]],
      [0.58, [132, 232, 188]],
      [0.78, [255, 214, 102]],
      [1, [255, 98, 74]],
    ];
  }

  if (layer === 'rain') {
    return [
      [0, [45, 55, 90]],
      [0.2, [71, 108, 194]],
      [0.45, [88, 210, 216]],
      [0.75, [132, 255, 175]],
      [1, [255, 248, 132]],
    ];
  }

  if (layer === 'pressure') {
    return [
      [0, [112, 58, 186]],
      [0.35, [88, 134, 255]],
      [0.58, [108, 220, 208]],
      [0.82, [255, 208, 114]],
      [1, [255, 128, 90]],
    ];
  }

  return [
    [0, [45, 66, 132]],
    [0.35, [68, 124, 220]],
    [0.58, [90, 198, 240]],
    [0.82, [126, 240, 188]],
    [1, [255, 239, 132]],
  ];
}

function buildFieldIndex(points) {
  const latitudes = [...new Set(points.map((point) => point.latitude))].sort((a, b) => a - b);
  const longitudes = [...new Set(points.map((point) => point.longitude))].sort((a, b) => a - b);
  const map = new Map();
  points.forEach((point, index) => {
    map.set(`${point.latitude}:${point.longitude}`, index);
  });
  return { latitudes, longitudes, map };
}

function findBounds(sortedValues, value) {
  if (value <= sortedValues[0]) return [sortedValues[0], sortedValues[0], 0];
  if (value >= sortedValues[sortedValues.length - 1]) {
    const last = sortedValues[sortedValues.length - 1];
    return [last, last, 0];
  }

  for (let index = 0; index < sortedValues.length - 1; index += 1) {
    const a = sortedValues[index];
    const b = sortedValues[index + 1];
    if (value >= a && value <= b) {
      return [a, b, (value - a) / (b - a || 1)];
    }
  }

  return [sortedValues[0], sortedValues[0], 0];
}

function sampleField(samples, index, latitude, longitude, layer) {
  const normalizedLongitude = ((longitude + 180 + 360) % 360) - 180;
  const [lat0, lat1, latMix] = findBounds(index.latitudes, clamp(latitude, -75, 75));

  const longitudesExtended = [...index.longitudes, index.longitudes[0] + 360];
  const wrappedLongitude =
    normalizedLongitude < index.longitudes[0] ? normalizedLongitude + 360 : normalizedLongitude;
  const [lon0Ext, lon1Ext, lonMix] = findBounds(longitudesExtended, wrappedLongitude);
  const lon0 = lon0Ext > 180 ? lon0Ext - 360 : lon0Ext;
  const lon1 = lon1Ext > 180 ? lon1Ext - 360 : lon1Ext;

  const s00 = samples[index.map.get(`${lat0}:${lon0}`)] || samples[0];
  const s01 = samples[index.map.get(`${lat0}:${lon1}`)] || s00;
  const s10 = samples[index.map.get(`${lat1}:${lon0}`)] || s00;
  const s11 = samples[index.map.get(`${lat1}:${lon1}`)] || s10;

  const value00 = getLayerValue(s00, layer);
  const value01 = getLayerValue(s01, layer);
  const value10 = getLayerValue(s10, layer);
  const value11 = getLayerValue(s11, layer);

  const value0 = value00 + (value01 - value00) * lonMix;
  const value1 = value10 + (value11 - value10) * lonMix;
  return value0 + (value1 - value0) * latMix;
}

function renderWeatherTexture(canvas, layer, samples, index) {
  const context = canvas.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (layer === 'none') return;

  const imageData = context.createImageData(canvas.width, canvas.height);
  const { data } = imageData;
  const [min, max] = getLayerRange(layer);
  const palette = getLayerPalette(layer);

  for (let y = 0; y < canvas.height; y += 1) {
    const latitude = 90 - (y / canvas.height) * 180;

    for (let x = 0; x < canvas.width; x += 1) {
      const longitude = (x / canvas.width) * 360 - 180;
      const value = sampleField(samples, index, latitude, longitude, layer);
      const normalized = clamp((value - min) / (max - min || 1), 0, 1);
      const [r, g, b] = sampleStops(palette, normalized);
      const offset = (y * canvas.width + x) * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = Math.round(75 + normalized * 120);
    }
  }

  context.putImageData(imageData, 0, 0);
}

function createWeatherOverlay() {
  const canvas = document.createElement('canvas');
  canvas.width = WEATHER_CANVAS_WIDTH;
  canvas.height = WEATHER_CANVAS_HEIGHT;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.07, 96, 96),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  mesh.visible = false;

  return { canvas, texture, mesh };
}

function createStormMarkers() {
  const group = new THREE.Group();
  group.visible = false;
  const markers = [];

  for (let index = 0; index < 32; index += 1) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0x8ee6ff,
        transparent: true,
        opacity: 0.85,
      })
    );
    marker.visible = false;
    group.add(marker);
    markers.push(marker);
  }

  return { group, markers };
}

function createAlertMarkers() {
  const group = new THREE.Group();
  const markers = [];

  for (let index = 0; index < 32; index += 1) {
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.05, 0),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      })
    );
    marker.visible = false;
    group.add(marker);
    markers.push(marker);
  }

  return { group, markers };
}

function createTerminatorLine() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({
    color: 0xffd6a4,
    transparent: true,
    opacity: 0.62,
  });
  return new THREE.LineLoop(geometry, material);
}

function updateTerminatorGeometry(line, sunDirection) {
  const normal = sunDirection.clone().normalize();
  let tangent = new THREE.Vector3(0, 1, 0).cross(normal);
  if (tangent.lengthSq() < 0.001) {
    tangent = new THREE.Vector3(1, 0, 0).cross(normal);
  }
  tangent.normalize();
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  const points = [];

  for (let index = 0; index < 96; index += 1) {
    const angle = (index / 96) * Math.PI * 2;
    const point = reusableVectorA
      .copy(tangent)
      .multiplyScalar(Math.cos(angle) * (EARTH_RADIUS + 0.09))
      .add(reusableVectorB.copy(bitangent).multiplyScalar(Math.sin(angle) * (EARTH_RADIUS + 0.09)));
    points.push(point);
  }

  line.geometry.setFromPoints(points);
  return reusableVectorC.copy(bitangent).multiplyScalar(EARTH_RADIUS + 0.32);
}

function createSunBadge() {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.right = '20px';
  container.style.bottom = '200px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  container.style.zIndex = '20';
  container.style.pointerEvents = 'none';

  const label = document.createElement('div');
  label.textContent = 'SUN';
  label.style.fontFamily = 'Arial, sans-serif';
  label.style.fontSize = '11px';
  label.style.fontWeight = '700';
  label.style.letterSpacing = '0.18em';
  label.style.color = '#ffe7b4';
  label.style.textShadow = '0 0 12px rgba(0,0,0,0.55)';

  const arrow = document.createElement('div');
  arrow.textContent = '➤';
  arrow.style.fontSize = '22px';
  arrow.style.color = '#ffd37a';
  arrow.style.textShadow = '0 0 14px rgba(255,211,122,0.9)';
  arrow.style.transformOrigin = '50% 50%';

  container.appendChild(label);
  container.appendChild(arrow);
  document.body.appendChild(container);

  return { container, arrow };
}

function createAlertsPanel() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  if (isMobile) {
    panel.style.top = '130px';
    panel.style.left = '20px';
    panel.style.right = 'auto';
    panel.style.width = '40px';
    panel.style.height = '40px';
    panel.style.borderRadius = '50%';
    panel.style.padding = '0';
    panel.style.display = 'flex';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'center';
  } else {
    panel.style.top = '400px';
    panel.style.right = '20px';
    panel.style.width = 'min(364px, calc(100vw - 40px))';
    panel.style.maxHeight = '182px';
    panel.style.padding = '12px';
    panel.style.borderRadius = '24px';
  }
  panel.style.background = 'rgba(8,12,20,0.48)';
  panel.style.border = '1px solid rgba(255,255,255,0.1)';
  panel.style.backdropFilter = 'blur(22px)';
  panel.style.webkitBackdropFilter = 'blur(22px)';
  panel.style.boxShadow = '0 18px 42px rgba(0,0,0,0.28)';
  panel.style.zIndex = '15';
  panel.style.overflow = 'hidden';
  panel.style.transition = 'all 0.22s ease';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.cursor = isMobile ? 'pointer' : 'default';

  const metadata = document.createElement('div');

  const title = document.createElement('div');
  title.textContent = 'Earth Live Alerts';
  title.style.color = '#ffffff';
  title.style.fontSize = isMobile ? '10px' : '13px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.08em';
  title.style.textTransform = 'uppercase';
  if (isMobile) title.style.display = 'none';

  const status = document.createElement('div');
  status.style.marginTop = '4px';
  status.style.color = 'rgba(196,212,240,0.72)';
  status.style.fontSize = isMobile ? '9px' : '11px';
  status.style.letterSpacing = '0.05em';
  status.style.textTransform = 'uppercase';
  status.textContent = 'Updating';
  if (isMobile) status.style.display = 'none';

  const toggle = document.createElement('div');
  toggle.textContent = isMobile ? '⚠️' : '';
  toggle.style.color = '#9fdcff';
  toggle.style.fontSize = '14px';
  toggle.style.display = 'flex';
  toggle.style.alignItems = 'center';
  toggle.style.justifyContent = 'center';

  const content = document.createElement('div');
  content.style.marginTop = '10px';
  content.style.display = isMobile ? 'none' : 'block';

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '6px';
  list.style.maxHeight = '112px';
  list.style.overflowY = 'auto';
  list.style.paddingRight = '4px';

  metadata.appendChild(title);
  metadata.appendChild(status);
  header.appendChild(metadata);
  header.appendChild(toggle);
  content.appendChild(list);

  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);

  let expanded = !isMobile;

  function setExpanded(value) {
    expanded = value;
    if (expanded) {
      panel.style.height = 'auto';
      panel.style.maxHeight = '200px';
      panel.style.width = 'min(300px, calc(100vw - 40px))';
      panel.style.left = '20px';
      panel.style.borderRadius = '20px';
      panel.style.padding = '12px';
      header.style.justifyContent = 'space-between';
      content.style.display = 'block';
      title.style.display = 'block';
      status.style.display = 'block';
      toggle.textContent = '✕';
      toggle.style.marginLeft = '8px';
    } else {
      panel.style.width = '40px';
      panel.style.height = '40px';
      panel.style.left = '20px';
      panel.style.borderRadius = '50%';
      panel.style.padding = '0';
      header.style.justifyContent = 'center';
      header.style.width = '100%';
      content.style.display = 'none';
      title.style.display = 'none';
      status.style.display = 'none';
      toggle.textContent = '⚠️';
      toggle.style.marginLeft = '0';
    }
  }

  if (isMobile) {
    setExpanded(false);
    header.addEventListener('click', () => {
      setExpanded(!expanded);
    });
  }

  function render(items) {
    list.innerHTML = '';
    items.slice(0, 4).forEach((item) => {
      const row = document.createElement('div');
      row.style.padding = '8px 10px';
      row.style.borderRadius = '12px';
      row.style.background =
        'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))';
      row.style.border = '1px solid rgba(255,255,255,0.09)';

      const header = document.createElement('div');
      header.textContent = item.title;
      header.style.color = '#f3f8ff';
      header.style.fontSize = '11px';
      header.style.fontWeight = '600';
      header.style.lineHeight = '1.35';

      const meta = document.createElement('div');
      meta.textContent = item.subtitle;
      meta.style.marginTop = '3px';
      meta.style.color = 'rgba(196,212,240,0.72)';
      meta.style.fontSize = '10px';
      meta.style.lineHeight = '1.35';

      row.appendChild(header);
      row.appendChild(meta);
      list.appendChild(row);
    });

    if (!items.length) {
      const empty = document.createElement('div');
      empty.textContent = 'No major live alerts right now.';
      empty.style.color = '#f3f8ff';
      empty.style.fontSize = '12px';
      empty.style.padding = '6px 2px';
      list.appendChild(empty);
    }
  }

  return { panel, status, render };
}

function createPlaceLabels(earth) {
  return PLACE_LABELS.map((place) => {
    const sprite = createTextSprite(place.name, {
      fontSize: place.type === 'city' ? 22 : 24,
      fill: place.type === 'city' ? '#d8f6ff' : '#fff6de',
    });
    sprite.position.copy(latLonToVector3(EARTH_RADIUS + 0.18, place.latitude, place.longitude));
    sprite.visible = false;
    earth.add(sprite);
    return { ...place, sprite };
  });
}

function updatePlaceLabels(labels, earth, camera, visible) {
  if (!visible) {
    labels.forEach((label) => {
      label.sprite.visible = false;
    });
    return;
  }

  const earthDistance = camera.position.distanceTo(earth.position);

  labels.forEach((label) => {
    const worldPosition = label.sprite.getWorldPosition(reusableVectorA);
    const outward = reusableVectorB.copy(worldPosition).sub(earth.position).normalize();
    const towardCamera = reusableVectorC.copy(camera.position).sub(worldPosition).normalize();
    const facingCamera = outward.dot(towardCamera) > 0.18;
    const visibleByZoom =
      label.type === 'city' ? earthDistance < 10.5 : earthDistance < 16.5;

    label.sprite.visible = facingCamera && visibleByZoom;
    if (!label.sprite.visible) return;

    label.sprite.lookAt(camera.position);
    const scale = label.type === 'city'
      ? THREE.MathUtils.clamp(earthDistance / 18, 0.36, 0.56)
      : THREE.MathUtils.clamp(earthDistance / 15, 0.42, 0.72);
    label.sprite.scale.set(scale * 1.8, scale * 0.44, 1);
  });
}

function updateSunBadge(badge, camera, sunDirection) {
  const centerProjected = reusableVectorA.set(0, 0, 0).project(camera);
  const sunProjected = reusableVectorB.copy(sunDirection).multiplyScalar(4).project(camera);
  const dx = (sunProjected.x - centerProjected.x) * window.innerWidth * 0.5;
  const dy = (sunProjected.y - centerProjected.y) * window.innerHeight * -0.5;
  const angle = Math.atan2(dy, dx);
  badge.arrow.style.transform = `rotate(${angle}rad)`;
}

async function fetchJsonWithRetry(url, options = {}) {
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY_MS = 2000; // Increased for mobile stability

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { ...options, cache: 'no-cache' });
      if (response.ok) return response;

      if (response.status === 429) {
        const delay = Math.min(60000, BASE_DELAY_MS * Math.pow(2, attempt));
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(`Rate limited (429) after ${MAX_ATTEMPTS} attempts`);
        }
        continue;
      }

      throw new Error(`Failed with status ${response.status}`);
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * attempt));
    }
  }
}


async function fetchEarthAlerts() {
  const results = [];

  try {
    const quakeResponse = await fetchJsonWithRetry(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
      { mode: 'cors', cache: 'no-store' }
    );
    if (quakeResponse.ok) {
      const quakeData = await quakeResponse.json();
      (quakeData.features || []).slice(0, 8).forEach((feature) => {
        const [longitude, latitude] = feature.geometry?.coordinates || [];
        results.push({
          type: 'earthquake',
          title: `Earthquake M${Number(feature.properties?.mag || 0).toFixed(1)}`,
          subtitle: feature.properties?.place || 'Global',
          latitude,
          longitude,
          sortTime: new Date(feature.properties?.time || 0).getTime(),
        });
      });
    }
  } catch (error) {
    console.error('Earthquake alert fetch failed:', error);
  }

  try {
    let eonetResponse;
    try {
      eonetResponse = await fetchJsonWithRetry('https://eonet.gsfc.nasa.gov/api/v3/events?status=open', {
        mode: 'cors',
        cache: 'no-store',
      });
    } catch (error) {
      console.warn('EONET direct request failed, trying proxy fallback', error);
      eonetResponse = await fetchJsonWithRetry(
        'https://api.allorigins.win/raw?url=https://eonet.gsfc.nasa.gov/api/v3/events?status=open',
        { mode: 'cors', cache: 'no-store' }
      );
    }

    if (eonetResponse && eonetResponse.ok) {
      const eonetData = await eonetResponse.json();
      (eonetData.events || []).forEach((event) => {
        const categories = (event.categories || []).map((category) => category.title);
        const geometry = event.geometry?.[event.geometry.length - 1];
        const [longitude, latitude] = geometry?.coordinates || [];
        let type = null;

        if (categories.includes('Wildfires')) type = 'wildfire';
        else if (categories.includes('Volcanoes')) type = 'volcano';
        else if (categories.includes('Severe Storms')) type = 'cyclone';
        if (!type) return;

        results.push({
          type,
          title: event.title,
          subtitle: categories.join(', '),
          latitude,
          longitude,
          sortTime: new Date(geometry?.date || 0).getTime(),
        });
      });
    }
  } catch (error) {
    console.error('EONET alert fetch failed:', error);
  }

  return results
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .sort((a, b) => b.sortTime - a.sortTime);
}

export function createLiveEarthSystem({ scene, earth, camera }) {
  const auroraMesh = createAuroraMesh();
  earth.add(auroraMesh);
  auroraMesh.visible = false;

  const terminatorLine = createTerminatorLine();
  scene.add(terminatorLine);
  terminatorLine.visible = false;

  const timeLabel = createTextSprite('UTC 00:00', { fill: '#ffe8bc' });
  scene.add(timeLabel);
  timeLabel.visible = false;

  const weatherOverlay = createWeatherOverlay();
  earth.add(weatherOverlay.mesh);

  const stormMarkers = createStormMarkers();
  earth.add(stormMarkers.group);

  const alertMarkers = createAlertMarkers();
  earth.add(alertMarkers.group);
  alertMarkers.group.visible = false;

  const placeLabels = createPlaceLabels(earth);
  const sunBadge = createSunBadge();
  const alertsPanel = createAlertsPanel();
  alertsPanel.panel.style.display = 'block';

  const weatherPoints = createWeatherGridPoints();
  const weatherIndex = buildFieldIndex(weatherPoints);
  let weatherSamples = createFallbackWeatherSamples(weatherPoints);
  let weatherLayer = 'none';
  let lastWeatherFetchAt = Date.now();
  let lastAlertsFetchAt = 0;
  let alertItems = [];
  let weatherLoading = false;
  let alertsLoading = false;
  let lastUtcMinuteText = '';
  let earthLabelsVisible = false;

  let nextWeatherRefreshAt = 0;
  let nextAlertsRefreshAt = 0;
  let weatherRetryCount = 0;
  let alertsRetryCount = 0;

  alertItems = FALLBACK_ALERT_ITEMS.slice();
  alertsPanel.status.textContent = 'Fallback';
  alertsPanel.render(
    alertItems.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
    }))
  );

  function renderWeather() {
    renderWeatherTexture(weatherOverlay.canvas, weatherLayer, weatherSamples, weatherIndex);
    weatherOverlay.texture.needsUpdate = true;
    weatherOverlay.mesh.visible = weatherLayer !== 'none';
  }

  function updateStormMarkers(nowMs) {
    const hotspots = weatherSamples
      .filter(
        (sample) =>
          sample.rain > 1.2 ||
          sample.weatherCode >= 95 ||
          (sample.windSpeed > 11 && sample.humidity > 72)
      )
      .sort((a, b) => b.rain + b.windSpeed * 0.4 - (a.rain + a.windSpeed * 0.4))
      .slice(0, stormMarkers.markers.length);

    stormMarkers.markers.forEach((marker, index) => {
      const hotspot = hotspots[index];
      if (!hotspot) {
        marker.visible = false;
        return;
      }

      marker.visible = weatherLayer !== 'none';
      marker.position.copy(latLonToVector3(EARTH_RADIUS + 0.12, hotspot.latitude, hotspot.longitude));
      const pulse = 0.8 + 0.35 * Math.sin(nowMs * 0.006 + index * 0.8);
      marker.scale.setScalar(pulse);
      marker.material.opacity = clamp(0.45 + hotspot.rain * 0.08, 0.45, 0.95);
      marker.material.color.set(hotspot.weatherCode >= 95 ? 0xfff1a3 : 0x7ee7ff);
    });
    stormMarkers.group.visible = weatherLayer !== 'none';
  }

  function updateAlertMarkers(nowMs) {
    alertMarkers.markers.forEach((marker, index) => {
      const item = alertItems[index];
      if (!item) {
        marker.visible = false;
        return;
      }

      marker.visible = false;
      marker.position.copy(latLonToVector3(EARTH_RADIUS + 0.16, item.latitude, item.longitude));
      marker.material.color.set(alertTypeColors[item.type] || '#ffffff');
      marker.rotation.y += 0.02;
      const pulse = 0.92 + 0.3 * Math.sin(nowMs * 0.004 + index * 0.6);
      marker.scale.setScalar(pulse);
      marker.material.opacity = 0.68 + 0.2 * Math.sin(nowMs * 0.004 + index);
    });
  }

  async function refreshWeather() {
    const now = Date.now();
    if (now < nextWeatherRefreshAt) {
      return;
    }
    if (weatherLoading) return;
    weatherLoading = true;

    try {
      weatherSamples = await fetchLiveWeatherSamples(weatherPoints);
      lastWeatherFetchAt = Date.now();
      weatherRetryCount = 0;
      nextWeatherRefreshAt = Date.now() + WEATHER_REFRESH_MS;
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        console.warn('Live weather is rate-limited (429), falling back to generated data.');
      } else {
        console.error('Live weather refresh failed:', error);
      }

      weatherSamples = createFallbackWeatherSamples(weatherPoints);
      lastWeatherFetchAt = Date.now();

      if (error.message && error.message.includes('429')) {
        weatherRetryCount = Math.min(weatherRetryCount + 1, 6);
        nextWeatherRefreshAt = Date.now() + 60000 * Math.pow(2, weatherRetryCount - 1);
      } else {
        weatherRetryCount = 0;
        nextWeatherRefreshAt = Date.now() + 60000;
      }
    } finally {
      weatherLoading = false;
    }

    renderWeather();
  }

  async function refreshAlerts() {
    const now = Date.now();
    if (now < nextAlertsRefreshAt) {
      return;
    }
    if (alertsLoading) return;
    alertsLoading = true;
    try {
      alertItems = await fetchEarthAlerts();
      alertsPanel.status.textContent = alertItems.length ? `Live • ${alertItems.length} tracked` : 'Live';
      alertsPanel.render(
        alertItems.map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
        }))
      );
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        console.warn('Live alerts are rate-limited (429), using fallback alerts.');
      } else {
        console.error('Live alert refresh failed:', error);
      }
      alertItems = FALLBACK_ALERT_ITEMS.slice();
      alertsPanel.status.textContent = 'Fallback';
      alertsPanel.render(
        alertItems.map((item) => ({
          title: item.title,
          subtitle: item.subtitle,
        }))
      );

      if (error.message && error.message.includes('429')) {
        alertsRetryCount = Math.min(alertsRetryCount + 1, 6);
        nextAlertsRefreshAt = Date.now() + 60000 * Math.pow(2, alertsRetryCount - 1);
      } else {
        alertsRetryCount = 0;
        nextAlertsRefreshAt = Date.now() + 60000;
      }
    } finally {
      alertsLoading = false;
    }

    lastAlertsFetchAt = Date.now();
  }

  function cycleWeatherLayer() {
    const index = WEATHER_LAYER_ORDER.indexOf(weatherLayer);
    weatherLayer = WEATHER_LAYER_ORDER[(index + 1) % WEATHER_LAYER_ORDER.length];
    renderWeather();
    return weatherLayer;
  }

  function update({ sunDirection, now }) {
    const nowMs = now.getTime();

    if (auroraMesh.visible) {
      auroraMesh.material.uniforms.time.value = nowMs * 0.001;
    }

    if (terminatorLine.visible || timeLabel.visible) {
      const labelOffset = updateTerminatorGeometry(terminatorLine, sunDirection);
      timeLabel.position.copy(labelOffset);
      const utcText = `UTC ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
      if (utcText !== lastUtcMinuteText) {
        updateSpriteText(timeLabel, utcText, '#ffe8bc');
        lastUtcMinuteText = utcText;
      }
      timeLabel.lookAt(camera.position);
    }

    updatePlaceLabels(placeLabels, earth, camera, earthLabelsVisible);
    if (sunBadge.container.style.display !== 'none') {
      updateSunBadge(sunBadge, camera, sunDirection);
    }
    updateStormMarkers(nowMs);
    updateAlertMarkers(nowMs);

    if (Date.now() - lastWeatherFetchAt > WEATHER_REFRESH_MS) {
      refreshWeather();
    }
    if (Date.now() - lastAlertsFetchAt > ALERT_REFRESH_MS) {
      refreshAlerts();
    }
  }

  renderWeather();
refreshWeather();
refreshAlerts();

// ✅ controlled calls (no more spam)
setInterval(refreshWeather, WEATHER_REFRESH_MS);

sunBadge.container.style.display = 'flex';

  return {
    update,
    cycleWeatherLayer,
    setWeatherLayer(layer) {
      weatherLayer = WEATHER_LAYER_ORDER.includes(layer) ? layer : 'none';
      renderWeather();
    },
    getWeatherLayer: () => weatherLayer,
    getWeatherLayerLabel: () => WEATHER_LAYER_LABELS[weatherLayer],
    setAuroraVisible(visible) {
      auroraMesh.visible = visible;
    },
    setTerminatorVisible(visible) {
      terminatorLine.visible = visible;
      timeLabel.visible = visible;
    },
    setEarthLabelsVisible(visible) {
      earthLabelsVisible = visible;
      if (!visible) {
        placeLabels.forEach((label) => {
          label.sprite.visible = false;
        });
      }
    },
    setAlertsVisible(visible) {
      alertsPanel.panel.style.display = visible ? 'block' : 'none';
      alertMarkers.group.visible = visible;
    },
  };
}

import * as THREE from 'https://esm.sh/three@0.152.2';
import { createLiveCloudLayer } from './liveClouds.js';
import { createEarthWindField } from './earthWinds.js';

const EARTH_RADIUS = 3;
const MOON_RADIUS_RATIO = 0.273;
const MOON_ORBIT_RADIUS = 24;
const MOON_ORBIT_TILT = THREE.MathUtils.degToRad(5.1);
const MOON_AXIAL_TILT = THREE.MathUtils.degToRad(6.7);
const MOON_DISTANCE_LABEL = '384,400 km';

const OVERLAY_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FRAGMENT_SHADER = `
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    float light = dot(normalize(vWorldNormal), normalize(sunDirection));
    float nightMask = 1.0 - smoothstep(-0.08, 0.18, light);
    float twilight = 1.0 - smoothstep(-0.28, 0.02, light);
    float alpha = mix(0.0, 0.16, nightMask) * max(0.72, twilight);

    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
`;

const MOON_SHADOW_FRAGMENT_SHADER = `
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    float light = dot(normalize(vWorldNormal), normalize(sunDirection));
    float nightMask = 1.0 - smoothstep(-0.12, 0.14, light);
    float alpha = nightMask * 0.82;

    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
`;

const NIGHT_FRAGMENT_SHADER = `
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float light = dot(normalize(vWorldNormal), normalize(sunDirection));
    float nightMask = 1.0 - smoothstep(-0.12, 0.1, light);
    float luminance = dot(nightColor, vec3(0.2126, 0.7152, 0.0722));
    float cityCore = smoothstep(0.08, 0.35, luminance);
    float cityMask = pow(nightMask, 1.8) * cityCore;
    float alpha = cityMask;

    gl_FragColor = vec4(nightColor * (2.8 + cityCore * 1.5), alpha);
  }
`;

function createDistanceLabelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 96;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(8, 16, 28, 0.78)';
    context.fillRect(8, 12, 304, 72);
    context.strokeStyle = 'rgba(159, 220, 255, 0.45)';
    context.lineWidth = 2;
    context.strokeRect(8, 12, 304, 72);

    context.fillStyle = '#eff9ff';
    context.font = '600 28px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.1, 0.92, 1);
  sprite.visible = false;
  return sprite;
}

export function createEarth(scene, renderer) {
  const loader = new THREE.TextureLoader();

  const earthTexture = loader.load(
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    () => console.log('Earth texture loaded'),
    undefined,
    (err) => console.error('Texture failed', err)
  );
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const nightTexture = new THREE.Texture();
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    color: 0xffffff,
    shininess: 18,
    specular: new THREE.Color(0x1a2633),
  });

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 256, 256);
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  const shadowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: OVERLAY_VERTEX_SHADER,
    fragmentShader: SHADOW_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
  });

  const shadowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.002, 256, 256),
    shadowMaterial
  );
  shadowSphere.renderOrder = 2;
  scene.add(shadowSphere);

  const nightMaterial = new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      nightTexture: { value: nightTexture },
    },
    vertexShader: OVERLAY_VERTEX_SHADER,
    fragmentShader: NIGHT_FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const nightLights = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.004, 256, 256),
    nightMaterial
  );
  nightLights.renderOrder = 4;
  nightLights.visible = false;
  scene.add(nightLights);

  const baseCloudTexture = loader.load(
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png'
  );
  baseCloudTexture.colorSpace = THREE.SRGBColorSpace;
  baseCloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const baseCloudMaterial = new THREE.MeshPhongMaterial({
    map: baseCloudTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });

  const baseClouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.02, 128, 128),
    baseCloudMaterial
  );
  baseClouds.renderOrder = 5;
  scene.add(baseClouds);

  const liveCloudLayer = createLiveCloudLayer(renderer);
  const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.03, 128, 128);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: liveCloudLayer.texture,
    color: 0xffffff,
    emissive: new THREE.Color(0x2d3644),
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  clouds.renderOrder = 6;
  scene.add(clouds);

  const moonTexture = loader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const moonBumpTexture = loader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
  moonBumpTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const moonPivot = new THREE.Group();
  scene.add(moonPivot);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * MOON_RADIUS_RATIO, 96, 96),
    new THREE.MeshPhongMaterial({
      map: moonTexture,
      bumpMap: moonBumpTexture,
      bumpScale: 0.03,
      color: 0xd8d6d2,
      shininess: 2,
      specular: new THREE.Color(0x111111),
    })
  );
  moon.position.set(MOON_ORBIT_RADIUS, 1.6, -3.2);
  moon.rotation.z = MOON_AXIAL_TILT;
  moonPivot.add(moon);

  const moonShadowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * MOON_RADIUS_RATIO + 0.004, 96, 96),
    new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: OVERLAY_VERTEX_SHADER,
      fragmentShader: MOON_SHADOW_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    })
  );
  moonShadowSphere.renderOrder = 3;
  scene.add(moonShadowSphere);

  const moonDistanceLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({
      color: 0x9fdcff,
      transparent: true,
      opacity: 0.75,
    })
  );
  moonDistanceLine.visible = false;
  scene.add(moonDistanceLine);

  const moonDistanceLabel = createDistanceLabelSprite(MOON_DISTANCE_LABEL);
  scene.add(moonDistanceLabel);

  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.1, 128, 128);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  const windField = createEarthWindField(renderer);
  scene.add(windField.group);

  return {
    earth,
    moon,
    moonPivot,
    moonShadowSphere,
    clouds,
    baseClouds,
    atmosphere,
    shadowSphere,
    nightLights,
    liveCloudLayer,
    windField,
    moonDistanceLine,
    moonDistanceLabel,
  };
}

export function updateEarthLighting(earthParts, sunDirection, now = new Date()) {
  const {
    earth,
    moon,
    moonPivot,
    moonShadowSphere,
    clouds,
    baseClouds,
    atmosphere,
    shadowSphere,
    nightLights,
    liveCloudLayer,
    windField,
    moonDistanceLine,
    moonDistanceLabel,
  } =
    earthParts;

  shadowSphere.material.uniforms.sunDirection.value.copy(sunDirection);
  nightLights.material.uniforms.sunDirection.value.copy(sunDirection);

  shadowSphere.rotation.copy(earth.rotation);
  nightLights.rotation.copy(earth.rotation);
  baseClouds.rotation.copy(earth.rotation);
  clouds.rotation.copy(earth.rotation);
  windField.group.rotation.copy(earth.rotation);

  const moonOrbitProgress =
    (now.getUTCDate() +
      now.getUTCHours() / 24 +
      now.getUTCMinutes() / 1440 +
      now.getUTCSeconds() / 86400) /
    27.3;
  moonPivot.rotation.y = moonOrbitProgress * Math.PI * 2;
  moonPivot.rotation.z = MOON_ORBIT_TILT;
  moon.lookAt(earth.position);
  moon.rotateY(Math.PI);
  moon.rotateZ(MOON_AXIAL_TILT);
  moonShadowSphere.material.uniforms.sunDirection.value.copy(sunDirection);
  moon.getWorldPosition(moonShadowSphere.position);
  moon.getWorldQuaternion(moonShadowSphere.quaternion);

  const moonWorldPosition = new THREE.Vector3();
  moon.getWorldPosition(moonWorldPosition);
  moonDistanceLine.geometry.setFromPoints([earth.position.clone(), moonWorldPosition]);
  moonDistanceLabel.position.copy(earth.position).lerp(moonWorldPosition, 0.5);
  moonDistanceLabel.position.y += 0.45;

  atmosphere.material.opacity = 0.22;
  liveCloudLayer.update(now);
  windField.update(now);
  clouds.material.map = liveCloudLayer.isUsingFallback()
    ? liveCloudLayer.fallbackTexture
    : liveCloudLayer.texture;
  baseClouds.material.opacity = liveCloudLayer.isUsingFallback() ? 0.38 : 0.18;
  clouds.material.opacity = liveCloudLayer.isUsingFallback() ? 0.64 : 1.0;
  clouds.material.needsUpdate = true;
}

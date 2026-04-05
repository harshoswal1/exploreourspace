import * as THREE from 'https://esm.sh/three@0.152.2';
import { OrbitControls } from 'https://esm.sh/three@0.152.2/examples/jsm/controls/OrbitControls.js';

import { createEarthRuntime } from './app/earthRuntime.js';
import { createAsteroidSystem } from './app/asteroids.js';
import { createFocusController } from './app/focus.js';
import { createLiveEarthSystem } from './app/liveEarthSystem.js';
import { createSatelliteSystem } from './app/satellites.js';
import { createAppState } from './app/state.js';
import { wireUI } from './app/ui.js';
import { createCamera } from './scene/camera.js';
import { createStars } from './scene/stars.js';
import { createButtons } from './ui/buttons.js';
import { createBrand } from './ui/brand.js';
import { createAsteroidStatusBadge } from './ui/asteroidStatusBadge.js';
import { createSatelliteStatusBadge } from './ui/satelliteStatusBadge.js';
import { createFollowExitButton } from './ui/followExitButton.js';
import { createInfoPanel, showEarthClimateInfo, showMoonInfo } from './ui/infoPanel.js';
import { createLiveBadge } from './ui/liveBadge.js';
import { createNewsPanel } from './ui/newsPanel.js';
import { createPoleCompass } from './ui/poleCompass.js';
import { createSearch } from './ui/search.js';
import { playSFX } from './utils/sfx.js';
import { createInstructions } from './ui/instructions.js';
import { createAudioControl } from './ui/audioControl.js';
import { createHomePage } from './ui/homePage.js';
import { getEarthClimateInfo } from './utils/earthClimate.js';

const state = createAppState();
const MOON_AVERAGE_DISTANCE_KM = 384400;

// Global Mobile UI Cleanup
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  html, body {
    background-color: #000000 !important;
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 900px) {
    /* Make status badges tiny pills stacked vertically */
    .status-badge, [class*="StatusBadge"], [id*="status-badge"] {
      transform: scale(0.6) !important;
      transform-origin: right top !important;
      margin-bottom: -10px !important;
    }

    /* Position status badges specifically under the Live Badge in the TOP RIGHT */
    #asteroid-status-badge-root { top: 95px !important; right: 20px !important; }
    #satellite-status-badge-root { top: 125px !important; right: 20px !important; }

    /* Ensure the search bar is pushed left on tiny screens */
    [id*="search-input"] {
      max-width: 120px !important;
    }
  }
`;
document.head.appendChild(globalStyle);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = createCamera();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastTouchTapAt = 0;
let lastTouchX = 0;
let lastTouchY = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
renderer.setPixelRatio(pixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000);

// Ensure canvas is always a fixed background
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';
document.body.appendChild(renderer.domElement);

document.body.style.touchAction = 'none';

const infoDiv = createInfoPanel();
const {
  orbitBtn,
  allLayersBtn,
  satBtn,
  asteroidsBtn,
  asteroidBtn,
  windBtn,
  auroraBtn,
  terminatorBtn,
  earthLabelsBtn,
  alertsBtn,
  weatherBtn,
  categoryBtn,
  starsBtn,
  labelBtn,
} =
  createButtons();
const { searchInput, clearBtn } = createSearch();

let newsPanel, poleCompass, asteroidStatusBadge, satelliteStatusBadge, exitFollowBtn;
let isStarted = false;

createHomePage(() => {
  isStarted = true;
  createInstructions();
  createLiveBadge();
  createAudioControl();
  newsPanel = createNewsPanel();
  poleCompass = createPoleCompass();
  asteroidStatusBadge = createAsteroidStatusBadge();
  satelliteStatusBadge = createSatelliteStatusBadge();
  exitFollowBtn = createFollowExitButton();

  if (exitFollowBtn) {
    exitFollowBtn.addEventListener('pointerdown', () => {
      playSFX('transition');
      clearFollowMode();
    });
  }

  // Initialize badge states now that they exist
  if (satelliteStatusBadge) {
    satelliteStatusBadge.setStatus(satelliteSystem.getStatus(), '');
  }
});

createBrand();
const isMobile = window.matchMedia('(max-width: 900px)').matches;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.zoomSpeed = isMobile ? 1.2 : 0.8;
controls.rotateSpeed = isMobile ? 1.1 : 0.8;
controls.zoomToCursor = false;
controls.enablePan = !isMobile;
controls.screenSpacePanning = !isMobile;
controls.panSpeed = isMobile ? 0.6 : 0.8;
controls.minDistance = 0.12;
controls.maxDistance = 200;
controls.target.set(0, 0, 0);

const focusController = createFocusController(camera, controls);

controls.addEventListener('start', () => {
  if (focusController.isFollowing()) {
    focusController.clear();
  }
});

function isUIElementTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-ui-element="true"]'));
}

const starsGroup = createStars(scene);
// Force stars to be in the scene and visible
if (starsGroup && !starsGroup.parent) {
  scene.add(starsGroup);
}

const earthRuntime = createEarthRuntime(scene, renderer);
const liveEarthSystem = createLiveEarthSystem({
  scene,
  earth: earthRuntime.earthParts.earth,
  camera,
});
const satelliteSystem = createSatelliteSystem({
  scene,
  camera,
  infoDiv,
  state,
});
const asteroidSystem = createAsteroidSystem({
  scene,
  camera,
  infoDiv,
  state,
});

wireUI({
  state,
  earthRuntime,
  liveEarthSystem,
  starsGroup,
  satelliteSystem,
  asteroidSystem,
  focusController,
  searchInput,
  clearBtn,
  orbitBtn,
  allLayersBtn,
  satBtn,
  asteroidsBtn,
  asteroidBtn,
  windBtn,
  auroraBtn,
  terminatorBtn,
  earthLabelsBtn,
  alertsBtn,
  weatherBtn,
  categoryBtn,
  starsBtn,
  labelBtn,
});

function clearFollowMode() {
  focusController.clear();
  earthRuntime.setMoonDistanceVisible(false);
  satelliteSystem.clearSelection();
  asteroidSystem.clearSelection();
  satelliteSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  asteroidSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
}

function getEarthClimateAtPointer(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObject(earthRuntime.earthParts.earth, false);
  if (!intersections.length) return null;

  const localPoint = earthRuntime.earthParts.earth.worldToLocal(intersections[0].point.clone());
  const radius = localPoint.length();
  if (!radius) return null;

  const normalized = localPoint.divideScalar(radius);
  const latitude = THREE.MathUtils.radToDeg(
    Math.asin(THREE.MathUtils.clamp(normalized.y, -1, 1))
  );
  let longitude = THREE.MathUtils.radToDeg(Math.atan2(-normalized.z, normalized.x));
  while (longitude > 180) longitude -= 360;
  while (longitude < -180) longitude += 360;

  return getEarthClimateInfo(latitude, longitude);
}

function getMoonHit(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObject(earthRuntime.earthParts.moon, false);
  return intersections.length ? intersections[0] : null;
}

function handleSceneSelection(clientX, clientY) {
  const asteroidEntry = asteroidSystem.handlePointer(clientX, clientY, raycaster, mouse);
  if (asteroidEntry) {
    playSFX('zoom'); // Use the snappy mechanical snap for focus
    satelliteSystem.clearSelection({ hidePanel: false });
    focusController.follow(asteroidEntry.mesh, new THREE.Vector3(0.65, 0.34, 0.65));
    asteroidSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
    return;
  }

  const satelliteEntry = satelliteSystem.handlePointer(clientX, clientY, raycaster, mouse);
  if (satelliteEntry) {
    playSFX('zoom'); // Single snappy sound
    focusController.follow(satelliteEntry.mesh, new THREE.Vector3(0.42, 0.26, 0.42));
    return;
  }

  const moonHit = getMoonHit(clientX, clientY);
  if (moonHit) {
    playSFX('zoom'); // Consistent focus sound
    clearFollowMode();
    earthRuntime.setMoonDistanceVisible(true);
    const moonPhase = earthRuntime.getMoonPhaseInfo();
    showMoonInfo(infoDiv, {
      name: 'Moon',
      earthDistanceKm: MOON_AVERAGE_DISTANCE_KM,
      relativeSize: '27.3% of Earth',
      orbitPeriodDays: '27.3',
      phaseName: moonPhase.name,
      illuminationPercent: Math.round(moonPhase.illumination * 100),
    });
    focusController.jumpTo(earthRuntime.earthParts.moon, new THREE.Vector3(2.4, 1.1, 2.4));
    return;
  }

  const climateInfo = getEarthClimateAtPointer(clientX, clientY);
  if (climateInfo) {
    playSFX('lock');
    clearFollowMode();
    showEarthClimateInfo(infoDiv, climateInfo, clientX, clientY);
    return;
  }

  clearFollowMode();
}

function updateSceneVisibility() {
  const query = satelliteSystem.getQueryValue(searchInput);
  satelliteSystem.updateVisibility(query);
  asteroidSystem.updateVisibility(query);
}

let lastPointerDownAt = 0;

window.addEventListener('pointerdown', (event) => {
  if (isUIElementTarget(event.target)) return;
  playSFX('click');

  const now = Date.now();
  if (now - lastPointerDownAt < 300) {
    handleSceneSelection(event.clientX, event.clientY);
    lastPointerDownAt = 0;
  } else {
    lastPointerDownAt = now;
  }
});

function handleEarthClick(clientX, clientY) {
  const climateInfo = getEarthClimateAtPointer(clientX, clientY);
  if (climateInfo) {
    clearFollowMode();
    showEarthClimateInfo(infoDiv, climateInfo, clientX, clientY);
  } else {
    clearFollowMode();
  }
}



window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    playSFX('transition');
    clearFollowMode();
  }
});

window.addEventListener('click', (event) => {
  if (isUIElementTarget(event.target)) return;
  handleEarthClick(event.clientX, event.clientY);
  updateSceneVisibility();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load data in the background without blocking the initial render
satelliteSystem.load().then(() => {
  if (satelliteStatusBadge) satelliteStatusBadge.setStatus(satelliteSystem.getStatus(), '');
  satelliteSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
});

asteroidSystem.load().then(() => {
  asteroidSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
});

function animate() {
  requestAnimationFrame(animate);
  const now = new Date();

  earthRuntime.update(now);
  liveEarthSystem.update({
    sunDirection: earthRuntime.getSunDirection(),
    now: now,
  });
  if (newsPanel) newsPanel.update();
  if (asteroidStatusBadge) asteroidStatusBadge.setStatus(asteroidSystem.getStatus(), '');
  if (exitFollowBtn) exitFollowBtn.style.display = focusController.isFollowing() ? 'block' : 'none';
  satelliteSystem.update();
  asteroidSystem.update();
  focusController.update();

  controls.update();
  if (poleCompass) poleCompass.update(camera, earthRuntime.earthParts.earth);
  renderer.render(scene, camera);
}

animate();

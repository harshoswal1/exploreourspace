import * as THREE from 'https://esm.sh/three@0.152.2';
import { setToolButtonState } from '../ui/buttons.js';
import {
  getSatelliteCategoryLabel,
  getSatelliteCategoryOrder,
} from '../utils/satelliteCategory.js';

export function wireUI({
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
}) {
  function applyAllState(enabled) {
    state.orbitsVisible = enabled;
    state.satellitesVisible = enabled;
    state.asteroidsVisible = enabled;
    state.asteroidPathsVisible = enabled;
    state.windDirectionsVisible = enabled;
    state.starsVisible = enabled;
    state.labelsVisible = enabled;
    state.auroraVisible = enabled;
    state.terminatorVisible = enabled;
    state.earthLabelsVisible = enabled;
    state.earthAlertsVisible = enabled;
    state.weatherLayer = enabled ? 'temperature' : 'none';
    if (!enabled) {
      state.satelliteCategory = 'all';
    }

    earthRuntime.setWindVisible(state.windDirectionsVisible);
    starsGroup.visible = state.starsVisible;
    liveEarthSystem.setAuroraVisible(state.auroraVisible);
    liveEarthSystem.setTerminatorVisible(state.terminatorVisible);
    liveEarthSystem.setEarthLabelsVisible(state.earthLabelsVisible);
    liveEarthSystem.setAlertsVisible(state.earthAlertsVisible);
    liveEarthSystem.setWeatherLayer(state.weatherLayer);

    weatherBtn.innerText = `Weather: ${liveEarthSystem.getWeatherLayerLabel()}`;
    categoryBtn.innerText = `Sat Filter: ${getSatelliteCategoryLabel(state.satelliteCategory)}`;

    syncButtonStates();

    const query = satelliteSystem.getQueryValue(searchInput);
    satelliteSystem.updateVisibility(query);
    asteroidSystem.updateVisibility(query);
  }

  function syncButtonStates() {
    setToolButtonState(orbitBtn, state.orbitsVisible);
    setToolButtonState(satBtn, state.satellitesVisible);
    setToolButtonState(asteroidsBtn, state.asteroidsVisible);
    setToolButtonState(asteroidBtn, state.asteroidPathsVisible);
    setToolButtonState(windBtn, state.windDirectionsVisible);
    setToolButtonState(auroraBtn, state.auroraVisible);
    setToolButtonState(terminatorBtn, state.terminatorVisible);
    setToolButtonState(earthLabelsBtn, state.earthLabelsVisible);
    setToolButtonState(alertsBtn, state.earthAlertsVisible);
    setToolButtonState(weatherBtn, state.weatherLayer !== 'none');
    setToolButtonState(categoryBtn, state.satelliteCategory !== 'all');
    setToolButtonState(starsBtn, state.starsVisible);
    setToolButtonState(labelBtn, state.labelsVisible);

    const allEnabled =
      state.orbitsVisible &&
      state.satellitesVisible &&
      state.asteroidsVisible &&
      state.asteroidPathsVisible &&
      state.windDirectionsVisible &&
      state.starsVisible &&
      state.labelsVisible &&
      state.auroraVisible &&
      state.terminatorVisible &&
      state.earthLabelsVisible &&
      state.earthAlertsVisible &&
      state.weatherLayer !== 'none';
    setToolButtonState(allLayersBtn, allEnabled);
  }

  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value ? 'block' : 'none';
    const query = satelliteSystem.getQueryValue(searchInput);
    satelliteSystem.updateVisibility(query);
    asteroidSystem.updateVisibility(query);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    satelliteSystem.updateVisibility('');
    asteroidSystem.updateVisibility('');
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = satelliteSystem.getQueryValue(searchInput);
    const satelliteEntry = satelliteSystem.focusByQuery(query);
    if (satelliteEntry) {
      focusController.follow(satelliteEntry.mesh, new THREE.Vector3(0.42, 0.26, 0.42));
      return;
    }

    const asteroidEntry = asteroidSystem.focusByQuery(query);
    if (asteroidEntry) {
      focusController.follow(asteroidEntry.mesh, new THREE.Vector3(0.65, 0.34, 0.65));
    }
  });

  orbitBtn.addEventListener('click', () => {
    state.orbitsVisible = !state.orbitsVisible;
    syncButtonStates();
    satelliteSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  });

  allLayersBtn.addEventListener('click', () => {
    const everythingOn =
      state.orbitsVisible &&
      state.satellitesVisible &&
      state.asteroidsVisible &&
      state.asteroidPathsVisible &&
      state.windDirectionsVisible &&
      state.starsVisible &&
      state.labelsVisible &&
      state.auroraVisible &&
      state.terminatorVisible &&
      state.earthLabelsVisible &&
      state.earthAlertsVisible &&
      state.weatherLayer !== 'none';
    applyAllState(!everythingOn);
  });

  satBtn.addEventListener('click', () => {
    state.satellitesVisible = !state.satellitesVisible;
    syncButtonStates();
    satelliteSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  });

  asteroidsBtn.addEventListener('click', () => {
    state.asteroidsVisible = !state.asteroidsVisible;
    syncButtonStates();
    asteroidSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  });

  asteroidBtn.addEventListener('click', () => {
    state.asteroidPathsVisible = !state.asteroidPathsVisible;
    syncButtonStates();
    asteroidSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  });

  windBtn.addEventListener('click', () => {
    state.windDirectionsVisible = !state.windDirectionsVisible;
    earthRuntime.setWindVisible(state.windDirectionsVisible);
    syncButtonStates();
  });

  auroraBtn.addEventListener('click', () => {
    state.auroraVisible = !state.auroraVisible;
    liveEarthSystem.setAuroraVisible(state.auroraVisible);
    syncButtonStates();
  });

  terminatorBtn.addEventListener('click', () => {
    state.terminatorVisible = !state.terminatorVisible;
    liveEarthSystem.setTerminatorVisible(state.terminatorVisible);
    syncButtonStates();
  });

  earthLabelsBtn.addEventListener('click', () => {
    state.earthLabelsVisible = !state.earthLabelsVisible;
    liveEarthSystem.setEarthLabelsVisible(state.earthLabelsVisible);
    syncButtonStates();
  });

  alertsBtn.addEventListener('click', () => {
    state.earthAlertsVisible = !state.earthAlertsVisible;
    liveEarthSystem.setAlertsVisible(state.earthAlertsVisible);
    syncButtonStates();
  });

  const categoryOrder = getSatelliteCategoryOrder();

  weatherBtn.addEventListener('click', () => {
    const nextLayer = liveEarthSystem.cycleWeatherLayer();
    state.weatherLayer = nextLayer;
    weatherBtn.innerText = `Weather: ${liveEarthSystem.getWeatherLayerLabel()}`;
    syncButtonStates();
  });

  categoryBtn.addEventListener('click', () => {
    const currentIndex = categoryOrder.indexOf(state.satelliteCategory);
    state.satelliteCategory = categoryOrder[(currentIndex + 1) % categoryOrder.length];
    categoryBtn.innerText = `Sat Filter: ${getSatelliteCategoryLabel(state.satelliteCategory)}`;
    syncButtonStates();
    satelliteSystem.updateVisibility(satelliteSystem.getQueryValue(searchInput));
  });

  starsBtn.addEventListener('click', () => {
    state.starsVisible = !state.starsVisible;
    starsGroup.visible = state.starsVisible;
    syncButtonStates();
  });

  labelBtn.addEventListener('click', () => {
    state.labelsVisible = !state.labelsVisible;
    const query = satelliteSystem.getQueryValue(searchInput);
    syncButtonStates();
    satelliteSystem.updateVisibility(query);
    asteroidSystem.updateVisibility(query);
  });

  weatherBtn.innerText = `Weather: ${liveEarthSystem.getWeatherLayerLabel()}`;
  categoryBtn.innerText = `Sat Filter: ${getSatelliteCategoryLabel(state.satelliteCategory)}`;
  earthRuntime.setWindVisible(state.windDirectionsVisible);
  liveEarthSystem.setAuroraVisible(state.auroraVisible);
  liveEarthSystem.setTerminatorVisible(state.terminatorVisible);
  liveEarthSystem.setEarthLabelsVisible(state.earthLabelsVisible);
  liveEarthSystem.setAlertsVisible(state.earthAlertsVisible);
  syncButtonStates();
}

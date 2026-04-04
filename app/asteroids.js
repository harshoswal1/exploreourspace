import * as THREE from 'https://esm.sh/three@0.152.2';

import { loadMajorAsteroids } from '../asteroids/loader.js';
import { createAsteroidLabel, createAsteroidMesh } from '../asteroids/mesh.js';
import { createAsteroidPath, getAsteroidPosition } from '../asteroids/path.js';
import { hideInfoPanel, showAsteroidInfo } from '../ui/infoPanel.js';

export function createAsteroidSystem({ scene, camera, infoDiv, state }) {
  const entries = [];
  let status = 'UPDATING';

  async function load() {
    status = 'UPDATING';

    try {
      const data = await loadMajorAsteroids();

      data.forEach((asteroid) => {
        const mesh = createAsteroidMesh(asteroid.hazardous);
        const path = createAsteroidPath(asteroid);
        const label = createAsteroidLabel(asteroid.name);
        label.position.set(0, 0.22, 0);
        mesh.add(label);
        path.visible = false;
        scene.add(path);
        scene.add(mesh);

        entries.push({
          ...asteroid,
          mesh,
          label,
          path,
        });
      });

      status = entries.length > 0 ? 'LIVE' : 'FALLBACK';
    } catch (error) {
      console.error('Failed to load major asteroids:', error);
      status = 'FALLBACK';
    }
  }

  function updateVisibility(query = '') {
    entries.forEach((entry) => {
      const matchesQuery = !query || entry.name.toLowerCase().includes(query);
      const isSelected = state.selectedAsteroidId === entry.id;
      const showPath = (state.asteroidPathsVisible || isSelected) && matchesQuery;
      entry.mesh.visible = state.asteroidsVisible && matchesQuery;
      entry.label.visible = state.labelsVisible && state.asteroidsVisible && matchesQuery;
      entry.path.visible = showPath;
      entry.mesh.userData.trail.visible = showPath;
      if (isSelected) {
        entry.label.visible = state.asteroidsVisible && matchesQuery;
      }
    });
  }

  function clearSelection({ hidePanel = true } = {}) {
    state.selectedAsteroidId = null;
    if (hidePanel) {
      hideInfoPanel(infoDiv);
    }
  }

  function focusByQuery(query) {
    const found = entries.find((entry) => entry.name.toLowerCase().includes(query));
    return found || null;
  }

  function handlePointer(clientX, clientY, raycaster, mouse) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(
      entries.map((entry) => entry.mesh),
      true
    );

    if (!intersects.length) {
      clearSelection();
      return null;
    }

    let parent = intersects[0].object;
    while (parent && !entries.find((entry) => entry.mesh === parent)) {
      parent = parent.parent;
    }

    const selectedEntry = entries.find((entry) => entry.mesh === parent);
    if (!selectedEntry) {
      clearSelection();
      return null;
    }

    state.selectedAsteroidId = selectedEntry.id;
    showAsteroidInfo(infoDiv, selectedEntry);
    return selectedEntry;
  }

  function update() {
    const nowMs = Date.now();

    entries.forEach((entry) => {
      const pos = getAsteroidPosition(entry, nowMs);
      entry.mesh.position.copy(pos);
      entry.mesh.rotation.x += 0.0025;
      entry.mesh.rotation.y += 0.0018;
      entry.label.lookAt(camera.position);

      const isSelected = state.selectedAsteroidId === entry.id;
      const { point, glow, trail } = entry.mesh.userData;
      const blink = 0.5 + 0.5 * Math.sin(nowMs * (entry.hazardous ? 0.016 : 0.013));
      glow.material.opacity = isSelected
        ? entry.hazardous
          ? 0.18 + blink * 0.72
          : 0.12 + blink * 0.62
        : entry.hazardous
          ? 0.04 + blink * 0.58
          : 0.03 + blink * 0.5;
      point.material.opacity = isSelected
        ? entry.hazardous
          ? 0.26 + blink * 0.74
          : 0.22 + blink * 0.68
        : entry.hazardous
          ? 0.08 + blink * 0.74
          : 0.06 + blink * 0.66;
      trail.material.opacity = isSelected
        ? entry.hazardous
          ? 0.48
          : 0.3
        : entry.hazardous
          ? 0.34
          : 0.18;
      trail.lookAt(camera.position);

      const distance = camera.position.distanceTo(entry.mesh.position);
      entry.path.material.opacity = isSelected
        ? entry.hazardous
          ? 0.7
          : 0.52
        : entry.hazardous
          ? 0.42
          : 0.28;
      const scale = THREE.MathUtils.clamp(
        distance / 20,
        isSelected ? 0.72 : 0.4,
        isSelected
          ? entry.hazardous
            ? 1.55
            : 1.3
          : entry.hazardous
            ? 0.92
            : 0.76
      );
      entry.mesh.scale.setScalar(scale);
      const pointScale = THREE.MathUtils.clamp(distance / 9, 0.85, isSelected ? 2.8 : 1.8);
      point.scale.setScalar(pointScale);

      const labelScale = THREE.MathUtils.clamp(distance / 20, 0.28, 0.9);
      entry.label.scale.set(labelScale, labelScale * 0.28, 1);
    });
  }

  return {
    entries,
    load,
    update,
    updateVisibility,
    clearSelection,
    hasSelection: () => state.selectedAsteroidId !== null,
    focusByQuery,
    getStatus: () => status,
    handlePointer,
  };
}

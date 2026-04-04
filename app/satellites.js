import * as THREE from 'https://esm.sh/three@0.152.2';

import { loadSatellites } from '../satellites/loader.js';
import { createSatelliteMesh, createLabel } from '../satellites/mesh.js';
import { createOrbitLine, getPosition } from '../satellites/orbit.js';
import { hideInfoPanel, showSatelliteInfo } from '../ui/infoPanel.js';
import { isImportant } from '../utils/helpers.js';
import { classifySatellite } from '../utils/satelliteCategory.js';


export function createSatelliteSystem({ scene, camera, infoDiv, state }) {
  const entries = [];
  let satelliteLib = null;
  const selectedTrailPoints = [];
  let status = 'UPDATING';
  let statusDetail = '';
  const selectedTrail = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({
      color: 0x8feeff,
      transparent: true,
      opacity: 0.9,
    })
  );
  selectedTrail.visible = false;
  scene.add(selectedTrail);

  function getQueryValue(searchInput) {
    return searchInput.value.toLowerCase();
  }

  function updateVisibility(query = '') {
    const selectedEntry =
      state.selectedSatelliteIndex >= 0 ? entries[state.selectedSatelliteIndex] : null;

    entries.forEach((entry, index) => {
      const matchesQuery = !query || entry.name.toLowerCase().includes(query);
      const matchesCategory =
        state.satelliteCategory === 'all' || entry.category === state.satelliteCategory;
      const isSelected = index === state.selectedSatelliteIndex;

      entry.mesh.visible = state.satellitesVisible && matchesQuery && matchesCategory;
      entry.label.visible = state.labelsVisible && matchesQuery && matchesCategory;
      entry.orbitLine.visible =
        ((state.orbitsVisible && matchesQuery && matchesCategory) || isSelected) &&
        state.satellitesVisible;
    });

    selectedTrail.visible =
      state.satellitesVisible &&
      state.selectedSatelliteIndex !== -1 &&
      selectedTrailPoints.length > 1 &&
      (!!selectedEntry &&
        (state.satelliteCategory === 'all' || selectedEntry.category === state.satelliteCategory));
  }

  async function load() {
    const satelliteResult = await loadSatellites();
    const satelliteData = satelliteResult.satellites || [];
    // If we loaded successfully, we should have a lib reference via the first valid satrec 
    // or we can just import it dynamically here to avoid blocking the whole file.
    if (typeof window !== 'undefined' && window.satellite) satelliteLib = window.satellite;
    
    status = satelliteResult.status || 'FALLBACK';
    statusDetail = satelliteResult.updatedAt
      ? new Date(satelliteResult.updatedAt).toLocaleString()
      : '';

    if (!satelliteData.length) {
      console.error('No satellite data loaded on deploy (satellite service unreachable or rate-limited).');
      return;
    }

    if (!satellite && satelliteData.some((sat) => !sat.satrec?.staticPosition)) {
      console.error('Satellite library did not load correctly. Check CDN availability and network policies.');
      return;
    }

    satelliteData.forEach((sat) => {
      const mesh = createSatelliteMesh();
      const orbitLine = createOrbitLine(sat.satrec);
      const label = createLabel(sat.name);

      orbitLine.visible = false;
      label.position.set(0, 0.2, 0);
      mesh.add(label);

      scene.add(orbitLine);
      scene.add(mesh);

      entries.push({
        mesh,
        satrec: sat.satrec,
        name: sat.name,
        category: classifySatellite(sat.name),
        label,
        orbitLine,
      });
    });

    if (entries.length > 0) {
      console.log('First satellite position:', getPosition(entries[0].satrec));
    }
  }

  function clearSelection({ hidePanel = true } = {}) {
    state.selectedSatelliteIndex = -1;
    selectedTrailPoints.length = 0;
    selectedTrail.visible = false;
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

    if (intersects.length === 0) {
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

    state.selectedSatelliteIndex = entries.indexOf(selectedEntry);
    selectedTrailPoints.length = 0;

    const now = new Date();
    if (!satelliteLib && !selectedEntry.satrec?.staticPosition) {
      console.warn('Satellite propagation library is not loaded (deploy network problem).');
      return null;
    }

    const pv = selectedEntry.satrec?.staticPosition
      ? {}
      : (satelliteLib ? satelliteLib.propagate(selectedEntry.satrec, now) : {});

    showSatelliteInfo(infoDiv, selectedEntry.name, pv, now, satelliteLib);
    return selectedEntry;
  }

  function update() {
    entries.forEach((entry) => {
      const pos = getPosition(entry.satrec);
      if (!pos) return;

      entry.mesh.position.copy(pos);
      entry.mesh.rotation.x += 0.002;
      entry.mesh.rotation.y += 0.002;

      const isSelected = state.selectedSatelliteIndex === entries.indexOf(entry);

      const distance = camera.position.distanceTo(entry.mesh.position);
      entry.orbitLine.material.opacity = Math.max(0.1, Math.min(0.5, 10 / distance));

      let scale = Math.max(
        isSelected ? 0.7 : 0.2,
        Math.min(isSelected ? 1.9 : 1.0, distance / (isSelected ? 9 : 20))
      );
      if (isImportant(entry.name)) {
        scale *= 1.8;
      }
      entry.mesh.scale.set(scale, scale, scale);

      const hit = entry.mesh.children.find(
        (child) =>
          child.geometry &&
          child.geometry.type === 'SphereGeometry' &&
          child.material &&
          child.material.opacity === 0
      );

      if (hit) {
        const hitScale = Math.max(1, Math.min(5, distance / 5));
        hit.scale.set(hitScale, hitScale, hitScale);
      }

      entry.label.lookAt(camera.position);

      const labelScale = Math.max(0.3, Math.min(1.2, distance / 12));
      entry.label.scale.set(labelScale, labelScale * 0.3, 1);

      const blink = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
      entry.mesh.children[0].material.opacity = blink;
      entry.mesh.children[0].material.transparent = true;

      const { point, model } = entry.mesh.userData;
      point.material.color.set(0xffe066);
      if (isImportant(entry.name)) {
        point.material.opacity = 1.0;
      }

      if (distance < 5) {
        point.visible = false;
        model.visible = true;
      } else {
        point.visible = true;
        model.visible = false;

        const scaleFactor = Math.max(0.8, Math.min(2.5, distance / 6));
        point.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }

      if (isSelected) {
        selectedTrailPoints.unshift(entry.mesh.position.clone());
        if (selectedTrailPoints.length > 80) {
          selectedTrailPoints.length = 80;
        }
      }
    });

    if (state.selectedSatelliteIndex !== -1 && selectedTrailPoints.length > 1) {
      selectedTrail.geometry.setFromPoints(selectedTrailPoints);
      selectedTrail.visible = state.satellitesVisible;
    } else {
      selectedTrail.visible = false;
    }
  }

  return {
    entries,
    getQueryValue,
    updateVisibility,
    load,
    clearSelection,
    hasSelection: () => state.selectedSatelliteIndex !== -1,
    focusByQuery,
    handlePointer,
    update,
    getStatus: () => status,
    getStatusDetail: () => statusDetail,
  };
}

import * as THREE from 'https://esm.sh/three@0.152.2';

import { createEarth, updateEarthLighting } from '../scene/earth.js';
import { getSunDirection } from '../utils/astronomy.js';

export function createEarthRuntime(scene, renderer) {
  const earthParts = createEarth(scene, renderer);
  const { earth, moon } = earthParts;
  const lastSunDirection = new THREE.Vector3(1, 0, 0);
  const moonWorldPosition = new THREE.Vector3();
  const moonToEarth = new THREE.Vector3();
  const moonToSun = new THREE.Vector3();

  function getMoonPhaseInfo() {
    moon.getWorldPosition(moonWorldPosition);
    moonToEarth.copy(earth.position).sub(moonWorldPosition).normalize();
    moonToSun.copy(lastSunDirection).multiplyScalar(100).sub(moonWorldPosition).normalize();
    const phaseAngleCos = THREE.MathUtils.clamp(moonToEarth.dot(moonToSun), -1, 1);
    const illumination = (1 - phaseAngleCos) * 0.5;
    const waxing = moonToEarth.clone().cross(moonToSun).y < 0;

    let name = 'Full Moon';
    if (illumination < 0.07) name = 'New Moon';
    else if (illumination < 0.3) name = waxing ? 'Waxing Crescent' : 'Waning Crescent';
    else if (illumination < 0.57) name = waxing ? 'First Quarter' : 'Last Quarter';
    else if (illumination < 0.9) name = waxing ? 'Waxing Gibbous' : 'Waning Gibbous';

    return {
      name,
      illumination,
    };
  }

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
  sunLight.position.set(10, 5, 10);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x465f86, 0.72);
  scene.add(ambientLight);

  function update() {
    const now = new Date();
    const seconds =
      now.getUTCHours() * 3600 +
      now.getUTCMinutes() * 60 +
      now.getUTCSeconds() +
      now.getUTCMilliseconds() / 1000;

    const rotation = (seconds / 86400) * Math.PI * 2;
    earth.rotation.y = -rotation;

    const sunDirection = getSunDirection(now);
    lastSunDirection.copy(sunDirection);
    updateEarthLighting(earthParts, sunDirection, now);
    sunLight.position.copy(sunDirection).multiplyScalar(20);
  }

  return {
    earthParts,
    getCloudStatus: () => earthParts.liveCloudLayer.getStatus(),
    getMoonPhaseInfo,
    getSunDirection: () => lastSunDirection.clone(),
    setWindVisible: (visible) => earthParts.windField.setVisible(visible),
    setMoonDistanceVisible: (visible) => {
      earthParts.moonDistanceLine.visible = visible;
      earthParts.moonDistanceLabel.visible = visible;
    },
    update,
  };
}

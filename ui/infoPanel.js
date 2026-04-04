export function createInfoPanel() {
  const infoDiv = document.createElement('div');
  infoDiv.style.position = 'absolute';
  infoDiv.style.bottom = '20px';
  infoDiv.style.left = '20px';
  infoDiv.style.padding = '10px 14px';
  infoDiv.style.background = 'rgba(0,0,0,0.7)';
  infoDiv.style.color = 'white';
  infoDiv.style.fontFamily = 'Arial';
  infoDiv.style.fontSize = '14px';
  infoDiv.style.borderRadius = '6px';
  infoDiv.style.display = 'none';
  infoDiv.style.maxWidth = '240px';
  infoDiv.style.lineHeight = '1.4';
  infoDiv.style.border = '1px solid rgba(255,255,255,0.1)';
  infoDiv.style.backdropFilter = 'blur(14px)';
  infoDiv.style.webkitBackdropFilter = 'blur(14px)';
  infoDiv.style.zIndex = '20';
  document.body.appendChild(infoDiv);

  return infoDiv;
}

export function hideInfoPanel(infoDiv) {
  infoDiv.style.display = 'none';
}

function setDefaultPanelPosition(infoDiv) {
  infoDiv.style.left = '20px';
  infoDiv.style.bottom = '20px';
  infoDiv.style.top = 'auto';
  infoDiv.style.right = 'auto';
  infoDiv.style.maxWidth = '240px';
  infoDiv.style.padding = '10px 14px';
}

function setFloatingPanelPosition(infoDiv, clientX, clientY) {
  const x = Math.min(clientX + 14, window.innerWidth - 196);
  const y = Math.min(clientY + 14, window.innerHeight - 150);

  infoDiv.style.left = `${Math.max(12, x)}px`;
  infoDiv.style.top = `${Math.max(12, y)}px`;
  infoDiv.style.bottom = 'auto';
  infoDiv.style.right = 'auto';
  infoDiv.style.maxWidth = '180px';
  infoDiv.style.padding = '9px 12px';
}

export function showSatelliteInfo(infoDiv, name, pv, now, satelliteLib) {
  setDefaultPanelPosition(infoDiv);
  infoDiv.style.display = 'block';

  let altitude = 'N/A';
  let speed = 'N/A';
  let latitude = 'N/A';
  let longitude = 'N/A';

  if (pv.position && pv.velocity) {
    const gmst = satelliteLib.gstime(now);
    const gd = satelliteLib.eciToGeodetic(pv.position, gmst);

    altitude = `${gd.height.toFixed(0)} km`;
    latitude = `${(gd.latitude * (180 / Math.PI)).toFixed(2)}°`;
    longitude = `${(gd.longitude * (180 / Math.PI)).toFixed(2)}°`;

    const vx = pv.velocity.x;
    const vy = pv.velocity.y;
    const vz = pv.velocity.z;
    const vel = Math.sqrt(vx * vx + vy * vy + vz * vz);

    speed = `${(vel * 3600).toFixed(0)} km/h`;
  }

  infoDiv.innerHTML = `
    <b>${name}</b><br/>
    Altitude: ${altitude}<br/>
    Speed: ${speed}<br/>
    Latitude: ${latitude}<br/>
    Longitude: ${longitude}<br/>
  `;
}

export function showAsteroidInfo(infoDiv, asteroid) {
  setDefaultPanelPosition(infoDiv);
  infoDiv.style.display = 'block';

  const sizeText = `${asteroid.diameterMinKm.toFixed(2)}-${asteroid.diameterMaxKm.toFixed(2)} km`;
  const speedText = `${asteroid.relativeVelocityKph.toFixed(0)} km/h`;
  const missKmText = asteroid.missDistanceKm.toLocaleString();
  const missLunarText = asteroid.missDistanceLunar.toFixed(2);

  infoDiv.innerHTML = `
    <b>${asteroid.name}</b><br/>
    Type: Major NEO<br/>
    Hazardous: ${asteroid.hazardous ? 'Yes' : 'No'}<br/>
    Estimated Size: ${sizeText}<br/>
    Relative Speed: ${speedText}<br/>
    Miss Distance: ${missKmText} km<br/>
    Lunar Distance: ${missLunarText} LD<br/>
    Close Approach: ${asteroid.closeApproachDate}<br/>
  `;
}

export function showMoonInfo(infoDiv, moonInfo) {
  setDefaultPanelPosition(infoDiv);
  infoDiv.style.display = 'block';

  infoDiv.innerHTML = `
    <b>${moonInfo.name}</b><br/>
    Type: Natural Satellite<br/>
    Earth Distance: ${moonInfo.earthDistanceKm.toLocaleString()} km<br/>
    Relative Size: ${moonInfo.relativeSize}<br/>
    Orbit Period: ${moonInfo.orbitPeriodDays} days<br/>
    Phase: ${moonInfo.phaseName}<br/>
    Illumination: ${moonInfo.illuminationPercent}%<br/>
  `;
}

export function showEarthClimateInfo(infoDiv, climateInfo, clientX, clientY) {
  setFloatingPanelPosition(infoDiv, clientX, clientY);
  infoDiv.style.display = 'block';

  infoDiv.innerHTML = `
    <b>${climateInfo.placeName}</b><br/>
    Climate: ${climateInfo.climateBand}<br/>
    Typical Range: ${climateInfo.temperatureRange}<br/>
    ${climateInfo.summary}<br/>
  `;
}

import * as THREE from 'https://esm.sh/three@0.152.2';

const NORTH_LOCAL = new THREE.Vector3(0, 1, 0);
const SOUTH_LOCAL = new THREE.Vector3(0, -1, 0);
const WORLD_CENTER = new THREE.Vector3();
const WORLD_POLE = new THREE.Vector3();
const SCREEN_CENTER = new THREE.Vector2();
const SCREEN_POLE = new THREE.Vector2();

function createArrowRow(labelText, accentColor) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'flex-end';
  row.style.gap = '10px';

  const label = document.createElement('div');
  label.textContent = labelText;
  label.style.fontFamily = 'Arial, sans-serif';
  label.style.fontSize = '11px';
  label.style.fontWeight = '700';
  label.style.letterSpacing = '0.18em';
  label.style.color = '#f3f8ff';
  label.style.textTransform = 'uppercase';
  label.style.textShadow = '0 0 12px rgba(0,0,0,0.55)';

  const arrow = document.createElement('div');
  arrow.textContent = '➤';
  arrow.style.width = '22px';
  arrow.style.height = '22px';
  arrow.style.display = 'flex';
  arrow.style.alignItems = 'center';
  arrow.style.justifyContent = 'center';
  arrow.style.fontSize = '22px';
  arrow.style.lineHeight = '1';
  arrow.style.color = accentColor;
  arrow.style.textShadow = `0 0 14px ${accentColor}`;
  arrow.style.transformOrigin = '50% 50%';
  arrow.style.transition = 'transform 120ms linear, opacity 120ms linear';

  row.appendChild(label);
  row.appendChild(arrow);

  return { row, arrow };
}

function projectToScreen(vector, camera) {
  const projected = vector.clone().project(camera);
  return SCREEN_POLE.set(
    projected.x * window.innerWidth * 0.5,
    -projected.y * window.innerHeight * 0.5
  );
}

function setArrowDirection(arrow, earth, camera, localPole, centerScreen) {
  WORLD_POLE.copy(localPole);
  earth.localToWorld(WORLD_POLE);
  const poleScreen = projectToScreen(WORLD_POLE, camera).clone();
  const dx = poleScreen.x - centerScreen.x;
  const dy = poleScreen.y - centerScreen.y;
  const angle = Math.atan2(dy, dx);

  arrow.style.transform = `rotate(${angle}rad)`;

  const worldDirection = WORLD_POLE.clone().sub(camera.position).normalize();
  const facing = camera.getWorldDirection(new THREE.Vector3()).dot(worldDirection);
  arrow.style.opacity = facing > 0 ? '1' : '0.38';
}

export function createPoleCompass() {
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.right = '20px';
  panel.style.bottom = '120px';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.alignItems = 'flex-end';
  panel.style.gap = '8px';
  panel.style.zIndex = '20';
  panel.style.pointerEvents = 'none';

  const title = document.createElement('div');
  title.textContent = 'POLES';
  title.style.fontFamily = 'Arial, sans-serif';
  title.style.fontSize = '10px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.26em';
  title.style.color = 'rgba(230,240,255,0.7)';
  title.style.textShadow = '0 0 14px rgba(0,0,0,0.5)';

  const north = createArrowRow('North', '#84d7ff');
  const south = createArrowRow('South', '#ffb3c4');

  panel.appendChild(title);
  panel.appendChild(north.row);
  panel.appendChild(south.row);
  document.body.appendChild(panel);

  return {
    update(camera, earth) {
      if (!camera || !earth) return;

      earth.getWorldPosition(WORLD_CENTER);
      const centerProjected = WORLD_CENTER.clone().project(camera);
      SCREEN_CENTER.set(
        centerProjected.x * window.innerWidth * 0.5,
        -centerProjected.y * window.innerHeight * 0.5
      );

      setArrowDirection(north.arrow, earth, camera, NORTH_LOCAL, SCREEN_CENTER);
      setArrowDirection(south.arrow, earth, camera, SOUTH_LOCAL, SCREEN_CENTER);
    },
  };
}

function styleButton(button) {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  button.style.width = '100%';
  button.style.padding = mobile ? '14px 14px' : '10px 12px';
  button.style.padding = mobile ? '8px 6px' : '10px 12px';
  button.style.borderRadius = mobile ? '16px' : '14px';
  button.style.fontSize = mobile ? '14px' : '11px';
  button.style.fontSize = mobile ? '11px' : '11px';
  button.style.fontWeight = '600';
  button.style.letterSpacing = '0.03em';
  button.style.color = 'white';
  button.style.background =
    'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))';
  button.style.border = '1px solid rgba(255,255,255,0.14)';
  button.style.outline = 'none';
  button.style.cursor = 'pointer';
  button.style.backdropFilter = 'blur(24px)';
  button.style.webkitBackdropFilter = 'blur(24px)';
  button.style.boxShadow =
    '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)';
  button.style.transition =
    'transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease';
  button.dataset.active = 'false';

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-1px)';
    button.style.borderColor = 'rgba(255,255,255,0.24)';
    button.style.boxShadow =
      '0 10px 28px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.12)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.borderColor = 'rgba(255,255,255,0.14)';
    button.style.boxShadow =
      '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)';
  });
}

function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.fontFamily = 'Arial, sans-serif';
  title.style.fontSize = '10px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.18em';
  title.style.textTransform = 'uppercase';
  title.style.color = 'rgba(210,225,245,0.62)';
  title.style.padding = '2px 4px 0';
  return title;
}

function createButtonGrid(columns = 2) {
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  grid.style.gap = '8px';
  return grid;
}

export function setToolButtonState(button, isActive) {
  button.dataset.active = isActive ? 'true' : 'false';
  button.style.color = isActive ? '#f5fbff' : 'rgba(255,255,255,0.84)';
  button.style.background = isActive
    ? 'linear-gradient(135deg, rgba(88,166,255,0.34), rgba(56,255,136,0.16))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))';
  button.style.borderColor = isActive ? 'rgba(124,200,255,0.46)' : 'rgba(255,255,255,0.14)';
  button.style.boxShadow = isActive
    ? '0 10px 26px rgba(32,88,160,0.28), inset 0 1px 1px rgba(255,255,255,0.18), 0 0 18px rgba(92,184,255,0.16)'
    : '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)';
}

export function createButtons() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const container = document.createElement('div');
  container.dataset.uiElement = 'true';
  container.style.position = 'absolute';
  container.style.top = mobile ? 'auto' : '156px';
  container.style.bottom = mobile ? '80px' : 'auto';
  container.style.left = mobile ? '50%' : '20px';
  container.style.width = mobile ? 'calc(100% - 24px)' : '248px';
  container.style.maxWidth = mobile ? '640px' : 'none';
  container.style.maxHeight = mobile ? '42vh' : 'min(68vh, 620px)';
  container.style.maxHeight = mobile ? '70vh' : 'min(68vh, 620px)';
  container.style.overflowY = 'auto';
  container.style.padding = mobile ? '10px 8px' : '12px';
  container.style.padding = mobile ? '12px 10px' : '12px';
  container.style.borderRadius = '20px';
  container.style.background = 'rgba(8,12,20,0.54)';
  container.style.border = '1px solid rgba(255,255,255,0.1)';
  container.style.backdropFilter = 'blur(20px)';
  container.style.webkitBackdropFilter = 'blur(20px)';
  container.style.boxShadow = '0 14px 36px rgba(0,0,0,0.28)';
  container.style.zIndex = '15';
  container.style.transform = mobile ? 'translateX(-50%)' : 'translateX(-18px) translateY(-6px)';
  container.style.transform = mobile ? 'translateX(-50%) translateY(20px)' : 'translateX(-18px) translateY(-6px)';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.style.transition = 'transform 180ms ease, opacity 180ms ease';

  const stack = document.createElement('div');
  stack.style.display = 'flex';
  stack.style.flexDirection = 'column';
  stack.style.gap = '12px';
  stack.style.gap = mobile ? '8px' : '12px';
  container.appendChild(stack);

  const toggle = document.createElement('button');
  toggle.textContent = '◎';
  toggle.style.position = 'absolute';
  toggle.style.top = mobile ? 'auto' : '104px';
  toggle.style.bottom = mobile ? '20px' : 'auto';
  toggle.style.left = mobile ? '50%' : '24px';
  toggle.style.transform = mobile ? 'translateX(-50%)' : 'none';
  toggle.style.width = mobile ? '56px' : '64px';
  toggle.style.height = mobile ? '56px' : '64px';
  toggle.style.padding = '0';
  toggle.style.borderRadius = '50%';
  toggle.style.fontSize = mobile ? '28px' : '34px';
  toggle.style.fontWeight = '600';
  toggle.style.lineHeight = '1';
  toggle.style.color = '#f6fbff';
  toggle.style.background = 'rgba(8, 12, 20, 0.45)';
  toggle.style.backdropFilter = 'blur(10px)';
  toggle.style.webkitBackdropFilter = 'blur(10px)';
  toggle.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  toggle.style.boxShadow =
    '0 0 0 1px rgba(180,225,255,0.08), inset 0 0 28px rgba(120,190,255,0.08)';
  toggle.style.textShadow =
    '0 0 10px rgba(160,220,255,0.9), 0 0 24px rgba(120,190,255,0.45), 0 8px 18px rgba(0,0,0,0.45)';
  toggle.style.cursor = 'pointer';
  toggle.style.zIndex = '16';
  toggle.style.transition =
    'transform 140ms ease, text-shadow 140ms ease, opacity 140ms ease, box-shadow 140ms ease';

  toggle.addEventListener('mouseenter', () => {
    toggle.style.transform = 'scale(1.05)';
    toggle.style.boxShadow =
      '0 0 0 1px rgba(196,234,255,0.14), inset 0 0 32px rgba(140,205,255,0.12)';
    toggle.style.textShadow =
      '0 0 12px rgba(190,232,255,1), 0 0 30px rgba(150,208,255,0.55), 0 10px 22px rgba(0,0,0,0.48)';
  });

  toggle.addEventListener('mouseleave', () => {
    toggle.style.transform = 'scale(1)';
    toggle.style.boxShadow =
      '0 0 0 1px rgba(180,225,255,0.08), inset 0 0 28px rgba(120,190,255,0.08)';
    toggle.style.textShadow =
      '0 0 10px rgba(160,220,255,0.9), 0 0 24px rgba(120,190,255,0.45), 0 8px 18px rgba(0,0,0,0.45)';
  });

  const orbitBtn = document.createElement('button');
  orbitBtn.innerText = 'Orbits';
  styleButton(orbitBtn);
  setToolButtonState(orbitBtn, false);

  const allLayersBtn = document.createElement('button');
  allLayersBtn.innerText = 'All Layers';
  styleButton(allLayersBtn);
  setToolButtonState(allLayersBtn, false);

  const satBtn = document.createElement('button');
  satBtn.innerText = 'Satellites';
  styleButton(satBtn);
  setToolButtonState(satBtn, true);

  const asteroidsBtn = document.createElement('button');
  asteroidsBtn.innerText = 'Asteroids';
  styleButton(asteroidsBtn);
  setToolButtonState(asteroidsBtn, true);

  const asteroidBtn = document.createElement('button');
  asteroidBtn.innerText = 'Asteroid Paths';
  styleButton(asteroidBtn);
  setToolButtonState(asteroidBtn, false);

  const windBtn = document.createElement('button');
  windBtn.innerText = 'Wind';
  styleButton(windBtn);
  setToolButtonState(windBtn, false);

  const auroraBtn = document.createElement('button');
  auroraBtn.innerText = 'Aurora';
  styleButton(auroraBtn);
  setToolButtonState(auroraBtn, false);

  const terminatorBtn = document.createElement('button');
  terminatorBtn.innerText = 'Terminator';
  styleButton(terminatorBtn);
  setToolButtonState(terminatorBtn, false);

  const earthLabelsBtn = document.createElement('button');
  earthLabelsBtn.innerText = 'Earth Labels';
  styleButton(earthLabelsBtn);
  setToolButtonState(earthLabelsBtn, false);

  const alertsBtn = document.createElement('button');
  alertsBtn.innerText = 'Earth Alerts';
  styleButton(alertsBtn);
  setToolButtonState(alertsBtn, false);

  const weatherBtn = document.createElement('button');
  weatherBtn.innerText = 'Weather: Off';
  styleButton(weatherBtn);
  setToolButtonState(weatherBtn, false);

  const categoryBtn = document.createElement('button');
  categoryBtn.innerText = 'Sat Filter: All';
  styleButton(categoryBtn);
  setToolButtonState(categoryBtn, false);

  const starsBtn = document.createElement('button');
  starsBtn.innerText = 'Stars';
  styleButton(starsBtn);
  setToolButtonState(starsBtn, true);

  const labelBtn = document.createElement('button');
  labelBtn.innerText = 'Labels';
  styleButton(labelBtn);
  setToolButtonState(labelBtn, true);

  const sceneTitle = createSectionTitle('Scene');
  const sceneGrid = createButtonGrid(2);
  sceneGrid.appendChild(starsBtn);
  sceneGrid.appendChild(labelBtn);
  sceneGrid.appendChild(orbitBtn);
  sceneGrid.appendChild(windBtn);

  const objectsTitle = createSectionTitle('Objects');
  const objectsGrid = createButtonGrid(2);
  objectsGrid.appendChild(satBtn);
  objectsGrid.appendChild(asteroidsBtn);
  objectsGrid.appendChild(asteroidBtn);
  objectsGrid.appendChild(categoryBtn);

  const earthTitle = createSectionTitle('Earth');
  const earthGrid = createButtonGrid(2);
  earthGrid.appendChild(weatherBtn);
  earthGrid.appendChild(auroraBtn);
  earthGrid.appendChild(terminatorBtn);
  earthGrid.appendChild(earthLabelsBtn);
  earthGrid.appendChild(alertsBtn);

  stack.appendChild(allLayersBtn);
  stack.appendChild(sceneTitle);
  stack.appendChild(sceneGrid);
  stack.appendChild(objectsTitle);
  stack.appendChild(objectsGrid);
  stack.appendChild(earthTitle);
  stack.appendChild(earthGrid);

  let open = false;

  function syncMenu() {
    container.style.transform = open ? 'translateX(0) translateY(0)' : 'translateX(-18px) translateY(-6px)';
    if (mobile) {
      container.style.transform = open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)';
    } else {
      container.style.transform = open ? 'translateX(0) translateY(0)' : 'translateX(-18px) translateY(-6px)';
    }
    container.style.opacity = open ? '1' : '0';
    container.style.pointerEvents = open ? 'auto' : 'none';
    toggle.textContent = open ? '◉' : '◎';
  }

  toggle.addEventListener('click', () => {
    open = !open;
    syncMenu();
  });

  document.body.appendChild(toggle);
  document.body.appendChild(container);

  return {
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
    container,
    toggle,
  };
}

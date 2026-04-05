export function createBrand() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const wrap = document.createElement('div');
  wrap.style.position = 'absolute';
  wrap.style.top = '20px';
  wrap.style.left = '20px';
  wrap.style.zIndex = '16';
  wrap.style.pointerEvents = 'none';

  const title = document.createElement('div');
  title.textContent = 'The Space';
  title.style.color = '#f7fbff';
  title.style.fontFamily = '"Trebuchet MS", "Arial Black", sans-serif';
  title.style.fontWeight = '900';
  title.style.fontSize = isMobile ? '15px' : '34px';
  title.style.lineHeight = '0.92';
  title.style.letterSpacing = '0.06em';
  title.style.textTransform = 'uppercase';
  title.style.textShadow = '0 10px 28px rgba(0,0,0,0.45), 0 0 18px rgba(113,181,255,0.18)';

  const subtitle = document.createElement('div');
  subtitle.textContent = 'Company';
  subtitle.style.color = '#b8caec';
  subtitle.style.fontFamily = '"Palatino Linotype", "Book Antiqua", Georgia, serif';
  subtitle.style.fontStyle = 'italic';
  subtitle.style.fontSize = isMobile ? '8px' : '18px';
  subtitle.style.letterSpacing = '0.18em';
  subtitle.style.textTransform = 'uppercase';
  subtitle.style.textShadow = '0 8px 20px rgba(0,0,0,0.38)';

  // Row container for Subtitle + Attribution
  const subRow = document.createElement('div');
  subRow.style.display = 'flex';
  subRow.style.alignItems = 'baseline';
  subRow.style.marginTop = '2px';
  subRow.style.marginLeft = '2px';
  subRow.style.pointerEvents = 'none';

  // Attribution & Social Links
  const attribution = document.createElement('div');
  attribution.style.marginLeft = isMobile ? '8px' : '12px';
  attribution.style.color = 'rgba(255, 255, 255, 0.45)';
  attribution.style.fontFamily = 'Arial, sans-serif';
  attribution.style.fontSize = isMobile ? '8px' : '10px';
  attribution.style.letterSpacing = '0.05em';
  attribution.style.pointerEvents = 'auto'; // Make links clickable
  attribution.style.display = 'flex';
  attribution.style.gap = '6px';
  attribution.style.alignItems = 'center';
  attribution.style.textTransform = 'none';

  attribution.innerHTML = `
    <span style="font-weight: 400;">- by Harsh Oswal</span>
    <a href="https://instagram.com/" target="_blank" title="Instagram" style="text-decoration: none; color: inherit; opacity: 0.6; font-size: 11px;">IG</a>
    <a href="https://linkedin.com/in/" target="_blank" title="LinkedIn" style="text-decoration: none; color: inherit; opacity: 0.6; font-size: 11px;">LI</a>
  `;

  subRow.appendChild(subtitle);
  subRow.appendChild(attribution);

  wrap.appendChild(title);
  wrap.appendChild(subRow);
  document.body.appendChild(wrap);

  return wrap;
}

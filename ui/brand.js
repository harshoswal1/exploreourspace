export function createBrand() {
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
  title.style.fontSize = '34px';
  title.style.lineHeight = '0.92';
  title.style.letterSpacing = '0.06em';
  title.style.textTransform = 'uppercase';
  title.style.textShadow = '0 10px 28px rgba(0,0,0,0.45), 0 0 18px rgba(113,181,255,0.18)';

  const subtitle = document.createElement('div');
  subtitle.textContent = 'Company';
  subtitle.style.marginTop = '2px';
  subtitle.style.marginLeft = '2px';
  subtitle.style.color = '#b8caec';
  subtitle.style.fontFamily = '"Palatino Linotype", "Book Antiqua", Georgia, serif';
  subtitle.style.fontStyle = 'italic';
  subtitle.style.fontSize = '18px';
  subtitle.style.letterSpacing = '0.18em';
  subtitle.style.textTransform = 'uppercase';
  subtitle.style.textShadow = '0 8px 20px rgba(0,0,0,0.38)';

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  document.body.appendChild(wrap);

  return wrap;
}

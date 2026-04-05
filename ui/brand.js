export function createBrand() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  const wrap = document.createElement('div');
  wrap.style.position = 'absolute';
  wrap.style.bottom = '24px';
  wrap.style.left = '20px';
  wrap.style.zIndex = '16';
  wrap.style.pointerEvents = 'none';

  const title = document.createElement('div');
  title.textContent = 'The Space';
  title.style.color = '#fff';
  title.style.fontFamily = 'monospace';
  title.style.fontWeight = '900';
  title.style.fontSize = isMobile ? '15px' : '34px';
  title.style.lineHeight = '0.92';
  title.style.letterSpacing = '0.4em';
  title.style.textTransform = 'uppercase';
  title.style.textShadow = '0 0 10px #ffcc33';
  title.style.borderLeft = '3px solid #ffcc33';
  title.style.paddingLeft = '15px';

  const subtitle = document.createElement('div');
  subtitle.textContent = 'Company';
  subtitle.style.color = '#b8caec';
  subtitle.style.fontFamily = '"Palatino Linotype", "Book Antiqua", Georgia, serif';
  subtitle.style.fontStyle = 'italic';
  subtitle.style.fontSize = isMobile ? '8px' : '18px';
  subtitle.style.letterSpacing = '0.18em';
  subtitle.style.textTransform = 'uppercase';
  subtitle.style.textShadow = '0 8px 20px rgba(0,0,0,0.38)';

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  document.body.appendChild(wrap);

  // Vertical Social Stack positioned below the Toggle Button
  const socialStack = document.createElement('div');
  socialStack.dataset.uiElement = 'true';
  socialStack.style.position = 'absolute';
  socialStack.style.right = isMobile ? '20px' : '24px';
  socialStack.style.top = isMobile ? '60px' : '80px';
  socialStack.style.left = 'auto';
  socialStack.style.display = 'flex';
  socialStack.style.flexDirection = 'column';
  socialStack.style.alignItems = 'flex-end';
  socialStack.style.gap = isMobile ? '12px' : '16px';
  socialStack.style.zIndex = '16';
  socialStack.style.pointerEvents = 'auto';

  // Prominent Name Tag
  const nameTag = document.createElement('div');
  nameTag.textContent = '@Harsh Oswal';
  nameTag.style.color = '#fff';
  nameTag.style.fontFamily = 'monospace';
  nameTag.style.fontSize = isMobile ? '12px' : '14px';
  nameTag.style.fontWeight = '400';
  nameTag.style.letterSpacing = '2px';
  nameTag.style.marginBottom = '10px';
  nameTag.style.opacity = '0.7';
  socialStack.appendChild(nameTag);

  const createSocialIcon = (url, label, svgContent) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.title = label;
    link.style.width = isMobile ? '36px' : '48px';
    link.style.height = isMobile ? '36px' : '48px';
    link.style.borderRadius = '50%';
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    link.style.justifyContent = 'center';
    link.style.background = 'rgba(8,12,20,0.58)';
    link.style.border = '1px solid rgba(255,255,255,0.18)';
    link.style.backdropFilter = 'blur(18px)';
    link.style.webkitBackdropFilter = 'blur(18px)';
    link.style.color = 'white';
    link.style.textDecoration = 'none';
    link.style.transition = 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease';
    link.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';

    link.innerHTML = svgContent;

    link.addEventListener('mouseenter', () => {
      link.style.transform = 'scale(1.1) translateX(4px)';
      link.style.background = 'rgba(255,255,255,0.1)';
      link.style.boxShadow = '0 0 20px rgba(124, 200, 255, 0.4)';
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'scale(1) translateX(0)';
      link.style.background = 'rgba(8,12,20,0.58)';
      link.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    });

    return link;
  };

  // Instagram Link
  const instaIcon = createSocialIcon(
    'https://www.instagram.com/harshoswal2/',
    'Instagram',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:50%; height:50%"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
  );

  // LinkedIn Link
  const linkedinIcon = createSocialIcon(
    'https://www.linkedin.com/in/harsh-oswal-706b14349?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
    'LinkedIn',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="width:50%; height:50%"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
  );

  socialStack.appendChild(instaIcon);
  socialStack.appendChild(linkedinIcon);
  document.body.appendChild(socialStack);

  return wrap;
}

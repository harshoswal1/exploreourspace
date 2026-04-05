export function createSearch() {
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const container = document.createElement('div');
  container.dataset.uiElement = 'true';
  container.style.position = 'absolute';
  container.style.top = mobile ? '50px' : '20px';
  container.style.right = mobile ? '16px' : '118px';
  container.style.left = mobile ? '12px' : 'auto';
  container.style.width = mobile ? 'calc(100vw - 24px)' : 'min(340px, calc(100vw - 234px))';
  container.style.padding = mobile ? '6px 8px' : '8px';
  container.style.borderRadius = mobile ? '14px' : '18px';
  container.style.background = 'rgba(8,12,20,0.54)';
  container.style.border = '1px solid rgba(255,255,255,0.1)';
  container.style.backdropFilter = 'blur(20px)';
  container.style.webkitBackdropFilter = 'blur(20px)';
  container.style.boxShadow = '0 14px 36px rgba(0,0,0,0.28)';
  container.style.zIndex = '15';
  document.body.appendChild(container);

  const fieldWrap = document.createElement('div');
  fieldWrap.style.position = 'relative';
  fieldWrap.style.width = '100%';
  container.appendChild(fieldWrap);

  const searchInput = document.createElement('input');
  searchInput.placeholder = 'Search satellite...';
  searchInput.style.width = '100%';
  searchInput.style.boxSizing = 'border-box';
  searchInput.style.padding = '9px 36px 9px 12px';
  searchInput.style.borderRadius = '12px';
  searchInput.style.fontSize = '13px';
  searchInput.style.background =
    'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))';
  searchInput.style.border = 'none';
  searchInput.style.outline = 'none';
  searchInput.style.boxShadow =
    'inset 0 1px 1px rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.2)';
  searchInput.style.color = 'white';
  searchInput.style.letterSpacing = '0.5px';
  fieldWrap.appendChild(searchInput);

  searchInput.addEventListener('focus', () => {
    searchInput.style.boxShadow =
      '0 0 0 1px rgba(98,179,255,0.35), 0 10px 28px rgba(0,110,255,0.18), inset 0 1px 2px rgba(255,255,255,0.18)';
  });

  searchInput.addEventListener('blur', () => {
    searchInput.style.boxShadow =
      'inset 0 1px 1px rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.2)';
  });

  const clearBtn = document.createElement('button');
  clearBtn.innerText = '✖';
  clearBtn.style.position = 'absolute';
  clearBtn.style.top = '50%';
  clearBtn.style.right = '10px';
  clearBtn.style.transform = 'translateY(-50%)';
  clearBtn.style.touchAction = 'manipulation';
  clearBtn.style.padding = '0';
  clearBtn.style.background = 'transparent';
  clearBtn.style.boxShadow = 'none';
  clearBtn.style.border = 'none';
  clearBtn.style.color = 'rgba(255,255,255,0.7)';
  clearBtn.style.fontSize = '15px';
  clearBtn.style.cursor = 'pointer';
  clearBtn.style.fontWeight = '300';
  clearBtn.style.fontFamily = 'Arial, sans-serif';
  clearBtn.style.opacity = '0.6';
  clearBtn.style.display = 'none';
  fieldWrap.appendChild(clearBtn);

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
  });

  clearBtn.addEventListener('mouseenter', () => {
    clearBtn.style.color = 'white';
  });

  clearBtn.addEventListener('mouseleave', () => {
    clearBtn.style.color = 'rgba(255,255,255,0.7)';
  });

  return { searchInput, clearBtn, container };
}

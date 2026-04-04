const NEWS_REFRESH_MS = 15 * 60 * 1000;
const NEWS_AGE_REFRESH_MS = 60 * 1000;
const NEWS_URL =
  'https://api.spaceflightnewsapi.net/v4/articles/?limit=5&ordering=-published_at';

function formatAge(isoDate) {
  const published = new Date(isoDate).getTime();
  const diffMs = Date.now() - published;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function styleHeadlineLink(link) {
  link.style.color = '#f3f8ff';
  link.style.textDecoration = 'none';
  link.style.fontSize = '13px';
  link.style.fontWeight = '600';
  link.style.lineHeight = '1.4';
  link.style.display = 'block';

  link.addEventListener('mouseenter', () => {
    link.style.color = '#9fdcff';
  });

  link.addEventListener('mouseleave', () => {
    link.style.color = '#f3f8ff';
  });
}

export function createNewsPanel() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const panel = document.createElement('div');
  panel.id = 'news-panel-root';
  panel.style.position = 'absolute';
  if (isMobile) {
    panel.style.bottom = '210px'; // Stacked above Alerts (which is at 150px)
    panel.style.right = '20px';
    panel.style.width = '40px';
    panel.style.height = '40px';
    panel.style.borderRadius = '50%';
    panel.style.padding = '0';
    panel.style.display = 'flex';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'center';
  } else {
    panel.style.top = '90px';
    panel.style.right = '20px';
    panel.style.width = 'min(360px, calc(100vw - 40px))';
    panel.style.maxHeight = '280px';
    panel.style.padding = '14px';
    panel.style.borderRadius = '22px';
  }
  panel.style.background = 'rgba(8,12,20,0.48)';
  panel.style.border = '1px solid rgba(255,255,255,0.1)';
  panel.style.backdropFilter = 'blur(20px)';
  panel.style.webkitBackdropFilter = 'blur(20px)';
  panel.style.boxShadow = '0 14px 36px rgba(0,0,0,0.28)';
  panel.style.zIndex = '15';
  panel.style.overflow = 'hidden';
  panel.style.transition = 'all 0.22s ease';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.cursor = isMobile ? 'pointer' : 'default';

  const metadata = document.createElement('div');

  const title = document.createElement('div');
  title.textContent = 'Top Space News';
  title.style.color = '#ffffff';
  title.style.fontSize = '14px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.08em';
  title.style.textTransform = 'uppercase';
  if (isMobile) title.style.display = 'none';

  const status = document.createElement('div');
  status.style.marginTop = '4px';
  status.style.color = 'rgba(196,212,240,0.78)';
  status.style.fontSize = '11px';
  status.style.letterSpacing = '0.06em';
  status.style.textTransform = 'uppercase';
  if (isMobile) status.style.display = 'none';

  const toggle = document.createElement('div');
  toggle.textContent = isMobile ? '🛰️' : '';
  toggle.style.marginLeft = '8px';
  toggle.style.color = '#9fdcff';
  toggle.style.fontSize = '14px';

  const content = document.createElement('div');
  content.style.marginTop = '12px';
  content.style.display = isMobile ? 'none' : 'block';

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '10px';
  list.style.maxHeight = '210px';
  list.style.overflowY = 'auto';
  list.style.paddingRight = '4px';

  metadata.appendChild(title);
  metadata.appendChild(status);
  header.appendChild(metadata);
  header.appendChild(toggle);
  content.appendChild(list);

  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);

  let expanded = !isMobile;

  function setExpanded(value) {
    expanded = value;
    if (expanded) {
      panel.style.height = 'auto';
      panel.style.maxHeight = '320px';
      panel.style.width = 'min(300px, calc(100vw - 40px))';
      panel.style.borderRadius = '20px';
      panel.style.padding = '14px';
      content.style.display = 'block';
      title.style.display = 'block';
      status.style.display = 'block';
      toggle.textContent = '✕';
    } else {
      panel.style.width = '40px';
      panel.style.height = '40px';
      panel.style.borderRadius = '50%';
      panel.style.padding = '0';
      content.style.display = 'none';
      title.style.display = 'none';
      status.style.display = 'none';
      toggle.textContent = '🛰️';
    }
  }

  if (isMobile) {
    setExpanded(false);
    header.addEventListener('click', () => {
      setExpanded(!expanded);
    });
  }

  let loading = false;
  let lastRefreshAt = 0;
  let lastHeadlineIds = '';
  let ageTimer = null;

  function renderArticles(articles, { markNew = false } = {}) {
    list.innerHTML = '';

    articles.forEach((article, index) => {
      const item = document.createElement('div');
      item.style.padding = '10px 12px';
      item.style.borderRadius = '14px';
      item.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))';
      item.style.border = '1px solid rgba(255,255,255,0.08)';

      const link = document.createElement('a');
      link.href = article.url;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.textContent = article.title;
      styleHeadlineLink(link);

      const meta = document.createElement('div');
      meta.textContent = `${article.news_site} • ${formatAge(article.published_at)}`;
      meta.style.marginTop = '6px';
      meta.style.color = 'rgba(196,212,240,0.72)';
      meta.style.fontSize = '11px';
      meta.style.letterSpacing = '0.04em';
      meta.dataset.publishedAt = article.published_at;
      meta.dataset.newsSite = article.news_site;

      item.appendChild(link);
      item.appendChild(meta);

      if (markNew && index === 0) {
        const badge = document.createElement('div');
        badge.textContent = 'NEW';
        badge.style.marginTop = '8px';
        badge.style.display = 'inline-flex';
        badge.style.padding = '3px 8px';
        badge.style.borderRadius = '999px';
        badge.style.background = 'rgba(95, 208, 207, 0.18)';
        badge.style.border = '1px solid rgba(95, 208, 207, 0.28)';
        badge.style.color = '#c9fffb';
        badge.style.fontSize = '10px';
        badge.style.fontWeight = '700';
        badge.style.letterSpacing = '0.08em';
        item.appendChild(badge);
      }

      list.appendChild(item);
    });
  }

  function refreshAges() {
    Array.from(list.children).forEach((item) => {
      const meta = item.querySelector('[data-published-at]');
      if (!meta) return;
      meta.textContent = `${meta.dataset.newsSite} • ${formatAge(meta.dataset.publishedAt)}`;
    });
  }

  async function refresh() {
    if (loading) return;
    loading = true;
    status.textContent = 'Updating';

    try {
      const response = await fetch(NEWS_URL, { mode: 'cors', cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`News request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const articles = payload.results || [];
      const currentHeadlineIds = articles.map((article) => article.id).join('|');
      const hasNewHeadline = lastHeadlineIds && currentHeadlineIds !== lastHeadlineIds;
      renderArticles(articles, { markNew: hasNewHeadline });

      lastRefreshAt = Date.now();
      lastHeadlineIds = currentHeadlineIds;
      status.textContent = hasNewHeadline ? 'Live • Updated' : 'Live';
      refreshAges();
    } catch (error) {
      console.error('Failed to refresh space news:', error);
      list.innerHTML = '';

      const item = document.createElement('div');
      item.style.padding = '10px 12px';
      item.style.borderRadius = '14px';
      item.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))';
      item.style.border = '1px solid rgba(255,255,255,0.08)';
      item.style.color = '#f3f8ff';
      item.style.fontSize = '13px';
      item.style.lineHeight = '1.5';
      item.textContent = 'Live space news is unavailable right now.';
      list.appendChild(item);
      status.textContent = 'Unavailable';
    } finally {
      loading = false;
    }
  }

  function update() {
    if (Date.now() - lastRefreshAt > NEWS_REFRESH_MS) {
      refresh();
    }
  }

  refresh();
  setInterval(refresh, NEWS_REFRESH_MS);
  ageTimer = setInterval(refreshAges, NEWS_AGE_REFRESH_MS);

  return { panel, update, refresh, ageTimer };
}

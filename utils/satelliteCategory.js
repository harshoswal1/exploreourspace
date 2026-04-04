const CATEGORY_ORDER = ['all', 'iss', 'gps', 'starlink', 'weather', 'military'];

export function getSatelliteCategoryOrder() {
  return CATEGORY_ORDER.slice();
}

export function getSatelliteCategoryLabel(category) {
  return {
    all: 'All',
    iss: 'ISS',
    gps: 'GPS',
    starlink: 'Starlink',
    weather: 'Weather',
    military: 'Military',
  }[category] || 'All';
}

export function classifySatellite(name = '') {
  const value = name.toUpperCase();

  if (value.includes('ISS')) return 'iss';
  if (value.includes('STARLINK')) return 'starlink';
  if (
    value.includes('NAVSTAR') ||
    value.includes(' GPS ') ||
    value.startsWith('GPS ') ||
    value.includes('GPS BIIR') ||
    value.includes('GPS BIII')
  ) {
    return 'gps';
  }

  if (
    value.includes('NOAA') ||
    value.includes('METEOR') ||
    value.includes('GOES') ||
    value.includes('HIMAWARI') ||
    value.includes('FENGYUN') ||
    value.includes('METOP') ||
    value.includes('JPSS') ||
    value.includes('ELEKTRO')
  ) {
    return 'weather';
  }

  if (
    value.includes('USA ') ||
    value.includes('NROL') ||
    value.includes('YAOGAN') ||
    value.includes('SBIRS') ||
    value.includes('AEHF') ||
    value.includes('WGS') ||
    value.includes('MUOS')
  ) {
    return 'military';
  }

  return 'all';
}

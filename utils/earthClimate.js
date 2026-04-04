const PLACE_MARKERS = [
  { name: 'India', latitude: 28.6, longitude: 77.2, kind: 'land' },
  { name: 'India', latitude: 22.6, longitude: 88.4, kind: 'land' },
  { name: 'India', latitude: 19.1, longitude: 72.9, kind: 'land' },
  { name: 'India', latitude: 13.1, longitude: 80.3, kind: 'land' },
  { name: 'India', latitude: 23.0, longitude: 79.0, kind: 'land' },
  { name: 'Pakistan', latitude: 30.2, longitude: 69.3, kind: 'land' },
  { name: 'Nepal', latitude: 28.3, longitude: 84.1, kind: 'land' },
  { name: 'Bangladesh', latitude: 23.7, longitude: 90.4, kind: 'land' },
  { name: 'Sri Lanka', latitude: 7.8, longitude: 80.7, kind: 'land' },
  { name: 'China', latitude: 39.9, longitude: 116.4, kind: 'land' },
  { name: 'China', latitude: 31.2, longitude: 121.5, kind: 'land' },
  { name: 'China', latitude: 35.8, longitude: 103.8, kind: 'land' },
  { name: 'Mongolia', latitude: 46.8, longitude: 103.1, kind: 'land' },
  { name: 'Japan', latitude: 35.7, longitude: 139.7, kind: 'land' },
  { name: 'Japan', latitude: 34.7, longitude: 135.5, kind: 'land' },
  { name: 'Indonesia', latitude: -6.2, longitude: 106.8, kind: 'land' },
  { name: 'Indonesia', latitude: -2.4, longitude: 118.0, kind: 'land' },
  { name: 'Thailand', latitude: 15.4, longitude: 101.0, kind: 'land' },
  { name: 'Saudi Arabia', latitude: 23.7, longitude: 44.5, kind: 'land' },
  { name: 'Turkey', latitude: 39.0, longitude: 35.2, kind: 'land' },
  { name: 'Russia', latitude: 55.8, longitude: 37.6, kind: 'land' },
  { name: 'Russia', latitude: 61.5, longitude: 96.0, kind: 'land' },
  { name: 'United Kingdom', latitude: 54.2, longitude: -2.8, kind: 'land' },
  { name: 'France', latitude: 48.9, longitude: 2.4, kind: 'land' },
  { name: 'Germany', latitude: 52.5, longitude: 13.4, kind: 'land' },
  { name: 'Spain', latitude: 40.4, longitude: -3.7, kind: 'land' },
  { name: 'Italy', latitude: 41.9, longitude: 12.5, kind: 'land' },
  { name: 'Egypt', latitude: 26.8, longitude: 30.8, kind: 'land' },
  { name: 'Nigeria', latitude: 9.1, longitude: 8.7, kind: 'land' },
  { name: 'Kenya', latitude: -1.3, longitude: 36.8, kind: 'land' },
  { name: 'South Africa', latitude: -30.6, longitude: 22.9, kind: 'land' },
  { name: 'United States', latitude: 40.7, longitude: -74.0, kind: 'land' },
  { name: 'United States', latitude: 34.1, longitude: -118.2, kind: 'land' },
  { name: 'United States', latitude: 39.8, longitude: -98.6, kind: 'land' },
  { name: 'Canada', latitude: 56.1, longitude: -106.3, kind: 'land' },
  { name: 'Mexico', latitude: 23.6, longitude: -102.5, kind: 'land' },
  { name: 'Brazil', latitude: -23.5, longitude: -46.6, kind: 'land' },
  { name: 'Brazil', latitude: -14.2, longitude: -51.9, kind: 'land' },
  { name: 'Argentina', latitude: -34.6, longitude: -58.4, kind: 'land' },
  { name: 'Chile', latitude: -35.7, longitude: -71.5, kind: 'land' },
  { name: 'Australia', latitude: -33.9, longitude: 151.2, kind: 'land' },
  { name: 'Australia', latitude: -25.3, longitude: 133.8, kind: 'land' },
  { name: 'New Zealand', latitude: -41.2, longitude: 174.7, kind: 'land' },
  { name: 'Greenland', latitude: 72.0, longitude: -40.0, kind: 'land' },
  { name: 'Antarctica', latitude: -78.0, longitude: 20.0, kind: 'land' },
  { name: 'Arabian Sea', latitude: 15, longitude: 65, kind: 'ocean' },
  { name: 'Bay of Bengal', latitude: 15, longitude: 88, kind: 'ocean' },
  { name: 'Indian Ocean', latitude: -18, longitude: 80, kind: 'ocean' },
  { name: 'Atlantic Ocean', latitude: 6, longitude: -30, kind: 'ocean' },
  { name: 'Pacific Ocean', latitude: 5, longitude: -150, kind: 'ocean' },
  { name: 'Southern Ocean', latitude: -58, longitude: 60, kind: 'ocean' },
  { name: 'Arctic Ocean', latitude: 78, longitude: 0, kind: 'ocean' },
];

function normalizeLongitude(longitude) {
  let normalized = longitude;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getAngularDistance(latitudeA, longitudeA, latitudeB, longitudeB) {
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);
  const lon1 = toRadians(normalizeLongitude(longitudeA));
  const lon2 = toRadians(normalizeLongitude(longitudeB));

  const cosDistance =
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);

  return Math.acos(Math.min(1, Math.max(-1, cosDistance))) * (180 / Math.PI);
}

function getClimateBand(latitude) {
  const absLat = Math.abs(latitude);

  if (absLat < 12) {
    return {
      band: 'Equatorial',
      range: '24C to 32C',
      summary: 'Hot and humid through most of the year',
    };
  }

  if (absLat < 24) {
    return {
      band: 'Tropical',
      range: '20C to 34C',
      summary: 'Warm year-round with wet and dry seasons',
    };
  }

  if (absLat < 35) {
    return {
      band: 'Subtropical',
      range: '12C to 32C',
      summary: 'Warm to hot, often dry or seasonally humid',
    };
  }

  if (absLat < 50) {
    return {
      band: 'Temperate',
      range: '2C to 26C',
      summary: 'Moderate seasons with mild to warm summers',
    };
  }

  if (absLat < 66) {
    return {
      band: 'Cold Temperate',
      range: '-10C to 18C',
      summary: 'Long colder seasons and short cool summers',
    };
  }

  return {
    band: 'Polar',
    range: '-35C to 5C',
    summary: 'Very cold most of the year',
  };
}

function getNearestMarker(latitude, longitude, kind) {
  const pool = kind ? PLACE_MARKERS.filter((marker) => marker.kind === kind) : PLACE_MARKERS;
  let bestMarker = pool[0];
  let bestDistance = Infinity;

  pool.forEach((marker) => {
    const distance = getAngularDistance(latitude, longitude, marker.latitude, marker.longitude);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMarker = marker;
    }
  });

  return { marker: bestMarker, distance: bestDistance };
}

export function getEarthClimateInfo(latitude, longitude) {
  const normalizedLongitude = normalizeLongitude(longitude);
  const nearestLand = getNearestMarker(latitude, normalizedLongitude, 'land');
  const nearestOcean = getNearestMarker(latitude, normalizedLongitude, 'ocean');
  const climate = getClimateBand(latitude);
  const isLand = nearestLand.distance < 20;
  const isOcean = nearestOcean.distance < 14;

  return {
    placeName: isLand
      ? nearestLand.marker.name
      : isOcean
        ? nearestOcean.marker.name
        : 'Open Ocean',
    climateBand: climate.band,
    temperatureRange: climate.range,
    summary: climate.summary,
    latitude,
    longitude: normalizedLongitude,
  };
}

export function createAppState() {
  return {
    satellitesVisible: true,
    asteroidsVisible: true,
    labelsVisible: true,
    orbitsVisible: false,
    asteroidPathsVisible: false,
    windDirectionsVisible: false,
    starsVisible: true,
    auroraVisible: false,
    terminatorVisible: false,
    sunIndicatorVisible: true,
    earthLabelsVisible: false,
    earthAlertsVisible: true,
    weatherLayer: 'none',
    satelliteCategory: 'all',
    selectedSatelliteIndex: -1,
    selectedAsteroidId: null,
  };
}

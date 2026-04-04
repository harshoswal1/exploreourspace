export function isImportant(name) {
  const upperName = name.toUpperCase();

  return (
    upperName.includes('ISS') ||
    upperName.includes('HUBBLE') ||
    upperName.includes('JWST') ||
    upperName.includes('WEBB') ||
    upperName.includes('STARLINK') ||
    upperName.includes('GPS') ||
    upperName.includes('NAVSTAR') ||
    upperName.includes('NOAA')
  );
}

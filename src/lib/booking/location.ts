/** Scarborough, Tobago — default map center */
export const SCARBOROUGH_CENTER = { lat: 11.1833, lng: -60.7353 }

/** Rough bounding box for Trinidad & Tobago survey work */
export const TT_BOUNDS = {
  minLat: 9.9,
  maxLat: 11.5,
  minLng: -62.0,
  maxLng: -60.4,
}

export type SiteCoordinates = {
  lat: number
  lng: number
}

export function isValidSiteCoordinates(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  return (
    lat >= TT_BOUNDS.minLat &&
    lat <= TT_BOUNDS.maxLat &&
    lng >= TT_BOUNDS.minLng &&
    lng <= TT_BOUNDS.maxLng
  )
}

export function formatSiteCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export function mapsLinkForCoordinates(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
}

export function parseSiteLocationGeo(geo: unknown): SiteCoordinates | null {
  if (!geo) return null

  if (typeof geo === 'string') {
    const match = geo.match(/\(([^,]+),([^)]+)\)/)
    if (!match) return null
    const lng = Number(match[1])
    const lat = Number(match[2])
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
  }

  if (typeof geo === 'object' && geo !== null) {
    const record = geo as { x?: number; y?: number; lat?: number; lng?: number }
    if (record.lat != null && record.lng != null) {
      return { lat: record.lat, lng: record.lng }
    }
    if (record.x != null && record.y != null) {
      return { lat: record.y, lng: record.x }
    }
  }

  return null
}

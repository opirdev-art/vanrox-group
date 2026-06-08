import { MapPin } from 'lucide-react'
import { mapsLinkForCoordinates, type SiteCoordinates } from '@/lib/booking/location'

export function SiteLocationLink({
  address,
  coordinates,
}: {
  address: string | null
  coordinates: SiteCoordinates | null
}) {
  if (!address && !coordinates) {
    return <span className="text-gray">—</span>
  }

  return (
    <div className="space-y-2">
      {address && <p className="text-white text-sm">{address}</p>}
      {coordinates && (
        <a
          href={mapsLinkForCoordinates(coordinates.lat, coordinates.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green text-sm hover:underline"
        >
          <MapPin size={14} />
          View pin on map ({coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)})
        </a>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { SiteCoordinates } from '@/lib/booking/location'
import { SCARBOROUGH_CENTER, TT_BOUNDS } from '@/lib/booking/location'
import 'leaflet/dist/leaflet.css'

type SiteLocationMapProps = {
  position: SiteCoordinates | null
  onPick: (coords: SiteCoordinates) => void
}

function MapClickHandler({ onPick }: { onPick: (coords: SiteCoordinates) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function RecenterOnPin({ position }: { position: SiteCoordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15), { animate: true })
    }
  }, [map, position])

  return null
}

export function SiteLocationMap({ position, onPick }: SiteLocationMapProps) {
  const center = position ?? SCARBOROUGH_CENTER

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-xl z-0"
      maxBounds={[
        [TT_BOUNDS.minLat, TT_BOUNDS.minLng],
        [TT_BOUNDS.maxLat, TT_BOUNDS.maxLng],
      ]}
      minZoom={9}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onPick={onPick} />
      <RecenterOnPin position={position} />
      {position && (
        <CircleMarker
          center={[position.lat, position.lng]}
          radius={12}
          pathOptions={{
            color: '#7dc242',
            fillColor: '#7dc242',
            fillOpacity: 0.9,
            weight: 3,
          }}
        />
      )}
    </MapContainer>
  )
}

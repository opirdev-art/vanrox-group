'use client'

import dynamic from 'next/dynamic'
import { useState, useTransition } from 'react'
import { Crosshair, Loader2, MapPin } from 'lucide-react'
import {
  formatSiteCoordinates,
  isValidSiteCoordinates,
  type SiteCoordinates,
} from '@/lib/booking/location'
import { reverseGeocode } from '@/lib/booking/reverse-geocode'

const SiteLocationMap = dynamic(
  () => import('./site-location-map').then((mod) => mod.SiteLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray text-sm">
        Loading map…
      </div>
    ),
  }
)

export type SiteLocationValue = {
  coordinates: SiteCoordinates | null
  address: string
}

type SiteLocationPickerProps = {
  value: SiteLocationValue
  onChange: (value: SiteLocationValue) => void
}

export function SiteLocationPicker({ value, onChange }: SiteLocationPickerProps) {
  const [mapError, setMapError] = useState('')
  const [geocoding, startGeocoding] = useTransition()
  const [locating, setLocating] = useState(false)

  function applyCoordinates(coords: SiteCoordinates) {
    if (!isValidSiteCoordinates(coords.lat, coords.lng)) {
      setMapError('Please drop the pin within Trinidad & Tobago.')
      return
    }

    setMapError('')
    onChange({
      coordinates: coords,
      address: value.address,
    })

    startGeocoding(async () => {
      const label = await reverseGeocode(coords.lat, coords.lng)
      onChange({
        coordinates: coords,
        address: label ?? formatSiteCoordinates(coords.lat, coords.lng),
      })
    })
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setMapError('Location is not supported on this device. Tap the map instead.')
      return
    }

    setLocating(true)
    setMapError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        applyCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setLocating(false)
        setMapError('Could not detect your location. Tap the map to place a pin.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-white text-sm font-medium">Mark your survey site</p>
          <p className="text-xs text-gray mt-1">
            Tap the map to drop a pin at the exact location. You can fine-tune the address below.
          </p>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 min-h-11 text-[0.7rem] uppercase tracking-widest font-bold text-green border border-green/30 px-4 py-2 rounded-lg hover:bg-green/10 transition disabled:opacity-50"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
          Use my location
        </button>
      </div>

      <div className="h-72 w-full overflow-hidden rounded-xl border border-white/10 relative">
        <SiteLocationMap position={value.coordinates} onPick={applyCoordinates} />
        {!value.coordinates && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center z-[500]">
            <span className="bg-navy/90 text-gray text-xs px-3 py-1.5 rounded-full border border-white/10">
              Tap map to place pin · Default: Scarborough
            </span>
          </div>
        )}
      </div>

      {value.coordinates && (
        <p className="text-xs text-gray">
          Pin: {formatSiteCoordinates(value.coordinates.lat, value.coordinates.lng)}
          {geocoding && <span className="text-green ml-2">Looking up address…</span>}
        </p>
      )}

      {mapError && <p className="text-red-400 text-sm">{mapError}</p>}

      <div className="space-y-2">
        <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
          Site address / landmark
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
          <input
            type="text"
            required
            value={value.address}
            onChange={(e) =>
              onChange({
                coordinates: value.coordinates,
                address: e.target.value,
              })
            }
            placeholder={
              value.coordinates
                ? 'Adjust the address or add a landmark (e.g. Lot 12, Milford Road)'
                : 'Drop a pin on the map first'
            }
            disabled={!value.coordinates}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none text-white disabled:opacity-50"
          />
        </div>
        {!value.coordinates && (
          <p className="text-xs text-yellow-400/90">
            A map pin is required so our team can find the exact site.
          </p>
        )}
      </div>
    </div>
  )
}

export const emptySiteLocation = (): SiteLocationValue => ({
  coordinates: null,
  address: '',
})

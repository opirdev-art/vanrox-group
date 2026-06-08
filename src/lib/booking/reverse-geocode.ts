export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('format', 'json')
    url.searchParams.set('zoom', '18')

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VANROX-Booking/1.0 (vanrox-group.com)',
      },
    })

    if (!response.ok) return null

    const data = (await response.json()) as { display_name?: string }
    return data.display_name?.trim() || null
  } catch {
    return null
  }
}

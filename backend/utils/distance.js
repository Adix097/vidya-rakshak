const AVERAGE_SPEED_KMPH = 25; //! very rough assumption

// Haversine formula
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode an address string using Nominatim
export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

  const response = await fetch(url, {
    headers: { "User-Agent": "vidya-rakshak-hackathon-app" },
  });

  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const results = await response.json();
  if (!results.length) {
    return null; // address couldn't be geocoded
  }

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

// Given two lat/lng points, return estimated travel time in minutes
export function estimateTravelMinutes(lat1, lng1, lat2, lng2) {
  const distanceKm = haversineDistanceKm(lat1, lng1, lat2, lng2);
  const hours = distanceKm / AVERAGE_SPEED_KMPH;
  return Math.round(hours * 60);
}

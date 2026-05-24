const OSM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const OSM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

const compactParts = (parts) => (
  parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
);

const formatOsmAddress = (data) => {
  const address = data?.address || {};
  const locality = address.neighbourhood || address.suburb || address.village || address.town || address.city_district;
  const city = address.city || address.town || address.village || address.county;
  const state = address.state || address.region;
  const primaryLine = compactParts([
    address.house_number && address.road ? `${address.house_number} ${address.road}` : address.road,
    locality,
    city,
  ]);
  const secondaryLine = compactParts([state, address.postcode, address.country]);
  const formatted = compactParts([
    primaryLine.join(', '),
    secondaryLine.join(', '),
  ]).join(', ');

  return formatted || data?.display_name || null;
};

export const reverseGeocode = async (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '18',
      addressdetails: '1',
      'accept-language': 'en-IN,en',
    });

    const response = await fetch(`${OSM_REVERSE_URL}?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    return formatOsmAddress(data);
  } catch (error) {
    console.error('OpenStreetMap reverse geocoding failed:', error);
    return null;
  }
};

export const forwardGeocode = async (query) => {
  const search = typeof query === 'string' ? query.trim() : '';
  if (search.length < 2) return null;

  try {
    const params = new URLSearchParams({
      q: search,
      format: 'jsonv2',
      limit: '1',
      addressdetails: '1',
      countrycodes: 'in',
      'accept-language': 'en-IN,en',
    });

    const response = await fetch(`${OSM_SEARCH_URL}?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : null;
    if (!result?.lat || !result?.lon) return null;

    return formatLocationResult(result);
  } catch (error) {
    console.error('OpenStreetMap location search failed:', error);
    return null;
  }
};

const formatLocationResult = (result) => ({
  lat: Number(result.lat),
  lng: Number(result.lon),
  address: formatOsmAddress(result),
  displayName: result.display_name || formatOsmAddress(result),
  provider: 'openstreetmap',
});

export const searchLocations = async (query, limit = 5) => {
  const search = typeof query === 'string' ? query.trim() : '';
  if (search.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: search,
      format: 'jsonv2',
      limit: String(limit),
      addressdetails: '1',
      countrycodes: 'in',
      'accept-language': 'en-IN,en',
    });

    const response = await fetch(`${OSM_SEARCH_URL}?${params.toString()}`);
    if (!response.ok) return [];

    const data = await response.json();
    return (Array.isArray(data) ? data : [])
      .filter((result) => result?.lat && result?.lon)
      .map(formatLocationResult);
  } catch (error) {
    console.error('OpenStreetMap location suggestions failed:', error);
    return [];
  }
};


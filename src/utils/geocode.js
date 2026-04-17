import api from '../services/api.js';

export const reverseGeocode = async (lat, lng) => {
  try {
    const { data } = await api.get(`/geocode/reverse?lat=${lat}&lng=${lng}`);
    return data.data?.address || null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};


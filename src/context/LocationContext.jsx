import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearLocationCache, getLocationFromCache, setLocationCache } from '../utils';
import { forwardGeocode, reverseGeocode } from '../utils/geocode';

const LocationContext = createContext();

export { LocationContext };

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const fetchAddress = useCallback(async (lat, lng) => {
    if (!lat || !lng) return null;
    setLoadingAddress(true);
    try {
      const address = await reverseGeocode(lat, lng);
      const fallbackAddress = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
      const resolvedAddress = address || fallbackAddress;
      setUserAddress(resolvedAddress);
      setLocationCache({ lat, lng, address: resolvedAddress, provider: 'openstreetmap' });
      return resolvedAddress;
    } catch (error) {
      console.error('Address fetch failed:', error);
      return null;
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  const getLocation = ({ refresh = false } = {}) => {
    return new Promise((resolve, reject) => {
      const cachedLocation = getLocationFromCache();
      if (cachedLocation && !refresh) {
        setUserLocation(cachedLocation);
        if (cachedLocation.address) {
          setUserAddress(cachedLocation.address);
          resolve({ location: cachedLocation, address: cachedLocation.address });
        } else {
          fetchAddress(cachedLocation.lat, cachedLocation.lng)
            .then((address) => resolve({ location: cachedLocation, address }))
            .catch((error) => reject(error));
        }
        return;
      }

      if (!navigator.geolocation) {
        alert('Geolocation not supported.');
        reject(new Error('Geolocation not supported')); 
        return;
      }
      
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(location);
          setUserAddress(null);
          setLocationCache({ ...location, source: 'current' });
          try {
            const address = await fetchAddress(location.lat, location.lng);
            resolve({ location, address });
          } catch (error) {
            resolve({ location, address: null });
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLoadingLocation(false);
          reject(error);
        },
        { enableHighAccuracy: true, maximumAge: 24 * 60 * 60 * 1000 }
      );
    });
  };

  const setManualLocation = useCallback(async (query) => {
    const result = await forwardGeocode(query);
    if (!result?.lat || !result?.lng) {
      return { success: false, message: 'Location not found. Try city, area, or pincode.' };
    }

    const location = { lat: result.lat, lng: result.lng };
    const address = result.address || query.trim();
    setUserLocation(location);
    setUserAddress(address);
    setLocationCache({ ...location, address, provider: 'openstreetmap', source: 'manual' });
    return { success: true, location, address };
  }, []);

  useEffect(() => {
    const cached = getLocationFromCache();
    if (cached) {
      setUserLocation(cached);
      if (cached.address) {
        setUserAddress(cached.address);
      }
    }
  }, []);

  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng && !userAddress) {
      fetchAddress(userLocation.lat, userLocation.lng);
    }
  }, [fetchAddress, userLocation, userAddress]);

  const value = {
    userLocation,
    userAddress,
    loadingLocation,
    loadingAddress,
    getLocation,
    setManualLocation,
    clearLocation: () => {
      setUserLocation(null);
      setUserAddress(null);
      clearLocationCache();
    }
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};


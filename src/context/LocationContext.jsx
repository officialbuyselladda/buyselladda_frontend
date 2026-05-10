import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearLocationCache, getLocationFromCache, setLocationCache } from '../utils';
import { reverseGeocode } from '../utils/geocode';

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

  const getLocation = () => {
    const cachedLocation = getLocationFromCache();
    if (cachedLocation) {
      setUserLocation(cachedLocation);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(location);
        setLocationCache({ ...location });
        setLoadingLocation(false);
        // Fetch address
        fetchAddress(location.lat, location.lng);
      },
      (error) => {
        console.error('Location error:', error);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 24 * 60 * 60 * 1000 }
    );
  };

  // Load cached on mount
  useEffect(() => {
    const cached = getLocationFromCache();
    if (cached) {
      setUserLocation(cached);
      if (cached.address) {
        setUserAddress(cached.address);
      }
    }
  }, []);

  // Fetch address when location changes
  useEffect(() => {
    if (userLocation && !userAddress) {
      fetchAddress(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const address = await reverseGeocode(lat, lng);
      setUserAddress(address);
      // Update cache with address
      setLocationCache({ lat, lng, address });
    } catch (error) {
      console.error('Address fetch failed:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const value = {
    userLocation,
    userAddress,
    loadingLocation,
    loadingAddress,
    getLocation,
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


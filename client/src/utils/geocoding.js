// Geocoding utilities for converting addresses to coordinates
import axios from 'axios';

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

// Cache for geocoding results
const geocodeCache = new Map();

/**
 * Convert address to coordinates using LocationIQ
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (address) => {
  if (!address || !LOCATIONIQ_API_KEY) {
    return null;
  }

  // Check cache first
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }

  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search', {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'in',
        addressdetails: 1
      },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };

      // Cache the result
      geocodeCache.set(address, coordinates);
      return coordinates;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return null;
};

/**
 * Get coordinates for multiple addresses
 * @param {string[]} addresses - Array of addresses
 * @returns {Promise<Array<{address: string, coordinates: {lat: number, lng: number} | null}>>}
 */
export const geocodeAddresses = async (addresses) => {
  const results = await Promise.all(
    addresses.map(async (address) => ({
      address,
      coordinates: await geocodeAddress(address)
    }))
  );

  return results;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Get driving directions between two points using LocationIQ
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {Promise<Object | null>} Directions result
 */
export const getDrivingDirections = async (origin, destination) => {
  if (!LOCATIONIQ_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(
      `https://us1.locationiq.com/v1/directions/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
      {
        params: {
          key: LOCATIONIQ_API_KEY,
          overview: 'full',
          steps: true
        },
        timeout: 15000
      }
    );

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      return response.data.routes[0];
    }
  } catch (error) {
    console.error('Directions error:', error);
  }

  return null;
};

/**
 * Get bounds that contain all given coordinates
 * @param {Array<{lat: number, lng: number}>} coordinates - Array of coordinates
 * @returns {Object} Bounds object {north, south, east, west}
 */
export const getBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const lats = coordinates.map(coord => coord.lat);
  const lngs = coordinates.map(coord => coord.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
};

/**
 * Check if coordinates are valid
 * @param {Object} coordinates - Coordinates {lat, lng}
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (coordinates) => {
  return (
    coordinates &&
    typeof coordinates.lat === 'number' &&
    typeof coordinates.lng === 'number' &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
};


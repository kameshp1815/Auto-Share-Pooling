import React, { useState, useEffect, useRef, useCallback } from 'react';
import GoogleMap from './GoogleMap';
import FallbackMap from './FallbackMap';
import { FaMapMarkerAlt, FaCar, FaRoute, FaPhone, FaExternalLinkAlt } from 'react-icons/fa';
import { geocodeAddress, getDrivingDirections, calculateDistance } from '../utils/geocoding';

const RideMap = ({
  rideInfo,
  driverDetails,
  rideStatus,
  onNavigate,
  onCallDriver,
  className = "w-full h-96"
}) => {
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 11.0168, lng: 76.9558 });
  const [driverPosition, setDriverPosition] = useState(null);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [hasGoogleMaps, setHasGoogleMaps] = useState(false);
  const mapRef = useRef(null);

  // Check if Google Maps API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setHasGoogleMaps(!!apiKey && apiKey !== 'your_google_maps_api_key');
  }, []);

  // Generate custom icons
  const createCustomIcon = (color, icon, size = 40) => {
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: size / 10,
      anchor: window.google?.maps ? new window.google.maps.Point(0, -30) : { x: 0, y: -30 }
    };
  };

  // Geocode ride locations
  const geocodeRideLocations = useCallback(async () => {
    if (!rideInfo?.from || !rideInfo?.to) return;

    setIsGeocoding(true);
    try {
      const [pickupCoords, destCoords] = await Promise.all([
        geocodeAddress(rideInfo.from),
        geocodeAddress(rideInfo.to)
      ]);

      if (pickupCoords) {
        setPickupCoordinates(pickupCoords);
      }
      if (destCoords) {
        setDestinationCoordinates(destCoords);
      }
    } catch (error) {
      console.error('Error geocoding locations:', error);
    } finally {
      setIsGeocoding(false);
    }
  }, [rideInfo?.from, rideInfo?.to]);

  // Geocode locations when ride info changes
  useEffect(() => {
    geocodeRideLocations();
  }, [geocodeRideLocations]);

  // Update markers based on ride status and driver details
  useEffect(() => {
    const newMarkers = [];
    const newRoutes = [];

    if (rideInfo && pickupCoordinates && destinationCoordinates) {
      // Pickup location marker
      newMarkers.push({
        position: pickupCoordinates,
        title: 'Pickup Location',
        label: 'P',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
            </svg>
          `)}`,
          scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : { width: 40, height: 40 },
          anchor: window.google?.maps ? new window.google.maps.Point(20, 20) : { x: 20, y: 20 }
        },
        infoWindow: `
          <div class="p-2">
            <h3 class="font-bold text-green-600">Pickup Location</h3>
            <p class="text-sm">${rideInfo.from || 'Pickup point'}</p>
          </div>
        `
      });

      // Destination marker
      newMarkers.push({
        position: destinationCoordinates,
        title: 'Destination',
        label: 'D',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">D</text>
            </svg>
          `)}`,
          scaledSize: window.google?.maps ? new window.google.maps.Size(40, 40) : { width: 40, height: 40 },
          anchor: window.google?.maps ? new window.google.maps.Point(20, 20) : { x: 20, y: 20 }
        },
        infoWindow: `
          <div class="p-2">
            <h3 class="font-bold text-red-600">Destination</h3>
            <p class="text-sm">${rideInfo.to || 'Destination point'}</p>
          </div>
        `
      });

      // Driver marker (if driver is found)
      if (driverDetails && rideStatus === 'found') {
        const driverPos = driverPosition || { lat: 11.0165, lng: 76.9555 }; // Mock position
        newMarkers.push({
          position: driverPos,
          title: 'Driver Location',
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="22" fill="#F59E0B" stroke="#ffffff" stroke-width="3"/>
                <text x="25" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🚗</text>
              </svg>
            `)}`,
            scaledSize: window.google?.maps ? new window.google.maps.Size(50, 50) : { width: 50, height: 50 },
            anchor: window.google?.maps ? new window.google.maps.Point(25, 25) : { x: 25, y: 25 }
          },
          animation: window.google?.maps?.Animation?.BOUNCE,
          infoWindow: `
            <div class="p-3">
              <h3 class="font-bold text-yellow-600 mb-2">${driverDetails.name || 'Driver'}</h3>
              <p class="text-sm mb-1"><strong>Vehicle:</strong> ${driverDetails.vehicleNumber || 'N/A'}</p>
              <p class="text-sm mb-1"><strong>Type:</strong> ${driverDetails.vehicleType || 'Auto'}</p>
              <p class="text-sm mb-2"><strong>Phone:</strong> ${driverDetails.phone || 'N/A'}</p>
              <div class="flex gap-2">
                <button onclick="window.callDriver('${driverDetails.phone}')" 
                        class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                  Call
                </button>
                <button onclick="window.navigateToDriver()" 
                        class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                  Navigate
                </button>
              </div>
            </div>
          `
        });

        // Add route from driver to pickup
        newRoutes.push({
          origin: driverPos,
          destination: pickupCoordinates,
          color: '#F59E0B',
          alternatives: false
        });
      }

      // Add route from pickup to destination
      newRoutes.push({
        origin: pickupCoordinates,
        destination: destinationCoordinates,
        color: '#3B82F6',
        alternatives: false
      });

      // Update map center to show all markers
      if (driverDetails && rideStatus === 'found' && driverPosition) {
        setMapCenter(driverPosition);
      } else if (pickupCoordinates) {
        setMapCenter(pickupCoordinates);
      }
    }

    setMarkers(newMarkers);
    setRoutes(newRoutes);
  }, [rideInfo, driverDetails, rideStatus, driverPosition, pickupCoordinates, destinationCoordinates]);

  // Simulate driver movement (in real app, this would come from WebSocket)
  useEffect(() => {
    if (driverDetails && rideStatus === 'found' && pickupCoordinates) {
      // Initialize driver position (simulate driver starting from a nearby location)
      if (!driverPosition) {
        setDriverPosition({
          lat: pickupCoordinates.lat + (Math.random() - 0.5) * 0.01,
          lng: pickupCoordinates.lng + (Math.random() - 0.5) * 0.01
        });
      }

      const interval = setInterval(() => {
        // Simulate driver moving towards pickup
        setDriverPosition(prev => {
          if (!prev || !pickupCoordinates) return prev;
          
          // Move slightly towards pickup point
          const latDiff = pickupCoordinates.lat - prev.lat;
          const lngDiff = pickupCoordinates.lng - prev.lng;
          
          // Calculate distance to pickup
          const distance = calculateDistance(prev, pickupCoordinates);
          
          // If very close to pickup, stop moving
          if (distance < 0.01) {
            return prev;
          }
          
          return {
            lat: prev.lat + latDiff * 0.1,
            lng: prev.lng + lngDiff * 0.1
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [driverDetails, rideStatus, pickupCoordinates, driverPosition]);

  // Handle marker clicks
  const handleMarkerClick = useCallback((markerData, marker) => {
    if (markerData.title === 'Driver Location') {
      // Focus on driver
      if (mapRef.current) {
        mapRef.current.panTo(markerData.position);
        mapRef.current.setZoom(16);
      }
    }
  }, []);

  // Handle map clicks
  const handleMapClick = useCallback((event) => {
    console.log('Map clicked at:', event.latLng);
  }, []);

  // Set up global functions for info window buttons
  useEffect(() => {
    window.callDriver = (phone) => {
      if (onCallDriver) {
        onCallDriver(phone);
      }
    };

    window.navigateToDriver = () => {
      if (onNavigate && driverPosition) {
        onNavigate(driverPosition);
      }
    };

    return () => {
      delete window.callDriver;
      delete window.navigateToDriver;
    };
  }, [onCallDriver, onNavigate, driverPosition]);

  // If no Google Maps API key, use fallback map
  if (!hasGoogleMaps) {
    return (
      <FallbackMap
        rideInfo={rideInfo}
        driverDetails={driverDetails}
        rideStatus={rideStatus}
        onNavigate={onNavigate}
        onCallDriver={onCallDriver}
        className={className}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isGeocoding && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600 text-sm">Loading map locations...</div>
          </div>
        </div>
      )}
      
      <GoogleMap
        ref={mapRef}
        center={mapCenter}
        zoom={15}
        markers={markers}
        routes={routes}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        showTraffic={true}
        showTransit={false}
        className="w-full h-full rounded-lg shadow-lg"
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setZoom(mapRef.current.getZoom() + 1);
            }
          }}
          className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">+</span>
        </button>
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setZoom(mapRef.current.getZoom() - 1);
            }
          }}
          className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">−</span>
        </button>
      </div>

      {/* Driver Info Overlay */}
      {driverDetails && rideStatus === 'found' && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {driverDetails.name ? driverDetails.name[0] : 'D'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{driverDetails.name || 'Driver'}</h3>
                <p className="text-sm text-gray-600">{driverDetails.vehicleNumber || 'N/A'}</p>
                <p className="text-xs text-gray-500">{driverDetails.vehicleType || 'Auto'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {driverDetails.phone && (
                <button
                  onClick={() => onCallDriver && onCallDriver(driverDetails.phone)}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                >
                  <FaPhone className="text-sm" />
                </button>
              )}
              <button
                onClick={() => onNavigate && onNavigate(driverPosition)}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <FaExternalLinkAlt className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            rideStatus === 'searching' ? 'bg-yellow-500 animate-pulse' :
            rideStatus === 'found' ? 'bg-green-500' :
            'bg-gray-400'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {rideStatus === 'searching' ? 'Searching for driver...' :
             rideStatus === 'found' ? 'Driver found' :
             'No active ride'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RideMap;

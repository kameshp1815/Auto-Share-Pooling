import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({
  center = { lat: 11.0168, lng: 76.9558 }, // Coimbatore coordinates
  zoom = 13,
  markers = [],
  routes = [],
  onMapClick,
  onMarkerClick,
  className = "w-full h-full",
  mapId = "autoshare-map",
  showTraffic = true,
  showTransit = false,
  mapTypeId = "roadmap"
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geometry", "routes"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { DirectionsService } = await loader.importLibrary("routes");
        const { DirectionsRenderer } = await loader.importLibrary("routes");

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center,
            zoom,
            mapId,
            mapTypeId,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ],
            gestureHandling: "greedy",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          });

          const directionsServiceInstance = new DirectionsService();
          const directionsRendererInstance = new DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#3B82F6",
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });

          directionsRendererInstance.setMap(mapInstance);

          setMap(mapInstance);
          setDirectionsService(directionsServiceInstance);
          setDirectionsRenderer(directionsRendererInstance);
          setIsLoaded(true);

          // Add click listener
          if (onMapClick) {
            mapInstance.addListener("click", onMapClick);
          }
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps. Please check your API key.");
      }
    };

    initMap();
  }, [center, zoom, mapId, mapTypeId, onMapClick]);

  // Update map center and zoom
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      if (zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, center, zoom]);

  // Add markers to map
  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing markers
      const existingMarkers = window.mapMarkers || [];
      existingMarkers.forEach(marker => marker.setMap(null));
      window.mapMarkers = [];

      // Add new markers
      markers.forEach((markerData, index) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title || `Marker ${index + 1}`,
          icon: markerData.icon || null,
          animation: markerData.animation || null,
          draggable: markerData.draggable || false,
          label: markerData.label || null
        });

        if (markerData.infoWindow) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.infoWindow
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
            if (onMarkerClick) {
              onMarkerClick(markerData, marker);
            }
          });
        } else if (onMarkerClick) {
          marker.addListener("click", () => {
            onMarkerClick(markerData, marker);
          });
        }

        window.mapMarkers.push(marker);
      });
    }
  }, [map, markers, onMarkerClick]);

  // Render routes
  useEffect(() => {
    if (map && directionsService && directionsRenderer && routes.length > 0) {
      routes.forEach((route, index) => {
        if (route.origin && route.destination) {
          const request = {
            origin: route.origin,
            destination: route.destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            avoidHighways: route.avoidHighways || false,
            avoidTolls: route.avoidTolls || false,
            provideRouteAlternatives: route.alternatives || false
          };

          directionsService.route(request, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              if (index === 0) {
                // Show the first route with full rendering
                directionsRenderer.setDirections(result);
              } else {
                // Show additional routes as polylines
                const polyline = new window.google.maps.Polyline({
                  path: result.routes[0].overview_path,
                  strokeColor: route.color || "#10B981",
                  strokeWeight: 3,
                  strokeOpacity: 0.7
                });
                polyline.setMap(map);
              }
            } else {
              console.error(`Directions request failed: ${status}`);
            }
          });
        }
      });
    }
  }, [map, directionsService, directionsRenderer, routes]);

  // Toggle traffic layer
  useEffect(() => {
    if (map) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      if (showTraffic) {
        trafficLayer.setMap(map);
      } else {
        trafficLayer.setMap(null);
      }
    }
  }, [map, showTraffic]);

  // Toggle transit layer
  useEffect(() => {
    if (map) {
      const transitLayer = new window.google.maps.TransitLayer();
      if (showTransit) {
        transitLayer.setMap(map);
      } else {
        transitLayer.setMap(null);
      }
    }
  }, [map, showTransit]);

  // Public methods
  const fitBounds = useCallback((bounds) => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map]);

  const panTo = useCallback((position) => {
    if (map && position) {
      map.panTo(position);
    }
  }, [map]);

  const setZoom = useCallback((zoomLevel) => {
    if (map) {
      map.setZoom(zoomLevel);
    }
  }, [map]);

  // Expose methods to parent component
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    fitBounds,
    panTo,
    setZoom,
    getMap: () => map
  }));

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;


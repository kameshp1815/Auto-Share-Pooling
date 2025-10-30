import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaIdCard, FaCar, FaCircle, FaMapMarkerAlt, FaClock, FaCheckCircle, FaSpinner, FaTimes, FaStar, FaSearch, FaShieldAlt, FaShare, FaMotorcycle, FaTaxi, FaExternalLinkAlt } from "react-icons/fa";
import io from "socket.io-client";
import RideMap from "./RideMap";

export default function RideStatus() {
  const [rideStatus, setRideStatus] = useState('searching');
  const [driverDetails, setDriverDetails] = useState(null);
  const [rideInfo, setRideInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(3);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [pickupDistance, setPickupDistance] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Get user email from JWT token
  const token = localStorage.getItem("token");
  const userEmail = token ? JSON.parse(atob(token.split('.')[1])).email : "";

  useEffect(() => {
    fetchRideData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchRideData, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (userEmail) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('ride:status-update', (data) => {
        if (data.userEmail === userEmail.toLowerCase()) {
          fetchRideData();
        }
      });

      // Generic user notifications
      newSocket.on('notify:user', (payload) => {
        if (payload.userEmail === userEmail.toLowerCase()) {
          const id = Date.now();
          setToasts((prev) => [...prev, { id, title: payload.title || 'Notification', body: payload.body || '' }]);
          setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 4000);
        }
      });

      newSocket.on('ride:driver-location', (data) => {
        if (data.userEmail === userEmail.toLowerCase()) {
          const pos = { lat: data.lat, lng: data.lng };
          setDriverPosition(pos);
          // Try to compute rough ETA/distance if we have pickup coordinates in rideInfo.from (not guaranteed)
          if (rideInfo?.fromCoords) {
            const dKm = haversine(pos, rideInfo.fromCoords);
            setPickupDistance(dKm.toFixed(1));
            const speedKmh = 20; // rough urban speed
            const eta = Math.max(1, Math.round((dKm / speedKmh) * 60));
            setEtaMinutes(eta);
          }
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [userEmail, rideInfo?.fromCoords]);

  const fetchRideData = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(`/api/rides/ongoing/${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setRideInfo(data);
          if (data.driverDetails && data.driverDetails.name) {
            setDriverDetails(data.driverDetails);
            setRideStatus('found');
            if (data.driverLocation && data.driverLocation.lat && data.driverLocation.lng) {
              setDriverPosition({ lat: data.driverLocation.lat, lng: data.driverLocation.lng });
            }
          } else if (data.status === 'Requested') {
            setRideStatus('searching');
          }
        } else {
          setRideStatus('no_ride');
        }
      } else {
        setRideStatus('no_ride');
      }
    } catch (error) {
      console.error('Error fetching ride data:', error);
    }
  };

  function haversine(a, b) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    return R * c;
  }

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'auto':
      case 'auto-rickshaw':
        return <FaMotorcycle className="text-yellow-500" />;
      case 'taxi':
        return <FaTaxi className="text-yellow-500" />;
      default:
        return <FaCar className="text-yellow-500" />;
    }
  };

  // Handle driver call
  const handleCallDriver = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  // Handle navigation to driver
  const handleNavigateToDriver = (driverPosition) => {
    if (driverPosition) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${driverPosition.lat},${driverPosition.lng}`;
      window.open(url, '_blank');    
    }
  };

  // Handle navigation to destination
  const handleNavigateToDestination = () => {
    if (rideInfo?.to) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rideInfo.to)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="absolute top-16 right-4 z-50 space-y-2">
          {toasts.map(t => (
            <div key={t.id} className="bg-white shadow-lg border border-yellow-200 rounded-xl px-4 py-3 min-w-[220px]">
              <div className="font-semibold text-gray-800">{t.title}</div>
              {t.body && <div className="text-sm text-gray-600">{t.body}</div>}
            </div>
          ))}
        </div>
      )}
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 flex justify-between items-center text-sm">
        <span className="font-medium">2:53</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
          <span className="text-xs">VoLTE</span>
          <span className="text-xs">60.4 KB/s</span>
          <span className="text-xs">5G</span>
          <div className="w-6 h-3 border border-gray-400 rounded-sm">
            <div className="w-4 h-2 bg-green-500 rounded-sm m-0.5"></div>
          </div>
          <span className="text-xs">55%</span>
        </div>
      </div>

      {/* Interactive Map Area */}
          <div className="absolute inset-0">
        <RideMap
          rideInfo={rideInfo}
          driverDetails={driverDetails}
          rideStatus={rideStatus}
          onNavigate={handleNavigateToDriver}
          onCallDriver={handleCallDriver}
          driverPosition={driverPosition}
          className="w-full h-full"
        />

        {/* Action Buttons */}
        <div className="absolute bottom-32 right-4 space-y-2">
          <button 
            onClick={handleNavigateToDestination}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Navigate to destination"
          >
            <FaExternalLinkAlt className="text-blue-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <FaShare className="text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <FaShieldAlt className="text-blue-600" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
        {rideStatus === 'searching' ? (
          // Searching State
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-purple-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Looking for your Auto ride</h2>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-gray-600">Trip Details</div>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                Trip Details
              </button>
            </div>
          </div>
        ) : rideStatus === 'found' && driverDetails ? (
          // Driver Found State
          <div className="p-6">
            <div className="mb-4">
              <div className="text-gray-500 text-sm mb-1">Driver is on the way</div>
              <div className="text-green-600 font-bold text-lg">ETA: {etaMinutes || timeRemaining} mins</div>
              <div className="text-gray-500 text-sm">{pickupDistance || '1.2'} km away</div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl p-4 mb-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {driverDetails.name ? driverDetails.name[0] : 'D'}
                    </span>
                  </div>
                <div>
                    <div className="font-bold text-lg text-gray-800">{driverDetails.name || 'Driver'}</div>
                    <div className="text-gray-600 text-sm">{driverDetails.vehicleNumber || 'TN38CU8587'}</div>
                    <div className="text-gray-500 text-xs">{driverDetails.vehicleType || 'Auto'} • {driverDetails.vehicleModel || 'Bajaj'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="text-sm font-medium">4.6</span>
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                {driverDetails.phone && (
                  <button 
                    onClick={() => handleCallDriver(driverDetails.phone)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                  >
                    <FaPhone className="text-sm" />
                    <span>Call Driver</span>
                  </button>
                )}
                <button 
                  onClick={handleNavigateToDestination}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
                >
                  <FaExternalLinkAlt className="text-sm" />
                  <span>Navigate</span>
              </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-600 text-sm mb-1">Pickup</div>
                <div className="text-gray-800 font-medium text-sm">{rideInfo?.from || 'Pickup location'}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Destination</div>
                <div className="text-gray-800 font-medium text-sm">{rideInfo?.to || 'Destination'}</div>
              </div>
            </div>
          </div>
        ) : (
          // No Ride State
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="text-gray-400 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Ride</h2>
            <p className="text-gray-600">Book a ride to see your driver details here</p>
          </div>
        )}
      </div>
    </div>
  );
}

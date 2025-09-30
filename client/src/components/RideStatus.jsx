import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaIdCard, FaCar, FaCircle, FaMapMarkerAlt, FaClock, FaCheckCircle, FaSpinner, FaTimes, FaStar, FaSearch, FaShieldAlt, FaShare, FaMotorcycle, FaTaxi } from "react-icons/fa";
import io from "socket.io-client";

export default function RideStatus() {
  const [rideStatus, setRideStatus] = useState('searching'); // 'searching', 'found', 'picked_up'
  const [driverDetails, setDriverDetails] = useState(null);
  const [rideInfo, setRideInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(3);

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

      return () => {
        newSocket.close();
      };
    }
  }, [userEmail]);

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

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
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

      {/* Map Area */}
      <div className="absolute inset-0 bg-gray-200">
        {/* Map Background */}
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 relative">
          {/* Roads */}
          <div className="absolute inset-0">
            {/* Main road */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-300 transform -translate-y-1/2"></div>
            {/* Side roads */}
            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
            <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
          </div>

          {/* Route Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500 transform -translate-y-1/2"></div>

          {/* Origin Pin */}
          <div className="absolute top-1/4 right-1/4">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-white text-xs" />
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              {rideInfo?.from || 'Singanallur'}
            </div>
          </div>

          {/* Destination Pin */}
          <div className="absolute bottom-1/3 right-1/3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-white text-xs" />
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              {rideInfo?.to || 'Pallapalayam'}
            </div>
          </div>

          {/* Available Vehicles */}
          {rideStatus === 'searching' && (
            <>
              <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <FaMotorcycle className="text-white text-xs" />
              </div>
              <div className="absolute top-1/3 right-1/2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <FaMotorcycle className="text-white text-xs" />
              </div>
              <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <FaMotorcycle className="text-white text-xs" />
              </div>
            </>
          )}

          {/* Driver Location (when found) */}
          {rideStatus === 'found' && driverDetails && (
            <div className="absolute top-1/2 right-1/3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                {getVehicleIcon(driverDetails.vehicleType)}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-32 right-4 space-y-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <FaShare className="text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
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
              <div className="text-gray-500 text-sm mb-1">You've reached your pickup</div>
              <div className="text-green-600 font-bold text-lg">Pickup in {timeRemaining} mins</div>
              <div className="text-gray-500 text-sm">Captain 1.2 km away</div>
            </div>

            <div className="mb-4">
              <div className="text-gray-700 font-medium mb-2">Start your order with PIN</div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-mono">7</div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-mono">7</div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-mono">8</div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center font-mono">6</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{driverDetails.vehicleNumber || 'TN38CU8587'}</div>
                  <div className="text-gray-700 font-medium">{driverDetails.name || 'Pandi P'}</div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-600 font-bold">P</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="text-sm font-medium">4.6</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-2">
                <FaPhone className="text-gray-600" />
                <span>Message {driverDetails.name || 'Pandi'}</span>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-600 text-sm">Pickup From</div>
                <div className="text-gray-800 font-medium">{rideInfo?.from || 'Pallapalayam, Kannampalayam, Tamil...'}</div>
              </div>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                Trip Details
              </button>
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

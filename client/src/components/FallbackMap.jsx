import React from 'react';
import { FaMapMarkerAlt, FaCar, FaRoute } from 'react-icons/fa';

const FallbackMap = ({
  rideInfo,
  driverDetails,
  rideStatus,
  onNavigate,
  onCallDriver,
  className = "w-full h-96"
}) => {
  return (
    <div className={`relative ${className} bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg shadow-lg`}>
      {/* Static Map Background */}
      <div className="w-full h-full relative overflow-hidden">
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
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <FaMapMarkerAlt className="text-white text-xs" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
            {rideInfo?.from || 'Pickup'}
          </div>
        </div>

        {/* Destination Pin */}
        <div className="absolute bottom-1/3 right-1/3">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <FaMapMarkerAlt className="text-white text-xs" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow">
            {rideInfo?.to || 'Destination'}
          </div>
        </div>

        {/* Available Vehicles */}
        {rideStatus === 'searching' && (
          <>
            <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <FaCar className="text-white text-xs" />
            </div>
            <div className="absolute top-1/3 right-1/2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <FaCar className="text-white text-xs" />
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <FaCar className="text-white text-xs" />
            </div>
          </>
        )}

        {/* Driver Location (when found) */}
        {rideStatus === 'found' && driverDetails && (
          <div className="absolute top-1/2 right-1/3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <FaCar className="text-white text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <span className="text-lg">+</span>
        </button>
        <button
          className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          title="Zoom Out"
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
                  <FaCar className="text-sm" />
                </button>
              )}
              <button
                onClick={() => onNavigate && onNavigate()}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <FaRoute className="text-sm" />
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

      {/* API Key Notice */}
      <div className="absolute bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-2 max-w-xs">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Add Google Maps API key to enable interactive maps with real-time tracking.
        </p>
      </div>
    </div>
  );
};

export default FallbackMap;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [driverEmail, setDriverEmail] = useState(localStorage.getItem("driverEmail") || "");
  const [inputEmail, setInputEmail] = useState("");
  const [availableRides, setAvailableRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingMyRides, setLoadingMyRides] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch available rides
  const fetchAvailableRides = async () => {
    setLoadingAvailable(true);
    try {
      const res = await fetch("/api/rides/available");
      const data = await res.json();
      setAvailableRides(data);
    } catch {
      setAvailableRides([]);
    }
    setLoadingAvailable(false);
  };

  // Fetch my rides
  const fetchMyRides = async (email) => {
    if (!email) return;
    setLoadingMyRides(true);
    try {
      const res = await fetch(`/api/rides/driver/${email}`);
      const data = await res.json();
      setMyRides(data);
    } catch {
      setMyRides([]);
    }
    setLoadingMyRides(false);
  };

  useEffect(() => {
    if (driverEmail) {
      fetchAvailableRides();
      fetchMyRides(driverEmail);
      // Poll for available rides every 10 seconds
      const interval = setInterval(() => {
        fetchAvailableRides();
      }, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [driverEmail]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputEmail) return;
    localStorage.setItem("driverEmail", inputEmail.toLowerCase());
    setDriverEmail(inputEmail.toLowerCase());
    setInputEmail("");
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("driverEmail");
    setDriverEmail("");
    setAvailableRides([]);
    setMyRides([]);
    setMessage("");
    navigate("/login");
  };

  const handleAccept = async (rideId) => {
    setLoadingAvailable(true);
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`/api/rides/accept/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver: driverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Ride accepted!");
        fetchAvailableRides();
        fetchMyRides(driverEmail);
      } else {
        setMessage(data.message || "Failed to accept ride");
        setLoadingAvailable(false);
        setLoadingMyRides(false);
      }
    } catch {
      setMessage("Failed to accept ride");
      setLoadingAvailable(false);
      setLoadingMyRides(false);
    }
  };

  const handleComplete = async (rideId) => {
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`/api/rides/complete/${rideId}`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Ride marked as completed!");
        fetchMyRides(driverEmail);
      } else {
        setMessage(data.message || "Failed to complete ride");
        setLoadingMyRides(false);
      }
    } catch {
      setMessage("Failed to complete ride");
      setLoadingMyRides(false);
    }
  };

  const handleRefresh = () => {
    fetchAvailableRides();
    fetchMyRides(driverEmail);
    setMessage("");
  };

  if (!driverEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🚗</div>
              <h2 className="text-3xl font-extrabold text-green-700 tracking-tight">Driver Login</h2>
              <p className="text-gray-600 mt-2">Access your driver dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Email</label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="email"
                  placeholder="Enter your email"
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  required
                />
              </div>
              <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-[1.02]" type="submit">
                Login as Driver
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-2 sm:px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 tracking-tight mb-1 sm:mb-2">Driver Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your rides and accept new bookings</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-600">Logged in as:</div>
                <div className="font-semibold text-green-700 text-sm sm:text-base">{driverEmail}</div>
              </div>
              <button 
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 text-sm sm:text-base"
                onClick={handleRefresh}
                disabled={loadingAvailable || loadingMyRides}
              >
                {loadingAvailable || loadingMyRides ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
              <button 
                className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl border border-green-200 text-center font-medium">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Rides */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-700">Available Rides</h2>
            </div>
            
            {loadingAvailable ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <div className="text-gray-500">Loading available rides...</div>
              </div>
            ) : availableRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <div className="text-gray-500">No available rides at the moment</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableRides.map((ride, idx) => (
                  <div key={ride._id || idx} className="bg-white/60 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-2">{ride.vehicle} • {ride.distance} km • {ride.fare}</div>
                        <div className="mt-2">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="mt-1"><FaCircle className="text-green-500 text-xs" /></span>
                            <span className="text-[15px] font-medium text-gray-900 leading-tight whitespace-pre-line">{ride.from}</span>
                          </div>
                          <div className="flex items-start gap-2 mt-1">
                            <span className="mt-1"><FaCircle className="text-red-500 text-xs" /></span>
                            <span className="text-[15px] font-medium text-gray-900 leading-tight whitespace-pre-line">{ride.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                          onClick={() => handleAccept(ride._id)}
                          disabled={loadingAvailable || loadingMyRides}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {ride.startedAt ? new Date(ride.startedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Rides */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-700">My Rides</h2>
              <div className="text-sm text-gray-500">{myRides.length} rides</div>
            </div>
            
            {loadingMyRides ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-gray-500">Loading your rides...</div>
              </div>
            ) : myRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <div className="text-gray-500">No rides found. Accept a ride to get started!</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myRides.map((ride, idx) => (
                  <div key={ride._id || idx} className="bg-white/60 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">
                          {ride.from} → {ride.to}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ride.vehicle} • {ride.distance} km • ₹{ride.fare}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        ride.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ride.status}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {ride.startedAt ? new Date(ride.startedAt).toLocaleString() : 'N/A'}
                      </div>
                      {ride.status !== 'Completed' && (
                        <button
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-yellow-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                          onClick={() => handleComplete(ride._id)}
                          disabled={loadingMyRides}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
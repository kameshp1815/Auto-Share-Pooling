import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle, FaEnvelope, FaPhone, FaIdBadge, FaCarSide, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import { useCallback } from "react";
import io from "socket.io-client";
import { API_BASE_URL, fileUrl } from "../config/api";

export default function DriverDashboard({ setDriverToken }) {
  const navigate = useNavigate();
  const [driverEmail, setDriverEmail] = useState("");
  const [driverProfile, setDriverProfile] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingMyRides, setLoadingMyRides] = useState(false);
  const [message, setMessage] = useState("");
  const [driverStatus, setDriverStatus] = useState('offline');
  const [toggling, setToggling] = useState(false);
  const [socket, setSocket] = useState(null);
  const [geoWatchId, setGeoWatchId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    const driverToken = localStorage.getItem("driverToken");
    if (!driverToken) {
      navigate("/driver-login", { replace: true });
      return;
    }
    try {
      const payload = JSON.parse(atob(driverToken.split('.')[1]));
      setDriverEmail(payload.email ? payload.email.toLowerCase() : "");
    } catch {
      setDriverEmail("");
    }
  }, []);

  useEffect(() => {
    const base = API_BASE_URL || window.location.origin;
    const s = io(base);
    setSocket(s);
    return () => { try { s.close(); } catch {} };
  }, []);

  const fileToUrl = (p) => fileUrl(p);

  const fetchDriverProfile = useCallback(async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/driver-profile/${email}`);

      if (res.ok) {
        const data = await res.json();
        setDriverProfile(data);
      } else {
        setDriverProfile(null);
      }
    } catch {
      setDriverProfile(null);
    }
  }, []);

  const fetchDriverActive = useCallback(async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/driver/active/${email}`);

      if (res.ok) {
        const data = await res.json();
        setDriverStatus(data.driverStatus || 'offline');
      }
    } catch {}
  }, []);

  const fetchAvailableRides = async () => {
    setLoadingAvailable(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/available`);

      const data = await res.json();
      setAvailableRides(data);
    } catch {
      setAvailableRides([]);
    }
    setLoadingAvailable(false);
  };

  const fetchMyRides = async (email) => {
    if (!email) return;
    setLoadingMyRides(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/driver/${email}`);

      const data = await res.json();
      setMyRides(data);
    } catch {
      setMyRides([]);
    }
    setLoadingMyRides(false);
  };

  useEffect(() => {
    if (driverEmail) {
      fetchDriverProfile(driverEmail);
      fetchDriverActive(driverEmail);
      fetchAvailableRides();
      fetchMyRides(driverEmail);

      const interval = setInterval(() => {
        fetchAvailableRides();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [driverEmail]);

  const handleAccept = async (rideId) => {
    setLoadingAvailable(true);
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/accept/${rideId}`, {
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

  const handleArrived = async (rideId) => {
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/arrived/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver: driverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Marked as arrived");
        fetchMyRides(driverEmail);
      } else {
        setMessage(data.message || "Failed to mark arrived");
        setLoadingMyRides(false);
      }
    } catch {
      setMessage("Failed to mark arrived");
      setLoadingMyRides(false);
    }
  };

  const handleStart = async (rideId) => {
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/start/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver: driverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Ride started");
        fetchMyRides(driverEmail);
      } else {
        setMessage(data.message || "Failed to start ride");
        setLoadingMyRides(false);
      }
    } catch {
      setMessage("Failed to start ride");
      setLoadingMyRides(false);
    }
  };

  const handleComplete = async (rideId, paymentMethod = 'cash') => {
    setLoadingMyRides(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/rides/complete/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver: driverEmail, paymentMethod })
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

  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    setDriverEmail("");
    if (setDriverToken) setDriverToken(null);
    if (geoWatchId !== null) { try { navigator.geolocation.clearWatch(geoWatchId); } catch {} setGeoWatchId(null); }
    try { socket && socket.emit('driver:offline', { email: driverEmail }); } catch {}
    navigate("/driver-login", { replace: true });
  };

  if (!driverEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100">
        <div className="bg-white/80 rounded-2xl shadow-xl p-8 border border-white/20 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Please log in as a driver</h2>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-green-600 transition-all duration-200"
            onClick={() => navigate("/driver-login")}
          >
            Go to Driver Login
          </button>
        </div>
      </div>
    );
  }

  const totalRides = myRides.length;
  const completedRides = myRides.filter(r => r.status === 'Completed').length;

  const setOnline = async () => {
    if (!driverEmail) return;
    setToggling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/driver/online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: driverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setDriverStatus(data.driverStatus);
        setMessage('You are now Online');
        try { socket && socket.emit('driver:online', { email: driverEmail }); } catch {}
        if ('geolocation' in navigator) {
          const id = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            try { socket && socket.emit('driver:location', { email: driverEmail, lat: latitude, lng: longitude }); } catch {}
          }, () => {}, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
          setGeoWatchId(id);
        }
      } else {
        setMessage(data.message || 'Failed to go online');
      }
    } catch {
      setMessage('Failed to go online');
    }
    setToggling(false);
  };

  const setOffline = async () => {
    if (!driverEmail) return;
    setToggling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/driver/offline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: driverEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setDriverStatus(data.driverStatus);
        setMessage('You are now Offline');
        if (geoWatchId !== null) { try { navigator.geolocation.clearWatch(geoWatchId); } catch {} setGeoWatchId(null); }
        try { socket && socket.emit('driver:offline', { email: driverEmail }); } catch {}
      } else {
        setMessage(data.message || 'Failed to go offline');
      }
    } catch {
      setMessage('Failed to go offline');
    }
    setToggling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-2 sm:px-4 py-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Enhanced Driver Profile & Stats */}
        {driverProfile && (
          <div className="bg-gradient-to-r from-green-200 via-yellow-100 to-blue-100 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-8 mb-8 border border-green-200">
            <div className="flex-shrink-0">
              {driverProfile.profilePic ? (
                <img
                  src={fileToUrl(driverProfile.profilePic)}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-xl object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-yellow-400 bg-gray-200 flex items-center justify-center text-4xl text-gray-400 font-bold shadow-xl">
                  {driverProfile.name ? driverProfile.name[0].toUpperCase() : driverProfile.email[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-3xl font-extrabold text-green-800 mb-1 flex items-center gap-2">
                {driverProfile.name || "Driver"}
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full ml-2 font-semibold flex items-center gap-1"><FaIdBadge className="inline-block" />Driver</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mb-1"><FaEnvelope className="text-yellow-500" /> {driverProfile.email}</div>
              <div className="flex items-center gap-2 text-gray-700 mb-1"><FaPhone className="text-blue-500" /> {driverProfile.phone || "-"}</div>
              <div className="flex items-center gap-2 text-gray-700"><FaCarSide className="text-green-500" /> Type: {driverProfile.type}</div>
            </div>
            {/* Stat Cards */}
            <div className="flex flex-row sm:flex-col gap-4 mt-6 sm:mt-0">
              <div className="bg-white/90 rounded-xl shadow p-4 flex flex-col items-center min-w-[110px]">
                <FaClipboardList className="text-2xl text-blue-500 mb-1" />
                <div className="text-lg font-bold text-gray-800">{totalRides}</div>
                <div className="text-xs text-gray-500">Total Rides</div>
              </div>
              <div className="bg-white/90 rounded-xl shadow p-4 flex flex-col items-center min-w-[110px]">
                <FaCheckCircle className="text-2xl text-green-500 mb-1" />
                <div className="text-lg font-bold text-gray-800">{completedRides}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
            {/* Action Buttons & Availability */}
            <div className="flex flex-col gap-3 ml-0 sm:ml-8 mt-6 sm:mt-0">
              <div className="bg-white/90 rounded-xl shadow p-4 flex flex-col items-center min-w-[160px]">
                <div className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 ${driverStatus === 'offline' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                  {driverStatus === 'offline' ? 'Offline' : 'Online'}
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={driverStatus !== 'offline'}
                    onChange={(e) => {
                      if (toggling) return;
                      if (e.target.checked) setOnline(); else setOffline();
                    }}
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow"></div>
                  <span className="ml-3 text-sm font-semibold text-gray-700">{driverStatus === 'offline' ? 'Go Online' : 'Go Offline'}</span>
                </label>
              </div>
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all text-base"
                onClick={handleRefresh}
                disabled={loadingAvailable || loadingMyRides}
              >
                {loadingAvailable || loadingMyRides ? '🔄 Loading...' : 'Refresh'}
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all text-base"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
        {/* Simple Dashboard Title Section or Approval Notice */}
        {driverProfile && (driverProfile.banned || !driverProfile.driverApproved) ? (
          <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-red-200 mb-8">
            {driverProfile.banned ? (
              <>
                <h1 className="text-2xl font-extrabold text-red-700 mb-2">Account Banned</h1>
                <p className="text-gray-700">Your account has been banned by admin. You cannot access rides.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-yellow-700 mb-2">Waiting for Approval</h1>
                <p className="text-gray-700">Your profile is under review by admin. Available rides will appear once approved.</p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
            <h1 className="text-3xl font-extrabold text-green-700 mb-2">Driver Dashboard</h1>
            <p className="text-gray-600 text-base">Manage your rides and accept new bookings</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl border border-green-200 text-center font-medium">
            {message}
          </div>
        )}

        

        

        {driverProfile && !(driverProfile.banned || !driverProfile.driverApproved) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Rides */}
          <div className="bg-white/90 rounded-2xl shadow- xl p-8 border border-yellow-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-700 flex items-center gap-2"><FaCarSide className="text-yellow-500" />Available Rides</h2>
            </div>
            {driverProfile && (driverProfile.banned || !driverProfile.driverApproved) ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⏳</div>
                <div className="text-gray-600">{driverProfile.banned ? 'You are banned by admin.' : 'Waiting for admin approval.'}</div>
              </div>
            ) : driverStatus === 'offline' ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛑</div>
                <div className="text-gray-600">You are offline. Go Online to see available rides.</div>
              </div>
            ) : loadingAvailable ? (
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
                  <div key={ride._id || idx} className="bg-yellow-50 rounded-xl p-5 border border-yellow-300 hover:shadow-lg transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-2"><FaCarSide className="text-yellow-500" />{ride.vehicle} • {ride.distance} km • ₹{ride.fare}</div>
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
                          className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-green-500 hover:to-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
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
          <div className="bg-white/90 rounded-2xl shadow- xl p-8 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2"><FaClipboardList className="text-blue-500" />My Rides</h2>
              <div className="text-sm text-gray-500">{myRides.length} rides</div>
            </div>
            {/* Ride history filters */}
            <div className="flex items-center gap-2 mb-4">
              {['all','Completed','Ongoing','Accepted','Arrived','Started','Requested'].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} className={`px-3 py-1 rounded-full text-sm ${historyFilter===f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f}</button>
              ))}
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
                {myRides.filter(r => historyFilter === 'all' ? true : r.status === historyFilter).map((ride, idx) => (
                  <div key={ride._id || idx} className="bg-blue-50 rounded-xl p-5 border border-blue-300 hover:shadow-lg transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
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
                        <div className="text-sm text-gray-600 mt-2 flex items-center gap-2"><FaCarSide className="text-blue-500" />{ride.vehicle} • {ride.distance} km • ₹{ride.fare}</div>
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
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                          onClick={() => handleComplete(ride._id, 'cash')}
                          disabled={loadingMyRides}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    {ride.status && ride.status !== 'Completed' && (
                      <div className="flex gap-2 mt-2 justify-end">
                        {ride.status === 'Accepted' && (
                          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleArrived(ride._id)} disabled={loadingMyRides}>Arrived</button>
                        )}
                        {['Accepted','Arrived'].includes(ride.status) && (
                          <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700" onClick={() => handleStart(ride._id)} disabled={loadingMyRides}>Start</button>
                        )}
                        {['Started','Ongoing'].includes(ride.status) && (
                          <>
                            <a className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" href={`https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${encodeURIComponent(ride.to)}`} target="_blank" rel="noreferrer">Navigate</a>
                            <button className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => handleComplete(ride._id, 'cash')} disabled={loadingMyRides}>End (Cash)</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
} 
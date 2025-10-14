import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle, FaUser, FaPhone, FaCar, FaIdCard, FaBolt, FaCreditCard, FaHistory, FaShieldAlt, FaChartPie, FaFilter } from "react-icons/fa";
import io from "socket.io-client";

export default function Profile() {
  const token = localStorage.getItem("token");
  let userType = "customer";
  let userEmail = "";
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userEmail = payload.email ? payload.email.toLowerCase() : "";
    userType = payload.type || "customer";
  }
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ridesPerPage = 3;
  const navigate = useNavigate();
  const [ongoingRide, setOngoingRide] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');

  // Driver UI state
  const [driverStats, setDriverStats] = useState({
    totalRides: 42,
    earnings: 1234,
    rating: 4.8
  });
  const [acceptedRides, setAcceptedRides] = useState([
    { from: "Station", to: "Mall", fare: "₹120", status: "Completed" },
    { from: "Airport", to: "Hotel", fare: "₹300", status: "Ongoing" }
  ]);

  useEffect(() => {
    fetchHistory();
    fetchOngoing();
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    const s = io('http://localhost:5000');
    setSocket(s);
    const handleStatus = (data) => {
      if ((data.userEmail || '').toLowerCase() === userEmail) {
        fetchHistory();
        fetchOngoing();
      }
    };
    s.on('ride:status-update', handleStatus);
    const interval = setInterval(() => {
      fetchOngoing();
    }, 10000);
    return () => {
      s.off('ride:status-update', handleStatus);
      s.close();
      clearInterval(interval);
    };
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!password) return setMessage("Password cannot be empty");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setMessage("Password updated successfully!");
      setPassword("");
    } else {
      const data = await res.json();
      setMessage(data.message || "Failed to update password");
    }
  };

  const fetchHistory = async () => {
    if (!userEmail) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/rides/history/${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
    setLoadingHistory(false);
  };

  const fetchOngoing = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`/api/rides/ongoing/${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        setOngoingRide(data || null);
      } else {
        setOngoingRide(null);
      }
    } catch {
      setOngoingRide(null);
    }
  };

  // Derived stats and pagination
  const totalRides = history.length;
  const totalCompleted = history.filter(r => r.status === 'Completed').length;
  const totalSpent = history.reduce((acc, r) => acc + (parseFloat(r.fare || '0') || 0), 0);
  const paidCount = history.filter(r => r.paymentStatus === 'paid').length;
  const cashCount = history.filter(r => r.paymentStatus === 'cash').length;

  const ridesFilteredAll = history.filter(r => {
    const statusOk = filterStatus === 'all' ? true : (r.status === filterStatus);
    const vehicleOk = filterVehicle === 'all' ? true : ((r.vehicle || '').toLowerCase() === filterVehicle);
    return statusOk && vehicleOk;
  });

  const totalPages = Math.ceil(ridesFilteredAll.length / ridesPerPage);
  const paginatedRides = ridesFilteredAll.slice((currentPage - 1) * ridesPerPage, currentPage * ridesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4 py-6">
      <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-0 border border-yellow-100/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center border border-yellow-200 shadow">
                <span className="text-yellow-500 font-extrabold text-2xl">A</span>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 drop-shadow-sm">My Profile</div>
                <div className="text-xs text-yellow-900/90">{userEmail}</div>
              </div>
            </div>
            <button
              className="bg-white/80 hover:bg-white text-yellow-800 px-3 py-2 rounded-lg text-sm font-bold border border-yellow-200 shadow"
              onClick={handleLogout}
            >Logout</button>
          </div>
          {ongoingRide && (
            <div className="mt-4 p-4 rounded-xl bg-white/80 border border-yellow-200 shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-yellow-800"><FaBolt className="text-yellow-600" /> Ongoing ride</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${['Accepted','Arrived','Started','Ongoing'].includes(ongoingRide.status) ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{ongoingRide.status}</span>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-600">From</div>
                  <div className="font-semibold text-gray-800 leading-snug">{ongoingRide.from}</div>
                  <div className="text-xs text-gray-600 mt-1">To</div>
                  <div className="font-semibold text-gray-800 leading-snug">{ongoingRide.to}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Fare</div>
                  <div className="font-extrabold text-gray-900">{ongoingRide.fare ? `₹${ongoingRide.fare}` : '-'}</div>
                  <div className="mt-1 text-xs text-gray-600">Payment</div>
                  <div className={`text-sm font-bold ${ongoingRide.paymentStatus === 'paid' ? 'text-green-700' : ongoingRide.paymentStatus === 'cash' ? 'text-blue-700' : 'text-yellow-700'}`}>{ongoingRide.paymentStatus || 'pending'}</div>
                </div>
              </div>
              {ongoingRide.driverDetails && ongoingRide.driverDetails.name && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-yellow-100">
                  <div className="text-xs font-bold text-gray-800 mb-1">Driver</div>
                  <div className="text-sm text-gray-700">{ongoingRide.driverDetails.name} • {ongoingRide.driverDetails.vehicleNumber || '-'}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded-lg text-sm font-bold border ${activeTab==='overview'?'bg-yellow-100 text-yellow-800 border-yellow-300':'bg-white text-gray-700 border-gray-200'}`}><span className="inline-flex items-center gap-2"><FaChartPie/> Overview</span></button>
            <button onClick={() => setActiveTab('rides')} className={`px-3 py-2 rounded-lg text-sm font-bold border ${activeTab==='rides'?'bg-yellow-100 text-yellow-800 border-yellow-300':'bg-white text-gray-700 border-gray-200'}`}><span className="inline-flex items-center gap-2"><FaHistory/> Rides</span></button>
            <button onClick={() => setActiveTab('payments')} className={`px-3 py-2 rounded-lg text-sm font-bold border ${activeTab==='payments'?'bg-yellow-100 text-yellow-800 border-yellow-300':'bg-white text-gray-700 border-gray-200'}`}><span className="inline-flex items-center gap-2"><FaCreditCard/> Payments</span></button>
            <button onClick={() => setActiveTab('security')} className={`px-3 py-2 rounded-lg text-sm font-bold border ${activeTab==='security'?'bg-yellow-100 text-yellow-800 border-yellow-300':'bg-white text-gray-700 border-gray-200'}`}><span className="inline-flex items-center gap-2"><FaShieldAlt/> Security</span></button>
          </div>
        </div>
        {userType === "driver" ? (
          <>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Driver Stats</h3>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{driverStats.totalRides}</div>
                  <div className="text-sm text-gray-600">Total Rides</div>
                </div>
                <div className="flex-1 bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">₹{driverStats.earnings}</div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
                <div className="flex-1 bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{driverStats.rating}★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 mt-6">Accepted Rides</h3>
              <ul className="divide-y divide-yellow-100">
                {acceptedRides.map((ride, idx) => (
                  <li key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-700">{ride.from} → {ride.to}</div>
                      <div className="text-sm text-gray-500">{ride.fare}</div>
                    </div>
                    <div className={`text-sm font-bold text-right ${ride.status === 'Completed' ? 'text-green-700' : 'text-yellow-700'}`}>{ride.status}</div>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold shadow-md hover:bg-red-600 transition-all text-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Tab Panels */}
            {activeTab === 'overview' && (
              <div className="px-5 pb-6">
                {/* Rapido-style user card */}
                <div className="mb-5 p-4 rounded-2xl bg-white border border-gray-100 shadow flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center font-extrabold text-lg">
                      {(userEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 text-lg">{(userEmail || '').split('@')[0] || 'User'}</div>
                      <div className="text-xs text-gray-500">{userEmail}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Rating</div>
                    <div className="font-bold text-yellow-700">4.8 ★</div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">💳</span>
                    Payments
                  </button>
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">🏠</span>
                    Saved Places
                  </button>
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">🎁</span>
                    Offers
                  </button>
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">🤝</span>
                    Refer & Earn
                  </button>
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">🆘</span>
                    Help
                  </button>
                  <button className="h-20 rounded-2xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center text-sm font-semibold text-yellow-800">
                    <span className="text-xl">🛡️</span>
                    Safety
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-600">Total Rides</div>
                    <div className="text-2xl font-extrabold text-yellow-700">{totalRides}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-600">Completed</div>
                    <div className="text-2xl font-extrabold text-yellow-700">{totalCompleted}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-600">Paid</div>
                    <div className="text-2xl font-extrabold text-yellow-700">{paidCount}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-600">Cash</div>
                    <div className="text-2xl font-extrabold text-yellow-700">{cashCount}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-800">Spending</div>
                    <div className="text-2xl font-extrabold text-gray-900">₹{Math.round(totalSpent)}</div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">Based on fare of your rides</div>
                </div>

                {/* Settings list */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow divide-y">
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Edit Profile</span>
                    <span className="text-gray-400">›</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Saved Places</span>
                    <span className="text-gray-400">›</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Payment Methods</span>
                    <span className="text-gray-400">›</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Notifications</span>
                    <span className="text-gray-400">›</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Support</span>
                    <span className="text-gray-400">›</span>
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <span className="text-red-600 font-bold">Logout</span>
                    <span className="text-red-400">›</span>
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'rides' && (
              <div className="px-5 pb-6">
                {/* Filters */}
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 text-gray-600"><FaFilter/> Filter</span>
                  <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setCurrentPage(1);}} className="border rounded-lg px-2 py-1">
                    <option value="all">All Status</option>
                    <option>Requested</option>
                    <option>Accepted</option>
                    <option>Arrived</option>
                    <option>Started</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                  <select value={filterVehicle} onChange={e=>{setFilterVehicle(e.target.value); setCurrentPage(1);}} className="border rounded-lg px-2 py-1">
                    <option value="all">All Vehicles</option>
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="cab">Cab</option>
                  </select>
                </div>
                {ridesFilteredAll.length === 0 ? (
                  <div className="text-center text-gray-500">No rides match selected filters.</div>
                ) : (
                  <div className="space-y-4">
                    {paginatedRides.map((ride, idx) => (
                      <div key={idx} className="bg-white rounded-2xl shadow border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-700 capitalize">{ride.vehicle || 'Ride'}</span>
                          <span className="text-gray-500 text-sm">{ride.requestedAt ? new Date(ride.requestedAt).toLocaleString() : ''}</span>
                          <span className="font-bold text-gray-800">{ride.fare ? `₹${ride.fare}` : '₹0'}</span>
                        </div>
                        <div className="mb-3">
                          <span className={`font-semibold text-sm px-3 py-1 rounded-full ${ride.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ride.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ride.status || ride.paymentStatus}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="mt-1"><FaCircle className="text-green-500 text-xs" /></span>
                            <span className="text-[15px] font-medium text-gray-900 leading-tight whitespace-pre-line">{ride.from}</span>
                          </div>
                          <div className="flex items-start gap-2 mb-3">
                            <span className="mt-1"><FaCircle className="text-red-500 text-xs" /></span>
                            <span className="text-[15px] font-medium text-gray-900 leading-tight whitespace-pre-line">{ride.to}</span>
                          </div>
                          {ride.driverDetails && ride.driverDetails.name && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                              <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <FaUser className="text-blue-600" />
                                Driver Details
                              </h4>
                              <div className="space-y-2">
                                {ride.driverDetails.name && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FaUser className="text-gray-500 w-4" />
                                    <span className="text-gray-700 font-medium">{ride.driverDetails.name}</span>
                                  </div>
                                )}
                                {ride.driverDetails.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FaPhone className="text-gray-500 w-4" />
                                    <span className="text-gray-700">{ride.driverDetails.phone}</span>
                                  </div>
                                )}
                                {ride.driverDetails.vehicleNumber && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FaIdCard className="text-gray-500 w-4" />
                                    <span className="text-gray-700 font-mono">{ride.driverDetails.vehicleNumber}</span>
                                  </div>
                                )}
                                {ride.driverDetails.vehicleType && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FaCar className="text-gray-500 w-4" />
                                    <span className="text-gray-700 capitalize">{ride.driverDetails.vehicleType} {ride.driverDetails.vehicleModel && `- ${ride.driverDetails.vehicleModel}`}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Pagination */}
                {ridesFilteredAll.length > ridesPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >Previous</button>
                    <span className="text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
                    <button
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >Next</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'payments' && (
              <div className="px-5 pb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow p-4">
                  <div className="font-bold text-gray-800 mb-2">Payment Summary</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-600">Paid</div>
                      <div className="text-xl font-extrabold text-yellow-700">{paidCount}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-600">Cash</div>
                      <div className="text-xl font-extrabold text-yellow-700">{cashCount}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-600">Total Spent</div>
                      <div className="text-xl font-extrabold text-yellow-700">₹{Math.round(totalSpent)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'security' && (
              <div className="px-5 pb-6">
                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 mb-8">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Change Password</label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder-gray-400 bg-gray-50"
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-yellow-400 transition-all text-lg mt-2" type="submit">
                    Update Password
                  </button>
                  {message && <div className={`mt-2 text-center font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
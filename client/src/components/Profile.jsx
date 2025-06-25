import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle } from "react-icons/fa";

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

  // Pagination logic
  const totalPages = Math.ceil(history.length / ridesPerPage);
  const paginatedRides = history.slice((currentPage - 1) * ridesPerPage, currentPage * ridesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4 py-6">
      <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 border border-yellow-100/60">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-yellow-700 tracking-tight text-center">My Profile</h2>
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
            <button
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-600 transition-all text-lg mb-6"
              onClick={() => { setShowHistory(!showHistory); setCurrentPage(1); }}
            >
              {showHistory ? 'Hide Ride History' : 'Show Ride History'}
            </button>
            {showHistory && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Past</h3>
                {loadingHistory ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : history.length === 0 ? (
                  <div className="text-center text-gray-400">No rides found.</div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedRides.map((ride, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-700 capitalize">{ride.vehicle || 'Ride'}</span>
                            <span className="text-gray-500 text-sm">{ride.dateTime ? ride.dateTime : ''}</span>
                            <span className="font-bold text-gray-800">{ride.fare ? `₹${ride.fare}` : '₹0'}</span>
                          </div>
                          <div className="mb-1">
                            <span className={`font-semibold text-sm ${ride.status === 'Cancelled' ? 'text-red-500' : ride.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{ride.status || ride.paymentStatus}</span>
                          </div>
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
                      ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
                      <button
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold shadow-md hover:bg-red-600 transition-all text-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
} 
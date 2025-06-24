import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const token = localStorage.getItem("token");
  const userEmail = token ? JSON.parse(atob(token.split('.')[1])).email.toLowerCase() : "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight mb-2">User Profile</h1>
          <div className="text-lg text-gray-600">Manage your account and view ride history</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Account Information</h2>
            
            {/* Email Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm font-medium text-blue-600 mb-1">Email Address</div>
              <div className="text-lg font-semibold text-blue-800">{userEmail}</div>
            </div>

            {/* Password Change Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button 
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02]" 
                type="submit"
              >
                Update Password
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-xl text-center font-medium ${
                message.includes("successfully") 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            {/* Logout Button */}
            <div className="mt-6">
              <button
                className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02]"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Booking History Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Booking History</h2>
            
            {loadingHistory ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-gray-500">Loading your booking history...</div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <div className="text-gray-500">No bookings found. Book your first ride!</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((ride, idx) => (
                  <div key={ride._id || idx} className="bg-white/60 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
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
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Driver: {ride.driver || 'Not assigned yet'}</div>
                      <div>Date: {ride.startedAt ? new Date(ride.startedAt).toLocaleString() : 'N/A'}</div>
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
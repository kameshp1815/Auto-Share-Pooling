import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api";

export default function DriverEarnings() {
  const [email, setEmail] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("driverToken");
    if (!token) { setError("Not logged in"); setLoading(false); return; }
    try { const payload = JSON.parse(atob(token.split('.')[1])); setEmail((payload.email || '').toLowerCase()); } catch { setEmail(""); }
  }, []);

  useEffect(() => {
    async function load() {
      if (!email) return;
      setLoading(true); setError("");
      try {
        const [rRes, eRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rides/driver/${email}`),
          fetch(`${API_BASE_URL}/api/rides/earnings/${email}`)
        ]);
        if (!rRes.ok) throw new Error('Failed to load rides');
        if (!eRes.ok) throw new Error('Failed to load earnings');
        const [rData, eData] = await Promise.all([rRes.json(), eRes.json()]);
        setRides(Array.isArray(rData) ? rData : []);
        setEarnings(eData || null);
      } catch (e) { setError(e.message || 'Error'); }
      setLoading(false);
    }
    load();
  }, [email]);

  const metrics = useMemo(() => {
    const completed = rides.filter(r => r.status === 'Completed');
    const totalTrips = completed.length;
    const totalEarnings = completed.reduce((sum, r) => sum + (parseFloat(r.fare) || 0), 0);
    const totalDistance = completed.reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0);
    return { totalTrips, totalEarnings, totalDistance };
  }, [rides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-2 sm:px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-green-700 mb-4">Earnings</h1>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-gray-500 text-sm">Completed Trips</div>
                <div className="text-2xl font-extrabold text-blue-700">{metrics.totalTrips}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-gray-500 text-sm">Total Earnings (₹)</div>
                <div className="text-2xl font-extrabold text-green-700">{metrics.totalEarnings.toFixed(2)}</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-gray-500 text-sm">Distance (km)</div>
                <div className="text-2xl font-extrabold text-yellow-700">{metrics.totalDistance.toFixed(1)}</div>
              </div>
            </div>
            {earnings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="font-bold text-gray-800 mb-2">Today</div>
                  <div className="text-3xl font-extrabold text-green-700 mb-1">₹{(earnings.day?.total || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mb-3">{earnings.day?.rides || 0} rides</div>
                  <div className="text-sm text-gray-600">Cash: {earnings.day?.breakdown?.cash || 0} • Online: {earnings.day?.breakdown?.online || 0}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="font-bold text-gray-800 mb-2">Last 7 Days</div>
                  <div className="text-3xl font-extrabold text-green-700 mb-1">₹{(earnings.week?.total || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mb-3">{earnings.week?.rides || 0} rides</div>
                  <div className="text-sm text-gray-600">Cash: {earnings.week?.breakdown?.cash || 0} • Online: {earnings.week?.breakdown?.online || 0}</div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="font-bold mb-3">Recent Completed Rides</div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">From</th>
                      <th className="py-2 px-3 text-left">To</th>
                      <th className="py-2 px-3 text-left">Fare</th>
                      <th className="py-2 px-3 text-left">Distance</th>
                      <th className="py-2 px-3 text-left">Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.filter(r => r.status === 'Completed').slice(0, 10).map(r => (
                      <tr key={r._id} className="border-t">
                        <td className="py-2 px-3">{r.from}</td>
                        <td className="py-2 px-3">{r.to}</td>
                        <td className="py-2 px-3">₹{r.fare}</td>
                        <td className="py-2 px-3">{r.distance} km</td>
                        <td className="py-2 px-3">{r.completedAt ? new Date(r.completedAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



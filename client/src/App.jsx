import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Booking from "./components/Booking";
import Profile from "./components/Profile";
import DriverLogin from "./driver/DriverLogin";
import DriverDashboard from "./driver/DriverDashboard";
import DriverProfile from "./driver/DriverProfile";
import DriverEarnings from "./driver/DriverEarnings";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import ContactUs from "./components/ContactUs";
import Safety from "./components/Safety";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Home from "./components/Home";
import DriverRegister from "./driver/DriverRegister";
import DriverProfileCompletion from "./driver/DriverProfileCompletion";
import UserManagement from "./admin/UserManagement";
import DriverManagement from "./admin/DriverManagement";
import AdminNavbar from "./admin/AdminNavbar";
import AdminLogin from "./admin/AdminLogin";
import RideStatus from "./components/RideStatus";

function AdminHome() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [users, setUsers] = React.useState([]);
  const [drivers, setDrivers] = React.useState([]);
  const [availableRides, setAvailableRides] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [uRes, dRes, rRes] = await Promise.all([
          fetch('/api/auth/admin/users'),
          fetch('/api/auth/admin/drivers'),
          fetch('/api/rides/available'),
        ]);
        if (!uRes.ok || !dRes.ok || !rRes.ok) throw new Error('Failed to load admin data');
        const [u, d, r] = await Promise.all([uRes.json(), dRes.json(), rRes.json()]);
        if (!cancelled) {
          setUsers(u || []);
          setDrivers(d || []);
          setAvailableRides(r || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error loading admin data');
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = {
    users: users.length,
    drivers: drivers.length,
    availableRides: availableRides.length,
    pendingDrivers: drivers.filter(d => !d.driverProfileCompleted).length,
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Admin Dashboard</h1>
        {loading ? (
          <div className="text-gray-500">Loading dashboard...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border rounded-xl shadow p-5">
                <div className="text-gray-500 text-sm">Registered Users</div>
                <div className="text-3xl font-extrabold text-blue-700">{stats.users}</div>
              </div>
              <div className="bg-white border rounded-xl shadow p-5">
                <div className="text-gray-500 text-sm">Drivers</div>
                <div className="text-3xl font-extrabold text-green-700">{stats.drivers}</div>
              </div>
              <div className="bg-white border rounded-xl shadow p-5">
                <div className="text-gray-500 text-sm">Pending Driver Approvals</div>
                <div className="text-3xl font-extrabold text-yellow-700">{stats.pendingDrivers}</div>
              </div>
              <div className="bg-white border rounded-xl shadow p-5">
                <div className="text-gray-500 text-sm">Available Rides</div>
                <div className="text-3xl font-extrabold text-indigo-700">{stats.availableRides}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800">Recent Users</h2>
                  <a href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</a>
                </div>
                <ul className="divide-y">
                  {users.slice(0, 5).map(u => (
                    <li key={u._id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{u.name || '-'} </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">User</span>
                    </li>
                  ))}
                  {users.length === 0 && <li className="py-2 text-gray-500">No users yet</li>}
                </ul>
              </div>

              <div className="bg-white border rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800">Recent Drivers</h2>
                  <a href="/admin/drivers" className="text-sm text-green-600 hover:underline">View all</a>
                </div>
                <ul className="divide-y">
                  {drivers.slice(0, 5).map(d => (
                    <li key={d._id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{d.name || '-'}</div>
                        <div className="text-sm text-gray-500">{d.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${d.driverProfileCompleted ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{d.driverProfileCompleted ? 'Approved' : 'Pending'}</span>
                    </li>
                  ))}
                  {drivers.length === 0 && <li className="py-2 text-gray-500">No drivers yet</li>}
                </ul>
              </div>

              <div className="bg-white border rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800">Available Rides</h2>
                  <a href="/admin-autoshare" className="text-sm text-indigo-600 hover:underline">Refresh</a>
                </div>
                <ul className="divide-y">
                  {availableRides.slice(0, 5).map(r => (
                    <li key={r._id} className="py-2">
                      <div className="font-semibold text-gray-800">{r.from} → {r.to}</div>
                      <div className="text-sm text-gray-500">{r.email} • {r.vehicle || 'N/A'}</div>
                    </li>
                  ))}
                  {availableRides.length === 0 && <li className="py-2 text-gray-500">No rides available</li>}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/admin/users" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Manage Users</a>
              <a href="/admin/drivers" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Manage Drivers</a>
              <a href="/admin-autoshare" className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">Refresh Dashboard</a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [driverToken, setDriverToken] = useState(localStorage.getItem("driverToken"));
  const [driverProfileCompleted, setDriverProfileCompleted] = useState(null);
  const [driverEmail, setDriverEmail] = useState("");

  React.useEffect(() => {
    if (driverToken) {
      try {
        const payload = JSON.parse(atob(driverToken.split('.')[1]));
        setDriverEmail(payload.email ? payload.email.toLowerCase() : "");
      } catch {
        setDriverEmail("");
      }
    }
  }, [driverToken]);

  React.useEffect(() => {
    async function fetchProfile() {
      const path = window.location.pathname || '';
      if (driverEmail && path.startsWith('/driver')) {
        const res = await fetch(`/api/auth/driver-profile/${driverEmail}`);
        if (res.ok) {
          const data = await res.json();
          setDriverProfileCompleted(!!data.driverProfileCompleted);
        } else {
          setDriverProfileCompleted(null);
        }
      }
    }
    fetchProfile();
  }, [driverEmail]);

  // No-op: admin auth is derived from localStorage per render

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {(() => {
          const path = window.location.pathname;
          const isAdminPage = path === '/admin-login' || path === '/admin-autoshare' || path.startsWith('/admin/');
          return !isAdminPage;
        })() && <Navbar token={token} setToken={setToken} driverToken={driverToken} setDriverToken={setDriverToken} />}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={setToken} />
                )
              }
            />
            <Route
              path="/register"
              element={
                token ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Register />
                )
              }
            />
            <Route path="/signup" element={<Navigate to="/register" />} />
            <Route
              path="/dashboard"
              element={
                token ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/booking"
              element={
                token ? (
                  <Booking />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                token ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/ride-status"
              element={
                token ? (
                  <RideStatus />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/driver-login"
              element={
                driverToken ? (
                  <Navigate to="/driver/dashboard" />
                ) : (
                  <DriverLogin setDriverToken={setDriverToken} />
                )
              }
            />
            <Route
              path="/driver/dashboard"
              element={
                driverToken ? (
                  driverProfileCompleted === false ? (
                    <DriverProfileCompletion email={driverEmail} onComplete={() => setDriverProfileCompleted(true)} />
                  ) : (
                    <DriverDashboard setDriverToken={setDriverToken} />
                  )
                ) : (
                  <Navigate to="/driver-login" />
                )
              }
            />
            <Route
              path="/driver/profile"
              element={
                driverToken ? (
                  <DriverProfile />
                ) : (
                  <Navigate to="/driver-login" />
                )
              }
            />
            <Route
              path="/driver/earnings"
              element={
                driverToken ? (
                  <DriverEarnings />
                ) : (
                  <Navigate to="/driver-login" />
                )
              }
            />
            <Route
              path="/driver-register"
              element={<DriverRegister />}
            />
            <Route
              path="/contact"
              element={<ContactUs />}
            />
            <Route
              path="/safety"
              element={<Safety />}
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/admin/users"
              element={
                localStorage.getItem('adminToken') ? (
                  <UserManagement />
                ) : (
                  <Navigate to="/admin-login" />
                )
              }
            />
            <Route
              path="/admin/drivers"
              element={
                localStorage.getItem('adminToken') ? (
                  <DriverManagement />
                ) : (
                  <Navigate to="/admin-login" />
                )
              }
            />
            <Route
              path="/admin-autoshare"
              element={
                localStorage.getItem('adminToken') ? (
                  <AdminHome />
                ) : (
                  <Navigate to="/admin-login" />
                )
              }
            />
            <Route
              path="/admin-login"
              element={<AdminLogin />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Booking from "./components/Booking";
import Profile from "./components/Profile";
import DriverDashboard from "./components/DriverDashboard";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import ContactUs from "./components/ContactUs";
import Safety from "./components/Safety";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar token={token} setToken={setToken} />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              }
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
              path="/driver"
              element={<DriverDashboard />}
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
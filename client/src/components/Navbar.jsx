import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
    setMenuOpen(false);
  };

  // Only show minimal navbar on driver pages
  const isDriverPage = location.pathname.startsWith("/driver");

  const navLinks = token ? [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/booking", label: "Booking" },
    { to: "/profile", label: "Profile" },
    { to: "/contact", label: "Contact" },
  ] : [
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-white/60 backdrop-blur-md shadow sticky top-0 z-50 border-b border-white/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 py-3">
        <div className={`text-2xl font-bold tracking-wide ${isDriverPage ? 'text-green-700' : 'text-red-600 hover:text-red-700 transition-colors duration-200'}`}>
          <Link to="/">AutoSharePolling{isDriverPage ? ' Driver' : ''}</Link>
        </div>
        {/* Desktop Links */}
        {!isDriverPage && (
          <div className="hidden md:flex flex-row items-center space-x-2 md:space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {token && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded shadow transition-all duration-200 hover:bg-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
              >
                Logout
              </button>
            )}
          </div>
        )}
        {/* Hamburger for Mobile */}
        {!isDriverPage && (
          <button
            className="md:hidden text-2xl text-blue-700 focus:outline-none ml-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
        {/* Driver Logout button (always visible on driver page) */}
        {isDriverPage && token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded shadow transition-all duration-200 hover:bg-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
          >
            Logout
          </button>
        )}
      </div>
      {/* Mobile Menu */}
      {!isDriverPage && menuOpen && (
        <div className="md:hidden bg-white/95 shadow-lg border-b border-white/30 animate-fade-in px-4 py-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-blue-700 font-semibold text-lg px-2 py-2 rounded hover:bg-yellow-100 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {token && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
      <style>{`
        .nav-underline::after {
          content: '';
          display: block;
          width: 0;
          height: 2px;
          background: #2563eb;
          transition: width 0.3s;
          border-radius: 2px;
          margin: 0 auto;
        }
        .nav-underline:hover::after, .nav-underline:focus::after {
          width: 100%;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s; }
      `}</style>
    </nav>
  );
}

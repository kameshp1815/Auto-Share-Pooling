import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white/60 backdrop-blur-md shadow sticky top-0 z-50 border-b border-white/30">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between px-6 py-3">
        <div className="text-2xl font-bold tracking-wide text-red-600 hover:text-red-700 transition-colors duration-200">
          <Link to="/">AutoSharePolling</Link>
        </div>
        <div className="flex flex-row items-center space-x-2 md:space-x-6">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Dashboard
              </Link>
              <Link
                to="/booking"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Booking
              </Link>
              <Link
                to="/profile"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Profile
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Contact
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded shadow transition-all duration-200 hover:bg-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-green-600 font-medium relative transition-all duration-200 hover:text-green-800 focus:text-green-800 nav-underline px-2 py-1"
              >
                Register
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 font-medium relative transition-all duration-200 hover:text-blue-800 focus:text-blue-800 nav-underline px-2 py-1"
              >
                Contact
              </Link>
            </>
          )}
        </div>
      </div>
      <style>{`
        .nav-underline::after {
          content: '';
          display: block;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #2563eb 0%, #f59e42 100%);
          transition: width 0.3s;
          border-radius: 2px;
          margin: 0 auto;
        }
        .nav-underline:hover::after, .nav-underline:focus::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}

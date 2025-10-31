import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const location = useLocation();
  const storedEmail = (typeof window !== 'undefined' && localStorage.getItem('adminEmail')) || 'admin';
  const adminEmail = storedEmail;
  const adminName = storedEmail.includes('@') ? storedEmail.split('@')[0] : storedEmail;
  return (
    <nav className="w-full bg-gray-900 text-white shadow-lg px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-yellow-400">Admin Panel</div>
      <div className="flex items-center gap-6">
        <Link
          to="/admin-autoshare"
          className={`font-semibold hover:text-yellow-400 transition ${location.pathname === "/admin-autoshare" ? "text-yellow-400 underline" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin/rides"
          className={`font-semibold hover:text-yellow-400 transition ${location.pathname === "/admin/rides" ? "text-yellow-400 underline" : ""}`}
        >
          Rides
        </Link>
        <Link
          to="/admin/groups"
          className={`font-semibold hover:text-yellow-400 transition ${location.pathname === "/admin/groups" ? "text-yellow-400 underline" : ""}`}
        >
          Groups
        </Link>
        <Link
          to="/admin/users"
          className={`font-semibold hover:text-yellow-400 transition ${location.pathname === "/admin/users" ? "text-yellow-400 underline" : ""}`}
        >
          User Management
        </Link>
        <Link
          to="/admin/drivers"
          className={`font-semibold hover:text-yellow-400 transition ${location.pathname === "/admin/drivers" ? "text-yellow-400 underline" : ""}`}
        >
          Driver Management
        </Link>
        <div className="hidden sm:flex items-center gap-2 ml-4 text-sm text-gray-300">
          <span className="inline-block px-2 py-1 rounded bg-gray-800 border border-gray-700">{adminName}</span>
          <span className="text-gray-500">({adminEmail})</span>
        </div>
      </div>
    </nav>
  );
}
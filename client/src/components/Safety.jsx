import React from "react";
import { FaShieldAlt, FaUserCheck, FaShareAlt, FaHeadset, FaMapMarkedAlt, FaPumpSoap, FaBell } from "react-icons/fa";

export default function Safety() {
  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-xl">
      {/* Hero Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-yellow-100 rounded-full p-4 shadow">
          <FaShieldAlt className="text-yellow-500 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-700 mb-1">Your Safety is Our Priority</h1>
          <p className="text-gray-600 font-medium">We are committed to providing a safe and secure ride experience for every user.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 mb-8">
        <div className="flex items-start gap-3">
          <FaUserCheck className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Verified Drivers</div>
            <div className="text-gray-600 text-sm">All drivers are background-checked and verified for your safety.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaShareAlt className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Share Your Ride</div>
            <div className="text-gray-600 text-sm">Easily share your ride details with trusted contacts in real time.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaHeadset className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">24/7 Support</div>
            <div className="text-gray-600 text-sm">Our support team is available around the clock for any assistance.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaMapMarkedAlt className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Live Ride Tracking</div>
            <div className="text-gray-600 text-sm">Track your ride in real time for peace of mind and transparency.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaPumpSoap className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Hygiene First</div>
            <div className="text-gray-600 text-sm">Mask and sanitizer recommended for all rides to ensure hygiene.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaBell className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Emergency SOS</div>
            <div className="text-gray-600 text-sm">Use the in-app SOS button for immediate help in emergencies.</div>
          </div>
        </div>
      </div>
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl flex items-center gap-4 shadow">
        <FaHeadset className="text-yellow-500 text-3xl" />
        <div className="text-gray-700 text-lg font-semibold">
          For emergencies, call our helpline: <span className="font-bold text-yellow-700">1800-123-4567</span>
        </div>
      </div>
    </div>
  );
} 
import React from "react";
import { useNavigate } from "react-router-dom";
import autoImg from "../assets/auto.png";

export default function NotFound() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4">
      {/* App Name */}
      <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-4 tracking-tight text-center w-full">AutoShare</div>
      {/* Illustration: Road, Auto, Crash */}
      <div className="relative flex flex-col items-center mb-8 w-full" style={{ minHeight: 80 }}>
        {/* SVG Road */}
        <svg className="w-full max-w-[400px] h-auto" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="30" width="260" height="20" rx="10" fill="#e5e7eb" />
          <rect x="10" y="38" width="40" height="4" rx="2" fill="#facc15" />
          <rect x="60" y="38" width="40" height="4" rx="2" fill="#facc15" />
          <rect x="110" y="38" width="40" height="4" rx="2" fill="#facc15" />
          <rect x="160" y="38" width="40" height="4" rx="2" fill="#facc15" />
          <rect x="210" y="38" width="40" height="4" rx="2" fill="#facc15" />
        </svg>
        {/* Auto Rickshaw - animated */}
        <img
          src={autoImg}
          alt="Auto Accident"
          className="w-24 sm:w-28 h-16 sm:h-20 object-contain absolute left-1/2 top-2 -translate-x-1/2 rotate-[-30deg] drop-shadow-lg animate-auto-slide-shake"
          style={{ zIndex: 2 }}
        />
        {/* Crash Effect (cartoon bang/star) - animated */}
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 animate-crash-pulse" width="40" height="40" viewBox="0 0 48 48" fill="none">
          <polygon points="24,2 28,16 44,12 32,24 44,36 28,32 24,46 20,32 4,36 16,24 4,12 20,16" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
        </svg>
      </div>
      {/* 404 and Button */}
      <div className="text-4xl sm:text-5xl font-extrabold text-yellow-400 mb-2 tracking-tight text-center w-full">404</div>
      <button
        className="bg-blue-500 text-white py-3 px-8 rounded-lg font-bold shadow-md hover:bg-blue-600 transition-all text-lg w-full max-w-xs mx-auto"
        onClick={() => navigate(token ? "/dashboard" : "/login")}
      >
        {token ? "Go to Dashboard" : "Go to Login"}
      </button>
      <style>{`
        @keyframes auto-slide-shake {
          0% { transform: translateX(-180px) rotate(-30deg); }
          60% { transform: translateX(0) rotate(-30deg); }
          70% { transform: translateX(0) rotate(-33deg); }
          80% { transform: translateX(0) rotate(-27deg); }
          90% { transform: translateX(0) rotate(-32deg); }
          100% { transform: translateX(0) rotate(-30deg); }
        }
        .animate-auto-slide-shake {
          animation: auto-slide-shake 1.2s cubic-bezier(0.68,-0.55,0.27,1.55) 1;
        }
        @keyframes crash-pulse {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
          50% { transform: scale(1.25) translate(-50%, -50%); opacity: 0.7; }
        }
        .animate-crash-pulse {
          animation: crash-pulse 1.2s cubic-bezier(0.68,-0.55,0.27,1.55) 1.1s 2;
        }
      `}</style>
    </div>
  );
} 
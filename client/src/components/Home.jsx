import React from "react";
import { useNavigate } from "react-router-dom";
import autoLogo from "../assets/auto.png";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background: 'radial-gradient(ellipse at 60% 10%, #fef08a 0%, #fef9c3 40%, #bae6fd 100%)'}}>
      {/* Enhanced decorative background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200 rounded-full opacity-40 blur-3xl -z-10 animate-float1" style={{top: '-8rem', left: '-8rem'}}></div>
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-blue-200 rounded-full opacity-40 blur-3xl -z-10 animate-float2" style={{bottom: '-10rem', right: '-10rem'}}></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-green-200 rounded-full opacity-30 blur-2xl -z-10 animate-float3" style={{top: '40%', left: '-6rem'}}></div>
      <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-yellow-300 rounded-full opacity-20 blur-2xl -z-10 animate-float4" style={{bottom: '30%', right: '-4rem'}}></div>
      {/* Subtle pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10 -z-10" style={{pointerEvents: 'none'}}>
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2" fill="#fde68a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div className="max-w-lg w-full bg-white/95 rounded-2xl shadow-2xl p-8 border border-yellow-100/60 text-center relative z-10">
        <img src={autoLogo} alt="AutoSharePolling Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg rounded-full border-4 border-yellow-300 bg-white" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-700 mb-2 tracking-tight drop-shadow">Welcome to AutoSharePolling</h1>
        <p className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">Your ride, your way!</p>
        <p className="text-gray-700 mb-8 text-base sm:text-lg">
          Fast, safe, and reliable rides at your fingertips.<br/>
          Please choose your login type to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <button
            className="w-full sm:w-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 rounded-xl font-extrabold shadow-lg hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={() => navigate("/login")}
          >
            User Login
          </button>
          <button
            className="w-full sm:w-1/2 bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-extrabold shadow-lg hover:from-green-500 hover:to-green-400 hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => navigate("/driver-login")}
          >
            Driver Login
          </button>
          <button
            className="w-full sm:w-1/2 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-xl font-extrabold shadow-lg hover:from-gray-900 hover:to-black hover:scale-105 transition-all text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-600"
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </button>
        </div>
      </div>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(30px) scale(1.04); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(-20px) scale(1.07); }
        }
        .animate-float1 { animation: float1 7s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
        .animate-float3 { animation: float3 9s ease-in-out infinite; }
        .animate-float4 { animation: float4 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 
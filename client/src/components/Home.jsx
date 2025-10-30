import React from "react";
import { useNavigate } from "react-router-dom";
import autoLogo from "../assets/auto.png";
import taxiImg from "../assets/taxi.png";
import driverImg from "../assets/driver.png";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden" style={{background: 'radial-gradient(ellipse at 60% 10%, #fef08a 0%, #fef9c3 40%, #bae6fd 100%)'}}>
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
      <section className="w-full px-4 pt-20 pb-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Left: text + CTAs */}
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 mb-4">
              Share rides. Save money.
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Go greener every day.</span>
            </h1>
            <p className="text-gray-700 text-base sm:text-lg mb-8 max-w-xl">
              Smart, safe and affordable daily commute. Join as a rider or become a driver and start earning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5">
              <button
                className="sm:w-auto w-full px-6 py-3 rounded-xl text-white font-bold shadow-lg bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] transition"
                onClick={() => navigate('/login')}
              >User Login</button>
              <button
                className="sm:w-auto w-full px-6 py-3 rounded-xl text-white font-bold shadow-lg bg-green-600 hover:bg-green-700 hover:scale-[1.02] transition"
                onClick={() => navigate('/driver-login')}
              >Driver Login</button>
              <button
                className="sm:w-auto w-full px-6 py-3 rounded-xl text-white font-bold shadow-lg bg-gray-800 hover:bg-black hover:scale-[1.02] transition"
                onClick={() => navigate('/admin-login')}
              >Admin Login</button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-white/80 border border-white/60 px-3 py-1 rounded-full shadow">✔ Verified Drivers</span>
              <span className="bg-white/80 border border-white/60 px-3 py-1 rounded-full shadow">✔ Live Ride Status</span>
              <span className="bg-white/80 border border-white/60 px-3 py-1 rounded-full shadow">✔ Secure Payments</span>
            </div>
          </div>

          {/* Right: imagery */}
          <div className="relative hidden md:block">
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-gradient-to-br from-yellow-200 to-blue-200 rounded-full blur-2xl opacity-60"></div>
            <img src={taxiImg} alt="Ride Preview" className="relative w-full max-w-md mx-auto drop-shadow-2xl rounded-2xl border border-white/70" />
            <img src={driverImg} alt="Driver Ready" className="w-40 absolute -bottom-6 -left-6 rotate-[-6deg] drop-shadow-xl rounded-xl border border-white/80" />
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center mb-6">Why choose us?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60">
              <div className="text-3xl mb-2">💸</div>
              <div className="font-bold text-gray-900 mb-1">Affordable</div>
              <p className="text-gray-600 text-sm">Share rides, split fares, and save more on every trip.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="font-bold text-gray-900 mb-1">Safe</div>
              <p className="text-gray-600 text-sm">Verified drivers and real-time status for peace of mind.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-bold text-gray-900 mb-1">Fast</div>
              <p className="text-gray-600 text-sm">Smart matching to get you on the road quickly.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60">
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-bold text-gray-900 mb-1">Eco-friendly</div>
              <p className="text-gray-600 text-sm">Reduce your carbon footprint by sharing rides.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-800 text-center mb-6">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60 text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <div className="font-bold text-gray-900 mb-1">Sign up</div>
              <p className="text-gray-600 text-sm">Create your account as a rider or a driver.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60 text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <div className="font-bold text-gray-900 mb-1">Match</div>
              <p className="text-gray-600 text-sm">Enter your route and we’ll find the best shared ride.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow p-5 border border-white/60 text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <div className="font-bold text-gray-900 mb-1">Go</div>
              <p className="text-gray-600 text-sm">Track your ride and arrive safely and affordably.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
          <div className="bg-green-50/80 border border-green-200 text-green-800 rounded-xl p-4 text-center font-semibold">24/7 Support</div>
          <div className="bg-yellow-50/80 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-center font-semibold">Live Ride Status</div>
          <div className="bg-blue-50/80 border border-blue-200 text-blue-800 rounded-xl p-4 text-center font-semibold">Secure Payments</div>
        </div>
      </section>

      <section className="w-full px-4 pb-20">
        <div className="max-w-6xl mx-auto bg-white/90 rounded-2xl border border-white/70 shadow p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Ready to ride smarter?</h3>
              <p className="text-gray-600">Join thousands choosing safer, faster, and greener commutes.</p>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow hover:bg-blue-700 hover:scale-105 transition"
                onClick={() => navigate('/register')}
              >Get Started</button>
              <button
                className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold shadow hover:bg-green-700 hover:scale-105 transition"
                onClick={() => navigate('/driver-register')}
              >Become a Driver</button>
            </div>
          </div>
        </div>
      </section>
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
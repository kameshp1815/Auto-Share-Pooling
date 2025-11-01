import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiLock, FiMail, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    axios.post(`${API_BASE_URL}/api/auth/admin-login`, { email, password })
      .then(({ data }) => {
        const token = data.token || 'true';
        localStorage.setItem('adminToken', token);
        if (data.email) localStorage.setItem('adminEmail', data.email);
        setSuccess("Login successful! Redirecting to admin dashboard...");
        // Immediate SPA redirect
        navigate('/admin-autoshare', { replace: true });
        // Hard redirect fallback (in case of routing edge cases)
        setTimeout(() => { if (window.location.pathname !== '/admin-autoshare') window.location.href = '/admin-autoshare'; }, 300);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || 'Invalid admin credentials';
        setError(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10" style={{background: 'radial-gradient(ellipse at 60% 10%, #e5e7eb 0%, #f8fafc 50%, #e5e7eb 100%)'}}>
      {/* Decorative background */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200 rounded-full opacity-40 blur-3xl -z-10"></div>
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-violet-200 rounded-full opacity-40 blur-3xl -z-10"></div>
      <svg className="absolute inset-0 w-full h-full opacity-10 -z-10" style={{pointerEvents:'none'}}>
        <defs>
          <pattern id="dots-admin" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2" fill="#a5b4fc" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-admin)" />
      </svg>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel: Promo/branding */}
        <div className="hidden md:flex flex-col justify-center bg-white/70 backdrop-blur rounded-2xl border border-indigo-100 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
              <FiShield className="text-lg" /> Secure Admin
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Manage AutoSharePolling with confidence</h2>
          <p className="text-gray-600 mb-6">Access analytics, moderate drivers, and keep your platform safe. Only authorized administrators can proceed.</p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 bg-indigo-500 rounded-full"></span><span>Review user and driver activity in real-time.</span></li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 bg-indigo-500 rounded-full"></span><span>Approve driver profiles and documents.</span></li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 bg-indigo-500 rounded-full"></span><span>Oversee rides and payments securely.</span></li>
          </ul>
          <div className="mt-8 text-sm text-gray-500">Tip: Ensure you’re on a secure network before logging in.</div>
        </div>

        {/* Right panel: Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <FiLock /> Admin Access
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-3 text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-1">Sign in with authorized credentials</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-center">{error}</div>}
            {success && <div className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-center">{success}</div>}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiMail /></span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 disabled:opacity-70"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none"><FiLock /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 disabled:opacity-70"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
                <span>Secure session</span>
              </div>
              <span className="text-gray-500">Need help? <a href="#" className="text-indigo-600 hover:underline">Contact support</a></span>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow hover:bg-indigo-700 transition-all mt-1 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting && !error ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <Link to="/" className="hover:underline">← Back to Home</Link>
            <div className="flex gap-3">
              <Link to="/login" className="hover:underline">User Login</Link>
              <span className="text-gray-300">|</span>
              <Link to="/driver-login" className="hover:underline">Driver Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



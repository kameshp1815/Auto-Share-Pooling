import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import autoLogo from "../assets/auto.png";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      onLogin && onLogin(data.token);
      navigate("/dashboard");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200">
      <div className="relative w-full max-w-md">
        {/* Floating Logo */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
          <div className="w-24 h-24 bg-white rounded-full shadow-xl border-4 border-yellow-300 flex items-center justify-center">
            <img src={autoLogo} alt="AutoSharePolling Logo" className="w-16 h-16 drop-shadow-lg" />
          </div>
        </div>
        {/* Card */}
        <div className="bg-white/95 pt-20 pb-10 px-8 rounded-3xl shadow-2xl border border-yellow-100/60 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-2 text-yellow-600 tracking-tight text-center">Welcome Back!</h2>
          <p className="mb-6 text-gray-500 text-center">Login to AutoSharePolling</p>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {error && <div className="mb-2 text-red-500 text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2">{error}</div>}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder-gray-400 bg-gray-50 shadow-sm"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder-gray-400 bg-gray-50 shadow-sm"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 rounded-xl font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition-all text-lg mt-2 tracking-wide" type="submit">
              Login
            </button>
          </form>
          <div className="mt-8 text-gray-600 text-sm text-center">
            Don't have an account?{' '}
            <Link to="/register" className="inline-block bg-yellow-100 text-yellow-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-200 transition-all ml-1">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
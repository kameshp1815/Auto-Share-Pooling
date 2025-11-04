import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import autoLogo from "../assets/auto.png";
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from "../config/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      try {
        const payloadPart = data.token.split('.')[1];
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(base64));
        const userEmail = json.email || json.userEmail || json.user?.email || json.sub || "";
        if (userEmail) {
          localStorage.setItem("userEmail", userEmail);
        }
      } catch {}
      onLogin && onLogin(data.token);
      navigate("/dashboard");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4 py-6">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 border border-yellow-100/60">
        <img src={autoLogo} alt="Login Logo" className="w-16 h-16 sm:w-20 sm:h-20 mb-4 drop-shadow-lg rounded-full border-4 border-yellow-300 bg-white mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-yellow-700 tracking-tight text-center">Login</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5">
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
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="mt-4 flex flex-col items-center">
          <GoogleLogin
            onSuccess={credentialResponse => {
              fetch(`${API_BASE_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
              })
                .then(res => res.json())
                .then(data => {
                  if (data.token) {
                    localStorage.setItem("token", data.token);
                    try {
                      const payloadPart = data.token.split('.')[1];
                      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
                      const json = JSON.parse(atob(base64));
                      const userEmail = json.email || json.userEmail || json.user?.email || json.sub || "";
                      if (userEmail) {
                        localStorage.setItem("userEmail", userEmail);
                      }
                    } catch {}
                    onLogin && onLogin(data.token);
                    navigate("/dashboard");
                  } else {
                    setError(data.message || "Google login failed");
                  }
                });
            }}
            onError={() => {
              setError("Google login failed");
            }}
          />
        </div>
        <div className="mt-6 text-gray-600 text-sm text-center">
          Don't have an account?{' '}
          <a href="/register" className="text-yellow-600 font-semibold hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}
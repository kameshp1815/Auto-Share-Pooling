import React, { useState } from "react";
import taxiLogo from "../assets/taxi.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Registration successful! You can now log in.");
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100">
      <div className="bg-white/95 p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col items-center border border-gray-200">
        <img src={taxiLogo} alt="Register Logo" className="w-20 h-20 mb-4 drop-shadow-lg rounded-full border-4 border-green-300 bg-white" />
        <h2 className="text-3xl font-extrabold mb-2 text-green-700 tracking-tight text-center">Create Account</h2>
        <p className="mb-6 text-gray-500 text-center">Register for AutoSharePolling</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {message && <div className={`mb-2 text-center font-medium ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition placeholder-gray-400 bg-gray-50"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition placeholder-gray-400 bg-gray-50"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-gradient-to-r from-green-500 to-yellow-400 text-white py-3 rounded-lg font-bold shadow-md hover:from-green-600 hover:to-yellow-500 transition-all text-lg mt-2" type="submit">
            Register
          </button>
        </form>
        <div className="mt-6 text-gray-600 text-sm text-center">
          Already have an account?{' '}
          <a href="/login" className="text-green-600 font-semibold hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
}
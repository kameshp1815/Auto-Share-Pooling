import React, { useEffect, useState } from "react";

export default function DriverProfile() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("driverToken");
    if (!token) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.email?.toLowerCase() || "");
    } catch {
      setEmail("");
    }
  }, []);

  useEffect(() => {
    async function load() {
      if (!email) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/auth/driver-profile/${email}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setError(e.message || "Error");
      }
      setLoading(false);
    }
    load();
  }, [email]);

  const backendOrigin = "http://localhost:5000";
  const fileToUrl = (p) => {
    if (!p) return "";
    if (p.startsWith('http')) return p;
    const trimmed = p.replace(/^[A-Za-z]:.*uploads[\\\/]*/i, 'uploads/').replace(/\\/g, '/');
    const withLeading = trimmed.startsWith('uploads/') ? `/${trimmed}` : trimmed.startsWith('/uploads/') ? trimmed : `/uploads/${trimmed}`;
    return `${backendOrigin}${withLeading}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-2 sm:px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-6 border">
        <h1 className="text-2xl font-extrabold text-green-700 mb-4">Driver Profile</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1 flex justify-center">
              {profile.profilePic ? (
                <img src={fileToUrl(profile.profilePic)} alt="Profile" className="w-32 h-32 rounded-full border-4 border-yellow-400 object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 bg-gray-200 flex items-center justify-center text-4xl text-gray-400 font-bold">
                  {(profile.name || profile.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 gap-2">
              <div><span className="font-semibold">Name:</span> {profile.name || '-'}</div>
              <div><span className="font-semibold">Email:</span> {profile.email}</div>
              <div><span className="font-semibold">Phone:</span> {profile.phone || '-'}</div>
              <div><span className="font-semibold">Approved:</span> {profile.driverApproved ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold">Banned:</span> {profile.banned ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold">License Number:</span> {profile.licenseNumber || '-'}</div>
              <div><span className="font-semibold">Vehicle:</span> {profile.vehicleMakeModel || '-'} ({profile.vehicleType || '-'})</div>
              <div><span className="font-semibold">Reg No:</span> {profile.vehicleRegNumber || '-'}</div>
            </div>
            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {profile.licenseFile && <a className="text-blue-600 underline" href={fileToUrl(profile.licenseFile)} target="_blank" rel="noreferrer">License File</a>}
              {profile.vehicleRCFile && <a className="text-blue-600 underline" href={fileToUrl(profile.vehicleRCFile)} target="_blank" rel="noreferrer">RC File</a>}
              {profile.vehicleInsuranceFile && <a className="text-blue-600 underline" href={fileToUrl(profile.vehicleInsuranceFile)} target="_blank" rel="noreferrer">Insurance File</a>}
            </div>
          </div>
        ) : (
          <div className="text-gray-600">No profile found.</div>
        )}
      </div>
    </div>
  );
}



import React, { useEffect, useState } from "react";
import { API_BASE_URL, fileUrl } from "../config/api";

function DriverDetailModal({ driver, onClose }) {
  if (!driver) return null;
  const toUrl = (p) => fileUrl(p);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Driver Details</h2>
        <div className="flex gap-4 mb-4">
          {driver.profilePic && (
            <img src={driver.profilePic.startsWith('http') ? driver.profilePic : toUrl(driver.profilePic)} alt="Profile" className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover" />
          )}
          <div>
            <div><span className="font-semibold">Name:</span> {driver.name || '-'}</div>
            <div><span className="font-semibold">Email:</span> {driver.email}</div>
            <div><span className="font-semibold">Phone:</span> {driver.phone || '-'}</div>
            <div><span className="font-semibold">Status:</span> {driver.driverProfileCompleted ? 'Active' : 'Pending'}</div>
          </div>
        </div>
        <div className="mb-2"><span className="font-semibold">License Number:</span> {driver.licenseNumber || '-'}</div>
        <div className="mb-2"><span className="font-semibold">License Expiry:</span> {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : '-'}</div>
        {driver.licenseFile && <div className="mb-2"><span className="font-semibold">License File:</span> <a href={toUrl(driver.licenseFile)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></div>}
        <div className="mb-2"><span className="font-semibold">Vehicle Type:</span> {driver.vehicleType || '-'}</div>
        <div className="mb-2"><span className="font-semibold">Vehicle Make/Model:</span> {driver.vehicleMakeModel || '-'}</div>
        <div className="mb-2"><span className="font-semibold">Vehicle Reg Number:</span> {driver.vehicleRegNumber || '-'}</div>
        <div className="mb-2"><span className="font-semibold">Vehicle Year:</span> {driver.vehicleYear || '-'}</div>
        {driver.vehicleRCFile && <div className="mb-2"><span className="font-semibold">RC File:</span> <a href={toUrl(driver.vehicleRCFile)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></div>}
        {driver.vehicleInsuranceFile && <div className="mb-2"><span className="font-semibold">Insurance File:</span> <a href={toUrl(driver.vehicleInsuranceFile)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></div>}
        {driver.vehiclePhoto && <div className="mb-2"><span className="font-semibold">Vehicle Photo:</span> <a href={toUrl(driver.vehiclePhoto)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></div>}
        <div className="mb-2"><span className="font-semibold">Emergency Contact:</span> {driver.emergencyContact?.name || '-'} ({driver.emergencyContact?.relationship || '-'}) {driver.emergencyContact?.phone || ''}</div>
        <div className="mb-2"><span className="font-semibold">Agreed to Terms:</span> {driver.agreeToTerms ? 'Yes' : 'No'}</div>
        <div className="mb-2"><span className="font-semibold">Consent for Background Check:</span> {driver.consentBackgroundCheck ? 'Yes' : 'No'}</div>
        <div className="mt-4 flex gap-2">
          {!driver.driverApproved && !driver.banned && (
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => driver.onApprove(driver.email)}>Approve</button>
          )}
          {!driver.banned ? (
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={() => driver.onBan(driver.email)}>Ban</button>
          ) : (
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" onClick={() => driver.onUnban(driver.email)}>Unban</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  async function fetchDrivers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/drivers`);
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      setError(err.message || "Error fetching drivers");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function approveDriver(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/drivers/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error('Approve failed');
      await fetchDrivers();
      if (selectedDriver && selectedDriver.email === email) setSelectedDriver({ ...selectedDriver, driverApproved: true });
    } catch (e) {
      setError(e.message || 'Approve failed');
    }
  }

  async function banDriver(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/drivers/ban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error('Ban failed');
      await fetchDrivers();
      if (selectedDriver && selectedDriver.email === email) setSelectedDriver({ ...selectedDriver, banned: true });
    } catch (e) {
      setError(e.message || 'Ban failed');
    }
  }

  async function unbanDriver(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/drivers/unban`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error('Unban failed');
      await fetchDrivers();
      if (selectedDriver && selectedDriver.email === email) setSelectedDriver({ ...selectedDriver, banned: false });
    } catch (e) {
      setError(e.message || 'Unban failed');
    }
  }

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Driver Management</h1>

        {loading ? (
          <div className="text-center text-gray-500">Loading drivers...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Approval</th>
                  <th className="py-2 px-4 border-b">Ban</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => (
                  <tr key={driver._id} className="text-center">
                    <td className="py-2 px-4 border-b">{driver.name || "-"}</td>
                    <td className="py-2 px-4 border-b">{driver.email}</td>
                    <td className="py-2 px-4 border-b">{driver.phone || "-"}</td>
                    <td className={`py-2 px-4 border-b font-semibold ${driver.driverProfileCompleted ? "text-green-600" : "text-yellow-600"}`}>{driver.driverProfileCompleted ? "Active" : "Pending"}</td>
                    <td className="py-2 px-4 border-b">{driver.driverApproved ? <span className="text-green-600 font-bold">Approved</span> : <span className="text-yellow-600 font-bold">Pending</span>}</td>
                    <td className="py-2 px-4 border-b">{driver.banned ? <span className="text-red-600 font-bold">Banned</span> : <span className="text-green-700 font-semibold">Active</span>}</td>
                    <td className="py-2 px-4 border-b flex gap-2 justify-center">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => setSelectedDriver({ ...driver, onApprove: approveDriver, onBan: banDriver, onUnban: unbanDriver })}>View</button>
                      {!driver.driverApproved && !driver.banned && (
                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => approveDriver(driver.email)}>Approve</button>
                      )}
                      {!driver.banned ? (
                        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => banDriver(driver.email)}>Ban</button>
                      ) : (
                        <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700" onClick={() => unbanDriver(driver.email)}>Unban</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DriverDetailModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </>
  );
} 
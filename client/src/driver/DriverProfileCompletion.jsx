import React, { useState } from "react";

export default function DriverProfileCompletion({ email, onComplete }) {
  const [form, setForm] = useState({
    licenseNumber: "",
    licenseExpiry: "",
    vehicleType: "",
    vehicleMakeModel: "",
    vehicleRegNumber: "",
    vehicleYear: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    agreeToTerms: false,
    consentBackgroundCheck: false,
  });
  const [files, setFiles] = useState({
    profilePic: null,
    licenseFile: null,
    vehicleRCFile: null,
    vehicleInsuranceFile: null,
    vehiclePhoto: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleFile = e => {
    setFiles(f => ({ ...f, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation
    if (!files.profilePic || !form.licenseNumber || !form.licenseExpiry || !files.licenseFile || !form.vehicleType || !form.vehicleMakeModel || !form.vehicleRegNumber || !form.vehicleYear || !files.vehicleRCFile || !files.vehicleInsuranceFile || !form.emergencyContactName || !form.emergencyContactRelationship || !form.emergencyContactPhone || !form.agreeToTerms || !form.consentBackgroundCheck) {
      setError("Please fill all required fields and upload all required documents.");
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append("email", email);
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    Object.entries(files).forEach(([k, v]) => v && data.append(k, v));
    try {
      const res = await fetch("/api/auth/driver-profile/complete", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess("Profile completed successfully!");
        onComplete && onComplete();
      } else {
        setError(result.message || "Failed to complete profile");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  // Add a function to check if all required fields are filled
  const isFormValid = () => {
    return (
      files.profilePic &&
      form.licenseNumber &&
      form.licenseExpiry &&
      files.licenseFile &&
      form.vehicleType &&
      form.vehicleMakeModel &&
      form.vehicleRegNumber &&
      form.vehicleYear &&
      files.vehicleRCFile &&
      files.vehicleInsuranceFile &&
      form.emergencyContactName &&
      form.emergencyContactRelationship &&
      form.emergencyContactPhone &&
      form.agreeToTerms &&
      form.consentBackgroundCheck
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100 px-2 py-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-10 border border-green-100/60 flex flex-col gap-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-green-700 tracking-tight text-center">Complete Your Driver Profile</h2>
        {error && <div className="mb-2 text-red-500 text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2">{error}</div>}
        {success && <div className="mb-2 text-green-600 text-center font-medium bg-green-50 border border-green-200 rounded-lg py-2">{success}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Profile Photo *</label>
            <input type="file" name="profilePic" accept="image/*" onChange={handleFile} required className="border rounded p-2" placeholder="Upload Profile Photo (JPG, PNG)" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Driver’s License *</label>
            <input type="text" name="licenseNumber" placeholder="License Number" value={form.licenseNumber} onChange={handleChange} required className="border rounded p-2" />
            <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} required className="border rounded p-2" />
            <label className="font-medium mt-2">Upload Driver’s License *</label>
            <input type="file" name="licenseFile" accept="image/*,application/pdf" onChange={handleFile} required className="border rounded p-2" placeholder="Upload Driver’s License (PDF, JPG, PNG)" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Vehicle Info *</label>
            <input type="text" name="vehicleType" placeholder="Vehicle Type (Car, Van, etc.)" value={form.vehicleType} onChange={handleChange} required className="border rounded p-2" />
            <input type="text" name="vehicleMakeModel" placeholder="Make & Model" value={form.vehicleMakeModel} onChange={handleChange} required className="border rounded p-2" />
            <input type="text" name="vehicleRegNumber" placeholder="Registration Number" value={form.vehicleRegNumber} onChange={handleChange} required className="border rounded p-2" />
            <input type="text" name="vehicleYear" placeholder="Year" value={form.vehicleYear} onChange={handleChange} required className="border rounded p-2" />
            <label className="font-medium mt-2">Vehicle Registration Certificate (RC) *</label>
            <input type="file" name="vehicleRCFile" accept="image/*,application/pdf" onChange={handleFile} required className="border rounded p-2" placeholder="Upload Vehicle Registration Certificate (RC) (PDF, JPG, PNG)" />
            <label className="font-medium mt-2">Vehicle Insurance *</label>
            <input type="file" name="vehicleInsuranceFile" accept="image/*,application/pdf" onChange={handleFile} required className="border rounded p-2" placeholder="Upload Vehicle Insurance (PDF, JPG, PNG)" />
            <label className="font-medium mt-2">Vehicle Photo (optional)</label>
            <input type="file" name="vehiclePhoto" accept="image/*" onChange={handleFile} className="border rounded p-2" placeholder="Upload Vehicle Photo (JPG, PNG) - Optional" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Emergency Contact *</label>
            <input type="text" name="emergencyContactName" placeholder="Name" value={form.emergencyContactName} onChange={handleChange} required className="border rounded p-2" />
            <input type="text" name="emergencyContactRelationship" placeholder="Relationship" value={form.emergencyContactRelationship} onChange={handleChange} required className="border rounded p-2" />
            <input type="text" name="emergencyContactPhone" placeholder="Phone Number" value={form.emergencyContactPhone} onChange={handleChange} required className="border rounded p-2" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={handleChange} required />
            I agree to the Terms & Conditions *
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="consentBackgroundCheck" checked={form.consentBackgroundCheck} onChange={handleChange} required />
            I consent to a background check *
          </label>
        </div>
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-bold shadow-md transition-all text-lg mt-2
            ${isFormValid() && !loading
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer opacity-100'
              : 'bg-red-500 text-white opacity-50 cursor-not-allowed'}`}
          disabled={loading || !isFormValid()}
        >
          {loading ? "Submitting..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
} 
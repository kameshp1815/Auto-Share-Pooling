import React from "react";
import { FaUserSecret, FaLock, FaExchangeAlt, FaRegCheckCircle } from "react-icons/fa";

export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 mt-6 sm:mt-8 bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-yellow-100 rounded-full p-4 shadow">
          <FaUserSecret className="text-yellow-500 text-4xl" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-700 mb-1">Privacy Policy</h1>
          <p className="text-gray-600 font-medium">Your privacy is important to us. Please review our policy below.</p>
        </div>
      </div>
      <div className="space-y-6 mt-6 mb-8">
        <div className="flex items-start gap-3">
          <FaLock className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Data Security</div>
            <div className="text-gray-600 text-sm">We use industry-standard measures to protect your personal data.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaExchangeAlt className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Data Usage</div>
            <div className="text-gray-600 text-sm">Your information is used only to provide and improve our services.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaRegCheckCircle className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">User Control</div>
            <div className="text-gray-600 text-sm">You can access, update, or delete your data at any time.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaUserSecret className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">No Third-Party Sharing</div>
            <div className="text-gray-600 text-sm">We do not sell or share your data with third parties without consent.</div>
          </div>
        </div>
      </div>
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl flex items-center gap-4 shadow">
        <FaLock className="text-yellow-500 text-3xl" />
        <div className="text-gray-700 text-lg font-semibold">
          For privacy questions, contact our support team. Your trust matters to us.
        </div>
      </div>
    </div>
  );
} 
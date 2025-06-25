import React from "react";
import { FaGavel, FaUserShield, FaHandshake, FaRegCheckCircle } from "react-icons/fa";

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 mt-6 sm:mt-8 bg-white/90 rounded-2xl shadow-2xl border border-yellow-100/60 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="bg-yellow-100 rounded-full p-4 shadow mb-2 sm:mb-0">
          <FaGavel className="text-yellow-500 text-4xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-yellow-700 mb-1">Terms of Service</h1>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Please read these terms carefully before using AutoSharePolling.</p>
        </div>
      </div>
      <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 mb-6 sm:mb-8">
        <div className="flex items-start gap-3">
          <FaUserShield className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">User Responsibilities</div>
            <div className="text-gray-600 text-sm">You agree to provide accurate information and use the service lawfully.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaHandshake className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Fair Use</div>
            <div className="text-gray-600 text-sm">Do not misuse the platform or engage in fraudulent activities.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaRegCheckCircle className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Service Availability</div>
            <div className="text-gray-600 text-sm">We strive for uptime but do not guarantee uninterrupted service.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FaGavel className="text-yellow-500 text-2xl mt-1" />
          <div>
            <div className="font-semibold text-gray-800">Legal Compliance</div>
            <div className="text-gray-600 text-sm">You must comply with all applicable laws and regulations.</div>
          </div>
        </div>
      </div>
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl flex items-center gap-4 shadow">
        <FaGavel className="text-yellow-500 text-3xl" />
        <div className="text-gray-700 text-lg font-semibold">
          By using AutoSharePolling, you agree to these terms. For questions, contact support.
        </div>
      </div>
    </div>
  );
}

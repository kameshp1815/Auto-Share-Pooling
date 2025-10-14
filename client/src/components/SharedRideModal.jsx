import React from 'react';
import { FaTimes, FaUsers, FaMoneyBillWave, FaCheck, FaTimesCircle } from 'react-icons/fa';

export default function SharedRideModal({ isOpen, onClose, onAccept, onDecline, originalFare, discountedFare }) {
  if (!isOpen) return null;

  // Calculate savings
  const originalFareValue = parseFloat(originalFare?.replace('₹', '') || 0);
  const discountedFareValue = parseFloat(discountedFare?.replace('₹', '') || 0) || Math.round(originalFareValue * 0.8);
  const savingsAmount = originalFareValue - discountedFareValue;
  const savingsPercentage = Math.round((savingsAmount / originalFareValue) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaUsers className="text-3xl text-yellow-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shared Ride Available!</h2>
          <p className="text-gray-600 mt-1">Save money by sharing your ride</p>
        </div>

        {/* Savings Information */}
        <div className="bg-yellow-50 rounded-2xl p-4 mb-6 border border-yellow-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">Original Fare:</span>
            <span className="text-gray-800 font-bold">{originalFare || `₹${originalFareValue}`}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">Discounted Fare:</span>
            <span className="text-green-600 font-bold">{discountedFare || `₹${discountedFareValue}`}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-yellow-200">
            <span className="text-gray-700 font-semibold">Your Savings:</span>
            <div className="flex items-center">
              <FaMoneyBillWave className="text-green-500 mr-1" />
              <span className="text-green-600 font-bold">₹{savingsAmount.toFixed(0)} ({savingsPercentage}% off)</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefits of Sharing</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Save money on your ride</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Reduce carbon footprint</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Meet new people in your area</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <FaTimesCircle />
            <span>No Thanks</span>
          </button>
          <button
            onClick={onAccept}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-bold shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200"
          >
            <FaCheck />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
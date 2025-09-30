import React from "react";
import { useNavigate } from "react-router-dom";
import autoImg from "../assets/taxi.png";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-2 sm:px-8 py-8 sm:py-16 md:py-24">
        <div className="flex-1 flex flex-col items-start justify-center mb-8 md:mb-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-red-600 mb-4 sm:mb-6 leading-tight drop-shadow">
            Book Your <span className="text-yellow-500">Auto</span> Instantly!
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8">
            Fast, safe, and reliable rides at your fingertips. Experience the new way to travel with AutoSharePolling.
          </p>
          <button
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-2xl font-bold shadow-lg transition-all duration-200"
            onClick={() => navigate("/booking")}
          >
            Book a Ride
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={autoImg}
            alt="Taxi"
            className="w-40 h-40 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] object-contain animate-bounce-slow"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-8 sm:py-12 md:py-20 bg-white bg-opacity-80">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-blue-700 mb-6 sm:mb-10">Why Choose AutoSharePolling?</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 px-2 sm:px-4">
          <div className="flex flex-col items-center w-full sm:w-auto">
            <img src="https://cdn-icons-png.flaticon.com/512/854/854894.png" alt="Easy Booking" className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Easy Booking</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">Book your ride in seconds with our user-friendly interface.</p>
          </div>
          <div className="flex flex-col items-center w-full sm:w-auto">
            <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="Safe Rides" className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Safe & Reliable</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">All drivers are verified and rides are tracked for your safety.</p>
          </div>
          <div className="flex flex-col items-center w-full sm:w-auto">
            <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Affordable" className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Affordable Fares</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">Enjoy competitive pricing with no hidden charges.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-8 sm:py-12 md:py-20 bg-gradient-to-r from-blue-50 to-yellow-50">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-red-600 mb-6 sm:mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 px-2 sm:px-4">
          <div className="flex flex-col items-center w-full sm:w-auto">
            <div className="bg-red-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-red-600">1</div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Sign Up / Login</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">Create your account or log in to get started.</p>
          </div>
          <div className="flex flex-col items-center w-full sm:w-auto">
            <div className="bg-yellow-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-yellow-600">2</div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Book Your Ride</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">Choose your pickup and drop locations and book instantly.</p>
          </div>
          <div className="flex flex-col items-center w-full sm:w-auto">
            <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4 text-lg sm:text-2xl font-bold text-blue-600">3</div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Enjoy the Journey</h3>
            <p className="text-gray-600 text-center max-w-xs text-sm sm:text-base">Sit back, relax, and enjoy your ride with AutoSharePolling.</p>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>
        {`
          .animate-bounce-slow {
            animation: bounce 2.5s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-20px);}
          }
        `}
      </style>
    </div>
  );
}
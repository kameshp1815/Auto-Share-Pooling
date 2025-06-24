// Requires: npm install react-icons axios
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaExchangeAlt, FaHome, FaBriefcase, FaMotorcycle, FaCarSide, FaTaxi } from "react-icons/fa";


const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export default function Booking() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState("auto");
  const [fare, setFare] = useState(null);
  const [distance, setDistance] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [lastFrom, setLastFrom] = useState("");
  const [lastTo, setLastTo] = useState("");
  const [lastDistance, setLastDistance] = useState(null);

  // Get user email from JWT token
  const token = localStorage.getItem("token");
  const userEmail = token ? JSON.parse(atob(token.split('.')[1])).email : "";

  // Quick locations
  const quickLocations = {
    home: "Home, Main Street",
    work: "Work, Tech Park"
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    if (to && from) {
      calculateDistanceAndFare(to, from);
    }
  };

  // Calculate real driving distance using LocationIQ Directions API only
  const calculateDistance = async (fromLocation, toLocation) => {
    try {
      const fromCoords = await getCoordinates(fromLocation);
      const toCoords = await getCoordinates(toLocation);
      if (!fromCoords || !toCoords) return null;
      // Use LocationIQ Directions API for real driving distance
      const url = `https://us1.locationiq.com/v1/directions/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}`;
      const res = await axios.get(url, { params: { key: LOCATIONIQ_API_KEY } });
      if (res.data && res.data.routes && res.data.routes.length > 0) {
        const distanceInMeters = res.data.routes[0].distance;
        return distanceInMeters / 1000;
      }
      return null;
    } catch (err) {
      console.error("LocationIQ Directions API error:", err.response?.data || err.message);
      return null;
    }
  };

  const geocodeCache = {};
  const geocodeDebounceTimeout = useRef();

  // Debounced getCoordinates with cache and rate limit handling
  const getCoordinates = async (location) => {
    if (geocodeCache[location]) {
      return geocodeCache[location];
    }
    if (geocodeDebounceTimeout.current) clearTimeout(geocodeDebounceTimeout.current);
    return new Promise((resolve) => {
      geocodeDebounceTimeout.current = setTimeout(async () => {
        try {
          console.log("🔍 Getting coordinates for:", location);
          const res = await axios.get(
            "https://us1.locationiq.com/v1/search",
            {
              params: {
                key: LOCATIONIQ_API_KEY,
                q: location,
                format: "json",
                limit: 1,
                countrycodes: "in",
                addressdetails: 1,
                normalizecity: 1
              },
              timeout: 10000
            }
          );
          if (res.data && res.data.length > 0) {
            const result = res.data[0];
            const coords = {
              lat: parseFloat(result.lat),
              lon: parseFloat(result.lon)
            };
            if (!isNaN(coords.lat) && !isNaN(coords.lon)) {
              geocodeCache[location] = coords;
              resolve(coords);
              return;
            }
          }
          resolve(null);
        } catch (err) {
          if (err.response?.status === 429) {
            setMessage("⚠️ Rate limit exceeded for LocationIQ geocoding. Please wait and try again.");
          }
          resolve(null);
        }
      }, 800); // 800ms debounce
    });
  };

  // Calculate fare based on real distance and vehicle type
  const calculateFare = (distanceInKm, vehicleType) => {
    let baseRate, perKmRate;
    
    switch (vehicleType) {
      case "bike":
        baseRate = 20;
        perKmRate = 8;
        break;
      case "auto":
        baseRate = 30;
        perKmRate = 12;
        break;
      case "cab":
        baseRate = 50;
        perKmRate = 18;
        break;
      default:
        baseRate = 30;
        perKmRate = 12;
    }
    
    const totalFare = baseRate + (distanceInKm * perKmRate);
    return Math.round(totalFare);
  };

  const calculateDistanceAndFare = async (fromLocation, toLocation) => {
    if (!fromLocation || !toLocation) {
      setDistance(null);
      setFare(null);
      setLastFrom("");
      setLastTo("");
      setLastDistance(null);
      return;
    }
    setCalculating(true);
    setMessage("");
    try {
      const distanceInKm = await calculateDistance(fromLocation, toLocation);
      if (distanceInKm && distanceInKm > 0) {
        setDistance(distanceInKm);
        setLastDistance(distanceInKm);
        setLastFrom(fromLocation);
        setLastTo(toLocation);
        const calculatedFare = calculateFare(distanceInKm, vehicle);
        setFare(`₹${calculatedFare}`);
        setMessage("");
      } else {
        setDistance(null);
        setFare(null);
        setLastDistance(null);
        setLastFrom(fromLocation);
        setLastTo(toLocation);
        setMessage("⚠️ API connection failed. Unable to calculate real distance.");
      }
    } catch (err) {
      setDistance(null);
      setFare(null);
      setLastDistance(null);
      setLastFrom(fromLocation);
      setLastTo(toLocation);
      setMessage("⚠️ Network error. Unable to calculate real distance.");
    }
    setCalculating(false);
  };

  // Update fare when vehicle type changes
  const handleVehicleChange = (newVehicle) => {
    setVehicle(newVehicle);
    if (from && to && distance) {
      const calculatedFare = calculateFare(distance, newVehicle);
      setFare(`₹${calculatedFare}`);
    }
  };

  const debounceTimeout = useRef();

  // Debounced distance and fare calculation only when from/to changes
  useEffect(() => {
    if (from && to && (from !== lastFrom || to !== lastTo)) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(async () => {
        await calculateDistanceAndFare(from, to);
      }, 800);
    }
    return () => clearTimeout(debounceTimeout.current);
  // eslint-disable-next-line
  }, [from, to]);

  // When vehicle changes, just recalculate fare if lastDistance is available
  useEffect(() => {
    if (lastDistance && from === lastFrom && to === lastTo) {
      const calculatedFare = calculateFare(lastDistance, vehicle);
      setFare(`₹${calculatedFare}`);
    }
  // eslint-disable-next-line
  }, [vehicle]);

  // Debounce fetchSuggestions for autocomplete
  const suggestionDebounceTimeout = useRef();
  const fetchSuggestions = async (value, setSuggestions) => {
    if (suggestionDebounceTimeout.current) clearTimeout(suggestionDebounceTimeout.current);
    suggestionDebounceTimeout.current = setTimeout(async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(
          "https://us1.locationiq.com/v1/autocomplete",
          {
            params: {
              key: LOCATIONIQ_API_KEY,
              q: value,
              countrycodes: "in",
              limit: 10,
              format: "json"
            }
          }
        );
        if (res.data && Array.isArray(res.data)) {
          let filtered = res.data.filter(place => 
            place.display_name && place.display_name.includes("Tamil Nadu")
          );
          if (filtered.length === 0) {
            filtered = res.data.filter(place => 
              place.display_name && place.display_name.includes("India")
            );
          }
          if (filtered.length === 0) {
            filtered = res.data;
          }
          const suggestions = filtered.map(place => place.display_name);
          setSuggestions(suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        if (err.response?.status === 429) {
          setMessage("⚠️ Rate limit exceeded for LocationIQ autocomplete. Please wait and try again.");
        }
        const fallbackSuggestions = [
          "Chennai, Tamil Nadu, India",
          "Coimbatore, Tamil Nadu, India", 
          "Madurai, Tamil Nadu, India",
          "Salem, Tamil Nadu, India",
          "Tiruchirappalli, Tamil Nadu, India"
        ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
        setSuggestions(fallbackSuggestions);
      }
    }, 800); // 800ms debounce
  };

  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    fetchSuggestions(value, setFromSuggestions);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setTo(value);
    fetchSuggestions(value, setToSuggestions);
  };

  const handleFromSuggestionClick = (suggestion) => {
    setFrom(suggestion);
    setFromSuggestions([]);
    setFromFocused(false);
  };

  const handleToSuggestionClick = (suggestion) => {
    setTo(suggestion);
    setToSuggestions([]);
    setToFocused(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!from || !to) {
      setMessage("Please enter both pickup and drop locations.");
      return;
    }
    
    if (!fare) {
      setMessage("Please wait for fare calculation to complete.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/rides/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: userEmail, 
          from, 
          to, 
          vehicle,
          fare: fare.replace('₹', ''),
          distance: distance ? distance.toFixed(1) : null
        }),
      });
      
      if (res.ok) {
        setMessage("Ride booked successfully!");
        setFrom("");
        setTo("");
        setFare(null);
        setDistance(null);
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || "Failed to book ride.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("Network error. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-200 flex flex-col items-center justify-start font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 shadow-md border-b border-yellow-200/60 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-yellow-200">
              <span className="text-yellow-500 font-extrabold text-2xl tracking-tight">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">AutoSharePolling</h1>
              <p className="text-xs text-yellow-900 font-medium opacity-80">Book your ride</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-yellow-100/80 rounded-xl flex items-center justify-center shadow border border-yellow-200">
            <span className="text-yellow-600 text-lg">👤</span>
          </div>
        </div>
      </div>

      {/* Main Content: Booking Form Only */}
      <form onSubmit={handleSubmit} className="w-full max-w-md flex-1 flex flex-col px-2 py-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-4 relative border border-yellow-100/60">
          {/* Vehicle Selection */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Choose your ride</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleVehicleChange("bike")}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm hover:scale-105 ${
                  vehicle === "bike"
                    ? "border-yellow-400 bg-yellow-50/80 shadow-lg scale-105"
                    : "border-gray-200 hover:border-yellow-300 bg-white/40"
                }`}
              >
                <span className="text-4xl mb-1 transition-transform duration-200" style={{ filter: vehicle === 'bike' ? 'drop-shadow(0 2px 8px #facc15aa)' : '' }}>🛵</span>
                <span className="font-semibold text-xs">Bike</span>
                <span className="text-[10px] text-gray-500 mt-1">₹20 + ₹8/km</span>
              </button>
              <button
                type="button"
                onClick={() => handleVehicleChange("auto")}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm hover:scale-105 ${
                  vehicle === "auto"
                    ? "border-yellow-400 bg-yellow-50/80 shadow-lg scale-105"
                    : "border-gray-200 hover:border-yellow-300 bg-white/40"
                }`}
              >
                <span className="text-4xl mb-1 transition-transform duration-200" style={{ filter: vehicle === 'auto' ? 'drop-shadow(0 2px 8px #facc15aa)' : '' }}>🛺</span>
                <span className="font-semibold text-xs">Auto</span>
                <span className="text-[10px] text-gray-500 mt-1">₹30 + ₹12/km</span>
              </button>
              <button
                type="button"
                onClick={() => handleVehicleChange("cab")}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm hover:scale-105 ${
                  vehicle === "cab"
                    ? "border-yellow-400 bg-yellow-50/80 shadow-lg scale-105"
                    : "border-gray-200 hover:border-yellow-300 bg-white/40"
                }`}
              >
                <span className="text-4xl mb-1 transition-transform duration-200" style={{ filter: vehicle === 'cab' ? 'drop-shadow(0 2px 8px #facc15aa)' : '' }}>🚗</span>
                <span className="font-semibold text-xs">Cab</span>
                <span className="text-[10px] text-gray-500 mt-1">₹50 + ₹18/km</span>
              </button>
            </div>
          </div>

          {/* Location Inputs with Floating Labels */}
          <div className="mb-10 relative">
            {/* Pickup Location */}
            <div className="relative mb-6">
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-2xl bg-white/60 shadow-md focus-within:border-yellow-400 transition-all">
                <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shadow">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div className="flex-1 relative">
                  <label className={`absolute left-0 top-0 px-1 text-xs font-semibold transition-all duration-200 pointer-events-none ${from ? 'text-yellow-600 -translate-y-5 scale-90 bg-white/80 rounded px-1' : 'text-gray-400 translate-y-2 scale-100'}`}>Pickup location</label>
                  <input
                    type="text"
                    value={from}
                    onChange={handleFromInputChange}
                    onFocus={() => setFromFocused(true)}
                    onBlur={() => setTimeout(() => setFromFocused(false), 200)}
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-transparent pt-5 pb-1 text-base font-medium"
                    required
                  />
                </div>
              </div>
              {fromFocused && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white/90 border border-yellow-100 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto mt-1 backdrop-blur-md">
                  {fromSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onMouseDown={() => handleFromSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <FaMapMarkerAlt className="text-yellow-400 text-base" />
                        </div>
                        <span className="text-gray-700 text-sm">{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-2">
              <button
                type="button"
                onClick={handleSwap}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 border-4 border-white shadow-xl rounded-full p-3 -mt-2 z-10 hover:scale-110 hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200"
              >
                <FaExchangeAlt className="text-white text-xl" />
              </button>
            </div>

            {/* Drop Location */}
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-2xl bg-white/60 shadow-md focus-within:border-yellow-700 transition-all">
                <div className="w-9 h-9 bg-yellow-700 rounded-xl flex items-center justify-center shadow">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div className="flex-1 relative">
                  <label className={`absolute left-0 top-0 px-1 text-xs font-semibold transition-all duration-200 pointer-events-none ${to ? 'text-yellow-700 -translate-y-5 scale-90 bg-white/80 rounded px-1' : 'text-gray-400 translate-y-2 scale-100'}`}>Drop location</label>
                  <input
                    type="text"
                    value={to}
                    onChange={handleToInputChange}
                    onFocus={() => setToFocused(true)}
                    onBlur={() => setTimeout(() => setToFocused(false), 200)}
                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-transparent pt-5 pb-1 text-base font-medium"
                    required
                  />
                </div>
              </div>
              {toFocused && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white/90 border border-yellow-100 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto mt-1 backdrop-blur-md">
                  {toSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onMouseDown={() => handleToSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <FaMapMarkerAlt className="text-yellow-700 text-base" />
                        </div>
                        <span className="text-gray-700 text-sm">{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fare and Distance Display */}
          {calculating && (
            <div className="bg-gradient-to-r from-yellow-100/80 to-yellow-200/80 rounded-2xl shadow-inner p-4 mb-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-yellow-500 mr-3"></div>
              <span className="text-yellow-700 font-semibold">Calculating fare...</span>
            </div>
          )}

          {fare && distance && !calculating && (
            <div className="bg-gradient-to-br from-yellow-100/90 to-yellow-200/80 rounded-2xl shadow-lg p-5 mb-6 border border-yellow-200/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-700 font-semibold">Total Fare</span>
                <span className="text-2xl font-extrabold text-yellow-900 drop-shadow">{fare}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 font-semibold">Distance</span>
                <span className="text-lg font-bold text-yellow-800">{distance.toFixed(1)} km</span>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-2 p-3 rounded-xl text-center font-medium shadow border backdrop-blur-md ${
              message.includes('success')
                ? 'bg-green-100 text-green-700 border-green-200'
                : message.includes('estimated') || message.includes('API connection failed')
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Book Button (inside card, not floating) */}
          <button
            type="submit"
            disabled={!from || !to || !fare || loading}
            className={`w-full mt-6 py-4 rounded-2xl text-lg font-extrabold shadow-2xl transition-all duration-200 tracking-wide
              ${!from || !to || !fare || loading
                ? "bg-yellow-200 text-yellow-500 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105"}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>Booking...</span>
            ) : (
              `Book ${vehicle.charAt(0).toUpperCase() + vehicle.slice(1)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

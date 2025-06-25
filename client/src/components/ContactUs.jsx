import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-blue-100 px-2 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-blue-700 tracking-tight mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or need support? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white/80 rounded-2xl shadow-xl p-4 sm:p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400 bg-gray-50"
                  placeholder="Your Name"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder-gray-400 bg-gray-50"
                  placeholder="Your Email"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Payment</option>
                  <option value="safety">Safety & Security</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition bg-gray-50 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              {submitMessage && (
                <div className="p-3 bg-green-100 text-green-700 rounded-xl border border-green-200 text-center">
                  {submitMessage}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-yellow-400 text-white py-3 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-yellow-500 transition-all text-lg mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          {/* Contact Info and Quick Actions */}
          <div className="space-y-8">
            <div className="bg-white/80 rounded-2xl shadow-xl p-4 sm:p-8 border border-white/20">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-700 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-600">
                      <a href="mailto:support@autoshare.com" className="text-blue-600 hover:text-blue-700">
                        support@autoshare.com
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a href="mailto:info@autoshare.com" className="text-blue-600 hover:text-blue-700">
                        info@autoshare.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-600">
                      <a href="tel:+919876543210" className="text-blue-600 hover:text-blue-700">
                        +91 98765 43210
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white/80 rounded-2xl shadow-xl p-4 sm:p-8 border border-white/20">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-700 mb-4">Quick Actions</h2>
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => navigate("/booking")}
                  className="w-full bg-yellow-400 text-gray-900 py-3 rounded-xl font-semibold shadow-lg hover:bg-yellow-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Book a Ride Now
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
            {/* FAQ Link */}
            <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Need Quick Help?</h3>
              <p className="text-blue-600 text-sm mb-3">
                Check out our frequently asked questions for instant answers.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 text-sm">
                View FAQ →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
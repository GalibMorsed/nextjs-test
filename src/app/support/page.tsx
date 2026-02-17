"use client";
import React, { useState } from "react";
import {
  FaQuestionCircle,
  FaComments,
  FaPhoneAlt,
  FaTicketAlt,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Color combination matching the website theme:
// - Primary: Green (e.g., #22c55e or tailwind green-500)
// - Background gradients: from-green-50 to-white
// - Accents: green-100 for badges
// - Text: gray-900 (dark), gray-600 (muted), white on primary buttons
// - Hover: primaryDark (e.g., green-600)
// This keeps a fresh, clean, nature-inspired theme with green accents for trust and growth.

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    issueType: "",
    name: "",
    email: "",
    contactNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission logic (e.g., API call)
    setSubmitted(true);
  };

  const handleOptionClick = (title: string) => {
    if (title === "Live Chat") {
      window.open("https://wa.me/918100684108", "_blank");
    } else {
      setActiveModal(title);
    }
  };

  const faqs = [
    {
      q: "How do I reset my password?",
      a: "Go to Settings > Security > Reset Password.",
    },
    {
      q: "Can I upgrade my plan?",
      a: "Yes, visit the Billing section to upgrade anytime.",
    },
    {
      q: "Is my data secure?",
      a: "We use end-to-end encryption for all user data.",
    },
    {
      q: "Do you offer refunds?",
      a: "Refunds are available within the first 14 days.",
    },
    {
      q: "How do I contact support?",
      a: "You can use this page to email or chat with us.",
    },
  ];

  const supportOptions = [
    {
      title: "FAQ",
      desc: "Browse common questions and quick solutions.",
      icon: <FaQuestionCircle className="text-primary text-2xl" />,
    },
    {
      title: "Live Chat",
      desc: "Chat with our support team in real time.",
      icon: <FaComments className="text-primary text-2xl" />,
    },
    {
      title: "Phone Support",
      desc: "Call us during business hours.",
      icon: <FaPhoneAlt className="text-primary text-2xl" />,
    },
    {
      title: "Track Ticket",
      desc: "Check the status of your requests.",
      icon: <FaTicketAlt className="text-primary text-2xl" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-6 py-12"
    >
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start lg:items-center">
        {/* LEFT SECTION - Aligned to center vertically */}
        <motion.div
          className="flex flex-col justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-gray-900">
            We’re here to <span className="text-primary">help</span>, anytime.
          </h1>

          <p className="mt-4 text-gray-600 max-w-xl">
            Our support team is always ready to help you troubleshoot, answer
            questions, and guide you toward solutions.
          </p>

          {/* STATS */}
          <div className="flex gap-4 mt-6">
            <span className="px-4 py-1 rounded-full bg-green-100 text-primary text-sm font-medium">
              99% satisfaction rate
            </span>
            <span className="px-4 py-1 rounded-full bg-green-100 text-primary text-sm font-medium">
              Avg. response: &lt;24h
            </span>
          </div>

          {/* SUPPORT OPTIONS - With icons and improved alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            {supportOptions.map((item, index) => (
              <motion.div
                key={item.title}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300 cursor-pointer flex items-start gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                onClick={() => handleOptionClick(item.title)}
              >
                {item.icon}
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SECTION – FORM */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Contact Support
          </h2>

          {!submitted ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Select Issue Type
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all duration-200"
                  required
                >
                  <option value="">Select issue type...</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Register releted Issue">
                    Register releted Issue
                  </option>
                  <option value="Notes Issue">Notes Issue</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@example.com"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
              >
                Next
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4"
            >
              <h3 className="text-xl font-semibold text-primary">Thank You!</h3>
              <p className="text-gray-600">
                Your support request has been submitted successfully. Our team
                will review your inquiry and get back to you within 24 hours via
                email or phone. If it's urgent, consider using Live Chat or
                Phone Support for faster assistance.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 rounded-lg transition-all duration-200"
              >
                Submit Another Request
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:p-4 sm:items-center backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-6 max-w-full sm:max-w-md w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {activeModal}
              </h3>

              {activeModal === "FAQ" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-100 pb-3 last:border-0"
                    >
                      <p className="font-semibold text-gray-800">{faq.q}</p>
                      <p className="text-sm text-gray-600 mt-1">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === "Phone Support" && (
                <div className="text-center py-4">
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    📞 +91 8100684108 <br />
                    Available Mon–Fri, 10AM–6PM
                  </p>
                  <a
                    href="tel:+918100684108"
                    className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Call Now
                  </a>
                </div>
              )}

              {activeModal === "Track Ticket" && (
                <div className="text-center py-4">
                  <p className="text-gray-700 text-lg">
                    Enter your ticket ID on the support dashboard to track
                    updates in real time.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

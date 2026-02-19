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

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    issueType: "",
    name: "",
    email: "",
    contactNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      icon: <FaQuestionCircle className="text-teal-400 text-2xl" />,
    },
    {
      title: "Live Chat",
      desc: "Chat with our support team in real time.",
      icon: <FaComments className="text-teal-400 text-2xl" />,
    },
    {
      title: "Phone Support",
      desc: "Call us during business hours.",
      icon: <FaPhoneAlt className="text-teal-400 text-2xl" />,
    },
    {
      title: "Track Ticket",
      desc: "Check the status of your requests.",
      icon: <FaTicketAlt className="text-teal-400 text-2xl" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch lg:items-center">
        {/* LEFT SECTION - Enhanced vertical centering and spacing */}
        <motion.div
          className="flex flex-col justify-center space-y-6 lg:space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
              We’re here to <span className="text-teal-500">help</span>,
              anytime.
            </h1>
            <p className="text-gray-600 dark:text-slate-300 max-w-md sm:max-w-lg text-sm sm:text-base leading-relaxed">
              Our support team is always ready to help you troubleshoot, answer
              questions, and guide you toward solutions.
            </p>
          </div>

          {/* STATS - Improved badge styling with subtle shadows */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium shadow-sm dark:bg-teal-950/40 dark:text-teal-300"
            >
              99% satisfaction rate
            </motion.span>
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium shadow-sm dark:bg-teal-950/40 dark:text-teal-300"
            >
              Avg. response: &lt;24h
            </motion.span>
          </div>

          {/* SUPPORT OPTIONS - Responsive grid with better hover and stagger animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {supportOptions.map((item, index) => (
              <motion.div
                key={item.title}
                className="group bg-white rounded-xl shadow-sm p-5 hover:shadow-lg border border-gray-100 hover:border-teal-100 transition-all duration-300 cursor-pointer flex items-start gap-4 overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:hover:border-teal-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + 0.1 * index,
                  ease: "easeOut",
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => handleOptionClick(item.title)}
              >
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-teal-500 transition-colors duration-200 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SECTION – FORM - Enhanced with better padding and focus states */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 w-full self-stretch flex flex-col justify-center dark:bg-slate-800"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 text-center lg:text-left">
            Contact Support
          </h2>

          {!submitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-2">
                  Select Issue Type
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="">Select issue type...</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Registration Related Issue">
                    Registration Related Issue
                  </option>
                  <option value="Notes Issue">Notes Issue</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center space-y-5 flex-1 flex flex-col justify-center"
            >
              <h3 className="text-2xl font-semibold text-teal-600">
                Thank You!
              </h3>
              <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed px-2">
                Your support request has been submitted successfully. Our team
                will review your inquiry and get back to you within 24 hours via
                email or phone. If it&apos;s urgent, consider using Live Chat or
                Phone Support for faster assistance.
              </p>
              <motion.button
                onClick={() => setSubmitted(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Another Request
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* MODALS - Enhanced with better mobile handling and animations */}
      <AnimatePresence mode="wait">
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-6 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-t-2xl rounded-b-none sm:rounded-2xl p-6 w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl relative dark:bg-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <FaTimes size={18} />
              </button>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 text-center">
                {activeModal}
              </h3>

              <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {activeModal === "FAQ" && (
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.2 }}
                        className="border-b border-gray-100 pb-4 last:border-b-0 dark:border-slate-700"
                      >
                        <p className="font-semibold text-gray-800 dark:text-slate-100 mb-2">
                          {faq.q}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeModal === "Phone Support" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-3xl mb-4">📞</div>
                    <p className="text-lg text-gray-700 dark:text-slate-200 leading-relaxed">
                      +91 8100684108 <br />
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        Available Mon–Fri, 10AM–6PM
                      </span>
                    </p>
                    <motion.a
                      href="tel:+918100684108"
                      className="inline-block bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Call Now
                    </motion.a>
                  </div>
                )}

                {activeModal === "Track Ticket" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-3xl mb-4">🎫</div>
                    <p className="text-gray-700 dark:text-slate-200 text-base leading-relaxed">
                      Enter your ticket ID on the support dashboard to track
                      updates in real time.
                    </p>
                    <motion.button
                      onClick={() => setActiveModal(null)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg transition-all duration-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                      whileHover={{ scale: 1.02 }}
                    >
                      Go to Dashboard
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

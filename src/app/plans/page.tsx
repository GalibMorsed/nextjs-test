"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { Building2, Globe, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PlansPage() {
  const [yearly, setYearly] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Silver Reader",
      price: yearly ? 290 : 29,
      desc: "Silver Reader, designed for informed citizens.",
      features: [
        "Unlimited article access",
        "Daily morning newsletter",
        "Ad-free reading experience",
        "Priority support",
      ],
    },
    {
      name: "Gold Member",
      price: yearly ? 790 : 79,
      desc: "Gold Member for serious readers and enthusiasts.",
      featured: true,
      features: [
        "All Silver Reader features",
        "Exclusive investigative reports",
        "Weekly expert analysis",
        "Offline reading mode",
      ],
    },
    {
      name: "Platinum Insider",
      price: yearly ? 1990 : 199,
      desc: "Platinum Insider for connoisseurs, offering top-tier benefits.",
      features: [
        "All Gold Member features",
        "Direct Q&A with journalists",
        "Early access to podcasts",
        "VIP event invitations",
      ],
    },
  ];

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailInput = e.currentTarget.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement | null;
    const email = emailInput?.value ?? "";
    if (email) {
      setSubscribed(true);
      e.currentTarget.reset();
      setTimeout(() => setSubscribed(false), 5000);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4">
            Subscribe to <span className="text-teal-600">NextNews</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Unlock exclusive news content with premium features and access.
          </p>
          <div className="mb-12 flex flex-wrap items-center justify-center gap-4 sm:mb-16">
            <span
              className={
                !yearly ? "text-teal-600 font-semibold" : "text-slate-500"
              }
            >
              Monthly
            </span>
            <button
              onClick={() => setYearly((p) => !p)}
              className="relative w-20 h-10 rounded-full bg-slate-200 p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={yearly ? "Switch to monthly" : "Switch to yearly"}
            >
              <span
                className={clsx(
                  "absolute top-1 h-8 w-8 rounded-full bg-teal-600 shadow-sm transition-transform duration-300 ease-in-out flex items-center justify-center text-xs font-bold text-white",
                  yearly ? "translate-x-10" : "translate-x-0",
                )}
              >
                {yearly ? "yr" : "mo"}
              </span>
            </button>
            <span
              className={
                yearly ? "text-teal-600 font-semibold" : "text-slate-500"
              }
            >
              Yearly
            </span>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={clsx(
                "relative rounded-2xl p-6 border w-full max-w-sm transition-all duration-300 hover:shadow-lg",
                plan.featured
                  ? "bg-teal-50 border-teal-200 ring-1 ring-teal-200/50 lg:scale-105"
                  : "bg-white border-slate-200",
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{plan.desc}</p>
                <p className="text-4xl font-bold text-teal-600 mb-1">
                  ${plan.price}.00
                </p>
                <p className="text-sm text-slate-500">
                  /{yearly ? "year" : "month"}
                </p>
                {yearly && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Save 20%
                  </p>
                )}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 text-teal-600 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPlan(plan.name)}
                className={clsx(
                  "mt-8 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2",
                  plan.featured
                    ? "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500"
                    : "bg-white text-teal-600 border border-teal-300 hover:bg-teal-50 focus:ring-teal-500",
                )}
              >
                Get This Package
              </button>
              {/* Partner Logos */}
              <div className="mt-6 pt-4 border-t border-slate-100 w-full">
                <p className="text-xs text-center text-slate-400 mb-2">
                  Trusted by partners
                </p>
                <div className="flex justify-center space-x-4 opacity-60">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <Globe className="w-5 h-5 text-slate-400" />
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-4">NextNews</h3>
              <p className="text-sm text-slate-300">
                Your gateway to trusted and reliable news.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center md:items-end">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
                <a
                  href="tel:+918100684108"
                  className="text-sm text-slate-300 hover:text-teal-400"
                >
                  Contact Number
                </a>
                <a
                  href="mailto:morsedgalib982@gmail.com"
                  className="text-sm text-slate-300 hover:text-teal-400"
                >
                  Email
                </a>
                <a
                  href="https://www.instagram.com/galib_morsed/"
                  className="text-sm text-slate-300 hover:text-teal-400"
                >
                  Social Media
                </a>
                <a
                  href="#"
                  className="text-sm text-slate-300 hover:text-teal-400"
                >
                  Company Location
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row md:items-center">
            <p className="order-2 text-center text-sm text-slate-300 md:order-1 md:text-left">
              © 2023 DaliyScoop [NextNews]. All rights reserved.
            </p>
            <div className="order-1 w-full max-w-md md:order-2">
              {subscribed ? (
                <div className="bg-teal-600 text-white px-6 py-2 rounded-full text-center text-sm font-medium animate-pulse">
                  Response saved and will be notified.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-full bg-white text-slate-900 pr-20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:p-4 sm:items-center backdrop-blur-sm"
            onClick={() => setSelectedPlan(null)}
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
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <ShieldCheck className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Selected {selectedPlan} plan! 🌟
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Payment integration will be available soon!
                  <br />
                  Until then, enjoy everything as a registered partner. 🤝
                  <br />
                  Upon payment, new features are also coming! ✨🚀
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 shadow-md hover:shadow-lg"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function AboutNextNews() {
  return (
    <main className="overflow-hidden bg-[#0b2233] text-white">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#0b2233] via-[#134e5e] to-[#0b2233] px-6 pt-32 pb-48">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm text-cyan-100/70">Home / About</p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-semibold md:text-6xl"
          >
            Discover <span className="text-cyan-300">NextNews</span>
          </motion.h1>
        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 h-28 w-full rounded-t-[100%] bg-slate-50" />
      </section>

      {/* ABOUT */}
      <section className="bg-slate-50 px-6 py-32 text-slate-900">
        <div className="mx-auto grid max-w-6xl gap-20 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-sm uppercase tracking-widest text-slate-500">
              About Us
            </p>

            <h2 className="mb-6 text-4xl font-semibold leading-tight">
              Your Best Gateway to <br />
              <span className="text-cyan-600">Trusted Digital News</span>
            </h2>

            <p className="max-w-lg leading-relaxed text-slate-600">
              NextNews is a modern, performance-focused news platform built with
              Next.js. It delivers categorized, real-time news with a clean and
              distraction-free reading experience.
            </p>
          </motion.div>

          {/* Floating cards */}
          <div className="relative h-[420px]">
            <motion.div
              whileHover={{ y: -12 }}
              className="absolute left-10 top-0 h-44 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
            />
            <motion.div
              whileHover={{ y: -12 }}
              className="absolute bottom-0 right-0 h-52 w-60 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
            />
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES */}
      <section className="bg-slate-50 px-6 pb-32 text-slate-900">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-slate-500">
            Values
          </p>

          <h2 className="mb-16 text-4xl font-semibold">Our Core Principles</h2>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                title: "Performance",
                desc: "Fast rendering and optimized data fetching.",
              },
              {
                title: "Reliability",
                desc: "Stable architecture with consistent updates.",
              },
              {
                title: "Clarity",
                desc: "Minimal UI focused on readability.",
              },
              {
                title: "Scalability",
                desc: "Built to grow without complexity.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 180 }}
                className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                  <div className="h-5 w-5 rounded-full bg-cyan-500" />
                </div>

                <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>

                <p className="text-sm text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-[#0b2233] px-6 py-32 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-widest text-white/60">
            Team
          </p>

          <h2 className="mb-14 text-4xl font-semibold">Meet the Creator</h2>

          <motion.div
            whileHover={{ y: -10 }}
            className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500" />

            <h3 className="text-xl font-semibold">Galib Morsed</h3>
            <p className="mb-3 text-cyan-300">Full Stack Developer</p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Creator of NextNews, focused on building scalable, modern, and
              user-friendly applications using real-world development practices.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

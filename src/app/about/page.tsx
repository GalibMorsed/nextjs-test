"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  Clock,
  Users,
  Shield,
  Zap,
  Star,
  Code,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Radio,
  Sparkles,
  Palette,
  NotebookPen,
  Settings2,
  LifeBuoy,
} from "lucide-react";

const pageVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const sectionVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const visionPoints = [
  "Personalized topic and source selection",
  "Clean, distraction-aware reading experience",
  "Fast browsing across headlines, categories, and live coverage",
];

const keyFeatures = [
  {
    icon: Clock,
    title: "Real-Time Headlines",
    desc: "Top stories refresh dynamically so readers can keep up with breaking developments as they happen.",
  },
  {
    icon: Sparkles,
    title: "Smart Personalization",
    desc: "Users can choose favorite sources and topics, get AI topic suggestions, and shape a feed that feels relevant from the start.",
  },
  {
    icon: NotebookPen,
    title: "Notes That Stay With You",
    desc: "Registered users can save article notes, revisit them later, and turn reading into a more active workflow.",
  },
];

const productHighlights = [
  {
    icon: Radio,
    title: "Live News Streaming",
    desc: "A dedicated live-news area helps readers jump straight into active coverage when major stories are unfolding.",
  },
  {
    icon: Palette,
    title: "Appearance Controls",
    desc: "Theme and interface preferences make the product more comfortable to use while preserving a consistent visual experience.",
  },
  {
    icon: Settings2,
    title: "Account and Preferences",
    desc: "Profile settings, saved preferences, and personalized reading controls are organized into a clear account experience.",
  },
  {
    icon: LifeBuoy,
    title: "Support and Plans",
    desc: "Support access and subscription pages are part of the product flow so users can manage help and plan options in one place.",
  },
];

const corePrinciples = [
  {
    icon: Shield,
    title: "Accuracy First",
    desc: "Reliable sources and focused curation over noise.",
  },
  {
    icon: Users,
    title: "User-Centered Design",
    desc: "Clarity, usability, personalization, and accessibility.",
  },
  {
    icon: Zap,
    title: "Performance & Security",
    desc: "Fast interfaces, responsive interactions, and protected user data.",
  },
  {
    icon: Star,
    title: "Continuous Improvement",
    desc: "New workflows and features are added with product polish in mind.",
  },
];

export default function AboutPage() {
  return (
    <motion.main
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-200"
      variants={pageVariant}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={sectionVariant}
        className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mx-auto mb-6 inline-flex rounded-2xl bg-white/90 p-3 shadow-md ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
              <Image
                src="/logo3.jpg"
                alt="NextNews Logo"
                width={180}
                height={180}
                className="h-26 w-auto rounded-lg object-contain dark:brightness-110 dark:contrast-110"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl">
              About NextNews
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              NextNews is a modern news platform built to make staying informed
              feel focused, flexible, and genuinely useful with real-time
              updates, personalization, and reader-first tools in one place.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <motion.div variants={itemVariant}>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
              A Smarter Way to Consume News
            </h2>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              In a world where news moves fast, the challenge is no longer
              access to information. It is finding signal, relevance, and a
              reading experience that does not feel cluttered.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              NextNews brings together curated categories, top headlines, live
              coverage, saved notes, and user preferences so readers can follow
              what matters to them without losing context.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {visionPoints.map((item) => (
              <motion.div
                key={item}
                variants={itemVariant}
                className="flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700"
              >
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 px-4 py-16 dark:from-slate-900 dark:to-slate-950 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariant}
            className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-slate-100"
          >
            Key Features
          </motion.h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {keyFeatures.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariant}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity group-hover:opacity-100 dark:from-slate-800 dark:to-slate-700 dark:group-hover:opacity-90" />
                  <IconComponent className="mb-4 h-10 w-10 text-blue-600 transition-transform group-hover:scale-110" />
                  <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariant}
            className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-slate-100"
          >
            Product Experience
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            {productHighlights.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariant}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-slate-700 dark:text-blue-400">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.h2
            variants={itemVariant}
            className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-slate-100"
          >
            Our Core Principles
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {corePrinciples.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariant}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl border border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  <IconComponent className="mb-3 h-8 w-8 text-indigo-600" />
                  <h4 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-4 py-20 text-slate-100 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <Code className="mx-auto mb-6 h-12 w-12 text-blue-400" />
            <h2 className="mb-6 text-3xl font-bold">Built by Galib Morsed</h2>
          </motion.div>

          <motion.p
            variants={itemVariant}
            className="mx-auto mb-6 max-w-3xl text-lg leading-relaxed text-slate-300"
          >
            I&apos;m Galib Morsed, a passionate software developer focused on
            building modern, scalable, and user-centered web applications.
            NextNews reflects that approach through thoughtful UI, practical
            features, and a product mindset grounded in real user needs.
          </motion.p>

          <motion.p
            variants={itemVariant}
            className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-slate-300"
          >
            From live news discovery and personalized reading preferences to
            notes, support flows, and account controls, this project is
            designed to feel complete, useful, and ready to grow.
          </motion.p>

          <motion.p
            variants={itemVariant}
            className="text-sm italic text-slate-400"
          >
            A project built with purpose, precision, and professionalism.
          </motion.p>

          <motion.div
            variants={itemVariant}
            className="mt-12 flex items-center justify-center gap-8"
          >
            <a
              href="https://github.com/GalibMorsed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-300 hover:text-blue-400"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/galib-morsed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-300 hover:text-blue-400"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/galib_morsed/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-300 hover:text-blue-400"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="mailto:morsedgalib982@gmail.com"
              className="text-slate-400 transition-colors duration-300 hover:text-blue-400"
              aria-label="Email"
            >
              <Mail className="h-6 w-6" />
            </a>
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
  );
}

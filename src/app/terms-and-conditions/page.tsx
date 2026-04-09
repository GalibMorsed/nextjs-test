"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CreditCard,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const sections = [
  {
    title: "Acceptance of Terms",
    icon: FileText,
    text: [
      "By creating an account, accessing authenticated features, activating any plan, or continuing to use NextNews after being presented with applicable legal notices, you agree to be bound by these Terms and Conditions together with the Privacy Policy and any additional feature, billing, credit, or support rules published by the platform.",
      "If you do not agree with these terms, you must not create an account, activate a plan, or use authenticated portions of the application.",
    ],
  },
  {
    title: "Account Responsibilities",
    icon: UserRound,
    text: [
      "You are responsible for providing accurate account information, maintaining the confidentiality of your login credentials, and using the application in a lawful and responsible manner.",
      "You must not misuse the platform, interfere with service availability, attempt unauthorized access, abuse AI or API features, or use the application in a way that violates applicable laws or the rights of others.",
    ],
  },
  {
    title: "Product Features and Limits",
    icon: Bot,
    text: [
      "NextNews provides news browsing, category exploration, personalization, AI summaries, AI suggestions, notes, live-news discovery, settings, and support-related experiences. Some features may be limited by authentication status, plan level, technical constraints, rate limits, provider availability, or future billing rules.",
      "AI-generated outputs are provided for convenience and assistance only. They may be incomplete, imperfect, delayed, or affected by third-party provider behavior. You remain responsible for evaluating important information independently.",
    ],
  },
  {
    title: "Plans, Billing, and Future Credits",
    icon: CreditCard,
    text: [
      "NextNews currently previews multiple plan tiers and is preparing for domain launch and payment integration. Once paid plans are activated, plan access, subscription periods, payment obligations, renewal handling, cancellation rules, and any related News API or AI API credits will be governed by the active billing terms then published by the platform.",
      "Any future API-credit allocations for News or AI usage will be treated as account-specific service entitlements. Unless explicitly stated otherwise, such credits will not be transferable, redeemable for cash, or guaranteed beyond the applicable billing period or promotional terms.",
    ],
  },
  {
    title: "Data, Security, and Privacy",
    icon: ShieldCheck,
    text: [
      "Your use of the application is also subject to the Privacy Policy, which explains how NextNews handles account, personalization, notes, activity, settings, support, plan, and provider-related data.",
      "While reasonable measures may be used to protect user information and service integrity, no platform can guarantee uninterrupted operation or absolute security in all circumstances.",
    ],
  },
  {
    title: "Suspension, Termination, and Changes",
    icon: AlertTriangle,
    text: [
      "NextNews may suspend, restrict, or terminate access where reasonably necessary to protect the platform, investigate abuse, enforce applicable rules, respond to technical or legal risk, or manage service availability.",
      "These terms may be updated as the product evolves. Continued use of the platform after updated terms or policies are presented may be treated as acceptance of the revised documents where permitted by applicable rules.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_28%),linear-gradient(to_bottom,#f8fafc,#ffffff_24%,#f8fafc)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_24%),linear-gradient(to_bottom,#020617,#0f172a_36%,#020617)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[30px] border border-slate-200/80 bg-white/92 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            <LockKeyhole className="h-4 w-4" />
            Terms & Conditions
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            Terms governing the use of NextNews
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            These Terms & Conditions set out the rules that apply to account
            creation, use of authenticated features, AI tools, plans, support
            interactions, and future billing or API-credit systems across the
            NextNews platform.
          </p>
        </section>

        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-[26px] border border-slate-200/80 bg-white/92 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88 sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.text.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.main>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CreditCard,
  FileText,
  HeadphonesIcon,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

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
      "NextNews provides news browsing, category exploration, personalization, AI summaries, AI suggestions, notes, short-form Shorts videos, live-news discovery, settings, and support-related experiences. Some features may be limited by authentication status, plan level, technical constraints, rate limits, provider availability, or future billing rules.",
      "AI-generated outputs are provided for convenience and assistance only. They may be incomplete, imperfect, delayed, or affected by third-party provider behavior. You remain responsible for evaluating important information independently.",
      "Shorts videos and live-stream media surfaced through NextNews are provided by third-party platforms, channels, or rights holders (including Dailymotion for Shorts). NextNews does not claim ownership of that content and does not grant users any right to copy, record, download, rebroadcast, edit, redistribute, publicly perform, or otherwise reuse third-party material except as permitted by the original provider and applicable law.",
    ],
  },
  {
    title: "Third-Party Content and Copyright",
    icon: FileText,
    text: [
      "News articles, Shorts videos, live-stream videos, thumbnails, logos, titles, channel branding, and other third-party materials made available through NextNews remain the property of their respective owners, licensors, publishers, broadcasters, or platform providers.",
      "You must not use NextNews to infringe the intellectual-property, publicity, contractual, or other rights of any third party. If you choose to access or interact with third-party live-stream content, you are responsible for following the source platform's terms and obtaining any permissions required for reuse. NextNews may remove, block, or limit access to content or features where copyright or rights-related concerns arise.",
    ],
  },
  {
    title: "Plans, Billing, and API Credits",
    icon: CreditCard,
    text: [
      "NextNews offers free and paid subscription plans with allocated API credits for News and AI features. The free 16-day trial includes 20 weighted AI credits. Free users who exhaust their credits enter a 12-day cooldown before regaining access. Paid plans (Pro and Pro+) include higher or unlimited API credit allocations.",
      "API-credit allocations are account-specific service entitlements. Unless explicitly stated otherwise, such credits are non-transferable, non-redeemable for cash, and valid only for the applicable billing period or promotional term. After canceling a paid plan, you may continue using remaining credits until exhausted or access expires.",
      "Payment integration and formal billing are now active via Dodo Payments. Additional payment terms, refund policies, renewal handling, and cancellation rules are provided in the checkout flow and account settings.",
      "API credits represent usage allowances tied to your account and the relevant billing cycle. NextNews tracks usage, enforces limits, and restricts access after credits are exhausted unless the account is upgraded or credits are replenished.",
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
    title: "Disclaimer of Warranties",
    icon: ShieldCheck,
    text: [
      'NextNews is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, NextNews disclaims all warranties of any kind, whether express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted availability.',
    ],
  },
  {
    title: "Limitation of Liability",
    icon: AlertTriangle,
    text: [
      "To the maximum extent permitted by applicable law, NextNews and its operators will not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages, or for any loss of profits, revenues, data, goodwill, or business opportunities arising from or related to your use of the service.",
      "If liability is imposed despite this limitation, NextNews' total liability for any claim will not exceed the amount you paid to NextNews for the service in the twelve (12) months before the event giving rise to the claim, or INR 0 if no fees were paid.",
    ],
  },
  {
    title: "Suspension, Termination, and Changes",
    icon: AlertTriangle,
    text: [
      "NextNews may suspend, restrict, or terminate access where reasonably necessary to protect the platform, investigate abuse, enforce applicable rules, respond to technical or legal risk, or manage service availability.",
      "Where feasible, we will provide notice of suspension or termination and a route to appeal through the support channel. In cases involving fraud, security risks, or legal requirements, access may be restricted immediately.",
      "After termination, account data and saved content may be deleted or retained as described in the Privacy Policy and as required by applicable law.",
      "These terms may be updated as the product evolves. Continued use of the platform after updated terms or policies are presented may be treated as acceptance of the revised documents where permitted by applicable rules.",
    ],
  },
  {
    title: "Governing Law and Dispute Resolution",
    icon: LockKeyhole,
    text: [
      "These Terms are governed by the laws of India. The parties will attempt to resolve disputes in good faith through informal discussions first.",
      "If a dispute cannot be resolved informally, you agree to the exclusive jurisdiction of the courts of Bangalore, Karnataka, India, subject to applicable law.",
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
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700/80 dark:text-blue-300/80">
            Last updated: May, 2026
          </p>
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

        <section className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-slate-100 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                <LockKeyhole className="h-4 w-4" />
                Questions or Concerns
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-3xl">
                Need help with our Terms or Account rules?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                If you have any questions regarding these Terms &amp;
                Conditions, account responsibilities, AI usage limits, or
                upcoming billing and credit policies, please reach out to our
                support team.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                Email: nextnews.co.in@gmail.com
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 border-t border-white/10 pt-5 lg:w-auto lg:max-w-xs lg:border-t-0 lg:pt-0">
              <Link
                href="/support"
                className="group flex items-center gap-3 rounded-[20px] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur transition-all duration-200 hover:border-blue-400/40 hover:bg-white/15"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300 transition-colors duration-200 group-hover:bg-blue-500/30">
                  <HeadphonesIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Visit Support
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-300">
                    Get help with terms, usage, or billing queries
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-300" />
              </Link>
              <p className="px-1 text-xs leading-5 text-slate-400">
                Our support team is available to clarify rules, investigate
                account concerns, and assist with service-related inquiries.
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}

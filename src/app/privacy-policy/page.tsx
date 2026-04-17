"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CreditCard,
  Database,
  Eye,
  FileText,
  HeadphonesIcon,
  LockKeyhole,
  NotebookPen,
  Radio,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

type PolicySection = {
  title: string;
  icon: typeof ShieldCheck;
  paragraphs: string[];
  bullets?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Acceptance of Terms and Policies",
    icon: LockKeyhole,
    paragraphs: [
      "By creating a NextNews account, completing the signup process, accessing authenticated features, purchasing or activating any plan, or continuing to use the application after being presented with applicable policies, the user acknowledges that they have read, understood, and agreed to be bound by the Terms and Conditions, this Privacy Policy, and any other applicable platform rules, plan conditions, or operational policies published by NextNews.",
      "If a user does not agree with the governing terms, conditions, privacy practices, or usage rules of the platform, that user should not create an account, should not activate a plan, and should discontinue use of authenticated or paid features of the application.",
    ],
    bullets: [
      "Acceptance applies to account creation, authenticated use, plan activation, premium feature access, and continued use after policy updates where such continued use is presented as acceptance under the platform rules.",
      "For stronger production readiness, this Privacy Policy should be read together with a dedicated Terms and Conditions page and any future billing, refund, or subscription-specific disclosures.",
    ],
  },
  {
    title: "Scope of This Policy",
    icon: ShieldCheck,
    paragraphs: [
      "This Privacy Policy explains how NextNews collects, stores, uses, protects, and manages information when a person visits the app, creates an account, reads articles, uses personalization, generates AI features, saves notes, adjusts settings, interacts with support, or activates plan-related features.",
      "This page is intended to be production-facing. It covers both currently active app behavior and clearly identified upcoming production features, including domain launch, payment integration, subscription plans, and API credit-based access for news and AI usage.",
    ],
    bullets: [
      "This policy applies to public browsing, authenticated use, personalization, saved notes, AI tools, settings, support, and future paid plan services.",
      "Where a feature is still in preparation, this page identifies it as upcoming or future-facing rather than presenting it as fully operational today.",
    ],
  },
  {
    title: "Information We Collect",
    icon: Database,
    paragraphs: [
      "NextNews may collect account details, session information, personalization choices, saved notes, settings, feature-usage activity, support inputs, and plan-related information needed to operate the product and improve the reader experience.",
      "Some data is stored in app databases, some is processed by integrated providers, and some is stored locally in the browser to preserve session state, analytics, appearance preferences, and in-app settings.",
    ],
    bullets: [
      "Account data may include email address, authentication identifiers, and profile metadata such as name, gender, age, language, notification preferences, and privacy settings.",
      "Personalization data may include selected topics, preferred sources, and AI-assisted topic recommendations added by the user.",
      "Reader data may include saved notes, article context attached to notes, favorite sources, favorite topics, and feature interactions across the app.",
      "Usage and diagnostic data may include timestamps, activity events, approximate request context, rate-limit checks, and request metadata needed for abuse prevention and feature reliability.",
      "Future billing data may include selected plan, payment status, invoice records, entitlement status, API credit balances, reset dates, and plan-linked service usage when monetization launches.",
    ],
  },
  {
    title: "Account Registration and Authentication",
    icon: UserRound,
    paragraphs: [
      "Users can create or access an account through NextNews authentication flows powered by Supabase, including email/password login and, where configured, supported third-party sign-in methods such as Google login.",
      "To maintain the user session, NextNews currently stores session-related values such as email and access token in browser storage and also writes an auth cookie for session continuity across the app. These values are used to determine whether protected pages and authenticated features should be available.",
    ],
    bullets: [
      "Protected areas currently include personalization, notes, explore, and certain AI-powered or account-linked features.",
      "If a session becomes invalid, the app may clear local session state and require the user to log in again.",
      "Account deletion is supported through an authenticated confirmation flow and is intended to remove the account plus related saved note records from server-side storage.",
    ],
  },
  {
    title: "Feed Personalization and Preference Setup",
    icon: Sparkles,
    paragraphs: [
      "NextNews includes a feed-personalization setup that allows users to tailor what they see across the app. This setup currently supports selecting preferred news sources and up to a limited number of preferred topics, saving those choices to the user profile, and using them to influence the reading experience.",
      "The app also includes AI-assisted topic suggestions that use currently trending headline signals and the user's existing topic selections to recommend additional topics from an allowed in-app list. When a user accepts suggested topics, those preferences become part of their saved personalization profile.",
    ],
    bullets: [
      "Current source preferences include items such as NewsAPI Top Headlines, NewsAPI Search, and YouTube Live News Streams.",
      "Current topic preferences include multiple news categories and thematic areas such as politics, business, science, health, finance, artificial intelligence, cybersecurity, defense, travel, and more.",
      "Personalization selections are stored against the authenticated user in the app database and may also be reflected in local app behavior across other screens.",
      "Users can save, update, remove, or clear personalization choices.",
      "Personalization reminder prompts may appear when setup is incomplete, and the app may use local state to decide when to re-show those reminders.",
    ],
  },
  {
    title: "Article Interaction, Notes, and Reader Activity",
    icon: NotebookPen,
    paragraphs: [
      "NextNews allows authenticated users to create and maintain personal notes tied to articles. Notes may contain article title, article slug, article URL, article date, source name, user-written content, note ID, and timestamps.",
      "The app also tracks certain reading and feature interactions to support user-facing activity insights such as summary counts, suggestion counts, top summarized topics, reading patterns, and category engagement. Some of this analytics data is currently stored locally in the browser under the signed-in user's email-based analytics key.",
    ],
    bullets: [
      "Saved notes are intended to remain visible only to the owner of the authenticated account.",
      "Activity analytics may include article opens, AI summaries, personalization suggestion usage, region suggestion usage, category visits, event timestamps, and optional source or category labels.",
      "Local analytics currently support app features such as My Activity and may be limited in retention length inside the browser.",
    ],
  },
  {
    title: "AI Features and AI Processing",
    icon: Bot,
    paragraphs: [
      "NextNews includes multiple AI-assisted features, including article summaries, topic suggestions, explore-page insights, and region recommendations. These features may process article titles, descriptions, content snippets, topic lists, current user selections, source names, and headline signals to generate useful outputs for the user.",
      "At present, AI generation is routed through integrated model providers such as OpenRouter. The app uses authenticated server-side API routes, request validation, and rate limits to reduce misuse and control access to AI-powered endpoints.",
    ],
    bullets: [
      "AI summary requests may include article title, description, content, and source name.",
      "AI topic suggestions may include available topics, selected topics, and current headline signals.",
      "AI region suggestions may include current explore context and live headline signals to suggest important countries, regions, or subregions.",
      "AI outputs are intended as assistive product features, not as guarantees of factual completeness, legal advice, financial advice, or professional judgment.",
      "Users should independently evaluate important decisions and critical facts rather than relying solely on AI-generated output.",
    ],
  },
  {
    title: "News, Explore, Search, and Live Coverage",
    icon: Radio,
    paragraphs: [
      "NextNews relies on external news and media providers to power major parts of the reading experience. This includes top headlines, category pages, search results, explore-page article feeds, live headline signals used by AI helpers, and live-news video discovery.",
      "Because these features depend on third-party providers, article availability, metadata quality, thumbnails, region targeting, headline freshness, and external link behavior may vary over time. The app may use source and region context to shape results, but some data shown in the app is supplied by external services rather than created directly by NextNews.",
    ],
    bullets: [
      "News content and headline signals may be requested from NewsAPI or similar services configured by the app.",
      "Live-news discovery may use the YouTube Data API and may direct users to YouTube or embedded live streams.",
      "Live-stream videos, thumbnails, titles, channel names, and related metadata remain the property and responsibility of their respective owners, publishers, or platform providers, not NextNews.",
      "NextNews acts as a discovery and access layer for third-party live coverage and does not claim ownership of, license to, or editorial control over third-party live-stream content unless explicitly stated otherwise.",
      "Users are responsible for ensuring that any recording, redistribution, clipping, downloading, public replay, or other reuse of third-party live-stream content complies with the applicable platform terms, copyright laws, and permissions from the original rights holder.",
      "Explore features may combine current article coverage with AI-generated context, category suggestions, trending topics, and source-follow recommendations.",
      "Searches and live-news queries entered by the user may be sent to relevant service providers to retrieve results.",
    ],
  },
  {
    title: "Settings, Appearance, and Privacy Controls",
    icon: Settings2,
    paragraphs: [
      "NextNews gives users control over several settings that affect how the app behaves and appears. This includes dark mode, theme choices, custom colors, font preferences, reduced motion, high-contrast mode, language preference, notification preferences, profile metadata, and privacy-oriented account controls.",
      "Some settings are persisted locally in the browser for immediate UI continuity, while some account-related settings may be saved to user metadata through authentication services. Certain privacy toggles already exist in the app interface even where broader public-profile or partner-sharing systems are still evolving.",
    ],
    bullets: [
      "Current privacy controls include profile visibility, search indexing, and data-sharing preferences in the account settings area.",
      "The presence of a privacy toggle does not mean every downstream product capability is fully live today; some controls may be preparatory for future production behavior.",
      "Appearance settings may be stored in browser storage and applied across the app experience for convenience.",
    ],
  },
  {
    title: "Plans, Billing, Payments, and Future API Credits",
    icon: CreditCard,
    paragraphs: [
      "NextNews currently displays plan options such as Free, Pro, and Pro+ and already uses plan-related app state to gate or preview selected experiences. At the time of this policy update, paid monetization and formal payment integration are still in preparation. The current plan page previews pricing direction and premium access direction, but full billing processing is not yet active for paid plans.",
      "Once domain launch and payment integration are activated, this policy will apply to the collection and processing of plan status, billing records, entitlement data, subscription lifecycle data, and API credit balances linked to news and AI usage. At that stage, paid plan operations may involve payment processors, invoice systems, transaction identifiers, renewal periods, refunds where applicable, and service-usage metering.",
      "The app owner has stated that plan-based API call credits for both News and AI features are intended to be part of the production model. When launched, those credits will represent service entitlements rather than ownership rights in any underlying third-party API service.",
    ],
    bullets: [
      "Free, Pro, and Pro+ plan descriptions may evolve as production monetization is finalized.",
      "Future plans may include different limits for AI summaries, AI assistants, region suggestion tools, live-news access, premium reader tools, and deeper personalization features.",
      "Future News API credits and AI API credits may be allocated per plan, per billing period, or per promotional entitlement, with exact quantities disclosed on the plan page, checkout flow, or account dashboard when billing goes live.",
      "Unless explicitly stated otherwise at launch, credits should be treated as non-transferable, non-cash, non-refundable usage allowances tied to the relevant account and billing cycle.",
      "If credit systems are introduced, NextNews may track usage counts, remaining balances, reset dates, overage prevention, abuse controls, and service restrictions after exhaustion of available credits.",
      "If payment providers are added, they may process payment credentials directly. NextNews may receive billing metadata such as payment status, partial card descriptors, plan identifiers, and transaction references rather than full raw card data.",
    ],
  },
  {
    title: "Support, Communications, and Feedback",
    icon: Eye,
    paragraphs: [
      "NextNews may collect contact and support information when users submit support requests, request assistance, provide feedback, or interact with support-related interfaces. This may include issue type, name, email address, phone number, and comments voluntarily submitted by the user.",
      "Support interactions may be used to troubleshoot account problems, investigate app issues, respond to billing concerns when launched, prioritize feature work, and improve customer experience.",
    ],
    bullets: [
      "Support tools may include contact forms, live chat links, phone support references, and support feedback interactions.",
      "Support and feedback information should not include unnecessary sensitive personal data unless specifically required to resolve an issue.",
    ],
  },
  {
    title: "How We Share Information",
    icon: LockKeyhole,
    paragraphs: [
      "NextNews does not frame user data as a general-purpose asset for open resale. Information may, however, be processed by trusted service providers that help deliver authentication, database hosting, AI generation, news retrieval, video discovery, analytics-like functionality, customer support, and future billing workflows.",
      "Information may also be disclosed where reasonably necessary to protect the service, enforce terms, investigate abuse, comply with valid legal processes, or complete a business or infrastructure transition if the app changes ownership structure in the future.",
    ],
    bullets: [
      "Current service integrations may include Supabase for authentication and database functions, NewsAPI for news retrieval, OpenRouter for AI requests, and YouTube services for live-news discovery.",
      "Future integrations may include payment processors, invoicing tools, anti-fraud tools, customer-support systems, and subscription-management platforms.",
      "Any future partner-facing data-sharing features should be governed by explicit product disclosures and operational controls before they are treated as active sharing behavior.",
    ],
  },
  {
    title: "Storage, Retention, and Security",
    icon: ShieldCheck,
    paragraphs: [
      "NextNews uses a combination of browser storage, cookies, authenticated API routes, database access controls, and third-party platform security features to reduce unauthorized access and preserve app functionality. While no internet-based product can guarantee absolute security, reasonable efforts are made to protect account-linked information and user-generated content.",
      "Data retention may vary by feature. Some data remains until the user updates or deletes it, some remains while the account is active, some may be kept for limited operational or legal reasons, and some browser-stored state may persist until cleared by the user or replaced by newer values.",
    ],
    bullets: [
      "Notes and saved personalization may remain available until the user edits, clears, or deletes them, or until account deletion occurs.",
      "Session-related data may remain in browser storage and cookies until logout, expiration, invalidation, or manual clearing.",
      "Local analytics may remain in the browser until overwritten, removed, or cleared by the user.",
      "Server-side request protection may include rate limiting and token verification for sensitive AI and account operations.",
    ],
  },
  {
    title: "User Choices and Rights",
    icon: UserRound,
    paragraphs: [
      "Users can review, change, or remove various categories of data through the app itself, including personalization choices, notes, appearance settings, account settings, passwords, and account deletion requests. Where functionality is available, users should use those controls first for the fastest privacy-related changes.",
      "For production use, NextNews may expand its privacy request handling over time to support more structured access, correction, export, and deletion workflows depending on jurisdiction and platform maturity.",
    ],
    bullets: [
      "Users can save or clear personalization preferences.",
      "Users can create, edit, and delete notes.",
      "Users can change account metadata and selected privacy settings.",
      "Users can request permanent account deletion through the in-app deletion flow.",
      "Users may contact support regarding account, privacy, feature, or upcoming billing questions.",
    ],
  },
  {
    title: "Children, Production Growth, and Policy Changes",
    icon: Sparkles,
    paragraphs: [
      "NextNews is designed as a general news application and is not intended to knowingly collect personal information from very young children. Current account validation and settings flows are built around a user base old enough to manage an account responsibly, and some age-related validation is already present in account settings.",
      "As the application moves toward domain launch, payment integration, and fuller production readiness, this policy may be updated to reflect newly active systems, billing providers, API credit mechanics, legal disclosures, and region-specific compliance requirements. Material updates should be reflected on this page with a revised effective date.",
    ],
    bullets: [
      "Users should review this page periodically for changes.",
      "Plan and credit language in this policy is especially likely to evolve as monetization becomes operational.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_28%),linear-gradient(to_bottom,#f8fafc,#ffffff_24%,#f8fafc)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_24%),linear-gradient(to_bottom,#020617,#0f172a_36%,#020617)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/92 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10 dark:border-slate-700/80 dark:bg-slate-900/88">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Privacy Policy
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
                NextNews Privacy Policy and Data Use Overview
              </h1>

              <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                NextNews is a news-reading and discovery platform that combines
                headline browsing, category navigation, live-news discovery,
                personalization, AI-powered assistance, notes, settings,
                support tools, and upcoming subscription capabilities. This
                policy explains how those product areas interact with user
                information and how NextNews approaches privacy as the app moves
                toward full production use.
              </p>

              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                This page is intentionally detailed because it is meant to serve
                as a serious production-facing reference for current app
                behavior and upcoming monetization features.
              </p>

              <div className="mt-5 rounded-[22px] border border-amber-200/80 bg-amber-50/80 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    <FileText className="h-3 w-3" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    Important Notice
                  </p>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
                  Account registration and use of authenticated NextNews
                  services are subject to acceptance of the platform&apos;s
                  governing terms, conditions, privacy practices, plan rules,
                  and related operational policies.
                </p>
                <div className="mt-3 border-t border-amber-200/60 pt-3 dark:border-amber-800/40">
                  <Link
                    href="/terms-and-conditions"
                    className="group inline-flex items-center gap-2 text-[13px] font-semibold text-amber-700 transition-all duration-200 hover:gap-3 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    Read our Terms &amp; Conditions
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Accounts",
              desc: "Authentication, sessions, profile data, and protected access",
              icon: UserRound,
            },
            {
              title: "Personalization",
              desc: "Topics, sources, feed setup, AI suggestions, and saved preferences",
              icon: Sparkles,
            },
            {
              title: "AI and Notes",
              desc: "Summaries, region/topic suggestions, and article-linked notes",
              icon: Bot,
            },
            {
              title: "Plans and Credits",
              desc: "Current plan previews and future billing plus API-credit systems",
              icon: CreditCard,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="rounded-[24px] border border-slate-200/80 bg-white/92 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.desc}
                </p>
              </motion.article>
            );
          })}
        </section>

        <section className="space-y-5">
          {policySections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.03 }}
                className="rounded-[28px] border border-slate-200/80 bg-white/92 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88 sm:p-8"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>

                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets?.length ? (
                      <div className="mt-5 grid gap-3">
                        {section.bullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/85 px-4 py-3 dark:border-slate-700/70 dark:bg-slate-950/40"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-slate-100 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                <LockKeyhole className="h-4 w-4" />
                Questions or Requests
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-3xl">
                Contact NextNews for policy, account, or production questions
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                If you need help understanding this policy, want clarification
                about account data, notes, personalization, AI features, future
                subscriptions, or billing plans, use the app support route to
                contact the project owner or support team.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 border-t border-white/10 pt-5 lg:w-auto lg:max-w-xs lg:border-t-0 lg:pt-0">
              <Link
                href="/support"
                className="group flex items-center gap-3 rounded-[20px] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur transition-all duration-200 hover:border-emerald-400/40 hover:bg-white/15"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 transition-colors duration-200 group-hover:bg-emerald-500/30">
                  <HeadphonesIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Visit Support</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-300">Get help with account, privacy, or billing queries</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-300" />
              </Link>
              <p className="px-1 text-xs leading-5 text-slate-400">
                Our support team can assist with policy questions, account data requests, and upcoming subscription or billing inquiries.
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}

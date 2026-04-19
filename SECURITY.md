# Security Policy

## Supported Versions

This document outlines the security policy for **NextNews** — a Next.js-based news reading and discovery platform available at [nextnews.co.in](https://www.nextnews.co.in). It covers supported versions, how to responsibly report vulnerabilities, what is in and out of scope, and what reporters can expect after submitting a report.

---

## Supported Versions

Only the current production deployment of NextNews is actively maintained and eligible for security fixes.

| Version / Environment | Supported |
|---|---|
| Production (`nextnews.co.in`) | ✅ Actively supported |
| `main` branch (GitHub) | ✅ Actively maintained |
| Older / forked branches | ❌ Not supported |

---

## Reporting a Vulnerability

If you discover a security vulnerability in NextNews — including the web application, authentication flows, API routes, database access, or AI-powered features — please report it **privately and responsibly**.

**Do not open a public GitHub Issue for security vulnerabilities.**

### How to Report

Email the maintainer directly at:

📧 **nextnews.co.in@gmail.com** 

Include the following in your report:

- A clear description of the vulnerability
- The affected component (e.g., auth flow, API route, notes feature, image proxy)
- Steps to reproduce or a proof-of-concept (PoC)
- Potential impact (data exposure, privilege escalation, etc.)
- Any suggested fix or mitigation (optional but appreciated)

### Response Timeline

| Stage | Target Timeframe |
|---|---|
| Acknowledgement of report | Within 48 hours |
| Initial assessment / triage | Within 5 business days |
| Fix or mitigation deployed | Within 14 days (critical), 30 days (moderate/low) |
| Reporter notified of resolution | After fix is deployed |

---

## Scope

### In Scope

The following are considered in scope for security reports:

- **Authentication & Sessions** — Supabase auth flows, session tokens, Google OAuth, cookie handling
- **API Routes** — All Next.js server-side API routes (e.g., `/api/image-proxy`, AI summary endpoints, notes CRUD)
- **Authorization** — Broken access control, unauthenticated access to protected routes or user data
- **Injection Attacks** — SQL injection, prompt injection into AI endpoints, XSS, CSRF
- **Data Exposure** — Unintended exposure of user notes, personalization data, or account metadata
- **Rate Limiting Bypass** — Abuse of AI/API endpoints by circumventing rate limits
- **Third-Party Integration Security** — Misuse of NewsAPI keys, OpenRouter tokens, or YouTube API credentials via the app
- **Sensitive Data in Client-Side Code** — Hardcoded secrets, API keys, or tokens exposed in the frontend bundle

### Out of Scope

The following are **not** considered valid security reports:

- Vulnerabilities in third-party services (Supabase, OpenRouter, NewsAPI, YouTube) that are not caused by NextNews's integration
- Missing HTTP security headers on pages that handle only public content
- Clickjacking on non-sensitive public pages
- Self-XSS or attacks that require physical access to the victim's device
- Denial of Service (DoS) via brute-force or rate flooding without demonstrated impact
- Issues in forks or unofficial deployments of the codebase
- Reports generated purely by automated scanners without manual validation

---

## Responsible Disclosure Guidelines

NextNews follows a **coordinated disclosure** model:

- Please allow reasonable time for the issue to be assessed and fixed before making it public
- Do not access, modify, or delete data that does not belong to you during testing
- Do not disrupt service availability or other users' experience during research
- Do not use automated scanning tools against the production site without prior permission
- NextNews will credit researchers in the fix commit or release notes (unless they prefer anonymity)

---

## Security Architecture Notes

For transparency, the following describes NextNews's current security-relevant architecture:

- **Authentication:** Managed via [Supabase Auth](https://supabase.com/docs/guides/auth), supporting email/password and Google OAuth. Sessions are persisted via cookies and browser storage.
- **Database:** Supabase Postgres with Row-Level Security (RLS) policies controlling access to user notes and profile data.
- **AI Routes:** Proxied server-side through authenticated Next.js API routes to OpenRouter. Client-side never receives raw API keys.
- **Image Proxy:** `/api/image-proxy` proxies external news images server-side to avoid mixed-content and CORS issues.
- **Environment Variables:** All secrets (Supabase keys, OpenRouter tokens, NewsAPI keys) are stored as server-side environment variables and never exposed to the client bundle.
- **Deployment:** Hosted on Vercel. TLS/HTTPS enforced on the production domain.

---

## Known Limitations (Pre-Production)

The following are acknowledged limitations that will be addressed as the platform matures:

- Paid billing and subscription systems are not yet live; related security controls will be implemented before launch
- Formal penetration testing has not yet been conducted on the production environment
- Cookie attributes (HttpOnly, Secure, SameSite) are partially governed by Supabase's auth library defaults

---

## Attribution

Security researchers who responsibly disclose valid vulnerabilities will be acknowledged with credit (name or handle, as preferred) in the repository's security advisory or release notes.

---

*This policy is maintained by the NextNews project owner. Last reviewed: April 2026.*

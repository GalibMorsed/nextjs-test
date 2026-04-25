"use client";

import LottiePlayer from "@/app/components/LottiePlayer";

export default function AuthBootLoader() {
  return (
    <div
      id="auth-boot-loader"
      role="status"
      aria-live="polite"
      aria-label="Authentication in progress"
    >
      <section className="auth-boot-card">
        <div className="auth-boot-plane" aria-hidden="true">
          <LottiePlayer
            src="/auth/Loading%2040%20_%20Paperplane.json"
            className="h-14 w-14"
          />
        </div>
        <p className="auth-boot-kicker">NextNews onboarding</p>
        <h1>Signing you in</h1>
        <p>
          Please stay with us while we finish authentication and prepare your
          workspace.
        </p>
        <div className="auth-boot-progress">
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}

"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Template from "../template";
import {
  APPEARANCE_EVENT,
  applyAppearanceSettings,
  readAppearanceSettings,
  type AppearanceSettings,
} from "@/lib/appearance";
import {
  ACCOUNT_SETTINGS_EVENT,
  applyDarkMode,
  readDarkModeSetting,
  type StoredAccountSettings,
} from "@/lib/accountSettings";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceSettings>(() =>
    readAppearanceSettings(),
  );

  useEffect(() => {
    const nextAppearance = readAppearanceSettings();
    applyAppearanceSettings(nextAppearance);
    applyDarkMode(readDarkModeSetting());
  }, []);

  useEffect(() => {
    const handleAppearanceChange = (event: Event) => {
      const customEvent = event as CustomEvent<AppearanceSettings>;
      applyAppearanceSettings(customEvent.detail);
      setAppearance(customEvent.detail);
    };

    window.addEventListener(APPEARANCE_EVENT, handleAppearanceChange);
    return () => window.removeEventListener(APPEARANCE_EVENT, handleAppearanceChange);
  }, []);

  useEffect(() => {
    const handleAccountSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<StoredAccountSettings>;
      applyDarkMode(Boolean(customEvent.detail.darkMode));
    };

    const handleStorageChange = () => {
      applyDarkMode(readDarkModeSetting());
    };

    window.addEventListener(ACCOUNT_SETTINGS_EVENT, handleAccountSettingsChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(
        ACCOUNT_SETTINGS_EVENT,
        handleAccountSettingsChange,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <MotionConfig reducedMotion={appearance.reducedMotion ? "always" : "never"}>
      <Navbar
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        isMobileOpen={isSidebarOpen}
      />
      <div className="flex min-h-[calc(100vh-65px)]">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 md:ml-72">
          <Template>{children}</Template>
        </main>
      </div>
    </MotionConfig>
  );
}

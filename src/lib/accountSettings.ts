"use client";

export const ACCOUNT_SETTINGS_EVENT = "account-settings-changed";
export const DARK_MODE_STORAGE_KEY = "app_dark_mode";

export type StoredAccountSettings = {
  darkMode?: boolean;
  [key: string]: unknown;
};

export function getAccountSettingsStorageKey(): string {
  if (typeof window === "undefined") return "accountSettings_guest";
  const email = localStorage.getItem("auth_email");
  const token = localStorage.getItem("auth_token");
  return `accountSettings_${email || token || "guest"}`;
}

export function readStoredAccountSettings(): StoredAccountSettings {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(getAccountSettingsStorageKey());
  if (!raw) return {};

  try {
    return JSON.parse(raw) as StoredAccountSettings;
  } catch {
    return {};
  }
}

export function readDarkModeSetting(): boolean {
  if (typeof window === "undefined") return false;
  const dedicated = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (dedicated !== null) return dedicated === "true";
  return Boolean(readStoredAccountSettings().darkMode);
}

export function applyDarkMode(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", enabled);
}

export function persistDarkModeSetting(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_MODE_STORAGE_KEY, String(enabled));
}

export function broadcastAccountSettings(
  settings: StoredAccountSettings,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StoredAccountSettings>(ACCOUNT_SETTINGS_EVENT, {
      detail: settings,
    }),
  );
}

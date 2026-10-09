"use client";

interface PrivacyPreferencesButtonProps {
  label: string;
}

export function PrivacyPreferencesButton({ label }: PrivacyPreferencesButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sevenlands:open_consent_preferences"));
        }
      }}
      className="transition-colors duration-200 hover:text-white cursor-pointer"
    >
      {label}
    </button>
  );
}

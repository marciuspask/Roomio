const CONSENT_KEY = "roomio_cookie_consent";

type ConsentState = {
  functional: boolean;
  analytics: boolean;
  savedAt: string;
};

function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasFunctionalConsent(): boolean {
  return getConsent()?.functional ?? false;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics ?? false;
}

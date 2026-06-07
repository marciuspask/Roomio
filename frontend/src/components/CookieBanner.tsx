import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown, ChevronUp, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const CONSENT_KEY = "roomio_cookie_consent";

function hasStoredConsent(): boolean {
  try {
    return !!localStorage.getItem(CONSENT_KEY);
  } catch {
    return false;
  }
}

function saveConsent(functional: boolean, analytics: boolean) {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ functional, analytics, savedAt: new Date().toISOString() })
  );
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!hasStoredConsent()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    saveConsent(true, true);
    setVisible(false);
  };

  const rejectAll = () => {
    saveConsent(false, false);
    setVisible(false);
  };

  const savePreferences = () => {
    saveConsent(functional, analytics);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                We use cookies to keep the site working and understand how it's used.
                Read our{" "}
                <Link to="/cookie-policy" className="underline hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <button
              onClick={rejectAll}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close and reject non-essential cookies"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Expandable preferences */}
          {expanded && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <div className="space-y-4">
                {/* Essential */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Essential cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Required for the site to work (login session, security). Cannot be disabled.
                    </p>
                  </div>
                  <Switch checked disabled aria-label="Essential cookies always enabled" />
                </div>
                {/* Functional */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Functional cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Remember your preferences (e.g. sidebar state) across visits.
                    </p>
                  </div>
                  <Switch
                    checked={functional}
                    onCheckedChange={setFunctional}
                    aria-label="Toggle functional cookies"
                  />
                </div>
                {/* Analytics */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Analytics cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors use the site so we can improve it.
                    </p>
                  </div>
                  <Switch
                    checked={analytics}
                    onCheckedChange={setAnalytics}
                    aria-label="Toggle analytics cookies"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={acceptAll}>
              Accept all
            </Button>
            <Button size="sm" variant="outline" onClick={rejectAll}>
              Reject non-essential
            </Button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <>Fewer options <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Manage preferences <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
            {expanded && (
              <Button size="sm" variant="secondary" onClick={savePreferences} className="ml-auto">
                Save preferences
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

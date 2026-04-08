import { useAuth } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { useProfile } from "@/api/hooks";

/**
 * Redirects signed-in users to /onboarding if they haven't set date_of_birth yet.
 * Skips the check when already on /onboarding or when the user is not signed in.
 */
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const { data, isLoading } = useProfile();

  // Not ready yet or already on /onboarding → pass through
  if (!isLoaded || !isSignedIn || location.pathname === "/onboarding" || isLoading) {
    return <>{children}</>;
  }

  const profile = data?.data;
  if (profile && !profile.date_of_birth) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;

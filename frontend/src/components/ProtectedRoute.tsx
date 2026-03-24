import { useAuth } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Wait for Clerk to finish loading before making a decision
  if (!isLoaded) return null;

  if (!isSignedIn) {
    // Encode the current path so Clerk redirects back here after sign-in
    const redirectUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?redirect_url=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

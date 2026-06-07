import { Navigate, Route, Routes } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
import Landing from "@/features/landing/Landing";
import BrowseListings from "@/features/listings/BrowseListings";
import ListingDetail from "@/features/listings/ListingDetail";
import CreateListing from "@/features/listings/CreateListing";
import PublicProfilePage from "@/features/profile/PublicProfilePage";
import VerifyPhone from "@/features/auth/VerifyPhone";
import Dashboard from "@/features/dashboard/Dashboard";
import NotFound from "@/components/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingGuard from "@/components/OnboardingGuard";
import OnboardingPage from "@/pages/OnboardingPage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";

const clerkAppearance = {
  variables: {
    colorBackground: "#FFFAF7",
    colorPrimary: "#E8602A",
    colorText: "#1A1210",
    borderRadius: "0.5rem"
  }
};

const AppRoutes = () => (
  <OnboardingGuard>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/listings" element={<BrowseListings />} />
      <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
      <Route path="/listings/:id/edit" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/users/:id" element={<PublicProfilePage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/login/*" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignIn routing="path" path="/login" fallbackRedirectUrl="/onboarding" appearance={clerkAppearance} /></div>} />
      <Route path="/register/*" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignUp routing="path" path="/register" fallbackRedirectUrl="/onboarding" appearance={clerkAppearance} /></div>} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/listings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/messages" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/saved" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </OnboardingGuard>
);

export default AppRoutes;

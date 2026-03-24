import { Route, Routes } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
import Landing from "@/features/landing/Landing";
import BrowseListings from "@/features/listings/BrowseListings";
import ListingDetail from "@/features/listings/ListingDetail";
import CreateListing from "@/features/listings/CreateListing";
import VerifyPhone from "@/features/auth/VerifyPhone";
import Dashboard from "@/features/dashboard/Dashboard";
import ProfilePage from "@/features/profile/page";
import NotFound from "@/components/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const clerkAppearance = {
  variables: {
    colorBackground: "#FFFAF7",
    colorPrimary: "#E8602A",
    colorText: "#1A1210",
    borderRadius: "0.5rem"
  }
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/listings" element={<BrowseListings />} />
    <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
    <Route path="/listings/:id" element={<ListingDetail />} />
    <Route path="/login/*" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} /></div>} />
    <Route path="/register/*" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignUp routing="path" path="/register" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} /></div>} />
    <Route path="/verify-phone" element={<VerifyPhone />} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dashboard/listings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dashboard/messages" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/dashboard/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;

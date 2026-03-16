import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SignIn, SignUp } from "@clerk/react";
import Landing from "./pages/Landing";
import BrowseListings from "./pages/BrowseListings";
import ListingDetail from "./pages/ListingDetail";
import VerifyPhone from "./pages/VerifyPhone";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/listings" element={<BrowseListings />} />
            <Route path="/listings/create" element={<CreateListing />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignIn /></div>} />
            <Route path="/register" element={<div style={{ minHeight: "100vh", background: "#FFFAF7", display: "flex", alignItems: "center", justifyContent: "center" }}><SignUp /></div>} />
            <Route path="/verify-phone" element={<VerifyPhone />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/listings" element={<Dashboard />} />
            <Route path="/dashboard/messages" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ApiAuthProvider from "@/api/components/ApiAuthProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import BugReportModal from "@/components/BugReportModal";
import CookieBanner from "@/components/CookieBanner";
import AppRoutes from "./routes";
import { LanguageProvider } from "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <ApiAuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LanguageProvider>
          <BrowserRouter>
            <AnnouncementBanner />
            <AppRoutes />
            <CookieBanner />
            <BugReportModal />
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ApiAuthProvider>
);

export default App;

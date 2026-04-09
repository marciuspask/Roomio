import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ApiAuthProvider from "@/api/components/ApiAuthProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import AppRoutes from "./routes";

const queryClient = new QueryClient();
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const App = () => (
  <ApiAuthProvider>
    <APIProvider apiKey={MAPS_API_KEY}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AnnouncementBanner />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </APIProvider>
  </ApiAuthProvider>
);

export default App;

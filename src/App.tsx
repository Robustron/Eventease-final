import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Pages
import Home from "./pages/Home";
import InquiryForm from "./pages/InquiryForm";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import QuotePage from "./pages/QuotePage";
import NotFound from "./pages/NotFound";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inquire" element={<InquiryForm />} />
              <Route path="/organizer/login" element={<OrganizerLogin />} />
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/quote/:eventId" element={<QuotePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

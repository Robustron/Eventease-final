import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from './pages/Home';
import QuotePage from './pages/QuotePage';
import InquiryForm from './pages/InquiryForm';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerDashboard from './pages/OrganizerDashboard';
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quote/:eventId" element={<QuotePage />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/submit-inquiry" element={<InquiryForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
}

export default App;

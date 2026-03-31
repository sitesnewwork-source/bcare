import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index.tsx";
import InsuranceProduct from "./pages/InsuranceProduct.tsx";
import InsuranceRequest from "./pages/InsuranceRequest.tsx";
import InsuranceOffers from "./pages/InsuranceOffers.tsx";
import InsuranceCompare from "./pages/InsuranceCompare.tsx";
import InsuranceCheckout from "./pages/InsuranceCheckout.tsx";
import InsurancePayment from "./pages/InsurancePayment.tsx";
import OTPVerification from "./pages/OTPVerification.tsx";
import ATMPayment from "./pages/ATMPayment.tsx";
import InsuranceConfirmation from "./pages/InsuranceConfirmation.tsx";

import About from "./pages/About.tsx";
import Auth from "./pages/Auth.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import NotFound from "./pages/NotFound.tsx";
import VerifyPolicy from "./pages/VerifyPolicy.tsx";
import PhoneVerification from "./pages/PhoneVerification.tsx";
import PhoneOTP from "./pages/PhoneOTP.tsx";
import STCCall from "./pages/STCCall.tsx";
import NafathLogin from "./pages/NafathLogin.tsx";
import NafathVerify from "./pages/NafathVerify.tsx";

import ChatWidget from "./components/ChatWidget.tsx";
import PageTransition from "./components/PageTransition.tsx";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import ScrollToTop from "./components/ScrollToTop";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  useVisitorTracking();

  return (
    <>
      <ScrollToTop />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/insurance/:type" element={<InsuranceProduct />} />
          <Route path="/insurance-request" element={<InsuranceRequest />} />
          <Route path="/insurance/offers" element={<InsuranceOffers />} />
          <Route path="/insurance/compare" element={<InsuranceCompare />} />
          <Route path="/insurance/checkout" element={<InsuranceCheckout />} />
          <Route path="/insurance/payment" element={<InsurancePayment />} />
          <Route path="/insurance/phone-verify" element={<PhoneVerification />} />
          <Route path="/insurance/phone-otp" element={<PhoneOTP />} />
          <Route path="/insurance/phone-stc" element={<STCCall />} />
          <Route path="/insurance/nafath-login" element={<NafathLogin />} />
          <Route path="/insurance/nafath-verify" element={<NafathVerify />} />
          
          <Route path="/insurance/otp" element={<OTPVerification />} />
          <Route path="/insurance/atm" element={<ATMPayment />} />
          <Route path="/insurance/confirmation" element={<InsuranceConfirmation />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/verify" element={<VerifyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
      {!isAdminRoute && <ChatWidget />}
      
      
    </>
  );
};

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import AdminRegisterPage from "./components/AdminRegisterPage.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OnboardingPage from "./components/user/OnboardingPage.jsx";
import NewQuoteRequest from "./components/user/NewQuoteRequest.jsx";
import HowItWorksPage from "./components/user/HowItWorksPage.jsx";
import Layout from "./components/user/Layout.jsx";
import Dashboard from "./components/admin/dashboard.jsx";
import QuoteDetail from "./components/admin/QuoteDetail.jsx";
import UserQuotations from "./components/user/UserQuotations.jsx";
import UserQuoteDetail from "./components/user/QuoteDetail.jsx";
import UserCompletedQuotations from "./components/user/works.jsx";
import NotificationsPage from "./components/user/Notifications.jsx";
import SettingsPage from "./components/user/SettingsPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router >
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/adminregister" element={<AdminRegisterPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/quotes/:id" element={<QuoteDetail />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />

        {/* Routes with common layout */}
        <Route element={<Layout />}>
          <Route path="/quotes/:id" element={<UserQuoteDetail />} />
          <Route path="/works" element={<UserCompletedQuotations />} />
          <Route path="/new-quote" element={<NewQuoteRequest />} />
          <Route path="/quotations" element={<UserQuotations />} />
          <Route path="/recent-updates" element={<NotificationsPage />} />
          <Route path="/account" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);

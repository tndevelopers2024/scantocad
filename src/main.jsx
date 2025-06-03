// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ProtectedRoute from "./contexts/ProtectedRoute.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import AdminRegisterPage from "./components/AdminRegisterPage.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OnboardingPage from "./components/user/OnboardingPage.jsx";
import NewQuoteRequest from "./components/user/NewQuoteRequest.jsx";
import HowItWorksPage from "./components/user/HowItWorksPage.jsx";
import Layout from "./components/user/Layout.jsx";
import Layout1 from "./components/admin/Layout.jsx";
import Dashboard from "./components/admin/dashboard.jsx";
import QuoteDetail from "./components/admin/QuoteDetail.jsx";
import UserQuotations from "./components/user/UserQuotations.jsx";
import UserQuoteDetail from "./components/user/QuoteDetail.jsx";
import UserCompletedQuotations from "./components/user/works.jsx";
import NotificationsPage from "./components/user/Notifications.jsx";
import SettingsPage from "./components/user/SettingsPage.jsx";
import Logout from "./components/Logout.jsx";
import { SocketProvider } from "../src/contexts/SocketProvider.jsx";
import EditQuoteRequest from "./components/user/EditQuoteRequest.jsx";
import UsersList from "./components/admin/Customers.jsx";
import UserDetailsPage from "./components/admin/User.jsx";
import RateConfigPage from "./components/admin/RateConfigPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <Router>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/adminregister" element={<AdminRegisterPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route 
            path="/how-it-works" 
            element={<ProtectedRoute><HowItWorksPage /></ProtectedRoute>} 
          />
          
          {/* Admin routes */}
          <Route element={<Layout1 />}>
            <Route 
              path="/admin/customers" 
              element={<ProtectedRoute><UsersList /></ProtectedRoute>} 
            />
             <Route 
              path="/admin/dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
             <Route 
              path="/admin/confiquration" 
              element={<ProtectedRoute><RateConfigPage /></ProtectedRoute>} 
            />
            <Route 
              path="/admin/quotes/:id" 
              element={<ProtectedRoute><QuoteDetail /></ProtectedRoute>} 
            />
             <Route 
              path="/admin/users/:id" 
              element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} 
            />
          </Route>
          
          {/* User routes with layout */}
          <Route element={<Layout />}>
            <Route 
              path="/quotes/:id" 
              element={<ProtectedRoute><UserQuoteDetail /></ProtectedRoute>} 
            />
            <Route 
              path="/my-orders" 
              element={<ProtectedRoute><UserCompletedQuotations /></ProtectedRoute>} 
            />
            <Route 
              path="/request-quote" 
              element={<ProtectedRoute><NewQuoteRequest /></ProtectedRoute>} 
            />
            <Route 
              path="/my-quotations" 
              element={<ProtectedRoute><UserQuotations /></ProtectedRoute>} 
            />
            <Route 
              path="/recent-updates" 
              element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/my-profile" 
              element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/edit-quote/:id" 
              element={<ProtectedRoute><EditQuoteRequest /></ProtectedRoute>} 
            />
          </Route>
        </Routes>
      </Router>
    </SocketProvider>
  </StrictMode>
);
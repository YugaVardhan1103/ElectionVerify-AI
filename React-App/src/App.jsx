import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SubmitClaim from "./pages/SubmitClaim";
import VerificationResult from "./pages/VerificationResult";
import VerificationHistory from "./pages/VerificationHistory";
import Profile from "./pages/Profile";
import ReviewerQueue from "./pages/ReviewerQueue";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-claim"
          element={
            <ProtectedRoute>
              <SubmitClaim />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification-result/:id"
          element={
            <ProtectedRoute>
              <VerificationResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification-result"
          element={
            <ProtectedRoute>
              <VerificationResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification-history"
          element={
            <ProtectedRoute>
              <VerificationHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer-queue"
          element={
            <ProtectedRoute requiredRoles={["reviewer", "admin"]}>
              <ReviewerQueue />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

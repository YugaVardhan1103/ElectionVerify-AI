import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SubmitClaim from "./pages/SubmitClaim";
import VerificationResult from "./pages/VerificationResult";
import VerificationHistory from "./pages/VerificationHistory";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-claim" element={<SubmitClaim />} />
        <Route
          path="/verification-result"
          element={<VerificationResult />}
        />
        <Route
          path="/verification-history"
          element={<VerificationHistory />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// watchly/src/App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// --- COMPONENT IMPORTS ---
// Make sure these exist and point to the correct paths in your project
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register"; // from your 'bigger' version
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import WebsiteList from "./components/Websites/WebsiteList";
import AddWebsite from "./components/Websites/AddWebsite";
import MetricList from "./components/Metrics/MetricList";
import AlertList from "./components/Alerts/AlertList";
import NotFound from "./components/Common/NotFound"; // or wherever you defined a 404

import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On initial load, check localStorage for a token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("Checking token in localStorage:", savedToken);
    setUser(!!savedToken); // user = true if token is non-empty
    setIsLoading(false);
  }, []);

  // Called when a login is successful (if you want to unify code between your Login.js and here)
  const handleLogin = () => {
    // For simple demo, we store a fake token
    // If you already store a real token in Login.js, you can skip this
    localStorage.setItem("token", "authenticated");
    setUser(true);
    navigate("/dashboard");
  };

  // Called on logout to remove the token and redirect
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(false);
    navigate("/login");
  };

  // While checking for a token, show a loading screen
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    // If you already wrap <App /> with <BrowserRouter> in src/index.js,
    // remove <Router> here. If not, keep it.
    <Router>
      <div className="App min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route for dashboard */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <WebsiteMonitorUI onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Additional protected routes */}
          <Route
            path="/websites"
            element={
              user ? (
                <WebsiteList onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/websites/add"
            element={
              user ? (
                <AddWebsite onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/metrics"
            element={
              user ? (
                <MetricList onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/alerts"
            element={
              user ? (
                <AlertList onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

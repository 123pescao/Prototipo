import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import WebsiteList from "./components/Websites/WebsiteList";
import AddWebsite from "./components/Websites/AddWebsite";
import MetricList from "./components/Metrics/MetricList";
import AlertList from "./components/Alerts/AlertList";
import LandingPage from "./components/LandingPage/LandingPage"; // Moved to a dedicated folder
import ProtectedRoute from "./components/Auth/ProtectedRoute"; // Add ProtectedRoute for authentication
import NotFound from "./components/Common/NotFound"; // Add a 404 Not Found page

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page at the root path */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Require Authentication) */}
        <Route
          path="/websites"
          element={
            <ProtectedRoute>
              <WebsiteList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/websites/add"
          element={
            <ProtectedRoute>
              <AddWebsite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/metrics"
          element={
            <ProtectedRoute>
              <MetricList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertList />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

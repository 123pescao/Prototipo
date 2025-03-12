import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("Checking token in localStorage:", savedToken);  // Debugging
    setUser(!!savedToken);  // Set to true if token exists
    setIsLoading(false);
  }, []);

  // Handle login and set token
  const handleLogin = () => {
    localStorage.setItem("token", "authenticated"); // Store token
    setUser(true); // Update user state to authenticated
    navigate("/dashboard"); // Redirect to dashboard after login
  };

  // Handle logout and remove token
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    setUser(false); // Update user state to not authenticated
    navigate("/login"); // Redirect to login page
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  return (
    <div className="App min-h-screen">
      <Routes>
        {/* Landing page is always the first page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login page comes after the landing page */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Dashboard route, accessible only if user is authenticated */}
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
      </Routes>
    </div>
  );
}

export default App;

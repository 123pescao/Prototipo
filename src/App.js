import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    if (savedUser) {
      setUser(true);
    }
    setIsLoading(false); // Set loading to false after checking authentication
  }, []);

  const handleLogin = () => {
    localStorage.setItem("userToken", "authenticated");
    setUser(true);
    navigate("/dashboard"); // Navigate to the dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setUser(false);
    navigate("/login"); // Redirect to login after logout
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  return (
    <div className="App min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />} // Handle both login and sign-up
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <WebsiteMonitorUI onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;

import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    if (savedUser) {
      setUser(true);
    }
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

  return (
    <div className="App min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={user ? <WebsiteMonitorUI onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
        />
      </Routes>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import LogoutButton from "./components/LogoutButton";
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load saved user token and dark mode preference
  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    const savedTheme = localStorage.getItem("theme");

    if (savedUser) {
      setUser(true);
    }
    
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="App min-h-screen">
      {user ? (
        // Apply dark mode **only** when user is logged in
        <div className={`min-h-screen ${darkMode ? "dark:bg-gray-800 dark:text-white" : ""}`}>
          <header className="p-4 flex justify-between items-center">
            <LogoutButton onLogout={() => setUser(null)} />
          </header>
          <main className="p-4">
            <WebsiteMonitorUI darkMode={darkMode} setDarkMode={setDarkMode} />
          </main>
        </div>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;

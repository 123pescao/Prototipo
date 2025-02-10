import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import LogoutButton from "./components/LogoutButton";
import './index.css';  

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    if (savedUser) {
      setUser(true);
    }
  }, []);

  return (
    <div className="App min-h-screen bg-white text-black">
      {user ? (
        // Apply dark mode **only** when user is logged in
        <div className="dark:bg-gray-800 dark:text-white min-h-screen">
          <header className="p-4 flex justify-between items-center">
            <LogoutButton onLogout={() => setUser(null)} />
          </header>
          <main className="p-4">
            <WebsiteMonitorUI />
          </main>
        </div>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;

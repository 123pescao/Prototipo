import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import DarkModeToggle from "./components/DarkModeToggle";
import LogoutButton from "./components/LogoutButton";
import './index.css';  

function App() {
  const [user, setUser] = useState(null);

  // Check if user is logged in (for example, based on a token or user data in localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("userToken"); // Or any other logic to check if the user is logged in
    if (savedUser) {
      setUser(true); // or setUser(savedUser)
    }
  }, []);

  return (
    <div className="App min-h-screen bg-white text-black dark:bg-gray-800 dark:text-white">
      <header className="p-4 flex justify-between items-center">
        <DarkModeToggle />
        {user && <LogoutButton onLogout={() => setUser(null)} />}
      </header>
      
      <main className="p-4">
        {user ? <WebsiteMonitorUI /> : <Login onLogin={setUser} />}
      </main>
    </div>
  );
}

export default App;

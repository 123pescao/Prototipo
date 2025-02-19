import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  // Load saved user token
  useEffect(() => {
    const savedUser = localStorage.getItem("userToken");
    if (savedUser) {
      setUser(true);
    }
  }, []);

  return (
    <div className="App min-h-screen">
      {user ? (
        <div className="min-h-screen">
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

import React, { useState } from "react";
import Login from "./components/Login";
import WebsiteMonitorUI from "./components/WebsiteMonitorUI";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {user ? <WebsiteMonitorUI /> : <Login onLogin={setUser} />}
    </div>
  );
}

export default App;

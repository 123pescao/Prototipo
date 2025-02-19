import React, { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fullMessage = "Monitor your websites in real-time with instant alerts and performance tracking.";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessage(fullMessage.slice(0, i));
      i++;
      if (i > fullMessage.length) i = 0;
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Temporary credentials for testing (replace with real authentication later)
    const validEmail = "admin@example.com";
    const validPassword = "password123";
    
    setIsLoading(true);
    if (email === validEmail && password === validPassword) {
      onLogin({ email });
    } else {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Inputs */}
      <div className="w-1/2 flex flex-col justify-center p-12 bg-cover bg-center" style={{ backgroundImage: "url('/.jpg')" }}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition duration-300 text-white font-semibold py-3 rounded-md`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-12">
        <img src="/hawk.png" alt="Watchly Logo" className="w-24 h-24 mb-4" />
        <h2 className="text-5xl font-bold mb-4 text-green-400">Watchly</h2>
        <p className="text-lg text-green-400 font-mono tracking-wide mb-6">{message}</p>
      </div>
    </div>
  );
}

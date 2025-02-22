import React, { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Track whether the user is on the login or sign-up page

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessage("Monitor your websites in real-time with instant alerts and performance tracking.");
      i++;
      if (i > 5) clearInterval(interval); // Limit interval for a smoother animation
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const validEmail = "admin@example.com";
      const validPassword = "password123";

      if (email === validEmail && password === validPassword) {
        onLogin({ email });
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const validEmail = "admin@example.com";
      const validPassword = "password123";

      if (email === validEmail && password === validPassword) {
        onLogin({ email });
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className={`w-1/2 flex flex-col justify-center p-12 ${isSignUp ? 'hidden' : 'block'} bg-green-500`}>
        <div className="text-center mb-8">
          <img src="/hawk.png" alt="Watchly Logo" className="w-24 h-24 mx-auto" />
          <h2 className="text-3xl font-bold text-white">Login</h2>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-3 rounded-md`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(true)}
            className="text-white hover:text-green-500 transition duration-300"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>

      {/* Right Side - Sign-Up Form */}
      <div className={`w-1/2 flex flex-col justify-center p-12 ${!isSignUp ? 'hidden' : 'block'} bg-white`}>
        <div className="text-center mb-8">
          <img src="/hawk.png" alt="Watchly Logo" className="w-24 h-24 mx-auto" />
          <h2 className="text-3xl font-bold text-green-500">Sign Up</h2>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold py-3 rounded-md`}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(false)}
            className="text-green-500 hover:text-white transition duration-300"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}

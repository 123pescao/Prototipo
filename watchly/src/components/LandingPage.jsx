import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import AnimatedHeader from "./AnimatedHeader";
import InteractiveCharts from "./InteractiveCharts";
import InteractiveFeatureCards from "./InteractiveFeatureCards";
import StepsAnimation from "./StepsAnimation";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-lg py-4 px-6 flex justify-between items-center z-50">
        <h1 className="text-2xl font-bold text-green-500 cursor-pointer" onClick={() => navigate("/")}>
          Watchly
        </h1>
        <div className="space-x-6">
          <Button className="text-gray-900 bg-transparent hover:text-green-500" onClick={() => navigate("/about")}>
            About
          </Button>
          <Button className="text-gray-900 bg-transparent hover:text-green-500" onClick={() => navigate("/contact")}>
            Contact Us
          </Button>
          <Button className="text-gray-900 bg-transparent hover:text-green-500" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg text-white" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen bg-white text-center px-6">
        <h1 className="text-5xl font-extrabold text-green-500 mb-4">
          Monitor Your Websites in Real-Time
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl">
          Track uptime, response times, and performance insights with Watchly.
        </p>
        <div className="flex space-x-4">
          <Button
            className="bg-green-500 hover:bg-green-600 py-3 px-6 text-lg rounded-lg text-white transition duration-300"
            onClick={() => navigate("/dashboard")} // Change this if needed
          >
            Get Started
          </Button>
          <Button
            className="bg-gray-900 hover:bg-gray-800 py-3 px-6 text-lg rounded-lg text-white transition duration-300"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>

          
        </div>
      </section>
      <AnimatedHeader />
      {/* Performance Insights Section */}
      <section className="py-16 bg-white text-center">
        <div className="container mx-auto">
          <AnimatedHeader />
          <h2 className="text-3xl font-bold text-green-500 mb-8">Performance Insights</h2>
          <InteractiveCharts />
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-green-500 mb-8">Key Features</h2>
          <InteractiveFeatureCards />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-green-500 mb-8">How It Works</h2>
          <StepsAnimation />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100 text-center">
        <p className="text-gray-700">© {new Date().getFullYear()} Watchly. All rights reserved.</p>
      </footer>
    </div>
  );
}

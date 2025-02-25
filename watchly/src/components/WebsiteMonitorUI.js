import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import WebsitesTable from "./WebsitesTable";
import { fetchWebsiteStatus, fetchWebsites, calculateUptimePercentage, calculateAverageResponseTime } from "./utils";
import { Globe, Activity, Clock, AlertTriangle } from "lucide-react"; // Import missing icons

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch websites on component mount
  useEffect(() => {
    const loadWebsites = async () => {
      const data = await fetchWebsites();
      setWebsites(data);
    };
    loadWebsites();
  }, []);

  // Periodically update website statuses
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedWebsites = await Promise.all(
        websites.map(async (site) => {
          const statusData = await fetchWebsiteStatus(site.url);
          return { ...site, ...statusData };
        })
      );
      setWebsites(updatedWebsites);
    }, 10000);

    return () => clearInterval(interval);
  }, [websites]);

  // Handle URL input change
  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addWebsite();
  };

  // Add a new website
  const addWebsite = async () => {
    if (url.trim() !== "") {
      setLoading(true);
      try {
        console.log("Adding website:", url); // Log the URL being added
  
        const response = await fetch('http://localhost:5000/websites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ url, name: url, frequency: 5 }),
        });
  
        console.log("Response status:", response.status); // Log the response status
  
        if (!response.ok) {
          const errorData = await response.json(); // Log the error response
          console.error("Error response:", errorData);
          throw new Error('Failed to add website');
        }
  
        const newWebsite = await response.json();
        console.log("New website added:", newWebsite); // Log the new website
  
        setWebsites((prev) => [...prev, newWebsite]);
        setUrl("");
      } catch (error) {
        console.error('Failed to add website:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  // Remove a website
  const removeWebsite = async (websiteId) => {
    try {
      await fetch(`http://localhost:5000/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setWebsites((prev) => prev.filter((site) => site.id !== websiteId));
    } catch (error) {
      console.error('Failed to remove website:', error);
    }
  };

  // Stats for the dashboard
  const stats = [
    {
      icon: Globe,
      title: "Websites Monitored",
      value: websites.length,
      color: "text-blue-500"
    },
    {
      icon: Activity,
      title: "Uptime",
      value: `${calculateUptimePercentage(websites)}%`,
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${calculateAverageResponseTime(websites)} ms`,
      color: "text-purple-500"
    },
    {
      icon: AlertTriangle,
      title: "Active Alerts",
      value: notifications.length,
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/5 via-transparent to-transparent"></div>
      
      {/* Header */}
      <Header 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Add Website Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <input
              type="url"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={handleInputChange}
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>

        {/* Websites Table */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <WebsitesTable websites={websites} removeWebsite={removeWebsite} />
        </Card>
      </main>
    </div>
  );
}

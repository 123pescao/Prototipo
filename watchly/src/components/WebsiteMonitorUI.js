import React, { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import WebsitesTable from "./WebsitesTable";
import {
  fetchWebsiteStatus,
  calculateUptimePercentage,
  calculateAverageResponseTime,
  addWebsite as apiAddWebsite,
  deleteWebsite
} from "../services/api";
import { Globe, Activity, Clock, AlertTriangle } from "lucide-react";
import useWebsites from "../hooks/useWebsites";

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const { websites, loading: initialLoading, error, fetchWebsites } = useWebsites();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formError, setFormError] = useState("");

  const isValidUrl = useCallback((url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    setFormError("");
  };

  const handleAddWebsite = useCallback(async () => {
    if (!isValidUrl(url)) {
      setFormError("Invalid URL. Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    if (websites.some((site) => site.url === url)) {
      setFormError("This website is already being monitored.");
      return;
    }

    setLoading(true);
    try {
      const newWebsite = await apiAddWebsite({ url, name: url, frequency: 5 });
      await fetchWebsites();
      const statusData = await fetchWebsiteStatus(url);
      setNotifications((prev) => [...prev, { url, status: statusData.status }]);
      setUrl("");
      setFormError("");
    } catch (error) {
      console.error("Failed to add website:", error);
      setFormError("Failed to add website. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url, websites, isValidUrl, fetchWebsites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddWebsite();
  };

  const removeWebsite = async (websiteId) => {
    try {
      await deleteWebsite(websiteId);
      fetchWebsites();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await Promise.all(
          websites.map(async (site) => {
            const statusData = await fetchWebsiteStatus(site.url);
            return { ...site, ...statusData };
          })
        );
        fetchWebsites();
      } catch (error) {
        console.error("Failed to update website statuses:", error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [websites, fetchWebsites]);

  const stats = [
    {
      icon: Globe,
      title: "Websites Monitored",
      value: websites.length,
      color: "text-blue-500",
    },
    {
      icon: Activity,
      title: "Uptime",
      value: `${calculateUptimePercentage(websites)}%`,
      color: "text-green-500",
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${calculateAverageResponseTime(websites)} ms`,
      color: "text-purple-500",
    },
    {
      icon: AlertTriangle,
      title: "Active Alerts",
      value: notifications.length,
      color: "text-yellow-500",
    },
  ];

  if (initialLoading) {
    return <div className="text-white">Loading websites...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/5 via-transparent to-transparent"></div>
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
      />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <StatsGrid stats={stats} />
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
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
        </form>
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <WebsitesTable websites={websites} removeWebsite={removeWebsite} />
        </Card>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import WebsitesTable from "./WebsitesTable";
import {
  fetchWebsiteMetrics,
  calculateUptimePercentage,
  calculateAverageResponseTime,
  addWebsite as apiAddWebsite,
  deleteWebsite
} from "../services/api";
import { Globe, Activity, Clock, AlertTriangle } from "lucide-react";
import useWebsites from "../hooks/useWebsites";

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const { websites, setWebsites, loading: initialLoading, error, fetchWebsites } = useWebsites();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formError, setFormError] = useState("");
  const latestWebsites = useRef([]);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch websites only once when component mounts
  useEffect(() => {
    if (websites.length === 0) {
      fetchWebsites(); // Ensures we fetch websites once
    }
  }, []); // Empty dependency array ensures this runs only once

  const triggerAlert = (message) => {
    setNotifications((prev) => [...prev, message]);

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1)); // Remove alert after 5 sec
    }, 5000);
  };

  // Fetch website statuses every 10s without triggering infinite re-renders
  const fetchStatuses = useCallback(async () => {
    if (websites.length === 0) return;
    setStatusLoading(true);

    try {
      const updatedWebsites = await Promise.all(
        websites.map(async (site) => {
          if (!site.id) {
            console.error(`Skipping site: Missing ID`, site);
            return { ...site, uptime: 0, response_time: "N/A"};
          }

          try {
            const metricsData = await fetchWebsiteMetrics(site.id);
            console.log(`Metrics for ${site.url}:`, metricsData);

            const isDown = metricsData?.uptime === 0;
            if (isDown) {
              triggerAlert(`⚠️ Website Down: ${site.url} is not reachable!`)
            }

            return {
              ...site,
              uptime: isDown ? 0 : metricsData?.uptime || 0, // Ensure uptime is valid
              response_time: metricsData?.response_time ?? "N/A",
              isDown,
            };
          } catch (err) {
            console.error(`Failed to fetch metrics for ${site.url}:`, err);
            return { ...site, uptime: 0, response_time: "N/A", isDown: true }; //  Graceful fallback
          }
        })
      );

      console.log("Updated Websites with Metrics:", updatedWebsites);

       // Update state safely
      if (JSON.stringify(updatedWebsites) !== JSON.stringify(websites)) {
        latestWebsites.current = updatedWebsites;
        setWebsites([...updatedWebsites]);
      }

    } catch (error) {
      console.error("Failed to update website statuses:", error);
    } finally {
      setStatusLoading(false);
    }
  }, [websites, setWebsites]);

  useEffect(() => {
    if (websites.length === 0) return;  // Prevent unnecessary API calls

    const interval = setInterval(() => {
      fetchStatuses();
    }, 10000);

    return () => clearInterval(interval);  // Cleanup interval on unmount or state change
  }, [websites, fetchStatuses])

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddWebsite();
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddWebsite = async () => {
    if (!isValidUrl(url)) {
      setFormError("Invalid URL. Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    if (url.trim() !== "") {
      setLoading(true);
      try {
        await apiAddWebsite({ url, name: url, frequency: 5 });
        fetchWebsites();
        setUrl("");
        setFormError("");
      } catch (error) {
        console.error("Failed to add website:", error);
        setFormError("Failed to add website. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeWebsite = async (websiteId) => {
    try {
      await deleteWebsite(websiteId);
      fetchWebsites();
    } catch (error) {
      console.error("Failed to remove website:", error);
    }
  };

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
      value: websites.length > 0
        ? (latestWebsites.current.reduce((sum, site) => sum + site.uptime, 0) / websites.length).toFixed(1) 
        : "0.0",
      color: "text-green-500",
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: websites.length > 0
        ? (latestWebsites.current
            .filter(site => typeof site.response_time === "number")
            .reduce((sum, site) => sum + site.response_time, 0) / websites.length
          ).toFixed(1)
        : "0.0",
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
    return <div className="text-white text-center mt-20">Loading websites...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/5 via-transparent to-transparent"></div>
      <Header showNotifications={showNotifications} setShowNotifications={setShowNotifications} notifications={notifications} />
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
            <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
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

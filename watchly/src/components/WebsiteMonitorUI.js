import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import StatsGrid from "./StatsGrid";
import api from "../services/api";
import { getAlerts } from "../services/api";
import WebsitesTable from "./WebsitesTable";
import {
  fetchWebsiteMetrics,
  addWebsite as apiAddWebsite,
  deleteWebsite,
} from "../services/api";
import { Globe, Activity, Clock, AlertTriangle } from "lucide-react";
import useWebsites from "../hooks/useWebsites";

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const { websites, setWebsites, loading: initialLoading, fetchWebsites } = useWebsites();
  const [uptimePercentage, setUptimePercentage] = useState("0.0");
  const [averageResponseTime, setAverageResponseTime] = useState("0.0");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formError, setFormError] = useState("");
  const latestWebsites = useRef([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const intervalRef = useRef(null);

  // Create a ref to always hold the latest websites state
  const websitesRef = useRef(websites);
  useEffect(() => {
    websitesRef.current = websites;
  }, [websites]);

  // Alert helper: adds a new alert and removes it after 5 seconds.
  const triggerAlert = useCallback((message) => {
    setNotifications((prev) => {
      const newAlerts = [...prev, message];
      if (newAlerts.length > 5) newAlerts.shift();
      return newAlerts;
    });

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  }, [setNotifications]);

  const fetchActiveAlerts = useCallback(async () => {
    try {
      // If your backend returns all unresolved alerts for the current user:
      const response = await api.get("/alerts?status=unresolved");
      // response.data is presumably an array of unresolved alerts
      setActiveAlerts(response.data.length);
      console.log("Updated active alerts count:", response.data.length);
    } catch (error) {
      console.error("Failed to fetch unresolved alerts:", error);
    }
  }, []);

  useEffect(() => {
    fetchActiveAlerts();
    const intervalId = setInterval(fetchActiveAlerts, 10000); // poll every 10s
    return () => clearInterval(intervalId);
  }, [fetchActiveAlerts]);

  // fetchStatuses: fetches metrics for each website, formats uptime as percentage,
  // and returns the updated website data.
  const fetchStatuses = useCallback(async () => {
    const currentWebsites = websitesRef.current;
    if (currentWebsites.length === 0) return;
    setStatusLoading(true);

    try {
      const updatedWebsites = await Promise.all(
        currentWebsites.map(async (site) => {
          if (!site.id) return { ...site, numericUptime: 0, numericResponseTime: 0, uptime: "0%", response_time: "N/A", isDown: true };

          try {
            const metricsData = await fetchWebsiteMetrics(site.id);
            const numericUptime = parseFloat(metricsData.uptime ?? 0);  // ✅ Ensure numeric value
            const numericResponseTime = parseFloat(metricsData.response_time ?? 0);

            const uptimeDisplay = `${(numericUptime * 100).toFixed(1)}%`;
            const responseTimeDisplay = numericResponseTime > 0 ? numericResponseTime.toFixed(2) : "N/A";
            const isDown = numericUptime < 0.5;

            return {
              ...site,
              numericUptime,
              numericResponseTime,
              uptime: uptimeDisplay,
              response_time: responseTimeDisplay,
              isDown
            };
          } catch (err) {
            console.error(`Failed to fetch metrics for ${site.url}:`, err);
            return { ...site, numericUptime: 0, numericResponseTime: 0, uptime: "0.0%", response_time: "N/A", isDown: true };
          }
        })
      );

      setWebsites(updatedWebsites);
      //Ensure `uptimePercentage` updates correctly
      const validWebsites = updatedWebsites.filter(site => !isNaN(site.numericUptime));
      const totalUptime = validWebsites.reduce((sum, site) => sum + site.numericUptime, 0);
      const avgUptime = validWebsites.length > 0
        ? ((totalUptime / validWebsites.length) * 100).toFixed(1)
        : "0.0";

      console.log("Before setting uptime percentage:", uptimePercentage); // Debug
      setUptimePercentage(avgUptime);
      console.log("After setting uptime percentage:", avgUptime);

      const validResponseTimes = updatedWebsites.filter(site => !isNaN(site.numericResponseTime) && site.numericResponseTime > 0);
      const totalResponseTime = validResponseTimes.reduce((sum, site) => sum + site.numericResponseTime, 0);
      const avgResponseTime = validResponseTimes.length > 0
        ? (totalResponseTime / validResponseTimes.length).toFixed(2)  // ✅ Ensure 2 decimal places
        : "0.0";

      console.log("Before setting avg response time:", averageResponseTime); // Debug
      setAverageResponseTime(avgResponseTime);
      console.log("After setting avg response time:", avgResponseTime);  // Debug

    } catch (error) {
      console.error("Failed to update website statuses:", error);
    } finally {
      setStatusLoading(false);
    }
  }, [triggerAlert, setWebsites, fetchWebsiteMetrics]);

  useEffect(() => {
    console.log("Updated uptime percentage (State Change):", uptimePercentage);
  }, [uptimePercentage]);  // ✅ Ensures React detects changes

  // useEffect: run fetchStatuses immediately on mount and then every 10 seconds.
  useEffect(() => {
    fetchStatuses(); // Fetch once on mount

    intervalRef.current = setInterval(() => {
      console.log("Fetching latest status updates...");
      fetchStatuses();
    }, 10000);

    return () => {
      console.log("Clearing interval for status updates.");
      clearInterval(intervalRef.current);
    };
  }, [fetchStatuses]);

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
      value: `${uptimePercentage}%`,
      color: uptimePercentage === "100.0" ? "text-green-500" : "text-yellow-500",
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${averageResponseTime} ms`,
      color: "text-purple-500",
    },
    {
      icon: AlertTriangle,
      title: "Active Alerts",
      value: activeAlerts,
      color: "text-yellow-500",
    },
  ];

  if (initialLoading) {
    return <div className="text-white text-center mt-20">Loading websites...</div>;
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
      <StatsGrid
        stats={stats} />
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
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

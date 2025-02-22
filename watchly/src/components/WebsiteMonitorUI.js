import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Activity, AlertTriangle, Bell, CheckCircle as CircleCheck, Circle as CircleX, Clock, Eye, Globe, LogOut, Monitor, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fetchWebsiteStatus = async (url) => {
  const response = await fetch(`https://api.yourwebsite-monitor.com/status?url=${url}`);
  return response.json();
};

export default function WebsiteMonitorUI() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Website example.com is down!", type: "error", time: "2 min ago" },
    { id: 2, message: "Response time improved for test.com", type: "success", time: "5 min ago" }
  ]);

  useEffect(() => {
    const interval = setInterval(async () => {
      setWebsites((prevWebsites) =>
        prevWebsites.map(async (site) => {
          const statusData = await fetchWebsiteStatus(site.url);
          return { ...site, ...statusData };
        })
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addWebsite();
  };

  const addWebsite = async () => {
    if (url.trim() !== "") {
      setLoading(true);
      const newWebsite = {
        url,
        status: "Checking...",
        history: [],
        speed: "Unknown",
        uptime: 100,
        alertTriggered: false,
        loadTime: 0,
        responseTime: Math.floor(Math.random() * 500) + 100, // Simulated response time
      };
      setWebsites((prev) => [...prev, newWebsite]);
      setUrl("");
      const statusData = await fetchWebsiteStatus(url);
      setWebsites((prev) => prev.map((w) => (w.url === url ? { ...w, ...statusData } : w)));
      setLoading(false);
    }
  };

  const removeWebsite = (targetUrl) => {
    setWebsites(websites.filter((site) => site.url !== targetUrl));
  };

  const calculateUptimePercentage = () => {
    const totalUptime = websites.reduce((acc, website) => acc + website.uptime, 0);
    return websites.length > 0 ? ((totalUptime / websites.length) * 100).toFixed(2) : 0;
  };

  const calculateAverageResponseTime = () => {
    const totalResponseTime = websites.reduce((acc, website) => acc + website.responseTime, 0);
    return websites.length > 0 ? (totalResponseTime / websites.length).toFixed(2) : 0;
  };

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
      value: `${calculateUptimePercentage()}%`,
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Avg Response Time",
      value: `${calculateAverageResponseTime()} ms`,
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
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Monitor className="w-10 h-10 text-blue-500" />
                <Eye className="w-5 h-5 text-white absolute bottom-0 right-0" />
              </div>
              <h1 className="text-2xl font-bold text-white">Watchly</h1>
            </div>

            <div className="flex items-center space-x-6">
              <button 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-6 h-6 text-white/80 hover:text-white transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button onClick={() => navigate("/settings")}>
                <Settings className="w-6 h-6 text-white/80 hover:text-white transition-colors" />
              </button>
              <button 
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  navigate("/login");
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-4 top-16 w-80 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-50">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Notifications</h3>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-white/5"
                  >
                    {notification.type === "error" ? (
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    ) : (
                      <CircleCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-white/50 text-xs mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? "Adding..." : "Add Website"}
            </Button>
          </div>
        </form>

        {/* Websites Table */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/60">Website URL</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Uptime</TableHead>
                <TableHead className="text-white/60">Response Time</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow key={website.url} className="border-white/10">
                  <TableCell className="text-white">{website.url}</TableCell>
                  <TableCell>
                    <span className={`flex items-center space-x-2 ${
                      website.status === "Up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {website.status === "Up" ? (
                        <CircleCheck className="w-4 h-4" />
                      ) : (
                        <CircleX className="w-4 h-4" />
                      )}
                      <span>{website.status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{website.uptime}%</TableCell>
                  <TableCell className="text-white">{website.responseTime} ms</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => removeWebsite(website.url)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}

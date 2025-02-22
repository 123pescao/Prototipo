import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { CircleCheck, CircleX } from "lucide-react";
import AnimatedHeader from "./AnimatedHeader";

const fetchWebsiteStatus = async (url) => {
  const response = await fetch(`https://api.yourwebsite-monitor.com/status?url=${url}`);
  return response.json();
};

export default function WebsiteMonitorUI() {
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);  // Add loading state
  const [currentPage, setCurrentPage] = useState("home");

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
    e.preventDefault(); // Prevent default form submission
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

  return (
    <div className="min-h-screen w-full bg-white p-6 text-black">
      <header className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-3">
          <img src="/hawk.png" alt="Watchly Logo" className="w-16 h-16" />
          <h1 className="text-3xl font-extrabold text-green-500">Watchly</h1>
        </div>
        <nav className="space-x-6">
          <button className="text-lg hover:text-green-500 transition duration-300">SIGN UP</button>
          <button className="text-lg hover:text-green-500 transition duration-300">LOGIN</button>
          <button className="text-lg hover:text-green-500 transition duration-300">SETTINGS</button>
          <button className="text-lg hover:text-green-500 transition duration-300">ABOUT</button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            onClick={() => {
              localStorage.removeItem("authToken"); // Example: Clearing auth token
              window.location.href = "/login"; // Redirecting to login page
            }}
          >
            LOG OUT
          </Button>
        </nav>
      </header>

      <main className="mt-0">
        <AnimatedHeader />  {/* Add it here */}

        {/* Total Websites Monitored Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Websites Monitored</p>
              <p className="text-4xl font-bold text-green-500">{websites.length}</p>
            </CardContent>
          </Card>
          {/* Uptime Percentage */}
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Uptime</p>
              <p className="text-4xl font-bold text-green-500">
                {calculateUptimePercentage()}%
              </p>
            </CardContent>
          </Card>
          {/* Average Response Time */}
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Response Time</p>
              <p className="text-4xl font-bold text-green-500">
                {calculateAverageResponseTime()} ms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Websites Table */}
        <div className="mt-10 bg-gray-800 p-8 rounded-xl shadow-lg">
          <Table className="text-green-400">
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm text-white-500">Website URL</TableHead>
                <TableHead className="text-sm text-white-500">Status</TableHead>
                <TableHead className="text-sm text-white-500">Uptime</TableHead>
                <TableHead className="text-sm text-white-500">Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => {
                return (
                  <TableRow key={website.url}>
                    <TableCell className="text-white-300">{website.url}</TableCell>
                    <TableCell className={`flex items-center ${website.status === "Up" ? "text-green-500" : "text-red-500"}`}>
                      {website.status === "Up" ? (
                        <CircleCheck className="mr-2" />
                      ) : (
                        <CircleX className="mr-2" />
                      )}
                      {website.status}
                    </TableCell>
                    <TableCell>{website.uptime}</TableCell>
                    <TableCell>{website.responseTime}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Form for URL Input moved to the bottom */}
      <form className="flex justify-center mt-8" onSubmit={handleSubmit}>
        <input
          type="text"
          className="p-3 rounded-lg bg-white-900 text-white border border-gray-700 mr-4 w-1/3"
          placeholder="Enter Website URL"
          value={url}
          onChange={handleInputChange}
        />
        <Button
          className="bg-green-500 hover:bg-green-600 py-2 px-4 text-lg rounded-lg"
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Website"}
        </Button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { CircleCheck, CircleX } from "lucide-react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 text-white">
      <header className="flex justify-between items-center p-4 bg-black-800 rounded-lg shadow-lg transition-all duration-300">
        <h1 className="text-3xl font-extrabold text-green-500">Watchly</h1>
        <nav className="space-x-6">
          <button className="text-lg hover:text-green-500 transition duration-300">Home</button>
          <button className="text-lg hover:text-green-500 transition duration-300">Settings</button>
          <button className="text-lg hover:text-green-500 transition duration-300">Help</button>
        </nav>
      </header>

      <main className="mt-8">
        <h2 className="text-center text-4xl font-semibold mb-8">Dashboard Overview</h2>

        {/* Form for URL Input */}
        <form className="flex justify-center mb-6" onSubmit={handleSubmit}>
          <input
            type="text"
            className="p-3 rounded-lg bg-black-700 text-black mr-4 w-1/3"
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

        {/* Total Websites Monitored Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Total Websites Monitored</p>
              <p className="text-4xl font-bold text-green-500">{websites.length}</p>
            </CardContent>
          </Card>
          {/* Uptime Percentage */}
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Uptime Percentage</p>
              <p className="text-4xl font-bold text-green-500">
                {calculateUptimePercentage()}%
              </p>
            </CardContent>
          </Card>
          {/* Average Response Time */}
          <Card className="bg-gray-800 text-center p-8 rounded-xl shadow-xl transition-transform transform hover:scale-105">
            <CardContent>
              <p className="text-xl text-green-400">Average Response Time</p>
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
                    <TableCell className="text-gray-300">{website.url}</TableCell>
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
    </div>
  );
};

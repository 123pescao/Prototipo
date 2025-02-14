import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trash2, Sun, Moon, Home, Settings, Info } from "lucide-react";
import { motion } from "framer-motion";
import WebsiteStatusChart from "./WebsiteStatusChart";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const fetchWebsiteStatus = async (url) => {
  const response = await fetch(`https://api.yourwebsite-monitor.com/status?url=${url}`);
  return response.json();
};

export default function WebsiteMonitorUI() {
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  const addWebsite = async () => {
    if (url.trim() !== "") {
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
    }
  };

  const removeWebsite = (targetUrl) => {
    setWebsites(websites.filter((site) => site.url !== targetUrl));
  };

  const navButtons = [
    { name: "Home", icon: Home },
    { name: "Settings", icon: Settings },
    { name: "About", icon: Info }
  ];

  const chartData = useMemo(() => ({
    labels: websites.map(site => site.url),
    datasets: [
      { label: 'Website Uptime', data: websites.map(site => site.uptime), borderColor: 'green', fill: false },
      { label: 'Website Load Time', data: websites.map(site => site.loadTime), borderColor: 'red', fill: false },
    ],
  }), [websites]);

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-64 bg-gray-900 text-white p-6 shadow-lg">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Watchly Logo" className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-white">Watchly</h1>
        </div>
        {navButtons.map(({ name, icon: Icon }) => (
          <button key={name} onClick={() => setCurrentPage(name.toLowerCase())} className="mt-4 flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-full">
            <Icon size={20} /> <span>{name}</span>
          </button>
        ))}
        <motion.button onClick={() => setDarkMode(!darkMode)} className="mt-6 flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-full absolute bottom-6 left-0 right-0 mx-auto">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />} <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 space-y-6">
        {currentPage === "home" && (
          <div>
            <Card className="shadow-lg rounded-xl dark:bg-gray-800 dark:text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Enter website URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700" />
                  <Button onClick={addWebsite} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add</Button>
                </div>
              </CardContent>
            </Card>

            <Table className="border rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
              <TableHeader>
                <TableRow className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white">
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites.map((site, index) => (
                  <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <TableCell>{site.url}</TableCell>
                    <TableCell>{site.status}</TableCell>
                    <TableCell>{site.uptime}%</TableCell>
                    <TableCell>{site.loadTime} ms</TableCell>
                    <TableCell>
                      <Button onClick={() => removeWebsite(site.url)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <WebsiteStatusChart data={chartData} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

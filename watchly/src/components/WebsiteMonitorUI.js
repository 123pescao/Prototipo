import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Loader2, Trash2, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import WebsiteStatusChart from './WebsiteStatusChart'; // Import the chart

export default function WebsiteMonitorUI() {
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [selectedWebsite, setSelectedWebsite] = useState(null); // Track the selected website
  const [loadingChart, setLoadingChart] = useState(false); // Track chart loading state

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const addWebsite = async () => {
    if (url.trim() !== "") {
      const newWebsite = { url, status: "Checking..." };
      setWebsites([...websites, newWebsite]);

      try {
        const response = await fetch("http://127.0.0.1:5000/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();
        setWebsites((prev) =>
          prev.map((site) =>
            site.url === url ? { ...site, status: data.status } : site
          )
        );
      } catch (error) {
        setWebsites((prev) =>
          prev.map((site) =>
            site.url === url ? { ...site, status: "Error" } : site
          )
        );
      }

      setUrl("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents accidental form submission
      addWebsite();
    }
  };

  const removeWebsite = (targetUrl) => {
    setWebsites(websites.filter((site) => site.url !== targetUrl));
  };

  const handleWebsiteClick = (website) => {
    setSelectedWebsite(website);
    setLoadingChart(true); // Set loading state to true when a website is selected
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        className="w-64 bg-gray-900 text-white p-6 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center text-white">Watchly</h1>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <ul className="mt-6 space-y-4">
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Home</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Website Status</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Settings</li>
        </ul>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-6 flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-full"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 space-y-6">
        {/* Monitoring Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="shadow-lg p-6 bg-blue-100 dark:bg-blue-800 dark:text-white">
            <h3 className="text-xl font-bold">Total Websites</h3>
            <p className="text-2xl">{websites.length}</p>
          </Card>
          <Card className="shadow-lg p-6 bg-green-100 dark:bg-green-800 dark:text-white">
            <h3 className="text-xl font-bold">Online</h3>
            <p className="text-2xl">
              {websites.filter((site) => site.status === "Online").length}
            </p>
          </Card>
          <Card className="shadow-lg p-6 bg-red-100 dark:bg-red-800 dark:text-white">
            <h3 className="text-xl font-bold">Offline</h3>
            <p className="text-2xl">
              {websites.filter((site) => site.status === "Error").length}
            </p>
          </Card>
        </div>

        {/* Add Website Section */}
        <Card className="shadow-lg rounded-xl dark:bg-gray-800 dark:text-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress} // ✅ Fixed Enter Key Issue
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button onClick={addWebsite} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Website Status Table */}
        <Table className="border rounded-lg shadow-md dark:bg-gray-800 dark:text-white">
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white">
              <TableHead className="p-3">Website</TableHead>
              <TableHead className="p-3">Status</TableHead>
              <TableHead className="p-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((site, index) => (
              <motion.tr 
                key={index} 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleWebsiteClick(site)} // Show chart when clicked
              >
                <TableCell className="p-3 font-medium">{site.url}</TableCell>
                <TableCell className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      site.status === "Online"
                        ? "bg-green-200 text-green-700 dark:bg-green-800 dark:text-white"
                        : site.status === "Checking..."
                        ? "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-white"
                        : "bg-red-200 text-red-700 dark:bg-red-800 dark:text-white"
                    }`}
                  >
                    {site.status === "Checking..." ? <Loader2 className="animate-spin" /> : site.status}
                  </span>
                </TableCell>
                <TableCell className="p-3 text-center">
                  <Button
                    onClick={() => removeWebsite(site.url)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>

        {/* Render the website status chart for selected website */}
        {selectedWebsite && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {/* Show loading spinner while chart is being loaded */}
            {loadingChart ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <WebsiteStatusChart url={selectedWebsite.url} />
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

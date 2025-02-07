import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WebsiteMonitorUI() {
  const [websites, setWebsites] = useState([]);
  const [url, setUrl] = useState("");

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

  const removeWebsite = (targetUrl) => {
    setWebsites(websites.filter((site) => site.url !== targetUrl));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        className="w-64 bg-gray-900 text-white p-6 shadow-lg"
      >
        <h1 className="text-3x1 font-bold text-center text-white">Watchly</h1>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <ul className="mt-6 space-y-4">
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Home</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Website Status</li>
          <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">Settings</li>
        </ul>
      </motion.div>

      {/* Main Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 space-y-6">
       
        {/* Monitoring Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="shadow-lg p-6 bg-blue-100">
            <h3 className="text-xl font-bold">Total Websites</h3>
            <p className="text-2xl">{websites.length}</p>
          </Card>
          <Card className="shadow-lg p-6 bg-green-100">
            <h3 className="text-xl font-bold">Online</h3>
            <p className="text-2xl">
              {websites.filter((site) => site.status === "Online").length}
            </p>
          </Card>
          <Card className="shadow-lg p-6 bg-red-100">
            <h3 className="text-xl font-bold">Offline</h3>
            <p className="text-2xl">
              {websites.filter((site) => site.status === "Error").length}
            </p>
          </Card>
        </div>

        {/* Add Website Section */}
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <Button onClick={addWebsite} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Website Status Table */}
        <Table className="border rounded-lg shadow-md">
          <TableHeader>
            <TableRow className="bg-gray-200 text-gray-700">
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
                className="border-b hover:bg-gray-100"
              >
                <TableCell className="p-3 font-medium">{site.url}</TableCell>
                <TableCell className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      site.status === "Online"
                        ? "bg-green-200 text-green-700"
                        : site.status === "Checking..."
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-red-200 text-red-700"
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
      </motion.div>
    </div>
  );
}

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { CheckCircle as CircleCheck, Circle as CircleX } from "lucide-react";

const WebsitesTable = ({ websites, removeWebsite }) => {
  console.log("Websites received in WebsitesTable:", websites);

  return (
    <Table className="bg-gray-100 text-black rounded-lg shadow-md">
      <TableHeader>
        <TableRow className="border-gray-300 bg-gray-200">
          <TableHead className="text-gray-800 font-semibold">Website URL</TableHead>
          <TableHead className="text-gray-800 font-semibold">Status</TableHead>
          <TableHead className="text-gray-800 font-semibold">Uptime</TableHead>
          <TableHead className="text-gray-800 font-semibold">Response Time</TableHead>
          <TableHead className="text-gray-800 font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {websites.map((website) => {
          const isUp = !website.isDown;
          return (
            <TableRow key={website.id} className="border-b border-gray-300 hover:bg-gray-50 transition">
              <TableCell className="font-medium">{website.url}</TableCell>
              <TableCell>
                <span className={`flex items-center space-x-2 ${isUp ? "text-green-600" : "text-red-600"}`}>
                  {isUp ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
                  <span>{isUp ? "Up" : "Down"}</span>
                </span>
              </TableCell>
              <TableCell>{website.uptime !== undefined ? `${parseFloat(website.uptime).toFixed(1)}%` : "0%"}</TableCell>
              <TableCell>{website.response_time !== "N/A" ? `${website.response_time} ms` : "N/A"}</TableCell>
              <TableCell>
                <Button
                  onClick={() => removeWebsite(website.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default WebsitesTable;

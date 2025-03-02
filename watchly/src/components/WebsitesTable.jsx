import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { CheckCircle as CircleCheck, Circle as CircleX } from "lucide-react";

const WebsitesTable = ({ websites, removeWebsite }) => {
  return (
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
        {websites.map((website) => {
          const isUp = website.uptime > 0;  // Convert uptime into boolean status
          return (
            <TableRow key={website.id} className="border-white/10">
              <TableCell className="text-white">{website.url}</TableCell>
              <TableCell>
                <span className={`flex items-center space-x-2 ${
                  isUp ? "text-green-400" : "text-red-400"
                }`}>
                  {isUp ? (
                    <CircleCheck className="w-4 h-4" />
                  ) : (
                    <CircleX className="w-4 h-4" />
                  )}
                  <span>{isUp ? "Up" : "Down"}</span>
                </span>
              </TableCell>
              <TableCell className="text-white">{website.uptime !== undefined ? `${website.uptime}%` : "0"}</TableCell>
              <TableCell className="text-white">{website.response_time !== undefined ? `${website.response_time} ms` : "N/A"}</TableCell>
              <TableCell>
                <Button
                  onClick={() => removeWebsite(website.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded"
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
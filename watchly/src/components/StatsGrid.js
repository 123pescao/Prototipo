import React from "react";
import { Card, CardContent } from "./ui/card";
import { Globe, Activity, Clock, AlertTriangle } from "lucide-react"; // Import missing icons

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {isNaN(parseFloat(stat.value))
                    ? "0"
                    : stat.title === "Uptime"
                      ? `${parseFloat(stat.value).toFixed(1)}%`   // Only add `%` for Uptime
                      : stat.title === "Avg Response Time"
                        ? `${parseFloat(stat.value).toFixed(2)} ms`  // Add `ms` for response time
                        : stat.title === "Active Alerts"
                          ? `${parseInt(stat.value)}`  // No `%`, just the alert count
                          : `${parseInt(stat.value)}`}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
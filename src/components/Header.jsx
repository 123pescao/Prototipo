import React from "react";
import { Bell, Settings, LogOut, Monitor, Eye, AlertTriangle, CheckCircle as CircleCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ showNotifications, setShowNotifications, notifications }) => {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Monitor className="w-10 h-10 text-green-500 animate-pulse" />
              <Eye className="w-5 h-5 text-green-500 absolute bottom-0 right-0 animate-float" />
            </div>
            <h1 className="text-2xl font-bold text-green-500">Watchly</h1>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-6 h-6 text-white/80 hover:text-white transition-colors" />
            </button>
            <button onClick={() => navigate("/settings")}>
              <Settings className="w-6 h-6 text-white/80 hover:text-white transition-colors" />
            </button>
            <button 
              className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
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
        <div className="fixed right-4 top-16 w-80 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-[99999]">
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
  );
};

export default Header;

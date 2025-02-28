import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://watchly-worker.joel-caban2017.workers.dev";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token Interceptor to attach token to API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/login"; // Redirect to login
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Unknown Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// User Authentication
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (userData) => api.post("/auth/login", userData);

// Websites
export const getWebsites = () => api.get("/websites");
export const addWebsite = (websiteData) => api.post("/websites/add", websiteData);
export const deleteWebsite = (websiteId) => api.delete(`/websites/${websiteId}`);

// Metrics
export const getMetrics = (websiteId) => api.get(`/metrics/?website_id=${websiteId}`);
export const addMetric = (metricData) => api.post("/metrics/add", metricData);

// Alerts
export const getAlerts = (websiteId) => api.get(`/alerts/?website_id=${websiteId}`);
export const updateAlert = (alertId, status) => api.patch(`/alerts/${alertId}`, { status });

// Fetch Website Status
export const fetchWebsiteStatus = async (url) => {
  try {
    const response = await api.get(`/status?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch website status:", error);
    return { status: "offline" }; // Fallback status
  }
};

// Fetch all websites from the backend
export const fetchWebsites = async () => {
  try {
    const response = await api.get("/websites");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return []; // Return an empty array if the request fails
  }
};

// Function to calculate uptime percentage
export const calculateUptimePercentage = (websites) => {
  const totalWebsites = websites.length;
  const uptimeWebsites = websites.filter(website => website.status === "online").length;
  return totalWebsites === 0 ? 0 : (uptimeWebsites / totalWebsites) * 100;
};

// Function to calculate average response time
export const calculateAverageResponseTime = (websites) => {
  const totalWebsites = websites.length;
  if (totalWebsites === 0) return 0;

  const totalResponseTime = websites.reduce((acc, website) => acc + website.responseTime, 0);
  return totalResponseTime / totalWebsites;
};

export default api;

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
export const registerUser = (userData) => api.post("/api/auth/register", userData);
export const loginUser = (userData) => api.post("/api/auth/login", userData);

// Websites
export const getWebsites = () => api.get("/api/websites/"); // Correct API for fetching websites
export const deleteWebsite = (websiteId) => api.delete("/api/websites/delete", { data: { id: websiteId } }); // Ensure correct data format

// Add a website and start monitoring it
export const addWebsite = async (websiteData) => {
  try {
    const response = await api.post("/api/websites/add", websiteData); // API to add a website
    const website = response.data;
    const statusData = await fetchWebsiteStatus(website.url);
    const metrics = await getMetrics(website.id); // Fetching metrics after adding website
    return {
      ...website,
      status: statusData.status,
      uptime: metrics.uptime,
      responseTime: metrics.responseTime,
    };
  } catch (error) {
    console.error("Error adding website:", error);
    throw error;
  }
};

// Metrics
export const getMetrics = (websiteId) => api.get(`/api/metrics/`, { params: { websiteId } }); // Correct metrics API
export const addMetric = (metricData) => api.post("/api/metrics/add", metricData);

// Fetch Website Status
export const fetchWebsiteStatus = async (url) => {
  try {
    const response = await api.get(`/api/status?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch website status:", error);
    return { status: "offline" };
  }
};

// Fetch all websites from the backend
export const fetchWebsites = async () => {
  try {
    const response = await api.get("/api/websites/");
    const websites = response.data;
    const websitesWithMetrics = await Promise.all(
      websites.map(async (website) => {
        const statusData = await fetchWebsiteStatus(website.url);
        const metrics = await getMetrics(website.id);
        return {
          ...website,
          status: statusData.status,
          uptime: metrics.uptime,
          responseTime: metrics.responseTime,
        };
      })
    );
    return websitesWithMetrics;
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return [];
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

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
      // Server responded with a status other than 2xx
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        // Token expired or unauthorized, you can handle this by redirecting to login
        // For example:
        window.location.href = "/login";
      }
    } else if (error.request) {
      // No response was received from the server
      console.error('Network Error:', error.request);
    } else {
      // Something else caused the error
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

export default api;

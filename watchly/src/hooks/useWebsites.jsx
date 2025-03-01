import { useState, useEffect } from "react";
import { getWebsites } from "../services/api";

export default function useWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWebsitesData = async () => {
    setLoading(true);
    try {
      const data = await getWebsites(); // Use getWebsites() from the backend
      setWebsites(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching websites:", err);
      setError("Failed to load websites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsitesData();
  }, []);

  return { websites, loading, error, fetchWebsites: fetchWebsitesData };
}

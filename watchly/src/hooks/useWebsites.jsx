import { useState, useEffect } from "react";
import { getWebsites } from "../services/api";

const useWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWebsites = async () => {
    try {
      const response = await getWebsites();
      setWebsites(response.data);
    } catch (error) {
      console.error("Error fetching websites:", error);
      setError("Failed to fetch websites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return { websites, loading, error, fetchWebsites };
};

export default useWebsites;

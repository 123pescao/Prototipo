// Fetch website status from the backend
export const fetchWebsiteStatus = async (url) => {
  try {
    const response = await fetch(`http://backend:5000/websites/status?url=${encodeURIComponent(url)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching website status:", errorData);
      throw new Error(errorData.message || "Failed to fetch website status");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch website status:", error);
    return { status: "Down", uptime: 0, responseTime: 0 }; // Default values if the request fails
  }
};

// Fetch all websites from the backend
export const fetchWebsites = async () => {
  try {
    const response = await fetch("http://backend:5000/websites", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching websites:", errorData);
      throw new Error(errorData.message || "Failed to fetch websites");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return []; // Return an empty array if the request fails
  }
};

// Calculate uptime percentage for all websites
export const calculateUptimePercentage = (websites) => {
  if (websites.length === 0) return 0; // Avoid division by zero

  const totalUptime = websites.reduce((acc, website) => acc + (website.uptime || 0), 0);
  const averageUptime = (totalUptime / websites.length) * 100;
  return averageUptime.toFixed(2); // Round to 2 decimal places
};

// Calculate average response time for all websites
export const calculateAverageResponseTime = (websites) => {
  if (websites.length === 0) return 0; // Avoid division by zero

  const totalResponseTime = websites.reduce((acc, website) => acc + (website.responseTime || 0), 0);
  const averageResponseTime = totalResponseTime / websites.length;
  return averageResponseTime.toFixed(2); // Round to 2 decimal places
};
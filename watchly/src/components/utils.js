// Fetch website status from the backend
export const fetchWebsiteStatus = async (url) => {
    try {
      const response = await fetch(`http://localhost:5000/websites/status?url=${url}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    } catch (error) {
      console.error('Failed to fetch website status:', error);
      return { status: 'Down', uptime: 0, responseTime: 0 };
    }
  };
  
  // Fetch all websites from the backend
  export const fetchWebsites = async () => {
    try {
      const response = await fetch('http://localhost:5000/websites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      return [];
    }
  };
  
  // Calculate uptime percentage
  export const calculateUptimePercentage = (websites) => {
    const totalUptime = websites.reduce((acc, website) => acc + website.uptime, 0);
    return websites.length > 0 ? ((totalUptime / websites.length) * 100).toFixed(2) : 0;
  };
  
  // Calculate average response time
  export const calculateAverageResponseTime = (websites) => {
    const totalResponseTime = websites.reduce((acc, website) => acc + website.responseTime, 0);
    return websites.length > 0 ? (totalResponseTime / websites.length).toFixed(2) : 0;
  };

// src/components/Metrics/MetricList.js
import React, { useEffect, useState } from 'react';
import { getMetrics } from '../../services/api';

const MetricList = ({ websiteId }) => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await getMetrics(websiteId);
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };
    fetchMetrics();
  }, [websiteId]);

  return (
    <div>
      <h2>Metrics</h2>
      <ul>
        {metrics.map((metric) => (
          <li key={metric.id}>
            Uptime: {metric.uptime}, Response Time: {metric.response_time}, Timestamp: {metric.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MetricList;

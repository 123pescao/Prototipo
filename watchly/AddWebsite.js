// src/components/Websites/AddWebsite.js
import React, { useState } from 'react';
import { addWebsite } from '../../services/api';

const AddWebsite = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addWebsite({ url, name, frequency });
      alert('Website added successfully!');
      // Optionally, redirect or refresh the website list
    } catch (error) {
      alert('Failed to add website: ' + error.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="number" placeholder="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
      <button type="submit">Add Website</button>
    </form>
  );
};

export default AddWebsite;

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import WebsiteList from './components/Websites/WebsiteList';
import AddWebsite from './components/Websites/AddWebsite';
import MetricList from './components/Metrics/MetricList';
import AlertList from './components/Alerts/AlertList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/websites" element={<WebsiteList />} />
        <Route path="/websites/add" element={<AddWebsite />} />
        <Route path="/metrics" element={<MetricList />} />
        <Route path="/alerts" element={<AlertList />} />
      </Routes>
    </Router>
  );
}

export default App;

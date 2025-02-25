import React from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate in v6

const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();  // Use navigate instead of history

  const logout = () => {
    // Clear user data from localStorage or state management
    localStorage.removeItem('userToken');
    
    // Call the onLogout function passed as prop
    onLogout();

    // Redirect to login page or home page
    navigate('/login');  // Use navigate to redirect to the login page
  };

  return (
    <button onClick={logout} className="p-2 rounded bg-red-600 text-white">
      Log Out
    </button>
  );
};

export default LogoutButton;

import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found. Redirecting to login.');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          console.warn('Token verification failed. Removing token and redirecting to login.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Network error during token verification:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
        role="status"
        aria-label="Loading authentication status"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-2 border-blue-200"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated. Redirecting to login page.');
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
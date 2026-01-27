import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // If token exists, allow access. Backend will reject requests if token is invalid
      setIsAuthenticated(true);
      setLoading(false);
      
      // Optional: Verify token in background without blocking
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://optimasfibre.onrender.com';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Only remove token if we get an explicit 401/403 response
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        // Don't remove token on network errors - let the user try
        console.warn('Token verification failed:', err.message);
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

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
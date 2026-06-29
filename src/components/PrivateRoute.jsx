import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTokenUsable = (token) => {
      if (!token || typeof token !== 'string') return false;
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      try {
        const payload = JSON.parse(atob(parts[1]));
        if (!payload?.exp) return true;
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    };

    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!isTokenUsable(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
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
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const isAdmin = data?.user?.role === 'admin';

        if (!isAdmin) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        console.warn('Token verification failed:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
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

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
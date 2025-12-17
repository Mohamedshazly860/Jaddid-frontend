// API Configuration and Base Service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're on a protected page that requires auth
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/marketplace', '/login', '/register'];
      
      // Check if current path is exactly a public path or starts with it
      const isPublicPath = publicPaths.some(path => 
        currentPath === path || currentPath.startsWith(path + '/')
      );
      
      if (!isPublicPath) {
        // Protected page - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } 
      // If public page, just reject the error without redirecting
      // This allows the page to handle 401s gracefully (e.g., hide favorites if not logged in)
    }
    return Promise.reject(error);
  }
);

export default api;

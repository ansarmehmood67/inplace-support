// Backend API configuration
export const API_BASE_URL = 'https://ba072026eae8.ngrok-free.app';

// Helper function to create API URLs
export const createApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API requests with proper headers
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = createApiUrl(endpoint);
  
  const defaultHeaders = {
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    'Content-Type': 'application/json',
  };
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, mergedOptions);
};
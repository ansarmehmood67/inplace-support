// Backend API configuration
export const API_BASE_URL = 'https://ba072026eae8.ngrok-free.app';

// Helper function to create API URLs
export const createApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Connection status
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; });
window.addEventListener('offline', () => { isOnline = false; });

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay
const getRetryDelay = (attempt: number) => {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelay);
};

// Enhanced API request with retry logic and error handling
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  if (!isOnline) {
    throw new Error('No internet connection. Please check your network and try again.');
  }

  const url = createApiUrl(endpoint);
  
  const defaultHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  };
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...mergedOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500 && attempt < RETRY_CONFIG.maxRetries) {
          // Server error, retry
          await delay(getRetryDelay(attempt));
          continue;
        }
        throw new Error(`Server error: ${response.status}. Please try again later.`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Request timeout. Please check your connection and try again.');
      }
      
      // Don't retry on client errors or final attempt
      if (attempt === RETRY_CONFIG.maxRetries || 
          (error instanceof Error && error.message.includes('timeout')) ||
          !isOnline) {
        break;
      }
      
      await delay(getRetryDelay(attempt));
    }
  }

  throw lastError || new Error('Network request failed. Please try again.');
};

// Specialized API functions
export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  // Special handling for file uploads - bypass default JSON headers
  const url = createApiUrl('/upload_excel/');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Longer timeout for file uploads
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        // Don't set Content-Type for FormData - browser sets multipart/form-data automatically
      },
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Upload failed (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response isn't JSON, use status-based message
        if (response.status === 413) {
          errorMessage = 'File too large. Please select a smaller file.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid file format. Please check your Excel file structure.';
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Upload timeout. Please check your connection and try again.');
    }
    throw error;
  }
};

export const getAllChats = async () => {
  const response = await apiRequest('/get_all_chats/');
  return response.json();
};

export const getEscalated = async () => {
  const response = await apiRequest('/get_escalated/');
  return response.json();
};

export const getCandidates = async () => {
  const response = await apiRequest('/get_all_chats/');
  return response.json();
};

export const getChatHistory = async (phone: string) => {
  const response = await apiRequest(`/get_chat_history/?phone=${phone}`);
  return response.json();
};

export const sendAdminReply = async (phone_number: string, text: string) => {
  const response = await apiRequest('/send_admin_reply/', {
    method: 'POST',
    body: JSON.stringify({ phone_number, text }),
  });
  return response.json();
};

export const resumeBot = async (phone_number: string) => {
  const response = await apiRequest('/resume_bot/', {
    method: 'POST',
    body: JSON.stringify({ phone_number }),
  });
  return response.json();
};
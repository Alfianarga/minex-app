import axios from 'axios';
import { API_BASE_URL } from './constants';

export interface ApiConnectionStatus {
  connected: boolean;
  error?: string;
}

/**
 * Check if the API server is reachable
 */
export const checkApiConnection = async (): Promise<ApiConnectionStatus> => {
  try {
    // Try to make a simple GET request to check if server is reachable
    // We'll try the base URL first, then a health endpoint
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    // Try health endpoint first, then fallback to base URL
    const endpoints = [`${baseUrl}/health`, `${baseUrl}/api/health`, baseUrl];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 5000,
          validateStatus: (status) => status < 500, // Accept any status < 500 as "server is reachable"
        });
        
        // If we get any response (even 404), server is reachable
        return {
          connected: true,
        };
      } catch (err: any) {
        // If it's a network error, continue to next endpoint
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
          continue;
        }
        
        // If we get a 404 or any response, server is reachable
        if (err.response) {
          return {
            connected: true,
          };
        }
      }
    }
    
    // If all endpoints failed with network errors, server is not reachable
    return {
      connected: false,
      error: 'Cannot connect to API server',
    };
  } catch (error: any) {
    // If it's a network error (ECONNREFUSED, ETIMEDOUT, etc.), server is not reachable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return {
        connected: false,
        error: 'Cannot connect to API server',
      };
    }
    
    // For other errors, assume server is reachable (might be auth or other issues)
    return {
      connected: true,
      error: error.message || 'Unknown error',
    };
  }
};


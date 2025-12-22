import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { supabase } from '../store/useAuthStore';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
client.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function isNetworkOrRetryable(error: any) {
  if (!error) return false;
  const code = error.code as string | undefined;
  const msg = (error.message || '').toLowerCase();
  const status = error?.response?.status as number | undefined;
  // Retry on common transient conditions
  if (status && [502, 503, 504].includes(status)) return true;
  if (code && ['ECONNABORTED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)) return true;
  if (msg.includes('network error') || msg.includes('fetch failed') || msg.includes('socket hang up')) return true;
  return false;
}

async function backoff(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status as number | undefined;
    const config = error.config || {};

    // Try to refresh session once on 401 before logging the user out
    if (status === 401 && !config.__retry401) {
      config.__retry401 = true;
      try {
        const refreshToken = await storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const { data, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
          if (!refreshError && data.session) {
            const newAccessToken = data.session.access_token;
            const newRefreshToken = data.session.refresh_token;

            await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            if (newRefreshToken) {
              await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newAccessToken}`;

            return client(config);
          }
        }
      } catch (e) {
        // Fall through to logout below
      }

      // Refresh failed or no refresh token available: clear auth
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }

    // Automatic small retry/backoff for transient errors
    if (isNetworkOrRetryable(error)) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 3;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delay = 250 * Math.pow(2, config.__retryCount - 1); // 250, 500, 1000ms
        await backoff(delay);
        return client(config);
      }
    }

    return Promise.reject(error);
  }
);

export default client;



// api/client.ts
import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { router } from 'expo-router';

const API_BASE_URL = 'https://ai-doctor-chatbot-zw8n.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - automatically add token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
      }
    } catch (error) {
      console.error('❌ Error adding token to request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🔄 Token expired, redirecting to login...');
      removeToken();

      // Redirect to login screen
      setTimeout(() => {
        if (router.canGoBack()) {
          router.replace('/login');
        } else {
          router.navigate('/login');
        }
      }, 100);
    }

    return Promise.reject(error);
  }
);

export default api;

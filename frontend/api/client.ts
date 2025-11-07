// api/client.ts
import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { router } from 'expo-router';

const API_BASE_URL = 'https://ai-doctor-chatbot-zw8n.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - automatically add token to all requests
api.interceptors.request.use(
  async (config) => {
    console.log(`🟡 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
      }
    } catch (error) {
      console.error('❌ Error adding token to request:', error);
    }
    if (config.data) {
      console.log('Request payload: ', JSON.stringify(config.data, null, 2));
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`Response ${response.status} from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.log('🔄 Token expired, redirecting to login...');
      removeToken();

      setTimeout(() => {
        if (router.canGoBack()) {
          router.replace('/login');
        } else {
          router.navigate('/login');
        }
      }, 100);
    }
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.log('🔴 Network/CORS Error - Check backend CORS configuration');
    }

    return Promise.reject(error);
  }
);

export default api;

// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.fluencerz.com/api',
});

// Automatically attach token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

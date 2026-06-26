// src/lib/api.ts
import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  timeout: 30_000,
});

// Response interceptor — global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.';
    if (err.response?.status === 401) {
      localStorage.removeItem('umkm_token');
      window.location.href = '/login';
      return Promise.reject(err);
    }
    toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    return Promise.reject(err);
  },
);

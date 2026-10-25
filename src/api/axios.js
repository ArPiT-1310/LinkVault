import axios from 'axios';

export const TOKEN_KEY = 'lv_token';
export const USER_KEY = 'lv_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected, log the user out.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Pulls a readable message out of a Spring error response ({ message } or { errors: {...} }).
export function errorMessage(err) {
  const data = err.response?.data;
  if (data?.errors) return Object.values(data.errors).join('. ');
  if (data?.message) return data.message;
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
  return 'Something went wrong. Please try again.';
}

export default api;

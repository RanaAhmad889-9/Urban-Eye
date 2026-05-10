import axios from 'axios';
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' });
api.interceptors.request.use((c) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) c.headers.Authorization = `Bearer ${t}`;
  }
  return c;
});
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
  return Promise.reject(e);
});
export default api;

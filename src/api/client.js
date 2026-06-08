import axios from 'axios';

const API = axios.create({ 
  baseURL: 'https://eventmaster-backend-iqov.onrender.com/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(res => res, async err => {
  if (err.response?.status === 401) {
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
      try {
        const { data } = await axios.post('https://web-production-f37d0c.up.railway.app/api/auth/refresh/', { refresh });
        localStorage.setItem('access', data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return axios(err.config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }
  return Promise.reject(err);
});

export default API;

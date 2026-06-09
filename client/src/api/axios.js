import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
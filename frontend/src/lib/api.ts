import axios from 'axios';

const API_URL = 'http://localhost:3002/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401s automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('demo_role');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Temporary function to get a dev token
export const loginDevUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/dev/token`);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    console.error('Failed to get dev token', error);
    throw error;
  }
};

export const fetchDashboardMetrics = async () => {
  const response = await api.get('/dashboard/metrics');
  return response.data;
};

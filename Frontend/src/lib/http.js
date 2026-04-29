import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  if (token && userId) {
    config.headers['authorization'] = token;
    config.headers['x-client-id'] = userId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

export default http
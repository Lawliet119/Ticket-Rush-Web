import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // need to set in .env 
  headers: {
    'Content-Type': 'application/json'
  }
})

// automatically attach token into header before each request 
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId'); 

  if (token && userId) {
    // header name in backend (x-client-id & authorization)
    config.headers['authorization'] = token; 
    config.headers['x-client-id'] = userId; 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
})
export default http
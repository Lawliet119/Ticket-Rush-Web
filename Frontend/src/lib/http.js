import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Required to send/receive HttpOnly cookies
})

// Request interceptor: attach access token + userId
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

// --- Silent Refresh Token Logic ---
let isRefreshing = false;
let failedQueue = []; // Queue of requests waiting for the new token

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 AND if we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['authorization'] = token;
          return http(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — HttpOnly cookie is sent automatically
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.metadata.accessToken;

        // Save new access token
        localStorage.setItem('accessToken', newAccessToken);

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers['authorization'] = newAccessToken;
        return http(originalRequest);

      } catch (refreshError) {
        // Refresh failed (token expired or reuse detected) — force logout
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

export default http
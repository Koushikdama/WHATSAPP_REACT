import axios from 'axios';

// Configure API client to connect to backend
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        // Handle unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            // You can uncomment this to redirect to login page
            // window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;

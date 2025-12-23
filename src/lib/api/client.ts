import axios from 'axios';

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // If NEXT_PUBLIC_API_URL is set, use it. 
        // Otherwise, if we're in the browser, try to use the current hostname with port 4000
        if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

        const { protocol, hostname } = window.location;
        // Default to port 4000 for the backend if no URL is provided
        return `${protocol}//${hostname}:4000/api`;
    }
    // Server-side fallback (for SSR)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();
export const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * API Service
 * Axios instance with interceptors for JWT token injection and refresh
 * Similar to Spring RestTemplate with interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { tokenService } from './token.service';
import { ApiError } from '../types/auth.types';

// API base URL - update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Request Interceptor
 * Automatically adds JWT token to requests
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenService.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('📡 Request with token:', config.method?.toUpperCase(), config.url);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('✅ Response received:', response.status, response.config.url);
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is not 401 or no config, reject immediately
        if (!error.response || error.response.status !== 401 || !originalRequest) {
            return Promise.reject(transformError(error));
        }

        // If already retried, reject
        if (originalRequest._retry) {
            console.error('❌ Token refresh failed, logging out');
            tokenService.clearTokens();
            window.location.href = '/'; // Redirect to login
            return Promise.reject(transformError(error));
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    originalRequest.headers.Authorization = `Bearer ${tokenService.getAccessToken()}`;
                    return apiClient(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenService.getRefreshToken();

        if (!refreshToken) {
            console.error('❌ No refresh token available');
            isRefreshing = false;
            tokenService.clearTokens();
            window.location.href = '/';
            return Promise.reject(transformError(error));
        }

        try {
            console.log('🔄 Attempting to refresh token...');

            // Call refresh endpoint
            const response = await axios.post<{ accessToken: string }>(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken }
            );

            const { accessToken } = response.data;
            tokenService.setAccessToken(accessToken);

            console.log('✅ Token refreshed successfully');

            // Process queued requests
            processQueue();
            isRefreshing = false;

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            processQueue(refreshError);
            isRefreshing = false;
            tokenService.clearTokens();
            window.location.href = '/';
            return Promise.reject(refreshError);
        }
    }
);

/**
 * Transform axios error to our API error format
 */
const transformError = (error: AxiosError): ApiError => {
    if (error.response) {
        // Server responded with error
        return {
            message: (error.response.data as any)?.message || error.message || 'An error occurred',
            code: (error.response.data as any)?.code || 'SERVER_ERROR',
            status: error.response.status,
            details: error.response.data,
        };
    } else if (error.request) {
        // Request made but no response
        return {
            message: 'No response from server',
            code: 'NETWORK_ERROR',
            details: error.request,
        };
    } else {
        // Error in request setup
        return {
            message: error.message || 'Request failed',
            code: 'REQUEST_ERROR',
        };
    }
};

/**
 * HTTP Methods
 */
export const api = {
    get: <T = any>(url: string, config = {}) =>
        apiClient.get<T>(url, config),

    post: <T = any>(url: string, data?: any, config = {}) =>
        apiClient.post<T>(url, data, config),

    put: <T = any>(url: string, data?: any, config = {}) =>
        apiClient.put<T>(url, data, config),

    patch: <T = any>(url: string, data?: any, config = {}) =>
        apiClient.patch<T>(url, data, config),

    delete: <T = any>(url: string, config = {}) =>
        apiClient.delete<T>(url, config),
};

export default apiClient;
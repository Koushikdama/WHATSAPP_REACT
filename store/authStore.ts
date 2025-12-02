/**
 * Authentication Store
 * Zustand store for authentication state management
 * Similar to Spring @Service with state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { tokenService } from '../services/token.service';
import { User, LoginRequest, SignupRequest } from '../types/auth.types';
import { StorageKeys } from '../utils/storage/storage.utils';
import { getCurrentUser } from '../api';

// Helper to create a dummy JWT
const createDummyJwt = (userId: string) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 86400 })); // Expires in 24h
    const signature = "dummy_signature";
    return `${header}.${payload}.${signature}`;
};

// Mock Auth Service functions locally since they are not in api.ts yet
const mockLogin = async (credentials: LoginRequest) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        const userId = 'user1';
        return {
            user: { id: userId, name: 'Test User', email: 'test@example.com', avatar: 'https://i.pravatar.cc/150?u=user1', isOnline: true },
            accessToken: createDummyJwt(userId),
            refreshToken: createDummyJwt(userId)
        };
    }
    // Default mock login for any other credentials for now, or throw error
    const userId = 'user1';
    return {
        user: { id: userId, name: 'Test User', email: credentials.email, avatar: 'https://i.pravatar.cc/150?u=user1', isOnline: true },
        accessToken: createDummyJwt(userId),
        refreshToken: createDummyJwt(userId)
    };
};

const mockSignup = async (data: SignupRequest) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userId = 'user_' + Date.now();
    return {
        user: { id: userId, name: data.name, email: data.email, avatar: 'https://i.pravatar.cc/150?u=' + Date.now(), isOnline: true },
        accessToken: createDummyJwt(userId),
        refreshToken: createDummyJwt(userId)
    };
};

const mockLogout = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
};

const mockRefreshToken = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { accessToken: createDummyJwt('user1') };
};

interface AuthState {
    // State
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // Login action
                login: async (credentials: LoginRequest) => {
                    set({ isLoading: true, error: null });
                    try {
                        const response = await mockLogin(credentials);

                        // Store tokens
                        tokenService.setTokens(response.accessToken, response.refreshToken);

                        // Update state
                        set({
                            user: response.user as User,
                            accessToken: response.accessToken,
                            refreshToken: response.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });

                        console.log('✅ Auth state updated after login');
                    } catch (error: any) {
                        console.error('❌ Login error in store:', error);
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error.message || 'Login failed',
                        });
                        throw error;
                    }
                },

                // Signup action
                signup: async (data: SignupRequest) => {
                    set({ isLoading: true, error: null });
                    try {
                        const response = await mockSignup(data);

                        // Store tokens
                        tokenService.setTokens(response.accessToken, response.refreshToken);

                        // Update state
                        set({
                            user: response.user as User,
                            accessToken: response.accessToken,
                            refreshToken: response.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });

                        console.log('✅ Auth state updated after signup');
                    } catch (error: any) {
                        console.error('❌ Signup error in store:', error);
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error.message || 'Signup failed',
                        });
                        throw error;
                    }
                },

                // Logout action
                logout: async () => {
                    set({ isLoading: true, error: null });
                    try {
                        await mockLogout();

                        // Clear state
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });

                        console.log('✅ Auth state cleared after logout');
                    } catch (error: any) {
                        console.error('❌ Logout error in store:', error);
                        // Clear state anyway
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error.message || 'Logout failed',
                        });
                    }
                },

                // Refresh token action
                refreshAccessToken: async () => {
                    try {
                        const response = await mockRefreshToken();

                        // Update access token
                        tokenService.setAccessToken(response.accessToken);

                        set({
                            accessToken: response.accessToken,
                        });

                        console.log('✅ Access token refreshed in store');
                    } catch (error: any) {
                        console.error('❌ Token refresh error in store:', error);
                        // If refresh fails, logout
                        get().logout();
                        throw error;
                    }
                },

                // Set user directly
                setUser: (user: User | null) => {
                    set({ user });
                },

                // Set tokens directly
                setTokens: (accessToken: string, refreshToken: string) => {
                    tokenService.setTokens(accessToken, refreshToken);
                    set({
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    });
                },

                // Clear auth state
                clearAuth: () => {
                    tokenService.clearTokens();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null,
                    });
                },

                // Check authentication status
                checkAuth: async () => {
                    set({ isLoading: true });
                    try {
                        // Get tokens from storage
                        const accessToken = tokenService.getAccessToken();
                        const refreshToken = tokenService.getRefreshToken();

                        if (!accessToken || !refreshToken) {
                            set({
                                isAuthenticated: false,
                                isLoading: false,
                            });
                            return;
                        }

                        // Check if token is expired
                        if (tokenService.isTokenExpired(accessToken)) {
                            // Try to refresh
                            await get().refreshAccessToken();
                        }

                        // Get current user
                        // const user = await authService.getCurrentUser();
                        // Use api.getCurrentUser instead
                        const user = await getCurrentUser();

                        if (user) {
                            set({
                                user: user as User,
                                accessToken,
                                refreshToken,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                        } else {
                            get().clearAuth();
                            set({ isLoading: false });
                        }
                    } catch (error) {
                        console.error('❌ Auth check failed:', error);
                        get().clearAuth();
                        set({ isLoading: false });
                    } finally {
                        console.log('🏁 Auth check completed, loading:', get().isLoading);
                    }
                },

                // Clear error
                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: StorageKeys.USER,
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
);
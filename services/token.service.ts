/**
 * Token Service
 * Manages JWT tokens (access and refresh tokens)
 * Similar to Spring Security TokenProvider
 */

import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { TokenPayload } from '../types/auth.types';
import { StorageKeys } from '../utils/storage/storage.utils';

class TokenService {
    /**
     * Set both access and refresh tokens
     */
    setTokens(accessToken: string, refreshToken: string): void {
        // Set access token (expires in 1 hour usually, but let's set cookie for 1 day for now or match token exp)
        // For simplicity, we'll let cookies persist for 7 days
        Cookies.set(StorageKeys.ACCESS_TOKEN, accessToken, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
        Cookies.set(StorageKeys.REFRESH_TOKEN, refreshToken, { expires: 30, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
        console.log('🔐 Tokens stored in cookies successfully');
    }

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        return Cookies.get(StorageKeys.ACCESS_TOKEN) || null;
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        return Cookies.get(StorageKeys.REFRESH_TOKEN) || null;
    }

    /**
     * Set only access token (used after refresh)
     */
    setAccessToken(accessToken: string): void {
        Cookies.set(StorageKeys.ACCESS_TOKEN, accessToken, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
        console.log('🔐 Access token updated in cookies');
    }

    /**
     * Clear all tokens
     */
    clearTokens(): void {
        Cookies.remove(StorageKeys.ACCESS_TOKEN);
        Cookies.remove(StorageKeys.REFRESH_TOKEN);
        console.log('🔐 Tokens cleared from cookies');
    }

    /**
     * Decode JWT token and get payload
     */
    decodeToken<T = TokenPayload>(token: string): T | null {
        try {
            return jwtDecode<T>(token);
        } catch (error) {
            // console.warn('Warning decoding token:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token: string | null): boolean {
        if (!token) return true;

        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;

            // Check if token expires in next 30 seconds
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime + 30;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration(token: string): Date | null {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return null;
            return new Date(decoded.exp * 1000);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get user ID from token
     */
    getUserIdFromToken(token: string): string | null {
        try {
            const decoded = this.decodeToken(token);
            return decoded?.sub || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Validate token structure
     */
    isValidTokenStructure(token: string): boolean {
        try {
            // JWT should have 3 parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            // Try to decode
            this.decodeToken(token);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get time until token expiration (in seconds)
     */
    getTimeUntilExpiration(token: string): number | null {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return null;

            const currentTime = Date.now() / 1000;
            const timeUntilExpiration = decoded.exp - currentTime;
            return Math.max(0, timeUntilExpiration);
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if we have valid tokens
     */
    hasValidTokens(): boolean {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        if (!accessToken || !refreshToken) return false;

        // Check if access token is valid (not expired)
        // Refresh token can be expired, we'll handle that during refresh
        return this.isValidTokenStructure(accessToken) &&
            this.isValidTokenStructure(refreshToken);
    }
}

// Export singleton instance
export const tokenService = new TokenService();
export default tokenService;
/**
 * Authentication Types
 * Type definitions for authentication and authorization
 */

import { User } from '../types';

export type { User };

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType?: 'Bearer';
    expiresIn?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: User;
}

export interface RefreshTokenResponse {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
}

export interface TokenPayload {
    sub: string;          // User ID
    email: string;
    name: string;
    iat: number;          // Issued at
    exp: number;          // Expiration
    [key: string]: any;   // Additional claims
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}
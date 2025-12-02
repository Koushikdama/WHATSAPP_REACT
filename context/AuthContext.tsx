import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser, logoutUser } from '../services/firebase/auth.service';
import { getUserProfile, updateUserProfile } from '../services/firebase/user.service';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
    currentUser: User | null;
    userProfile: User | null;
    loading: boolean;
    signup: (email: string, password: string, name: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Get user from Zustand store (keeping this for compatibility if needed, but primary source is now Firebase)
    const setUser = useAuthStore(state => state.setUser);
    const storeLogout = useAuthStore(state => state.logout);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is logged in, fetch their profile
                try {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    if (userProfile) {
                        setCurrentUser(userProfile);
                        setUser(userProfile);
                    } else {
                        console.warn('User profile not found in Firestore for:', firebaseUser.uid);
                        setCurrentUser(null);
                        storeLogout();
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    // Only log the error, don't crash - user may be newly created
                    // and profile might not exist yet
                }
            } else {
                // User is logged out - just clear state, no Firestore calls
                setCurrentUser(null);
                storeLogout();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, storeLogout]);

    const login = async (email: string, password: string) => {
        const user = await loginUser(email, password);
        setCurrentUser(user);
        setUser(user);
    };

    const signup = async (email: string, password: string, name: string) => {
        const user = await registerUser(email, password, name);
        setCurrentUser(user);
        setUser(user);
    };

    const logout = async () => {
        if (currentUser) {
            await logoutUser(currentUser.id);
        }
        setCurrentUser(null);
        storeLogout();
    };

    const updateUserProfile = async (updates: Partial<User>) => {
        if (!currentUser) return;
        // Update in Firestore would be needed here if we want persistence
        // For now, updating local state
        setCurrentUser({ ...currentUser, ...updates });
        setUser({ ...currentUser, ...updates });
    };

    const value: AuthContextType = {
        currentUser,
        userProfile: currentUser,
        loading,
        signup,
        login,
        logout,
        updateUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tokenService } from '../../services/token.service';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const hasTokens = tokenService.hasValidTokens();

    if (loading) {
        // You might want to render a loading spinner here
        return (
            <div className="bg-[#111b21] h-screen w-screen flex flex-col items-center justify-center text-white">
                <img src="https://static.whatsapp.net/rsrc.php/v3/y7/r/_DSx_SM7ITE.png" alt="WhatsApp Logo" className="w-24 h-24 mb-4" />
                <p className="text-lg">Loading...</p>
                <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse w-full"></div>
                </div>
            </div>
        );
    }

    if (!currentUser && !hasTokens) {
        // Redirect them to the /auth page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
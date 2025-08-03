// PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
const PublicRoute = ({ children }) => {
    const { isAuthenticated, userDataLoaded } = useAuth();

    // console.log("🔓 [PublicRoute] Auth:", {
    //     isAuthenticated,
    //     userDataLoaded
    // });
    // console.log("[PublicRoute] Location.pathname =>", window.location.pathname);

    if (!userDataLoaded) {
        return (
            <div className="loading-container">
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/profile" />;
    }

    return children;
};

export default PublicRoute;

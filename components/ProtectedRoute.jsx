import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, userDataLoaded } = useAuth();
    const location = useLocation();

    console.log("🔒 [ProtectedRoute] Auth:", {
        isAuthenticated,
        userDataLoaded
    });
    console.log("[ProtectedRoute] Location.pathname =>", window.location.pathname);

    // Show loading while checking authentication
    if (!userDataLoaded) {
        return (
            <div className="loading-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedRoute;

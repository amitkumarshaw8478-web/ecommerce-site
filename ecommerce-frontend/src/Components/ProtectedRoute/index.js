import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isSessionValid, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);

  useEffect(() => {
    // Check if session is still valid
    if (!isSessionValid()) {
      setHasAccess(false);
      return;
    }

    // Check base authentication
    if (!isAuthenticated) {
      setHasAccess(false);
      return;
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
      setHasAccess(false);
      return;
    }

    setHasAccess(true);
  }, [isAuthenticated, isAdmin, requireAdmin, isSessionValid]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Deny access if user doesn't have permission
  if (hasAccess === false) {
    return (
      <Navigate 
        to={requireAdmin ? "/admin-login" : "/login"} 
        state={{ 
          from: location,
          message: requireAdmin ? 'Admin access required' : 'Please login first'
        }} 
        replace 
      />
    );
  }

  // Grant access if all checks pass
  return hasAccess === true ? children : null;
};

export default ProtectedRoute;

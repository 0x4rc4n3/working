import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChefHat } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-orange-500 rounded-full mb-4">
            <ChefHat className="h-8 w-8 text-white animate-bounce" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Smart Recipe Hub</h2>
          <p className="text-gray-600">Preparing your culinary experience...</p>
          <div className="mt-4">
            <div className="spinner mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
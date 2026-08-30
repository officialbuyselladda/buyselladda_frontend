import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ admin = false, children }) => {
  const { user, loading } = useAuth();
  const hasToken = () => {
    const token = localStorage.getItem('token');
    return Boolean(token && token !== 'undefined' && token !== 'null');
  };

  // During initial loading, check if user exists in localStorage
  // If so, allow access - the user will be restored immediately
  if (loading) {
    const storedUser = localStorage.getItem('user');
    if (storedUser && hasToken()) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Check if user exists in localStorage
        if (parsedUser) {
          // For admin routes, check role
          if (admin && parsedUser.role !== 'admin') {
            return <Navigate to="/" replace />;
          }
          // Allow access to protected content during loading
          return children ? children : <Outlet />;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Show loading spinner if no stored user
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || !hasToken()) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;


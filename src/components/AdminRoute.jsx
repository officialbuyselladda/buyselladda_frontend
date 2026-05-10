import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // During initial loading, check if user exists in localStorage
  // If so, allow access - the user will be restored immediately
  if (loading) {
    // Check localStorage directly during loading to prevent flash
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // If user is admin, allow access during loading
        if (parsedUser && parsedUser.role === 'admin') {
          return children ? children : <Outlet />;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Show loading spinner if no stored user
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;


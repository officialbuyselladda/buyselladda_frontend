import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFirstAllowedAdminPath, hasAdminPermission } from '../utils/adminPermissions';

const AdminPermissionRoute = ({ permission, children }) => {
  const { user } = useAuth();

  if (hasAdminPermission(user, permission)) {
    return children;
  }

  const fallbackPath = getFirstAllowedAdminPath(user);
  if (fallbackPath !== window.location.pathname) {
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-500" />
      <h1 className="text-xl font-bold text-red-700">Permission Required</h1>
      <p className="mt-2 text-sm font-semibold text-red-600">Your account does not have access to this admin section.</p>
    </div>
  );
};

export default AdminPermissionRoute;

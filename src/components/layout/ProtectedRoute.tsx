import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // ⏳ Wait until auth state is fully loaded
  if (loading || !user) return <Spinner />;

  // 🔒 Block unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Block non-admins from admin-only pages
  // if (adminOnly && !isAdmin) {
  //   return (
  //     <div className="flex items-center justify-center h-screen text-center text-red-500 font-semibold">
  //       You are not authorized to view this page.
  //     </div>
  //   );
  // }

  return children;
};

export default ProtectedRoute;

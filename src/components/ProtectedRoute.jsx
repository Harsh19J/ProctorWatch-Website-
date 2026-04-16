import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.first_login) return <Navigate to="/first-login" replace />;

    return children;
}

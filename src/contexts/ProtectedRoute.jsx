import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (!token || !userId || !userRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

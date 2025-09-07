// src/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { expiryTime } = useAuth();
  console.log(expiryTime)
  return expiryTime ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

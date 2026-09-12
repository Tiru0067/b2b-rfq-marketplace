import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

// Route only accessible to logged-in Buyers
export const BuyerRoute = ({ children }) => {
  const { isAuthenticated, isBuyer, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a supplier tries to access buyer pages, send them to the marketplace
  if (!isBuyer) {
    return <Navigate to="/marketplace" replace />;
  }

  return children;
};

// Route only accessible to logged-in Suppliers
export const SupplierRoute = ({ children }) => {
  const { isAuthenticated, isSupplier, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a buyer tries to access supplier pages, send them to the buyer dashboard
  if (!isSupplier) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route only accessible to guests (redirects logged-in users to their dashboard)
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isBuyer, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={isBuyer ? '/dashboard' : '/marketplace'} replace />;
  }

  return children;
};

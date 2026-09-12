import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import {
  BuyerRoute,
  SupplierRoute,
  GuestRoute,
} from './components/RouteGuards';
import CreateRfqModal from './components/CreateRfqModal';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerRfqDetails from './pages/BuyerRfqDetails';
import SupplierMarketplace from './pages/SupplierMarketplace';
import SupplierQuotations from './pages/SupplierQuotations';

// Smart Home redirect based on role
const HomeRedirect = () => {
  const { isAuthenticated, isBuyer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/marketplace" replace />;
  return <Navigate to={isBuyer ? '/dashboard' : '/marketplace'} replace />;
};

// 404 Not Found Page
const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-typography-400 font-bold text-2xl">
      404
    </div>
    <h1 className="text-xl font-bold text-typography-900">Page Not Found</h1>
    <p className="text-sm text-typography-500 max-w-sm">
      The page you are looking for does not exist or may have moved.
    </p>
    <Link
      to="/"
      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl"
    >
      Return Home
    </Link>
  </div>
);

// Main App Container with Navbar & Global Create RFQ Modal
const AppLayout = () => {
  const { isBuyer, isAuthenticated } = useAuth();
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background-base">
      <Navbar
        onCreateRfqClick={
          isAuthenticated && isBuyer ? () => setIsCreateRfqOpen(true) : null
        }
      />

      <main className="flex-1">
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Guest Only Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Buyer Only Routes */}
          <Route
            path="/dashboard"
            element={
              <BuyerRoute>
                <BuyerDashboard />
              </BuyerRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:id"
            element={
              <BuyerRoute>
                <BuyerRfqDetails />
              </BuyerRoute>
            }
          />

          {/* Supplier Only Routes */}
          <Route
            path="/my-quotes"
            element={
              <SupplierRoute>
                <SupplierQuotations />
              </SupplierRoute>
            }
          />

          {/* Public / Marketplace Route (Accessible to all) */}
          <Route path="/marketplace" element={<SupplierMarketplace />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Create RFQ Modal triggered from Navbar */}
      {isAuthenticated && isBuyer && (
        <CreateRfqModal
          isOpen={isCreateRfqOpen}
          onClose={() => setIsCreateRfqOpen(false)}
          onRfqCreated={() => {
            // Reload page or let dashboard refresh
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
};

export default App;

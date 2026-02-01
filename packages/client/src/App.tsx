import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { OrderForm } from './pages/OrderForm';
import { Payment } from './pages/Payment';
import { OrderSuccess } from './pages/OrderSuccess';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/order" element={<OrderForm />} />
      <Route path="/payment/:orderNo" element={<Payment />} />
      <Route path="/order/success/:orderNo" element={<OrderSuccess />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

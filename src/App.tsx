import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VerificationCenter from './pages/VerificationCenter';
import UserManagement from './pages/UserManagement';
import BookingManagement from './pages/BookingManagement';
import Payments from './pages/Payments';
import WalletPage from './pages/Wallet';
import Reviews from './pages/Reviews';
import SafetyMonitoring from './pages/SafetyMonitoring';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Login />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="verification" element={<VerificationCenter />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="payments" element={<Payments />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="safety" element={<SafetyMonitoring />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

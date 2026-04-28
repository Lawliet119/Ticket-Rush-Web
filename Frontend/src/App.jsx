import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home'; 
import CreateEvent from './pages/CreateEvent';
import ResetPassword from './pages/ResetPassword';

// Import các trang mới tạo
import MyTicketsPage from './pages/MyTicketsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEventsPage from './pages/admin/ManageEventsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        {/* --- CUSTOMER ROUTES --- */}
        <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
        <Route path="/signup" element={<CustomerLayout><SignUp /></CustomerLayout>} />
        <Route path="/forgot-password" element={<CustomerLayout><ForgotPassword /></CustomerLayout>} />
        <Route path="/reset-password/:token" element={<CustomerLayout><ResetPassword /></CustomerLayout>} />
        <Route path="/home" element={<CustomerLayout><Home /></CustomerLayout>} />
        
        <Route path="/my-tickets" element={
          <ProtectedRoute>
            <CustomerLayout><MyTicketsPage /></CustomerLayout>
          </ProtectedRoute>
        } />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/events" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><ManageEventsPage /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Đưa CreateEvent vào AdminLayout */}
        <Route path="/create-event" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><CreateEvent /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<div className="p-20 text-center text-2xl font-bold">404 - Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
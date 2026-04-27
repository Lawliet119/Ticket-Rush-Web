import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');

  // Nếu không có token, chuyển hướng đến tranglogin
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  // Nếu yêu cầu quyền admin nhưng role không phải là ADMIN, chuyển hướng về trang home
  if (requireAdmin && userRole !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  // Nếu đã có token và  role là ADMIN, cho phép truy cập
  return children;
}
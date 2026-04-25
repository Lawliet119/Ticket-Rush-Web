import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import CreateEvent from './pages/CreateEvent';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Điều hướng trang chủ mặc định vào home */}
          <Route path="/" element={<Navigate to="/home" />} />

          {/* public routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* protected routes */}
          <Route path="/create-event" element={<CreateEvent />} />

          {/* 404 route */}
          <Route path="*" element={<div style={{ padding: '20px' }}>404 - Not found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );


}

export default App;
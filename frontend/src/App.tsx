import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// === Các trang chính của hệ thống ===
import SearchForms from './pages/SearchForms';         // Trang tìm kiếm ngữ nghĩa
import Product from './pages/Product';            // Trang upload biểu mẫu (Admin)
import Login from './pages/Login';                     // Trang đăng nhập
import Register from './pages/Register';               // Trang đăng ký tài khoản
import AdminRequired from './pages/AdminRequired';// Trang thông báo khi không có quyền admin
import UserProfile from './pages/UserProfile';    // Hồ sơ người dùng
import AdminHistory from './pages/AdminHistory';  // Nhật ký admin xem lịch sử upload
import UserHistory from './pages/UserHistory';    // Nhật ký người dùng tải file
import OpenFile from './pages/OpenFile';               // Trang xem chi tiết file
import ForgotPassword from './pages/ForgotPassword';

import MainLayout from './components/Layout/MainLayout';      // Giao diện khung layout
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Context lưu thông tin đăng nhập


// ===== ROUTE: Bảo vệ yêu cầu đã đăng nhập ===== //
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  // Delay nhẹ để đảm bảo AuthContext khởi tạo xong
  React.useEffect(() => {
    const checkAuth = async () => {
      await new Promise(res => setTimeout(res, 300)); // Giả lập loading
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Hiển thị vòng loading khi đang kiểm tra đăng nhập
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập → redirect về /login
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};


// ===== ROUTE: Chỉ cho Admin truy cập ===== //
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;             // Nếu chưa đăng nhập
  if (user?.role !== "admin") return <Navigate to="/admin-required" />; // Nếu không phải admin

  return <>{children}</>;
};


// ===== Ứng dụng chính ===== //
const App: React.FC = () => {
  return (
    <AuthProvider> {/* Cung cấp context đăng nhập cho toàn bộ app */}
      <Router>
          <Routes>

            {/* ==== PUBLIC ROUTES ==== */}
            <Route path="/" element={<SearchForms />} />                 {/* Trang chủ → Tìm kiếm */}
            <Route path="/search-forms" element={<SearchForms />} />    {/* Lặp lại alias */}
            <Route path="/login" element={<Login />} />                 {/* Trang đăng nhập */}
            <Route path="/register" element={<Register />} />           {/* Trang đăng ký */}
            <Route path="/get-started" element={<Navigate to="/register" />} /> {/* Đường tắt dẫn về đăng ký */}
            <Route path="/admin-required" element={<AdminRequired />} />{/* Trang báo lỗi thiếu quyền admin */}
            <Route path="/open-file/:id" element={<OpenFile />} />      {/* Trang xem file chi tiết */}
            <Route path="/forgot-password" element={<ForgotPassword/>} />

            {/* ==== ADMIN ROUTES ==== */}
            <Route
              path="/product"
              element={
                <AdminRoute>
                  <Product />  {/* Upload tài liệu – Chỉ admin được truy cập */}
                </AdminRoute>
              }
            />
            <Route
              path="/admin-history"
              element={
                <AdminRoute>
                  <AdminHistory /> {/* Xem nhật ký thao tác – Admin */}
                </AdminRoute>
              }
            />


            {/* ==== USER ROUTES ==== */}
            <Route
              path="/user-profile"
              element={
                <ProtectedRoute>
                  <UserProfile /> {/* Trang hồ sơ cá nhân */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-history"
              element={
                <ProtectedRoute>
                  <UserHistory /> {/* Nhật ký download cá nhân */}
                </ProtectedRoute>
              }
            />
            

          </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

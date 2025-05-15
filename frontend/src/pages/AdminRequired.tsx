import * as React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const AdminRequired: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col items-center justify-center px-4 py-12 min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-[#1a237e] mb-2">HUTECH Search</div>
              <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-3 text-[#1a237e]">Yêu cầu đăng nhập</h2>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để truy cập trang sản phẩm và sử dụng các tính năng tìm kiếm thông minh. Vui lòng đăng nhập nếu đã có tài khoản hoặc đăng ký để tạo tài khoản mới.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="bg-[#1976d2] text-white px-6 py-3 rounded-md hover:bg-[#1565c0] transition font-medium w-full sm:w-auto"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-[#1976d2] border border-[#1976d2] px-6 py-3 rounded-md hover:bg-blue-50 transition font-medium w-full sm:w-auto"
                >
                  Đăng ký
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/search-forms" className="text-sm text-[#1976d2] hover:underline">
                Quay lại trang tìm kiếm
              </Link>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              <p>Nếu bạn gặp vấn đề khi truy cập, vui lòng liên hệ với quản trị viên</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminRequired;
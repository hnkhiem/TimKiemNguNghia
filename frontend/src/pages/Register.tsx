// ✅ Trang đăng ký sử dụng MainLayout + màu chữ đồng nhất theo thiết kế (#1a237e)

import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  submit?: string;
}

const Register: FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    else if (formData.fullName.length < 2) newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') setTermsAccepted(checked);
    else setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) return setIsLoading(false);
    if (!termsAccepted) {
      setErrors(prev => ({ ...prev, terms: 'Vui lòng đồng ý với điều khoản dịch vụ' }));
      return setIsLoading(false);
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      if (response.ok) navigate('/login', { state: { message: 'Đăng ký thành công. Hãy đăng nhập!' } });
      else setErrors(prev => ({ ...prev, submit: data.error || 'Đăng ký thất bại' }));
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setErrors(prev => ({ ...prev, submit: 'Lỗi kết nối tới server' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex justify-center py-10">
          <div className="max-w-md w-full bg-[#d9dcde] rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-[#1a4e7e] mb-2">HUTECH Search</div>
              <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-[#1a237e]">Đăng ký tài khoản</h2>
              <p className="mt-2 text-[#1a237e]">Đăng ký để trải nghiệm dịch vụ tìm kiếm thông minh</p>
            </div>

            {errors.submit && <div className="mb-4 text-red-600 text-sm text-center">{errors.submit}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-black ">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                className={`bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black ">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-black">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-[#1976d2] hover:text-[#1565c0] underline">
                  Điều khoản dịch vụ
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1976d2] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#1a237e]">
                Đã có tài khoản? <Link to="/login" className="font-medium text-[#1976d2] hover:text-[#1565c0] underline">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Register;
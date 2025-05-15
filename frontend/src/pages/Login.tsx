import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../components/Logic/activityLogger';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.id) {
        localStorage.setItem("user", JSON.stringify(data)); 
        await login(email, password);
        await logActivity(data.id, 'Login', 'Đăng nhập thành công');
        navigate('/search-forms', { state: { user: data } });
      }
      
     else {
        setError(data.message || 'Email hoặc mật khẩu không đúng');
    }
      

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError('Lỗi server. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
};

  return (
    <MainLayout>
      <PageContainer>
      <div className="min-h-screen bg-[#fafbfc] text-black flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-[#d9dcde] rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-[#1a4e7e] mb-2">HUTECH Search</div>
            <div className="w-16 h-1 bg-[#1976d2] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold ">Đăng ký tài khoản</h2>
            <p className="mt-2 ">Đăng ký để trải nghiệm dịch vụ tìm kiếm thông minh</p>
          </div>  

            {location.state?.message && (
              <div className="mb-4 text-green-600 text-sm text-center">
                {location.state.message}
              </div>
            )}
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white text-[#1a237e] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1976d2] focus:border-[#1976d2] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-black">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-[#1976d2] hover:text-[#1565c0]">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1976d2] ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-medium text-[#1976d2] hover:text-[#1565c0] underline">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';
import { logActivity } from '../components/Logic/activityLogger';


const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();


  // Gửi mã xác nhận
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('✅ Mã xác nhận đã gửi đến email của bạn.');
        setStep(2);
      } else {
        setStatus('error');
        setMessage(data.message || '❌ Gửi mã thất bại.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Lỗi máy chủ. Vui lòng thử lại.');
    }
  };

  // Xác minh mã
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/users/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('✅ Mã xác nhận hợp lệ. Bạn có thể đổi mật khẩu.');
        setStep(3);
      } else {
        setStatus('error');
        setMessage(data.message || '❌ Mã xác nhận không hợp lệ.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Lỗi máy chủ khi xác minh mã.');
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        // Thông báo thành công
        setStatus('success');
        setMessage('✅ Mật khẩu đã được thay đổi thành công.');
      
        //  Ghi log activity
        await logActivity(data.user_id, 'Change Password', 'Người dùng đã đổi mật khẩu thành công');
        
        // Set up lại bước đầu
        setStep(1);
        setEmail('');
        setCode('');
        setNewPassword('');
        // Chuyển trang
        navigate('/login');

      } else {
        setStatus('error');
        setMessage(data.message || '❌ Không thể thay đổi mật khẩu.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('❌ Lỗi máy chủ khi đổi mật khẩu.');
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold text-blue-700 text-center mb-4">Quên mật khẩu</h2>
            {message && (
              <div className={`text-sm text-center mb-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            {step === 1 && (
              <>
                <p className="text-gray-600 text-center mb-6">Nhập email để nhận mã xác nhận.</p>
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                      className="bg-gray-100 text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    {status === 'loading' ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-gray-600 text-center mb-6">Nhập mã xác nhận đã gửi về email.</p>
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-300 text-gray-800 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã xác nhận</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-gray-100 text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    {status === 'loading' ? 'Đang xác minh...' : 'Xác nhận mã'}
                  </button>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-gray-600 text-center mb-6">Nhập mật khẩu mới của bạn.</p>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-100 text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    {status === 'loading' ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default ForgotPassword;

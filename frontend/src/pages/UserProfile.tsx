// ✅ Trang UserProfile - sử dụng MainLayout + giữ giao diện thiết kế

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../components/Logic/activityLogger';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_Number: "",
    role: "",
    memberSince: ""
  });
  const [activities, setActivities] = useState<{ type: string, time: string }[]>([]);

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:5000/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone_Number: data.phone_number || "Chưa cập nhật",
            role: data.role || "",
            memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString() : ""
          });
        })
        .catch(err => console.error("Lỗi khi lấy user:", err));

      fetch(`http://localhost:5000/api/users/${user.id}/activity`)
        .then(res => res.json())
        .then(data => {
          setActivities(data.activities || []);
        })
        .catch(err => console.error("Lỗi khi lấy activity:", err));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone_Number: formData.phone_Number
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Cập nhật thành công!");
        setIsEditing(false);
        await logActivity(user!.id, "Cập nhật hồ sơ", "Người dùng đã cập nhật thông tin cá nhân");
      } else {
        alert("❌ Lỗi cập nhật: " + result.error);
      }
    } catch (err) {
      console.error("❌ Lỗi gửi yêu cầu:", err);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  if (!user || !user.id) {
    return (
      <MainLayout>
        <PageContainer>
          <div className="text-center py-10 text-gray-600">Loading user information...</div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white">User Profile</h1>
          </div>

          <div className="p-6">
            <div className="flex items-start flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl text-gray-600">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : "?"}
                    </span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-[#1a237e]">{formData.name}</h2>
                    <p className="text-gray-600">{formData.email}</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Subscription</h3>
                  <p><b>Member since:</b> {formData.memberSince}</p>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-[#d7d8d9] text-blue-600 hover:text-blue"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      {['name', 'email', 'phone_Number'].map(field => (
                        <div className="mb-4" key={field}>
                          <label className="block text-gray-700 mb-1 capitalize">{field.replace('_', ' ')}</label>
                          <input
                            type="text"
                            name={field}
                            value={(formData as any)[field]}
                            onChange={handleChange}
                            className="bg-gray-300 w-full p-2 border rounded"
                          />
                        </div>
                      ))}
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          name="role"
                          value={formData.role}
                          disabled
                          className="bg-gray-200 w-full p-2 border rounded text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                      >
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <>
                      <p><b>Full Name:</b> {formData.name}</p>
                      <p><b>Email:</b> {formData.email}</p>
                      <p><b>Phone Number:</b> {formData.phone_Number}</p>
                      <p><b>Role:</b> {formData.role}</p>
                    </>
                  )}
                </div>

                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <ul className="text-sm">
                    {activities.length > 0 ? (
                      activities.map((activity, idx) => (
                        <li key={idx} className="p-2 border-b">
                          <span className="text-gray-600">{activity.type}</span> - {new Date(activity.time).toLocaleString()}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500">Không có hoạt động nào.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default UserProfile;

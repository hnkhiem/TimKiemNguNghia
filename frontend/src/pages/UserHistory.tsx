import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

interface DownloadHistoryItem {
  id: number;
  filename: string;
  date: string;
}

const UserHistory: React.FC = () => {
  const { user } = useAuth();
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch('http://localhost:5000/api/history/downloads/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    })
      .then(res => res.json())
      .then(data => {
        setDownloadHistory(data.downloads || []);
      })
      .catch(err => console.error('Lỗi lấy lịch sử:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const pageCount = Math.ceil(downloadHistory.length / itemsPerPage);
  const currentPageItems  = downloadHistory.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= pageCount) {
      setPage(pageNum);
    }
  };
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white">Download History</h1>
          </div>

          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500">Đang tải lịch sử...</p>
            ) : downloadHistory.length === 0 ? (
              <p className="text-gray-500">Không có lịch sử tải xuống.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-gray-800 font-semibold">
                      <tr>
                        <th className="px-6 py-3 text-left">Tên tệp</th>
                        <th className="px-6 py-3 text-left">Ngày tải</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900 font-medium">{item.filename}</td>
                          <td className="px-6 py-4 text-gray-700">{formatDate(item.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center gap-2 mt-6">
                  <button
                    className="px-3 py-1 rounded bg-blue-200 text-blue-800 disabled:opacity-50"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    &lt; Prev
                  </button>
                  {[...Array(pageCount)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === pageCount}
                  >
                    Next &gt;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default UserHistory;
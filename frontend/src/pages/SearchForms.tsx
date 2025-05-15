import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logActivity } from '../components/Logic/activityLogger';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const PDFIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-10 h-10">
    <path fill="#FF5722" d="M20 2H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z" />
    <path stroke="#FF5722" strokeWidth="2" d="M4 6v14a2 2 0 002 2h14" />
    <path fill="#fff" d="M10.5 11.5h-.8v2.4h.8c.8 0 1.3-.5 1.3-1.2s-.5-1.2-1.3-1.2zM14.7 11.5h1.4v.9h-1.4v.8h1.6v.9h-2.5v-3.8h2.6v.9h-1.7v.3z" />
    <path fill="#fff" d="M10.5 10.6c1.2 0 2.2.7 2.2 2.1 0 1.4-.9 2.1-2.2 2.1h-1.7v-4.2h1.7z" />
  </svg>
);

interface Form {
  id: number;
  title: string;
  content: string;
  filePath: string;
  created_at: Date;
}

export default function SearchForms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceId, setDebounceId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

   // Load form theo page mặc định
   const loadForms = (pageNum = 1) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/forms/page?page=${pageNum}&limit=5`)
      .then(res => res.json())
      .then(data => {
        setForms(data.forms);
        setTotalPages(data.totalPages);
        setIsSearching(false);
      })
      .catch(err => console.error("Lỗi tải forms:", err))
      .finally(() => setLoading(false));
  };


   // Khi mới vào trang, load page đầu tiên
  useEffect(() => {
    if (!isSearching) loadForms(page);
  }, [page]);

  // Xử lý tìm kiếm khi bấm nút hoặc Enter
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      loadForms(1);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/forms/search?query=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        setForms(data.results || []);
        setTotalPages(1);
        setIsSearching(true);

        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (userId) {
            logActivity(userId, 'search', `Tìm kiếm với từ khóa: ${searchQuery}`);
        }
        
      })
      .catch(err => console.error("Lỗi tìm kiếm:", err))
      .finally(() => setLoading(false));
  };

  // Xử lý nhấn Enter trong ô tìm kiếm
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Khi người dùng gõ vào input (debounce 0.5 giây)
  useEffect(() => {
    if (debounceId) clearTimeout(debounceId);

    const id = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        handleSearch();
      } else {
        loadForms(1);
      }
    }, 500);

    setDebounceId(id);

    return () => clearTimeout(id);
  }, [searchQuery]);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) setPage(pageNum);
  };

  return (
    <MainLayout>
      <PageContainer>
              {/* Header */}
        <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900">
          <div className="w-full flex flex-col items-center pt-12 pb-4">
            <h1 className="text-4xl font-bold mb-2 text-center">Intelligent Document Search & Analysis</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
              Transform the way you search through documents with our advanced semantic search technology.
            </p>
          {/* Search Bar */}
            <div className="w-full max-w-xl flex items-center bg-white rounded-full shadow-lg px-6 py-3 mb-8 border border-gray-100">
              <input
                type="text"
                placeholder="Search across all your documents..."
                className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSearch}
                className="ml-2 bg-[#1976d2] hover:bg-[#1565c0] transition-colors text-white rounded-full p-2 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

              {/* Loading spinner */}
          {loading && (
            <p className="text-gray-500 mb-4">Đang tải dữ liệu...</p>
          )}

          {/* Results */}
          <div className="w-full max-w-xl mt-8 space-y-4">
            {forms.length === 0 && !loading ? (
              <p className="text-center text-gray-500">Không tìm thấy biểu mẫu nào.</p>
            ) : (
              forms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between px-4 py-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/open-file/${form.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <PDFIcon />
                    <div>
                      <p className="font-semibold">{form.title}</p>
                      <p className="text-sm text-gray-500">{new Date(form.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>


          <div className="mt-10 flex justify-center items-center gap-2 bg-white py-2 px-6 rounded-full shadow-md">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded bg-[#1976d2] text-white disabled:opacity-50"
            >
              &lt; prev
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const p = idx + 1;
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive ? 'bg-[#1976d2] text-white' : 'bg-white text-[#1976d2] border border-[#1976d2] hover:bg-[#e3f2fd]'}`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm rounded bg-[#1976d2] text-white disabled:opacity-50"
            >
              next &gt;
            </button>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
}
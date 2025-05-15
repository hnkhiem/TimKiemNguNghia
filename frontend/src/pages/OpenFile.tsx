import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OpenFile = () => {
  const { id } = useParams();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/forms/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Lỗi lấy file:', err);
        setLoading(false);
      });
  }, [id]);

  const handleDownload = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;

    if (!userId || !file || !file.title) return;

    fetch('http://localhost:5000/api/history/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.title,
        user_id: userId
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Ghi log download:', data.message);
      })
      .catch(err => {
        console.error('❌ Lỗi ghi log tải xuống:', err);
      });
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Đang tải file...</p>;
  }

  return (
    <div className="w-full">
      {file.filePath?.endsWith('.pdf') ? (
        <iframe
          src={file.filePath}
          width="100%"
          height="700px"
          title="PDF Viewer"
          onLoad={handleDownload}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#fff'
          }}
        />
      ) : (
        <p className="text-center text-red-500 mt-10">Không thể hiển thị nội dung file.</p>
      )}
    </div>
  );
};

export default OpenFile;

import * as React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PageContainer from '../components/Layout/PageContainer';

const Product: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const filesArray = Array.from(event.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một file");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('form', file));

    try {
      const response = await fetch('http://localhost:5000/api/forms/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Upload thành công!");
        setSelectedFiles([]);

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        for (const uploaded of data.forms || []) {
          await fetch('http://localhost:5000/api/history/uploads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: uploaded.title,
              status: 'upload',
              user_id: user.id
            })
          });
        }
      } else {
        alert("Upload thất bại: " + (data.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Lỗi khi upload:", error);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col items-center bg-[#fafbfc] text-gray-900">
          <div className="w-full flex flex-col items-center pt-12 pb-4">
            <h1 className="text-4xl font-bold mb-2 text-center">Upload & Process Your Files</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
              Upload your documents for intelligent processing and semantic search capabilities.
            </p>
          </div>

          <div
            className="w-full max-w-2x1 min-h-[12rem] max-h-[30rem]
              bg-[#d2d3d4] border-2 border-dashed rounded-lg 
              p-8 text-center bg-white 
              shadow-md hover:shadow-lg transition-shadow 
              flex flex-col gap-8 items-center justify-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFiles.length > 0 && (
              <div className="w-full max-h-48 overflow-y-auto flex flex-col gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between bg-gray-100 px-4 py-2 rounded">
                    <span className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="bg-[#C0C0C0] text-red-500 text-sm rounded px-2"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length === 0 && (
              <>
                <div>
                  <svg className="mx-auto w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl font-medium mb-4">Drag and drop your files here or</p>
              </>
            )}

            {selectedFiles.length > 0 && (
              <button
                onClick={handleUploadAll}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Upload tất cả
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1976d2] text-white px-8 py-3 rounded hover:bg-[#1565c0] transition-colors font-medium"
            >
              Choose Files
            </button>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Product;

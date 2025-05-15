import React, { useEffect } from 'react';
import Navbar from '../Shared/Navbar';
import Footer from '../Shared/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Tạo hiệu ứng fade-in khi component được tải
  useEffect(() => {
    document.body.classList.add('fade-in');
    return () => {
      document.body.classList.remove('fade-in');
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow animate-fadeIn">
        {children}
      </main>
      <Footer />
    </div>
  );
  
};

export default MainLayout; 
import React from 'react';
import { Link } from 'react-router-dom';

// Danh sách link điều hướng
const NAV_LINKS = [
  { label: 'Search', path: '/search-forms' },
  { label: 'Product', path: '/product' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Help', path: '/help' },
  { label: 'Privacy', path: '/privacy' },
];


// Icon SVG mạng xã hội
const SocialIcon = ({ d }: { d: string }) => (
  <a href="#" className="bg-blue-600 hover:bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center transition-colors">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">

          {/* Logo & mô tả */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <span className="bg-white text-blue-700 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-2">H</span>
              <span className="text-xl font-bold tracking-wide">HUTECH Search</span>
            </div>
            <p className="text-blue-100 text-sm max-w-md">
              Our AI-powered search engine transforms how you search through documents with advanced semantic understanding.
            </p>
          </div>

          {/* Navigation links */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 md:mb-0">
            {NAV_LINKS.map(link => (
              <Link key={link.label} to={link.path} className="text-blue-100 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mạng xã hội + bản quyền */}
          <div className="flex flex-col items-end">
            <div className="flex space-x-4 mb-4">
              <SocialIcon d="M24 4.557c-.883.392-1.832.656-2.828.775..." /> {/* Twitter */}
              <SocialIcon d="M19 0h-14c-2.761 0-5 2.239-5 5v14..." />         {/* LinkedIn */}
              <SocialIcon d="M12 0c-6.626 0-12 5.373-12 12..." />           {/* GitHub */}
            </div>
            <p className="text-blue-200 text-sm">
              &copy; {new Date().getFullYear()} HUTECH University
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

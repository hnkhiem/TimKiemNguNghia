import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo & Brand */}
          <Link to="/search-forms" className="flex items-center space-x-2 transition transform hover:scale-105 duration-300">
            <div className="bg-white text-blue-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">
              <span>H</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">HUTECH Search</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-blue-500 animate-fadeDown">
            <NavLinks isMobile onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

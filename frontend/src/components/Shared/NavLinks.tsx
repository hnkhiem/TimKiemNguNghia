import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const NavLinks: React.FC<Props> = ({ isMobile = false, onNavigate }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const linkClass = (path: string) =>
    `block py-2 px-4 text-white transition-all duration-300 ${
      location.pathname === path
        ? 'bg-blue-500 rounded-lg font-bold'
        : 'hover:bg-blue-500 hover:translate-x-2 hover:rounded-lg'
    }`;

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
  };

  return (
    <>
      <Link to="/search-forms" className={linkClass('/search-forms')} onClick={onNavigate}>Search</Link>

      {isAuthenticated ? (
        <>
          <Link
            to={user?.role === 'admin' ? '/admin-history' : '/user-history'}
            className={linkClass(user?.role === 'admin' ? '/admin-history' : '/user-history')}
            onClick={onNavigate}
          >
            History
          </Link>
          <Link to="/user-profile" className={linkClass('/user-profile')} onClick={onNavigate}>Profile</Link>
          {user?.role === 'admin' && (
            <Link to="/product" className={linkClass('/product')} onClick={onNavigate}>Product</Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-4 text-white bg-blue-500 my-2 rounded-lg hover:bg-blue-400 transition-all duration-300"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={linkClass('/login')} onClick={onNavigate}>Login</Link>
          <Link to="/register" className={linkClass('/register')} onClick={onNavigate}>Register</Link>
        </>
      )}
    </>
  );
};

export default NavLinks;

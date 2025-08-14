import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, HelpCircle } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bcu-header">
      <div className="bcu-header-content">
        <Link to="/" className="bcu-logo">
          bcu
        </Link>
        
        <nav className="bcu-nav">
          <Link 
            to="/" 
            className={`bcu-nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/wireframe" 
            className={`bcu-nav-link ${isActive('/wireframe') ? 'active' : ''}`}
          >
            Wireframe Editor
          </Link>
          <Link 
            to="/generate" 
            className={`bcu-nav-link ${isActive('/generate') ? 'active' : ''}`}
          >
            Design Generator
          </Link>
        </nav>

        <div className="bcu-header-actions">
          <button className="bcu-header-icon-btn">
            <Search size={20} />
          </button>
          <button className="bcu-header-icon-btn">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

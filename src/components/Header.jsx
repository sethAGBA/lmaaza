import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { menuItems } from '../data';

const Header = ({ isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || (path === '/accueil' && location.pathname === '/');
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className={`text-2xl font-bold ${isScrolled ? 'text-purple-600' : 'text-white'}`}>
            L'Maaza
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => {
              const path = item.id === 'accueil' ? '/' : `/${item.id}`;
              return (
                <Link
                  key={item.id}
                  to={path}
                  className={`transition-colors hover:text-purple-300 ${
                    isActive(path)
                      ? (isScrolled ? 'text-purple-600 font-semibold' : 'text-yellow-300 font-semibold')
                      : (isScrolled ? 'text-gray-700' : 'text-white')
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-xl">
            {menuItems.map((item) => {
              const path = item.id === 'accueil' ? '/' : `/${item.id}`;
              return (
                <Link
                  key={item.id}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center ${
                    isActive(path) ? 'text-purple-600 font-semibold bg-purple-50' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
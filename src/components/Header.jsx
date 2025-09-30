import React from 'react';
import { Menu, X } from 'lucide-react';
import './Header.css';

const Header = ({ isScrolled, isMenuOpen, setIsMenuOpen, menuItems, activeSection, setActiveSection }) => {
  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <div className="nav-row">
          <div className={`brand-title ${isScrolled ? 'scrolled' : ''}`}>L'Maaza</div>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              const btnClasses = ['menu-button'];
              if (isScrolled) btnClasses.push('scrolled');
              if (isActive) btnClasses.push('active');
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className={btnClasses.join(' ')}>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button className={`mobile-toggle ${isScrolled ? 'scrolled' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMenuOpen(false);
                }}
                className={`mobile-menu-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <span className="icon-space">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

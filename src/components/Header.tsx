import React from 'react';
import { Keyboard, Sun, Moon } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="header">
      <div className="logo">
        <Keyboard size={32} className="logo-icon" />
        <span className="logo-text">typo</span>
      </div>
      
      <nav className="nav">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>
    </header>
  );
};

export default Header;

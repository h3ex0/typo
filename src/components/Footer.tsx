import React from 'react';
import { Globe } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="shortcuts">
        <div className="shortcut">
          <kbd>shift</kbd> + <kbd>enter</kbd> - restart test
        </div>
      </div>
      
      <div className="footer-links">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Globe size={18} />
          <span>github</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;

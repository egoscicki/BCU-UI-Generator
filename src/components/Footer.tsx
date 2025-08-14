import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bcu-footer">
      <div className="bcu-footer-content">
        <div className="bcu-footer-brand">
          <h3 className="bcu-footer-logo">bcu</h3>
          <p className="bcu-footer-tagline">
            Building better banking experiences through intelligent design
          </p>
        </div>
        
        <div className="bcu-footer-links">
          <div className="bcu-footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="/wireframe">Wireframe Editor</a></li>
              <li><a href="/generate">Design Generator</a></li>
              <li><a href="/templates">Templates</a></li>
            </ul>
          </div>
          
          <div className="bcu-footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/tutorials">Tutorials</a></li>
              <li><a href="/examples">Examples</a></li>
            </ul>
          </div>
          
          <div className="bcu-footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="bcu-footer-bottom">
          <p>&copy; 2024 BCU Credit Union. All rights reserved.</p>
          <p>Empowering financial innovation through intelligent design.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

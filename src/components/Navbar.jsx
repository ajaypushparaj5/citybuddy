import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ExternalLink } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <nav style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 1000,
      display: 'flex',
      gap: '12px'
    }}>
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
      >
        <Home size={18} />
        Back to Home
      </Link>
    </nav>
  );
}

export default Navbar;

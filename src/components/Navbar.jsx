import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  if (location.pathname === '/') return null;

  const isCitizen = location.pathname === '/citizen';

  const linkStyle = {
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
  };

  return (
    <nav style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 1000,
      display: 'flex',
      gap: '12px'
    }}>
      {!isCitizen ? (
        <Link 
          to="/citizen" 
          style={linkStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
        >
          <LayoutDashboard size={18} />
          Citizen View
        </Link>
      ) : (
        <Link 
          to="/twin" 
          style={linkStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
        >
          <Settings size={18} />
          Admin View
        </Link>
      )}

      <Link 
        to="/" 
        style={linkStyle}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)'}
      >
        <Home size={18} />
        Home
      </Link>
    </nav>
  );
}

export default Navbar;

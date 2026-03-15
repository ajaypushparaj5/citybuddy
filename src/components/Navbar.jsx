import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      backgroundColor: '#0f172a',
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          backgroundColor: '#6366f1', 
          padding: '4px', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
            <path d="m12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
            <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '1.1rem' }}>CITYBUDDY AI</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
        <Link 
          to="/" 
          style={{ 
            color: location.pathname === '/' ? '#6366f1' : 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            borderBottom: location.pathname === '/' ? '2px solid #6366f1' : 'none',
            paddingBottom: '4px'
          }}
        >
          Digital Twin Engine
        </Link>
        <Link 
          to="/traffic" 
          style={{ 
            color: location.pathname === '/traffic' ? '#6366f1' : 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            borderBottom: location.pathname === '/traffic' ? '2px solid #6366f1' : 'none',
            paddingBottom: '4px'
          }}
        >
          Traffic Tracking AI
        </Link>
      </div>

      <div style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
        System Active
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ExternalLink } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  if (location.pathname === '/') return null;

  return (
    <nav className="absolute top-4 right-4 z-[1000] flex gap-3">
      <Link 
        to="/" 
        className="glass-strong flex items-center gap-2 px-4 py-2.5 text-white no-underline rounded-xl text-sm font-medium hover:bg-slate-700/90 transition-colors"
      >
        <Home size={18} />
        Back to Home
      </Link>
    </nav>
  );
}

export default Navbar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-slate-900 text-white border-b border-white/10 z-[100]">
      <div className="flex items-center gap-3">
        <div className="bg-brand-blue p-1 rounded flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
            <path d="m12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
            <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
          </svg>
        </div>
        <span className="font-bold tracking-wider text-[1.1rem]">CITYBUDDY AI</span>
      </div>

      <div className="flex gap-6 text-[0.85rem] font-medium">
        <Link 
          to="/" 
          className={`no-underline transition-colors pb-1 border-b-2 ${
            location.pathname === '/' ? 'text-brand-blue border-brand-blue' : 'text-white/70 border-transparent hover:text-white'
          }`}
        >
          Digital Twin Engine
        </Link>
        <Link 
          to="/traffic" 
          className={`no-underline transition-colors pb-1 border-b-2 ${
            location.pathname === '/traffic' ? 'text-brand-blue border-brand-blue' : 'text-white/70 border-transparent hover:text-white'
          }`}
        >
          Traffic Tracking AI
        </Link>
      </div>

      <div className="text-[0.75rem] px-3 py-1.5 rounded-md border border-white/20 bg-white/5 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
        System Active
      </div>
    </nav>
  );
};

export default Navbar;

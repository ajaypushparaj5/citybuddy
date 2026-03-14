import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind classes
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * LightBeamButton
 * 
 * A futuristic button featuring a rotating light beam border effect.
 * Uses CSS @property for high-performance hardware-accelerated animations.
 */
export function LightBeamButton({ 
  children, 
  className, 
  onClick,
  gradientColors = ["#47768f", "#06b6d4", "#918855"], // CityBuddy Palette: Indigo -> Cyan -> Indigo
  ...props 
}) {
  const gradientString = `conic-gradient(from var(--gradient-angle), transparent 0%, ${gradientColors[0]} 40%, ${gradientColors[1]} 50%, transparent 60%, transparent 100%)`;

  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          from { --gradient-angle: 0deg; }
          to { --gradient-angle: 360deg; }
        }
        .animate-border-spin {
          animation: border-spin 2.5s linear infinite;
        }
      `}</style>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "group relative isolate overflow-hidden rounded-full bg-slate-950 px-8 py-4 text-base font-extralight text-white transition-all hover:bg-black border border-white/5",
          "shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)]",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-3">{children}</span>
        
        {/* Gradient Border Animation Layer */}
        <div 
          className="absolute inset-0 -z-10 rounded-full p-[1.5px] animate-border-spin" 
          style={{ 
            '--gradient-angle': '0deg',
            background: gradientString
          }} 
        />
        
        {/* Solid Inner Background (keeps text legible) */}
        <div className="absolute inset-[1.5px] -z-10 rounded-full bg-slate-950" />
        
        {/* Hover Static Inner Glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </motion.button>
    </>
  );
}

export default LightBeamButton;

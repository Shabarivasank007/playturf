import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4 select-none">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center font-sports text-base font-black text-white shadow-md shadow-brand/10">
              DD
            </div>
            <span className="text-base font-black tracking-tighter text-slate-950 font-sports uppercase leading-none">
              DD<span className="text-brand">TURF</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed font-semibold">
            Near MERLIS HOTEL, COIMBATORE 61, Avinashi Road, Goldwins, Coimbatore, Tamil Nadu - 641014
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider mb-4 font-sports">Features</h4>
          <ul className="space-y-2.5 text-sm text-slate-600 font-semibold">
            <li>
              <Link to="/book" className="hover:text-brand transition-colors">Book a Turf</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-brand transition-colors">Streaks & Loyalty</Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-brand transition-colors">Owner Control Center</Link>
            </li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider mb-4 font-sports">Under the hood</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-medium">
            <li>React 18 & Vite</li>
            <li>Tailwind CSS v3 (White & Red Theme)</li>
            <li>Framer Motion Animations</li>
            <li>Redis hold simulator (stateful)</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-medium">
        <span>© 2026 DD Turf Inc. All rights reserved.</span>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

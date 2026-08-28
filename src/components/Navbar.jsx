import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Trophy, LogOut, ShieldAlert, Calendar, User, Zap } from 'lucide-react';

export const Navbar = () => {
  const { user, logoutUser } = useApp();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll tracking to trigger floating scaling micro-interactions
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl transition-all duration-300 ${
        scrolled 
          ? 'top-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl py-2 px-6 rounded-2xl scale-[0.98]' 
          : 'top-4 bg-white/75 backdrop-blur-lg border border-slate-200/40 shadow-lg py-3.5 px-7 rounded-3xl'
      }`}
    >
      <div className="flex items-center justify-between">
        
        {/* Monogram Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-sports text-lg font-black text-white shadow-md shadow-brand/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10 font-black tracking-tighter">
              D<span className="text-white/80">D</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/20 to-transparent z-0" />
            <div className="absolute inset-0 border border-white/10 rounded-xl" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-base font-black tracking-tighter text-slate-900 font-sports uppercase">
              DD<span className="text-brand">TURF</span>
            </span>
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-0.5">COIMBATORE</span>
          </div>
        </Link>

        {/* Desktop Menu with Apple-Style Underline and Dot Indicators */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative py-1.5 text-sm font-black tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200 group ${
                  active ? 'text-brand' : 'text-slate-600 hover:text-brand'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.name}
                
                {link.path === '/profile' && user.isLoggedIn && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 bg-brand/10 text-brand">
                    🔥 {user.streakCount}
                  </span>
                )}

                {/* Minimal Underline Slide Hover */}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                {/* Sleek Active Dot Indicator */}
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand shadow-sm shadow-brand/50" />
                )}
              </Link>
            );
          })}

          {/* Admin link */}
          <Link
            to="/admin"
            className={`relative py-1.5 text-sm font-black tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200 group ${
              isActive('/admin') ? 'text-slate-900' : 'text-slate-505 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-brand" />
            Admin Panel
            
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            {isActive('/admin') && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-900" />
            )}
          </Link>
        </div>

        {/* User Auth Info */}
        <div className="hidden md:flex items-center gap-4 border-l border-slate-200/80 pl-5">
          {user.isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full border-2 border-brand/40 overflow-hidden hover:scale-105 transition-transform duration-300 bg-slate-100 group-hover:border-brand">
                  <img 
                    src={user.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=ronaldo"} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">Athlete</span>
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-brand transition-colors max-w-[100px] truncate mt-0.5">
                    {user.name}
                  </span>
                </div>
              </Link>
              <button
                onClick={logoutUser}
                className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-brand flex items-center justify-center transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-brand hover:bg-brand-dark text-white font-black text-xs tracking-wider uppercase px-5 py-2 rounded-lg shadow-md shadow-brand/10 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-3.5 animate-fadeIn shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-bold tracking-wide flex items-center justify-between ${
                  active ? 'text-brand bg-brand/5 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-brand' : 'text-slate-500'}`} />
                  {link.name}
                </div>
                {link.path === '/profile' && user.isLoggedIn && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-brand/10 text-brand">
                    🔥 {user.streakCount}
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className={`px-4 py-3 rounded-lg text-sm font-bold tracking-wide flex items-center gap-3 ${
              isActive('/admin') ? 'text-slate-900 bg-slate-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-brand" />
            Admin Panel
          </Link>

          <div className="border-t border-slate-150 pt-4 mt-2">
            {user.isLoggedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-brand/30 overflow-hidden bg-slate-100">
                    <img 
                      src={user.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=ronaldo"} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400">Profile</span>
                    <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setIsOpen(false);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-brand hover:bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center block bg-brand hover:bg-brand-dark text-white font-bold text-sm py-2.5 rounded-lg shadow-lg shadow-brand/20 transition-all cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const navLinks = [
  { name: 'Book Field', path: '/book', icon: Calendar },
  { name: 'My Bookings', path: '/bookings', icon: Zap },
  { name: 'Streak & Loyalty', path: '/profile', icon: Trophy },
];

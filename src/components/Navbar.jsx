import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Trophy, LogOut, ShieldAlert, Calendar, User, Zap, Activity } from 'lucide-react';

export const Navbar = () => {
  const { user, logoutUser } = useApp();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Live Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Book Field',     path: '/book',      icon: Calendar },
    { name: 'My Bookings',   path: '/bookings',   icon: Zap },
    { name: 'Profile',       path: '/profile',    icon: Trophy },
  ];

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl transition-all duration-300 ${
      scrolled
        ? 'top-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl py-2 px-6 rounded-2xl scale-[0.98]'
        : 'top-4 bg-white/75 backdrop-blur-lg border border-slate-200/40 shadow-lg py-3.5 px-7 rounded-3xl'
    }`}>
      <div className="flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-black text-white shadow-md shadow-brand/10 group-hover:scale-105 transition-all">
            <span className="text-lg font-black tracking-tighter">DD</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tighter text-slate-900 uppercase">DD<span className="text-brand">TURF</span></span>
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-0.5">COIMBATORE</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ name, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={name} to={path}
                className={`relative py-1.5 text-sm font-black tracking-wider uppercase flex items-center gap-1.5 transition-colors group
                  ${active ? 'text-brand' : 'text-slate-600 hover:text-brand'}`}>
                <Icon className="w-3.5 h-3.5" />
                {name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                {active && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand" />}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link to="/admin"
              className={`relative py-1.5 text-sm font-black tracking-wider uppercase flex items-center gap-1.5 transition-colors group
                ${isActive('/admin') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
              <ShieldAlert className="w-3.5 h-3.5 text-brand" />
              Admin
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4 border-l border-slate-200/80 pl-5">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-all">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase leading-none">{user.role}</span>
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-brand transition-colors max-w-[100px] truncate mt-0.5">
                    {user.name}
                  </span>
                </div>
              </Link>
              <button onClick={logoutUser}
                className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand flex items-center justify-center transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="bg-brand hover:bg-brand-dark text-white font-black text-xs tracking-wider uppercase px-5 py-2 rounded-lg shadow-md transition-all hover:scale-[1.02]">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-2 shadow-lg">
          {links.map(({ name, path, icon: Icon }) => (
            <Link key={name} to={path} onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3
                ${isActive(path) ? 'text-brand bg-brand/5' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Icon size={18} className={isActive(path) ? 'text-brand' : 'text-slate-400'} />
              {name}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 text-slate-700 hover:bg-slate-50">
              <ShieldAlert size={18} className="text-brand" /> Admin Panel
            </Link>
          )}
          <div className="border-t border-slate-100 pt-3 mt-1">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-black text-sm">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{user.name}</span>
                </div>
                <button onClick={() => { logoutUser(); setIsOpen(false); }}
                  className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1">
                  <LogOut size={12} /> Out
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-brand text-white font-bold text-sm py-2.5 rounded-xl">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

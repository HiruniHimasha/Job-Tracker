// components/Navbar.jsx — updated with /suggestions nav link
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/dashboard',   label: 'Dashboard',    icon: '📋' },
    { to: '/interviews',  label: 'Interviews',   icon: '🎯' },
    { to: '/suggestions', label: 'Suggestions',  icon: '💼' },
    { to: '/resume',      label: 'Resume AI',    icon: '🤖' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100/80 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                            flex items-center justify-center text-white text-sm font-bold shadow-md
                            group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-200">
              JT
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600
                               bg-clip-text text-transparent leading-none block">
                Job Tracker
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">Career Management</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-2xl p-1 gap-0.5">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
                            transition-all duration-200
                            ${isActive(link.to)
                              ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'}`}>
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Profile dropdown */}
          <div className="hidden md:block relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200
                         rounded-2xl px-3 py-2 transition-all">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500
                              flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{user?.name}</span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl
                              border border-gray-100 py-2 overflow-hidden z-50 animate-dropdown">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {navLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <span>{link.icon}</span> {link.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                               hover:bg-red-50 transition-colors font-medium">
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-gray-50 flex flex-col items-center
                       justify-center gap-1.5 hover:bg-gray-100 transition-colors">
            <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 animate-dropdown">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors
                          ${isActive(link.to) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="text-lg">{link.icon}</span> {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500
                              flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-xs text-red-500 font-semibold border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50">
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-dropdown { animation: dropdown 0.18s ease-out; }
      `}</style>
    </nav>
  );
}
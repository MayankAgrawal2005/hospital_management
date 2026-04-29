import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { setUser(null); }
    } else {
      setUser(null);
    }
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled || mobileOpen ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-base sm:text-xl">S</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 truncate max-w-[150px] sm:max-w-none">
            CareSync 360
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-6 font-medium">
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          <ThemeToggle />
          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Log In</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-full text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 transition">Dashboard</Link>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Right: ThemeToggle + Hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-4 py-5 space-y-3">
          <Link to="/" className="block text-gray-700 dark:text-gray-300 font-semibold py-2 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          {!user ? (
            <>
              <Link to="/login" className="block text-gray-700 dark:text-gray-300 font-semibold py-2 hover:text-blue-600">Log In</Link>
              <Link to="/register" className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-md">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block text-blue-600 dark:text-blue-400 font-bold py-2">Dashboard</Link>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold flex-1">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="w-full text-center text-red-500 dark:text-red-400 font-bold py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/40">
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
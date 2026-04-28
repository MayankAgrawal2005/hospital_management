import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
            CarePoint
          </h1>
        </Link>

        <div className="flex items-center gap-6 font-medium">
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          
          <ThemeToggle />

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">Log In</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 rounded-full text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 transition">
                Dashboard
              </Link>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
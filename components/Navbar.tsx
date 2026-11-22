import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import StaggeredMenu from './StaggeredMenu';

interface MenuItem {
  label: string;
  link: string;
  onClick?: () => void;
}

const Logo = () => (
  <NavLink to="/" className="text-white font-bold text-xl flex items-center shrink-0">
    <img src="/images/BY logo.png" alt="Bharat Yatra Logo" className="h-12 w-auto" />
  </NavLink>
);

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Packages", link: "/packages" },
    { label: "AI Trip Planner", link: "/ai-planner" },
  ];

  const activeLink = navItems.find(item => location.pathname === item.link)?.link || '';
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const userJson = sessionStorage.getItem('loggedInUser');
    if (userJson) {
      try {
        setLoggedInUser(JSON.parse(userJson));
      } catch (error) {
        console.error("Failed to parse loggedInUser from sessionStorage", error);
        sessionStorage.removeItem('loggedInUser'); // Clear corrupted data
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      sessionStorage.removeItem('loggedInUser');
      setLoggedInUser(null);
      setIsProfileOpen(false);
      // Use setTimeout to allow state update before navigation
      setTimeout(() => navigate('/'), 0);
    }
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems = [...navItems];
    if (loggedInUser) {
      return [
        ...baseItems,
        { label: "Profile", link: "/profile" },
        { label: "My Bookings", link: "/my-bookings" },
        { label: "Liked Packages", link: "/liked-packages" },
        { label: "Logout", link: "#", onClick: handleLogout },
      ];
    } else {
      return [
        ...baseItems,
        { label: "Sign In", link: "/signin" },
        { label: "Sign Up", link: "/signup" },
      ];
    }
  };

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  const currentUnderline = hoveredLink || activeLink;
  const navHasBg = scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* Desktop Nav */}
      <div className={`hidden lg:flex items-center justify-between mx-auto mt-4 px-4 h-16 rounded-full transition-all duration-300 ${navHasBg ? 'max-w-4xl bg-black/50 backdrop-blur-md' : 'max-w-5xl'}`}>
        <div>
          <Logo />
        </div>
        <div
          className="flex items-center gap-2"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.link}
              onMouseEnter={() => setHoveredLink(item.link)}
              className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span className={`relative z-10 transition-colors ${currentUnderline === item.link ? 'text-black' : 'text-gray-200 hover:text-white'}`}>{item.label}</span>
              {currentUnderline === item.link && (
                <motion.div
                  layoutId="underline"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </NavLink>
          ))}
        </div>
        {loggedInUser ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3"
            >
              <img src={loggedInUser.profileImageUrl || '/images/profile/profile-pic.jpg'} alt={loggedInUser.username} className="w-9 h-9 rounded-full object-cover border-2 border-gray-600" />
              <span className="text-sm font-medium text-gray-200 hidden md:block">Hi, {loggedInUser.username}</span>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20"
                >
                  <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                    <img src={loggedInUser.profileImageUrl || '/images/profile/profile-pic.jpg'} alt={loggedInUser.username} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-white">{loggedInUser.username}</p>
                      <p className="text-xs text-gray-400">{loggedInUser.email}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <NavLink to="/profile" onClick={() => setIsProfileOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700">
                      Edit Profile
                    </NavLink>
                    <NavLink to="/my-bookings" onClick={() => setIsProfileOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700">
                      Your Bookings
                    </NavLink>
                    <NavLink to="/liked-packages" onClick={() => setIsProfileOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700">
                      Liked Packages
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 rounded-md hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink to="/signin" className="px-4 py-2 rounded-full text-sm font-medium transition-colors text-gray-200 hover:text-black hover:bg-white">
              Sign In
            </NavLink>
            <NavLink to="/signup" className="px-4 py-2 rounded-full text-sm font-bold transition-colors bg-white text-black hover:bg-gray-200">
              Sign Up
            </NavLink>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden h-16">
        <StaggeredMenu
          items={getMenuItems()}
          socialItems={socialItems}
          logoUrl="/images/BY logo.png"
        />
      </div>
    </header>
  );
};

export default Navbar;

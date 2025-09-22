'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import api from '@/utils/api';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', image: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const API_BASE = 'https://api.fluencerz.com/api';
  const API_image = 'https://api.fluencerz.com';

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const type = localStorage.getItem('userType');
      if (token && type) {
        try {
          const endpoint = type === 'brand' ? `${API_BASE}/brand/me` : `${API_BASE}/influencer/me`;
          const res = await api.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure token is sent
            },
          });
          setIsLoggedIn(true);
          setUserType(type);
          setUserInfo({
            name: type === 'brand' ? res.data.company_name : res.data.full_name,
            image: res.data.profile_image ? `${API_image}${res.data.profile_image}` : '/default-avatar.png',
          });
        } catch (err) {
          // Only clear localStorage for 401 Unauthorized
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            setIsLoggedIn(false);
            setUserType(null);
            setUserInfo({ name: '', image: '' });
          } else {
            // Log other errors but don't clear localStorage
            // console.error('Failed to fetch user info:', err.message);
          }
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType(null);
    setUserInfo({ name: '', image: '' });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'For Influencers', href: '/influencers' },
    { label: 'For Brands', href: '/brands' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <header className="bg-white/30 backdrop-blur-sm rounded-4xl w-[90vw] p-0 md:w-[80vw] shadow-md fixed top-5 z-50 mx-auto left-1/2 transform -translate-x-1/2">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/fluencerz.png"
            height={1000}
            width={1000}
            alt="Fluencerz Logo"
            className="object-contain sm:h-[50px] sm:w-[200px] md:h-[90px] md:w-[320px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 sm:space-x-6 md:space-x-8 font-extrabold">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 transition-colors font-extrabold text-sm sm:text-base md:text-lg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth/User Section */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3 md:gap-4">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 md:gap-2 focus:outline-none"
              >
                <Image
                  src={userInfo.image}
                  alt={userInfo.name}
                  width={28}
                  height={28}
                  className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full object-cover border border-gray-200"
                />
                <span className="text-white font-medium text-xs sm:text-sm md:text-base hidden lg:inline">
                  {userInfo.name}
                </span>
              </button>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute right-0 mt-2 w-40 sm:w-44 md:w-48 bg-white shadow-lg rounded-lg py-1 sm:py-2 md:py-2 z-10"
                >
                  <button
                    onClick={() => {
                      router.push(userType === 'brand' ? '/dashboard/brand/campaigns' : '/dashboard/influencer/campaigns');
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-1 sm:gap-2 md:gap-2 w-full text-left px-3 sm:px-4 md:px-4 py-1 sm:py-2 md:py-2 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm md:text-base"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 sm:gap-2 md:gap-2 w-full text-left px-3 sm:px-4 md:px-4 py-1 sm:py-2 md:py-2 text-red-600 hover:bg-gray-100 text-xs sm:text-sm md:text-base"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex gap-1 sm:gap-2 md:gap-3">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth/#brandLogin"
                  className="px-3 py-1 sm:px-4 sm:py-2 md:px-8 md:py-4 text-xs sm:text-sm md:text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth/#brandRegister"
                  className="px-3 py-1 sm:px-4 sm:py-2 md:px-8 md:py-4 text-xs sm:text-sm md:text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-shadow"
                >
                  Signup
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-md mt-2 rounded-lg overflow-hidden"
        >
          <nav className="flex flex-col p-3 space-y-2">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    router.push(userType === 'brand' ? '/dashboard/brand' : '/dashboard/influencer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 font-medium text-left text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium text-left text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/#brandLogin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-full text-center"
                >
                  Login
                </Link>
                <Link
                  href="/auth/#brandRegister"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-center"
                >
                  Signup
                </Link>
              </div>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
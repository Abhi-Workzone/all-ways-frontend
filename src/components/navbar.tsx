'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { HiMenu, HiX } from 'react-icons/hi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin' : '/dashboard';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass flex flex-col items-center w-full"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center">
              <span className="text-white font-bold text-lg">a</span>
            </div>
            <span className="text-xl font-bold gradient-text">AllWays</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm text-[#8888aa] hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-sm text-[#8888aa] hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/#testimonials" className="text-sm text-[#8888aa] hover:text-white transition-colors">
              Testimonials
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="text-sm text-[#8888aa] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary !py-2 !px-5 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#8888aa] hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary !py-2 !px-5 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full glass border-t border-[rgba(108,99,255,0.1)]"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/#services" onClick={() => setIsOpen(false)} className="block py-2 text-[#8888aa] hover:text-white">
                Services
              </Link>
              <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="block py-2 text-[#8888aa] hover:text-white">
                How It Works
              </Link>
              <Link href="/#testimonials" onClick={() => setIsOpen(false)} className="block py-2 text-[#8888aa] hover:text-white">
                Testimonials
              </Link>
              <hr className="border-[rgba(108,99,255,0.1)]" />
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="block py-2 text-white">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="btn-secondary w-full text-sm !py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block py-2 text-white">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="btn-primary block text-center text-sm !py-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'ADMIN' ? '/admin' : '/dashboard';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <span className="text-[var(--foreground)] font-bold uppercase text-lg">a</span>
            </div>
            <span className="text-xl font-bold gradient-text">AllWays</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
              How It Works
            </Link>
            <Link href="/#testimonials" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
              Testimonials
            </Link>
          </div>

          {/* CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
              </button>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
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
                <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary !py-2 !px-5 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button & Small screen toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              >
                {theme === 'dark' ? <HiSun size={20} /> : <HiMoon size={20} />}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--foreground)] p-2"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full glass border-t border-[var(--border)]"
          >
            <div className="px-4 py-4 space-y-4">
              <Link href="/#services" onClick={() => setIsOpen(false)} className="block py-2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                Services
              </Link>
              <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="block py-2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                How It Works
              </Link>
              <Link href="/#testimonials" onClick={() => setIsOpen(false)} className="block py-2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                Testimonials
              </Link>
              <hr className="border-[var(--border)]" />
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="block py-2 text-[var(--foreground)]">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="btn-secondary w-full text-sm !py-2">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block py-2 text-[var(--foreground)]">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="btn-primary block text-center text-sm !py-2">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

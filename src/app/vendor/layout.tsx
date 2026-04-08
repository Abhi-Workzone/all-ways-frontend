'use client';

import { useAuthStore } from '@/store/auth.store';
import { usersAPI } from '@/lib/services';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiHome,
  FiUser,
  FiClock,
  FiLogOut,
  FiBriefcase,
  FiActivity,
  FiSun,
  FiMoon,
  FiX,
  FiMenu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, setUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const { data } = await usersAPI.getMe();
        if (data.success && setUser) {
          setUser(data.data);
        }
      } catch (err) {
        console.error('Profile refresh failed', err);
      }
    };

    if (mounted && user) {
      refreshProfile();
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router, mounted]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/vendor', icon: FiHome },
    { name: 'My Profile', href: '/vendor/profile', icon: FiUser },
    { name: 'Job Board', href: '/vendor/jobs', icon: FiBriefcase },
    { name: 'Active Jobs', href: '/vendor/active', icon: FiActivity },
    { name: 'History', href: '/vendor/history', icon: FiClock },
  ];

  if (!mounted || !user) return (
    <div className="h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );


  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-soft-dark/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-light border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                <span className="text-[var(--foreground)] font-bold uppercase text-sm">a</span>
              </div>
              <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">AllWays</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-[var(--text-muted)]"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <p className="text-xs text-[var(--placeholder)] uppercase tracking-wider font-semibold mb-2">Vendor Panel</p>
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-[var(--border)] opacity-80">
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[var(--foreground)] font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[var(--foreground)] truncate max-w-[120px]">{user.email}</p>
                <p className="text-xs text-[var(--placeholder)]">Vendor</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-[var(--secondary)] hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm"
            >
              <FiLogOut className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-grid-pattern flex flex-col">
        {/* Top Header for Mobile/Info */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 md:px-8 border-b border-[var(--border)] bg-[var(--background)] bg-opacity-80 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
             >
               <FiMenu size={24} />
             </button>
            <div className="hidden sm:flex w-8 h-8 rounded-lg bg-[var(--primary)] items-center justify-center">
              <span className="text-[var(--foreground)] font-bold text-xs font-mono">V</span>
            </div>
            <h2 className="text-[var(--foreground)] font-semibold flex items-center gap-2">
              Welcome, {user.email.split('@')[0]}
              {user.businessStatus === 'APPROVED' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] text-emphasized tracking-widest px-3 py-1.5 rounded-full border border-white/10 uppercase !text-white shadow-sm shadow-black/20 ${
              user.businessStatus === 'APPROVED' ? 'bg-[var(--accent)]' :
              user.businessStatus === 'REJECTED' ? 'bg-red-500' :
              'bg-[var(--secondary)]'
            }`}>
              <span className="hidden sm:inline">VERIFICATION: </span>
              <span className="sm:hidden">VERIF: </span>
              {user.businessStatus === 'APPROVED' ? 'OK' : user.businessStatus || 'PENDING'}
            </span>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

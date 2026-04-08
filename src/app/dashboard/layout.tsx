'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { FiHome, FiArchive, FiLogOut, FiMenu, FiX, FiActivity as FiZap, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from 'next-themes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'USER') {
    return (
       <div className="h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  const navItems = [
    { name: 'Book Service', path: '/dashboard', icon: <FiHome className="text-xl" /> },
    { name: 'Active Mission', path: '/dashboard/active', icon: <FiZap className="text-xl" /> },
    { name: 'Service History', path: '/dashboard/history', icon: <FiArchive className="text-xl" /> },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: <FiUser className="text-xl" /> },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-soft-dark z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-light border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-10 mt-2 px-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                <span className="text-[var(--foreground)] font-bold uppercase text-sm">a</span>
              </div>
              <span className="text-lg font-bold gradient-text">AllWays</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-light)] transition-all"
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button className="lg:hidden text-[var(--text-muted)]" onClick={() => setIsSidebarOpen(false)}>
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="px-2 mb-6 flex-1 overflow-y-auto">
            <p className="text-xs text-[var(--placeholder)] uppercase tracking-wider font-semibold mb-2">User Panel</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-[var(--border)] px-2 shrink-0">
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[var(--surface-light)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-[var(--foreground)] font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[var(--foreground)] truncate max-w-[120px]">{user.email}</p>
                <p className="text-xs text-[var(--placeholder)]">Customer</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[var(--secondary)] hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm"
            >
              <FiLogOut className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(108,99,255,0.02)] to-transparent pointer-events-none" />
        
        {/* Top Header Mobile */}
        <header className="lg:hidden h-16 glass border-b border-[var(--border)] flex items-center px-4 justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <span className="text-[var(--foreground)] font-bold uppercase text-sm">a</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)]"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--text-muted)] p-2">
              <FiMenu size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

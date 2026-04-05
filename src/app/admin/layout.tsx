'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { FiHome, FiSettings, FiLogOut, FiMenu, FiX, FiUsers, FiBriefcase, FiUserPlus } from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { useAuthStore } = await import('@/store/auth.store');
      const auth = useAuthStore.getState();

      if (!auth.isAuthenticated) {
        router.push('/login');
      } else if (auth.user?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome className="text-xl" /> },
    { name: 'Live Request', path: '/admin/live-requests', icon: <FiHome className="text-xl" /> },
    { name: 'Dispatch & Logic', path: '/admin/requests', icon: <FiUserPlus className="text-xl" /> },
    { name: 'Manage Services', path: '/admin/services', icon: <FiSettings className="text-xl" /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers className="text-xl" /> },
    { name: 'Vendors', path: '/admin/vendors', icon: <FiBriefcase className="text-xl" /> },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-light border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-10 mt-2 px-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center">
                <span className="text-[#0a0a0f] font-bold text-sm">a</span>
              </div>
              <span className="text-lg font-bold gradient-text">allWays <span className="text-[#00D4AA] text-xs align-top font-black">PRO</span></span>
            </Link>
            <button className="lg:hidden text-[#8888aa]" onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>

          <div className="px-2 mb-6 flex-1 overflow-y-auto">
            <p className="text-xs text-[#666680] uppercase tracking-wider font-semibold mb-2">Admin Panel</p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-[rgba(108,99,255,0.1)] px-2 shrink-0">
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[rgba(108,99,255,0.05)] border border-[rgba(0,212,170,0.2)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#6C63FF] flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">Administrator</p>
                <p className="text-xs text-[#00D4AA] font-semibold">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-[#FF6B9D] hover:bg-[rgba(255,107,157,0.1)] rounded-xl transition-colors font-medium text-sm"
            >
              <FiLogOut className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,212,170,0.02)] to-transparent pointer-events-none" />

        {/* Top Header Mobile */}
        <header className="lg:hidden h-16 glass border-b flex items-center px-4 justify-between sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-sm">a</span>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(true)} className="text-[#8888aa] p-2">
            <FiMenu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 z-10 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

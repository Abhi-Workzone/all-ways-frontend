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
  FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const { data } = await usersAPI.getMe();
        if (data.success && setAuth && accessToken && refreshToken) {
          setAuth(data.data, accessToken, refreshToken);
        }
      } catch (err) {
        console.error('Profile refresh failed', err);
      }
    };

    if (isHydrated && user) {
      refreshProfile();
    }
  }, [isHydrated]); // Refresh once on mount/hydration

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router, isHydrated]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/vendor', icon: FiHome },
    { name: 'My Profile', href: '/vendor/profile', icon: FiUser },
    { name: 'Job Board', href: '/vendor/jobs', icon: FiBriefcase },
    { name: 'Active Jobs', href: '/vendor/active', icon: FiActivity },
    { name: 'History', href: '/vendor/history', icon: FiClock },
  ];

  if (!isHydrated || !user) return (
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#12121a] border-r border-[rgba(108,99,255,0.1)] flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center">
              <span className="text-white font-bold text-sm">a</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AllWays</span>
            {/* <span className="text-[10px] bg-[rgba(0,212,170,0.1)] text-[#00D4AA] px-1.5 py-0.5 rounded font-mono border border-[#00D4AA]/20 uppercase">Vendor</span> */}
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <p className="text-xs text-[#666680] uppercase tracking-wider font-semibold mb-2">Vendor Panel</p>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-[rgba(108,99,255,0.05)]">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[rgba(108,99,255,0.05)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center text-white font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.email}</p>
              <p className="text-xs text-[#666680]">Vendor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#FF6B9D] hover:bg-[rgba(255,107,157,0.1)] rounded-xl transition-colors font-medium text-sm"
          >
            <FiLogOut className="text-lg" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-grid-pattern">
        {/* Top Header for Mobile/Info */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 md:px-8 border-b border-[rgba(108,99,255,0.05)] bg-[rgba(10,10,15,0.8)] backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">V</span>
            </div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              Welcome, {user.email.split('@')[0]}
              {user.businessStatus === 'APPROVED' && <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-white/5 uppercase ${user.businessStatus === 'APPROVED' ? 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20' :
                user.businessStatus === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  'bg-[#FFB74D]/10 text-[#FFB74D] border-[#FFB74D]/20'
              }`}>
              VERIFICATION: {user.businessStatus || 'PENDING'}
            </span>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

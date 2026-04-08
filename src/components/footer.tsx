'use client';

import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] w-full flex justify-center">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                <span className="text-[var(--foreground)] font-bold uppercase text-lg">a</span>
              </div>
              <span className="text-xl font-bold gradient-text">AllWays</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
              Your trusted partner for premium home services. Book with confidence, experience excellence.
            </p>
            <div className="flex gap-3">
              {[FaTwitter, FaInstagram, FaLinkedin, FaFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-[var(--surface-light)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--border)] transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Quick Links</h4>
            <div className="space-y-3">
              {['Home', 'Services', 'About Us', 'Contact'].map((link) => (
                <Link key={link} href="#" className="block text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Services</h4>
            <div className="space-y-3">
              {['Home Cleaning', 'AC Service', 'Plumbing', 'Electrician'].map((s) => (
                <span key={s} className="block text-sm text-[var(--text-muted)]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <FiMail size={14} className="text-[var(--primary)]" />
                hello@allways.com
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <FiPhone size={14} className="text-[var(--primary)]" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <FiMapPin size={14} className="text-[var(--primary)]" />
                Mumbai, India
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--placeholder)]">
            © {new Date().getFullYear()} AllWays. All rights reserved. Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}

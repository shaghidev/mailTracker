// src/components/Navbar/Navbar.tsx
'use client';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '@/components/UI/LogoutButton';
import LoginButton from '@/components/UI/LoginButton';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0B1E1E] text-white shadow-md px-4 sm:px-6 md:px-12 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo/gules-logo.png"
            alt="Gules Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl sm:text-2xl font-bold">Gules</span>
        </div>

        {/* Desktop/Tablet navigacija */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 uppercase font-semibold text-sm lg:text-base">
          <Link
            href="/"
            className="hover:text-[#E0A930] transition-colors cursor-pointer"
          >
            POČETNA
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className="hover:text-[#25B9C4] transition-colors cursor-pointer"
              >
                DASHBOARD
              </Link>
              <Link
                href="/contacts"
                className="hover:text-[#25B9C4] transition-colors cursor-pointer"
              >
                KONTAKTI
              </Link>
              <LogoutButton />
            </>
          )}

          {!isAuthenticated && <LoginButton />}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 bg-[#0B1E1E] flex flex-col items-center justify-center space-y-8 text-xl font-bold uppercase transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="hover:text-[#E0A930] transition-colors cursor-pointer"
        >
          POČETNA
        </Link>

        {isAuthenticated && (
          <>
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="hover:text-[#25B9C4] transition-colors cursor-pointer"
            >
              DASHBOARD
            </Link>
            <Link
              href="/contacts"
              onClick={closeMenu}
              className="hover:text-[#25B9C4] transition-colors cursor-pointer"
            >
              KONTAKTI
            </Link>
            <LogoutButton />
          </>
        )}

        {!isAuthenticated && <LoginButton />}

        {/* Close button (inside menu) */}
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-white"
        >
          <X size={32} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

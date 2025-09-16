// src/components/Navbar/Navbar.tsx
'use client';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '@/components/UI/LogoutButton';
import LoginButton from '@/components/UI/LoginButton';
import Image from 'next/image';

const Navbar = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className="sticky top-0 z-50 bg-[#0B1E1E] text-[#FFFFFF] shadow-md px-6 md:px-12 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Image src="/logo/gules-logo.png" alt="Gules Logo" width={40} height={40} className="object-contain" />
        <span className="text-2xl font-bold">Gules</span>
      </div>

      {/* Navigacija */}
      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:text-[#E0A930] transition-colors cursor-pointer">
          Početna
        </Link>

        {isAuthenticated && (
          <>
            <Link href="/dashboard" className="hover:text-[#25B9C4] transition-colors cursor-pointer">
              Dashboard
            </Link>
            <Link href="/contacts" className="hover:text-[#25B9C4] transition-colors cursor-pointer">
              Kontakti
            </Link>
            <LogoutButton />
          </>
        )}

        {!isAuthenticated && <LoginButton />}
      </div>
    </nav>
  );
};

export default Navbar;

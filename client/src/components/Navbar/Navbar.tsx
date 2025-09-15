'use client';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '@/components/UI/LogoutButton';
import LoginButton from '@/components/UI/LoginButton';

const Navbar = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className="bg-[#1F2937] text-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Email Marketing</h1>
      <div className="space-x-4">
        {isAuthenticated && (
          <Link href="/dashboard" className="hover:text-[#2979FF]">
            Dashboard
          </Link>
        )}
        <Link href="/" className="hover:text-[#2979FF]">Home</Link>
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      </div>
    </nav>
  );
};

export default Navbar;

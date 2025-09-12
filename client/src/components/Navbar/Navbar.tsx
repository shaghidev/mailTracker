// src/components/Navbar.tsx
import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Email Marketing</h1>
      <div className="space-x-4">
        <Link href="/dashboard" className="hover:text-blue-500">Dashboard</Link>
        <Link href="/" className="hover:text-blue-500">Home</Link>
      </div>
    </nav>
  );
};

export default Navbar;

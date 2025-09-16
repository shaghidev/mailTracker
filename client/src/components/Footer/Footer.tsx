// src/components/Footer/Footer.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1E1E] text-[#BCCCDC] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Logo + About */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-[#E0A930]">Gules</h2>
          <p className="text-sm md:text-base">
            Profesionalni alat za email marketing, upravljanje kampanjama i kontakte. Sve na jednom mjestu.
          </p>
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Product</h3>
            <ul className="space-y-1">
              <li><Link href="/features" className="hover:text-[#25B9C4] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#25B9C4] transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#25B9C4] transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Company</h3>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-[#25B9C4] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#25B9C4] transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-[#25B9C4] transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-white">Follow us</h3>
          <div className="flex gap-4 mt-2 text-white">
            <Link href="https://twitter.com" target="_blank" className="hover:text-[#1DA1F2] transition-colors"><FaTwitter size={24} /></Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-[#0A66C2] transition-colors"><FaLinkedin size={24} /></Link>
            <Link href="https://github.com" target="_blank" className="hover:text-[#6e5494] transition-colors"><FaGithub size={24} /></Link>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-[#1F2937] pt-6 text-center text-sm text-[#A0AEC0]">
        &copy; {new Date().getFullYear()} Gules. Sva prava pridržana.
      </div>
    </footer>
  );
};

export default Footer;

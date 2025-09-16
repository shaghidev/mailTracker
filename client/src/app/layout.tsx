// src/app/layout.tsx
'use client';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer'; // <-- ispravno
import ClientAuth0Provider from '@/components/Auth0/ClientAuth0Provider';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <body className="min-h-screen flex flex-col bg-[#080D10] text-[#FFFFFF] font-sans">

        <ClientAuth0Provider>

          {/* Sticky Navbar */}
          <header className="sticky top-0 z-50 bg-[#0B1E1E] shadow-md">
            <Navbar />
          </header>

          {/* Glavni sadržaj */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <Footer />

        </ClientAuth0Provider>
      </body>
    </html>
  );
}

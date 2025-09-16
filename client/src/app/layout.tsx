// src/app/layout.tsx
'use client';
import Navbar from '@/components/Navbar/Navbar';
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
          <footer className="bg-[#0B1E1E] text-[#BCCCDC] text-center text-sm py-6 mt-12">
            &copy; {new Date().getFullYear()} Gules – Profesionalni email marketing za ozbiljne biznise.
          </footer>

        </ClientAuth0Provider>
      </body>
    </html>
  );
}

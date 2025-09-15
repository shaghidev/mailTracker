// src/app/layout.tsx
'use client';
import Navbar from '@/components/Navbar/Navbar';
import ClientAuth0Provider from '@/components/Auth0/ClientAuth0Provider';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <ClientAuth0Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ClientAuth0Provider>
      </body>
    </html>
  );
}

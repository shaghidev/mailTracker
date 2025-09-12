// src/app/layout.tsx
import "@/styles/globals.css";
import React, { ReactNode } from "react";
import Navbar from "@/components/Navbar/Navbar";

export const metadata = {
  title: "Email Marketing",
  description: "Dashboard for Email Marketing App",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}

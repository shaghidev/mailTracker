// src/app/page.tsx
"use client";
import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Welcome to Email Marketing App
      </h1>
      <p className="text-lg mb-8 text-center text-gray-700 max-w-xl">
        Manage your campaigns, track opens and clicks, and grow your email list—all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default HomePage;

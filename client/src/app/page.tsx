// src/app/page.tsx
'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const HomePage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E0F2FF] to-[#D1C4E9] p-6">
      <h1 className="text-4xl font-bold mb-4 text-center text-[#1F2937]">
        Welcome to Email Marketing App
      </h1>
      <p className="text-lg mb-8 text-center text-gray-700 max-w-xl">
        Manage your campaigns, track opens and clicks, and grow your email list—all in one place.
      </p>
      {!isAuthenticated && (
        <div className="flex gap-4">
          <button
            onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
            className="bg-[#2979FF] text-white px-6 py-3 rounded-lg hover:bg-[#1E63D8] transition-colors"
          >
            Login / Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;

'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const HomePage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080D10] p-6 text-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-4 text-center text-[#FFBD00]">
        Welcome to Mailora
      </h1>
      <p className="text-lg mb-8 text-center text-[#A0AEC0] max-w-xl">
        Manage your campaigns, track opens and clicks, and grow your email list—all in one place.
      </p>
      {!isAuthenticated && (
        <button
          onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
          className="bg-[#2979FF] text-white px-6 py-3 rounded-lg hover:bg-[#1E63D8] transition-colors"
        >
          Login / Sign Up
        </button>
      )}
    </div>
  );
};

export default HomePage;

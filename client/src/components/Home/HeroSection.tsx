'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

const HeroSection: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <header className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-[#0B1E1E]">
      <motion.div
        className="absolute text-center px-6 md:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-[#E0A930]">
          <Typewriter
            words={['Gules.', 'Marketing bez granica.', 'Rastite brzo.']}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={2000}
          />
        </h1>
        <p className="text-lg md:text-xl text-[#BCCCDC] max-w-2xl mb-10">
          Profesionalni alat za upravljanje kampanjama, kontakte i automatizaciju – sve na jednom mjestu.
        </p>
        {!isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
            className="bg-[#25B9C4] hover:bg-[#E0A930] text-[#0B1E1E] font-semibold px-12 py-5 rounded-lg transition-colors cursor-pointer"
          >
            Počni sada
          </motion.button>
        )}
      </motion.div>
    </header>
  );
};

export default HeroSection;

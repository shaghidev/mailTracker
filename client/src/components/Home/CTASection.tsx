'use client';
import React from 'react';
import Image from 'next/image';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';

const CTASection: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <motion.section className="relative py-32 flex items-center justify-center text-center overflow-hidden">
      <Image src="/images/megaphone.png" alt="Grow your business" fill className="object-cover opacity-30" />
      <motion.div className="relative z-10 px-6 md:px-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#E0A930] mb-6">
          Spremni za rast?
        </h2>
        <p className="text-[#BCCCDC] max-w-xl mb-8">
          Eemail marketing. Intuitivno, moćno i bez komplikacija.
        </p>
        {!isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
            className="bg-[#25B9C4] hover:bg-[#E0A930] text-[#0B1E1E] font-semibold px-12 py-5 rounded-lg transition-colors cursor-pointer"
          >
            Počni odmah
          </motion.button>
        )}
      </motion.div>
    </motion.section>
  );
};

export default CTASection;

// src/app/page.tsx
'use client';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

const HomePage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1E1E] text-[#FFFFFF] font-sans">

      {/* Hero Section: full-width image + typewriter */}
      <header className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute text-center px-6 md:px-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
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

      {/* Feature Grid: slika + tekst naizmjenično */}
      <motion.section className="py-20 px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={fadeUp}>
          <Image src="/home/feature-analytics.jpg" alt="Analitika" width={600} height={400} className="rounded-xl shadow-lg" />
        </motion.div>
        <motion.div variants={fadeUp} className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#E0A930]">Precizna analitika</h2>
          <p className="text-[#BCCCDC] text-lg">
            Pratite otvorene emailove, klikove i konverzije. Sve metrike na dohvat ruke, vizualno i intuitivno.
          </p>
        </motion.div>

        {/* Druga Feature */}
        <motion.div variants={fadeUp} className="order-last md:order-none space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#25B9C4]">Automatizacija kampanja</h2>
          <p className="text-[#BCCCDC] text-lg">
            Postavite automatizirane sekvence i pustite Gules da radi umjesto vas, bez stresa i grešaka.
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Image src="/home/feature-automation.jpg" alt="Automatizacija" width={600} height={400} className="rounded-xl shadow-lg" />
        </motion.div>
      </motion.section>

      {/* Process / Steps Section: horizontal steps */}
      <motion.section className="py-20 px-6 md:px-12 bg-[#0F2A2A] rounded-xl">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-[#E0A930] text-center mb-12">
          Kako radi Gules?
        </motion.h2>
        <motion.div className="flex flex-col md:flex-row justify-around items-start gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {[
            { title: '1. Kreirajte kampanju', desc: 'Jednostavno dizajnirajte email koristeći predloške.', icon: '/home/bullhorn.png' },
            { title: '2. Segmentirajte kontakte', desc: 'Odaberite prave korisnike za svaki email.', icon: '/home/segmentation.png' },
            { title: '3. Pošaljite i pratite', desc: 'Automatska dostava i real-time statistika.', icon: '/home/send-data.png' },
          ].map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center bg-[#154141] p-6 rounded-xl hover:bg-[#1B3B3B] transition-colors cursor-pointer">
              <Image src={step.icon} alt={step.title} width={80} height={80} className="mb-4" />
              <h3 className="text-xl font-bold text-[#25B9C4] mb-2">{step.title}</h3>
              <p className="text-[#BCCCDC]">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Testimonials: horizontal slider / motion cards */}
      <motion.section className="py-20 px-6 md:px-12">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-[#E0A930] text-center mb-12">
          Što naši korisnici kažu
        </motion.h2>
        <motion.div className="flex gap-8 overflow-x-auto py-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {[
            { text: '“Gules nam je povećao konverzije i smanjio vrijeme posla.”', name: 'Ivan Horvat', role: 'Marketing Manager' },
            { text: '“Najintuitivnija platforma za profesionalni email marketing.”', name: 'Ana Kovač', role: 'CEO' },
            { text: '“Automatizacija i statistika su game changer.”', name: 'Marko Jurić', role: 'Growth Lead' },
          ].map((t, i) => (
            <motion.div key={i} variants={fadeUp} className="min-w-[300px] bg-[#154141] rounded-xl p-6 shadow-md hover:scale-105 transition-transform cursor-pointer">
              <p className="text-[#BCCCDC] italic mb-4">{t.text}</p>
              <h4 className="text-[#25B9C4] font-bold">{t.name}</h4>
              <span className="text-[#BCCCDC] text-sm">{t.role}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA with full-width background image */}
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

     
    </div>
  );
};

export default HomePage;

'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  { title: 'Kreirajte kampanju', desc: 'Jednostavno dizajnirajte email koristeći predloške.', icon: '/home/bullhorn.png' },
  { title: 'Segmentirajte kontakte', desc: 'Odaberite prave korisnike za svaki email.', icon: '/home/segmentation.png' },
  { title: 'Pošaljite i pratite', desc: 'Automatska dostava i real-time statistika.', icon: '/home/send-data.png' },
];

const ProcessSteps: React.FC = () => {
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.3 } } };

  return (
    <motion.section className="py-20 px-6 md:px-12 bg-[#0F2A2A] rounded-xl">
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-4xl font-extrabold text-[#E0A930] text-center mb-12"
      >
        Kako radi Gules?
      </motion.h2>
      <motion.div
        className="flex flex-col md:flex-row justify-around items-start gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex flex-col items-center text-center bg-[#154141] p-6 rounded-xl hover:bg-[#1B3B3B] transition-colors cursor-pointer"
          >
            <Image src={step.icon} alt={step.title} width={80} height={80} className="mb-4" />
            <h3 className="text-xl font-bold text-[#25B9C4] mb-2">{step.title}</h3>
            <p className="text-[#BCCCDC]">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default ProcessSteps;

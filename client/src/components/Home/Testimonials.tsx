'use client';
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  { text: '“Gules nam je povećao konverzije i smanjio vrijeme posla.”', name: 'Ivan Horvat', role: 'Marketing Manager' },
  { text: '“Najintuitivnija platforma za profesionalni email marketing.”', name: 'Ana Kovač', role: 'CEO' },
  { text: '“Automatizacija i statistika su game changer.”', name: 'Marko Jurić', role: 'Growth Lead' },
];

const Testimonials: React.FC = () => {
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.3 } } };

  return (
    <motion.section className="py-20 px-6 md:px-12">
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-4xl font-extrabold text-[#E0A930] text-center mb-12"
      >
        Što naši korisnici kažu
      </motion.h2>
      <motion.div
        className="flex gap-8 overflow-x-auto py-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="min-w-[300px] bg-[#154141] rounded-xl p-6 shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            <p className="text-[#BCCCDC] italic mb-4">{t.text}</p>
            <h4 className="text-[#25B9C4] font-bold">{t.name}</h4>
            <span className="text-[#BCCCDC] text-sm">{t.role}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Testimonials;

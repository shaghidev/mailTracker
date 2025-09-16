'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Precizna analitika',
    desc: 'Pratite otvorene emailove, klikove i konverzije. Sve metrike na dohvat ruke, vizualno i intuitivno.',
    image: '/home/feature-analytics.jpg',
    color: '#E0A930',
  },
  {
    title: 'Automatizacija kampanja',
    desc: 'Postavite automatizirane sekvence i pustite Gules da radi umjesto vas, bez stresa i grešaka.',
    image: '/home/feature-automation.jpg',
    color: '#25B9C4',
  },
];

const FeatureGrid: React.FC = () => {
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.3 } } };

  return (
    <motion.section
      className="py-20 px-6 md:px-12 flex flex-col gap-12"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          className={`flex flex-col md:flex-row items-center gap-8 ${
            i % 2 !== 0 ? 'md:flex-row-reverse' : ''
          }`}
          variants={fadeUp}
        >
          <div className="w-full md:w-1/2">
            <Image
              src={feature.image}
              alt={feature.title}
              width={600}
              height={400}
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: feature.color }}>
              {feature.title}
            </h2>
            <p className="text-[#BCCCDC] text-lg">{feature.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
};

export default FeatureGrid;

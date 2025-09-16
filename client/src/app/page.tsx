'use client';
import React from 'react';
import HeroSection from '@/components/Home/HeroSection';
import FeatureGrid from '@/components/Home/FeatureGrid';
import ProcessSteps from '@/components/Home/ProcessSteps';
import Testimonials from '@/components/Home/Testimonials';
import CTASection from '@/components/Home/CTASection';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B1E1E] text-white font-sans">
      <HeroSection />
      <FeatureGrid />
      <ProcessSteps />
      <Testimonials />
      <CTASection />
    </div>  
  );
};

export default HomePage;

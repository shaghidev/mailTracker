// src/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { Campaign } from '@/types/Campaign';
import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignCard from '@/components/CampaignCard/CampaignCard';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const { fetchCampaigns } = useCampaigns();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingCampaigns(true);
      fetchCampaigns()
        .then(setCampaigns)
        .catch(console.error)
        .finally(() => setLoadingCampaigns(false));
    }
  }, [isAuthenticated, fetchCampaigns]);

  if (isLoading || (!isAuthenticated && !loadingCampaigns)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080D10]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25B9C4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D10] text-white px-6 py-12 flex flex-col items-center">
      
      {/* Hero / Header */}
      <motion.div 
        className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-[#FFBD00] mb-4 md:mb-0">
          Vaše kampanje
        </motion.h1>
        <motion.button 
          variants={fadeUp}
          onClick={() => router.push('/dashboard/new')}
          className="bg-[#25B9C4] hover:bg-[#2979FF] text-[#080D10] font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
        >
          + Nova kampanja
        </motion.button>
      </motion.div>

      {/* Campaigns Grid */}
      {loadingCampaigns ? (
        <p className="text-[#A0AEC0] text-lg">Učitavanje kampanja...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-[#A0AEC0] text-lg">Nema dostupnih kampanja. Kreirajte prvu!</p>
      ) : (
        <motion.div 
          className="w-full max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {campaigns.map((c) => (
            <motion.div key={c.id} variants={fadeUp}>
              <CampaignCard campaign={c} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;

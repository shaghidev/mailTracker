'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { Campaign } from '@/types/Campaign';
import { useCampaigns } from '@/services/api';
import CampaignCard from '@/components/CampaignCard/CampaignCard';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const { fetchCampaigns } = useCampaigns();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // ----------------------------
  // Preusmjeravanje korisnika
  // ----------------------------
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // ----------------------------
  // Dohvat kampanja
  // ----------------------------
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingCampaigns(true);
      fetchCampaigns()
        .then(setCampaigns)
        .catch(console.error)
        .finally(() => setLoadingCampaigns(false));
    }
  }, [isAuthenticated, fetchCampaigns]);

  // ----------------------------
  // Loader dok Auth0 učitava
  // ----------------------------
  if (isLoading || (!isAuthenticated && !loadingCampaigns)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // ----------------------------
  // Dashboard content
  // ----------------------------
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {loadingCampaigns ? (
        <p className="text-gray-700">Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-700">No campaigns found.</p>
      ) : (
        <div className="w-full max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

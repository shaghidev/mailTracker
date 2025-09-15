'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { Campaign } from '@/types/Campaign';
import { useCampaigns } from "@/hooks/useCampaigns";
import CampaignCard from '@/components/CampaignCard/CampaignCard';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const { fetchCampaigns } = useCampaigns();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Preusmjeravanje korisnika
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  // Dohvat kampanja
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingCampaigns(true);
      fetchCampaigns()
        .then(setCampaigns)
        .catch(console.error)
        .finally(() => setLoadingCampaigns(false));
    }
  }, [isAuthenticated, fetchCampaigns]);

  // Loader
  if (isLoading || (!isAuthenticated && !loadingCampaigns)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>
        <button
          onClick={() => router.push('/dashboard/new')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {loadingCampaigns ? (
        <p className="text-gray-600">Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns found.</p>
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

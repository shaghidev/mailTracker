// src/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import CampaignCard from "@/components/CampaignCard/CampaignCard";
import { getCampaigns } from "@/services/api";
import { Campaign } from "@/types/Campaign";

const DashboardPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard - All Campaigns</h1>
      {loading ? (
        <p className="text-center mt-10">Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p>No campaigns yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

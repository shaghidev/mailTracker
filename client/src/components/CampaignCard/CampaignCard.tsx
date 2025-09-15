// src/components/CampaignCard.tsx
import React from "react";
import { Campaign } from "@/types/Campaign";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
<div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#2979FF]">
  <h2 className="text-lg font-bold text-[#1F2937]">{campaign.name}</h2>
  <p className="text-sm text-gray-500">
    Created: {new Date(campaign.createdAt).toLocaleDateString()}
  </p>
  <div className="flex justify-between mt-2 text-sm">
    <span className="text-[#22C55E]">Sent: {campaign.sent || 0}</span>
    <span className="text-[#FACC15]">Opened: {campaign.opened || 0}</span>
    <span className="text-[#EF4444]">Clicked: {campaign.clicked || 0}</span>
  </div>
</div>

  );
};

export default CampaignCard;

// src/components/CampaignCard.tsx
import React from "react";
import { Campaign } from "@/types/Campaign";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-lg font-bold">{campaign.name}</h2>
      <p className="text-sm text-gray-500">
        Created: {new Date(campaign.createdAt).toLocaleDateString()}
      </p>
      <div className="flex justify-between mt-2 text-sm">
        <span>Sent: {campaign.sent || 0}</span>
        <span>Opened: {campaign.opened || 0}</span>
        <span>Clicked: {campaign.clicked || 0}</span>
      </div>
    </div>
  );
};

export default CampaignCard;

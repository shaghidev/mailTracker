// src/components/CampaignCard.tsx
'use client';
import React from "react";
import { Campaign } from "@/types/Campaign";
import { motion } from "framer-motion";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <motion.div
      className="bg-[#0F2A2A] shadow-md rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#25B9C4] cursor-pointer"
      whileHover={{ scale: 1.03 }}
    >
      <h2 className="text-xl font-extrabold text-[#FFBD00]">{campaign.name}</h2>
      <p className="text-sm text-[#BCCCDC] mt-1">
        Created: {new Date(campaign.createdAt).toLocaleDateString()}
      </p>

      <div className="flex justify-between mt-4 text-sm font-semibold">
        <span className="text-[#22C55E]">Sent: {campaign.sent || 0}</span>
        <span className="text-[#FACC15]">Opened: {campaign.opened || 0}</span>
        <span className="text-[#EF4444]">Clicked: {campaign.clicked || 0}</span>
      </div>
    </motion.div>
  );
};

export default CampaignCard;

import axios from "axios";
import { Campaign } from "@/types/Campaign";

// Exportaj API_URL da ga može koristiti frontend
export const API_URL = "https://mailtracker-7jvy.onrender.com/api/campaigns";

// Campaigns
export const getCampaigns = async (accessToken: string): Promise<Campaign[]> => {
  const res = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

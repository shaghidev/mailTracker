// src/services/api.ts
import axios from "axios";
import { Campaign } from "@/types/Campaign";

export const getCampaigns = async (): Promise<Campaign[]> => {
  const res = await axios.get("https://mailtracker-7jvy.onrender.com/api/campaigns"); // backend URL
  return res.data;
};

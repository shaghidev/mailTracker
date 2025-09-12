// src/services/api.ts
import axios from "axios";
import { Campaign } from "@/types/Campaign";

export const getCampaigns = async (): Promise<Campaign[]> => {
  const res = await axios.get("/api/campaigns"); // prilagodi backend endpoint
  return res.data;
};

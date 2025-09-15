import axios from "axios";
import { Campaign } from "@/types/Campaign";
import { ContactList } from "@/types/Contact";

const API_URL = "https://mailtracker-7jvy.onrender.com";

// Campaigns
export const getCampaigns = async (accessToken: string): Promise<Campaign[]> => {
  const res = await axios.get(`${API_URL}/api/campaigns`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// Contact Lists
export const fetchContactLists = async (accessToken: string): Promise<ContactList[]> => {
  const res = await axios.get(`${API_URL}/api/contact_lists`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { Campaign } from '@/types/Campaign';

const API_URL = 'https://mailtracker-7jvy.onrender.com';

export const getCampaigns = async (accessToken: string): Promise<Campaign[]> => {
  const res = await axios.get(`${API_URL}/api/campaigns`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const useCampaigns = () => {
  const { getAccessTokenSilently } = useAuth0();

  const fetchCampaigns = useCallback(async () => {
    const token = await getAccessTokenSilently();
    return getCampaigns(token);
  }, [getAccessTokenSilently]); // memoriramo funkciju

  return { fetchCampaigns };
};

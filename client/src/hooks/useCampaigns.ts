import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getCampaigns } from "@/services/api";
import { Campaign } from "@/types/Campaign";

export const useCampaigns = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const fetchCampaigns = useCallback(async (): Promise<Campaign[]> => {
    if (!isAuthenticated) return [];
    const token = await getAccessTokenSilently();
    return getCampaigns(token);
  }, [getAccessTokenSilently, isAuthenticated]);

  return { fetchCampaigns };
};

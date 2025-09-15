import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchContactLists } from "@/services/api";
import { ContactList } from "@/types/Contact";

export const useContacts = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const fetchLists = useCallback(async (): Promise<ContactList[]> => {
    if (!isAuthenticated) return [];
    const token = await getAccessTokenSilently();
    return fetchContactLists(token);
  }, [getAccessTokenSilently, isAuthenticated]);

  return { fetchLists };
};

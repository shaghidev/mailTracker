// hooks/useContactLists.ts
import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ContactList } from '@/types/Contact';
import * as contactService from '@/services/contactService';

export const useContactLists = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const data = await contactService.fetchContactLists(token);
      setLists(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAccessTokenSilently]);

  return { lists, loading, fetchLists };
};

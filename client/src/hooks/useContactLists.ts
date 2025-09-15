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

  const addList = async (name: string) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await contactService.addContactList(name, token);
      setLists(prev => [...prev, { id: res.data.list_id, name: res.data.name, emails: [] }]);
    } catch (err) { console.error(err); }
  };

  const deleteList = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      await contactService.deleteContactList(id, token);
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (err) { console.error(err); }
  };

  return { lists, loading, fetchLists, addList, deleteList };
};
